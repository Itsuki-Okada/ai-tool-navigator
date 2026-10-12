import { AI_PROFILES } from '../../data/aiProfiles';
import { CATEGORY_MAP } from '../../data/categories';
import { PROMPT_RECIPES, TARGET_PROFILES, type PromptRecipe } from '../../data/promptRecipes';
import type {
  Answers,
  CategoryId,
  GeneratedPrompt,
  PromptMode,
  PromptTarget,
  Recommendation,
} from '../../types';
import { describeAnswer, getVisibleQuestions, hasConcreteAnswer, selectedOptions } from '../diagnosis/flow';
import { buildDevSpec, isDevPrompt } from './devSpec';

/**
 * プロンプト生成
 * ----------------------------------------------------------------
 * 回答をそのまま連結せず、セクション（役割・目的・背景・要件…）に整理してから、
 * 出力先（ChatGPT / Gemini / Claude / Claude Code など）に合わせた形式で書き出します。
 */

export interface GenerateOptions {
  categoryId: CategoryId;
  answers: Answers;
  mode: PromptMode;
  target: PromptTarget;
  recommendation?: Recommendation;
}

export interface Section {
  key: string;
  title: string;
  xmlTag: string;
  lines: string[];
  /** 本文として段落で表示する（箇条書きにしない） */
  paragraph?: boolean;
  numbered?: boolean;
}

function resolveRecipe(categoryId: CategoryId, target: PromptTarget): PromptRecipe {
  const base = PROMPT_RECIPES[categoryId];
  const override = base.targetOverrides?.[target];
  return override ? { ...base, ...override } : base;
}

/** 回答をセクションごとに振り分ける */
export function organizeAnswers(categoryId: CategoryId, answers: Answers) {
  const buckets = {
    objective: [] as string[],
    background: [] as string[],
    requirements: [] as string[],
    features: [] as string[],
    constraints: [] as string[],
    output: [] as string[],
    quality: [] as string[],
    adds: [] as string[],
    constraintAdds: [] as string[],
    unknown: [] as string[],
  };
  let goal = '';

  for (const q of getVisibleQuestions(categoryId, answers)) {
    const a = answers[q.id];
    if (q.id === 'goal') {
      goal = a?.text?.trim() ?? '';
      continue;
    }
    if (!hasConcreteAnswer(a)) {
      if (q.id !== 'notes') buckets.unknown.push(q.promptLabel);
      continue;
    }
    const desc = describeAnswer(q, a);
    if (desc && q.promptSection !== 'none') {
      const line = q.id === 'notes' ? desc : `${q.promptLabel}：${desc}`;
      buckets[q.promptSection].push(line);
    }
    for (const opt of selectedOptions(q, a)) {
      for (const add of opt.promptAdds ?? []) {
        (q.promptSection === 'constraints' ? buckets.constraintAdds : buckets.adds).push(add);
      }
    }
  }
  return { goal, ...buckets };
}

function dedupe(lines: string[]): string[] {
  return [...new Set(lines.filter(Boolean))];
}

export function buildSections(opts: GenerateOptions): { title: string; sections: Section[] } {
  const { categoryId, answers, mode, target } = opts;
  const category = CATEGORY_MAP[categoryId];
  const recipe = resolveRecipe(categoryId, target);
  const targetProfile = TARGET_PROFILES[target];
  const org = organizeAnswers(categoryId, answers);
  const dev = isDevPrompt(categoryId, answers, target) ? buildDevSpec(categoryId, answers, target, mode) : null;
  const quality = mode === 'quality';
  const short = mode === 'short';
  const omit = new Set(recipe.omit ?? []);

  const title = org.goal ? truncate(org.goal, 40) : `${category.title}の${recipe.deliverable}`;
  const objective = org.goal
    ? `${org.goal}`
    : `「${category.title}」の分野で、以下の条件に合った${recipe.deliverable}を作成してください。`;

  const needsSearch = (opts.recommendation?.needs ?? []).some((n) => (n.need === 'webSearch' || n.need === 'deepResearch') && n.weight >= 3);
  const searchRule = needsSearch ? ['最新の情報はWeb検索で確認し、出典（URL）と情報の日付を示してください。'] : [];

  const sections: Section[] = [];
  const push = (s: Section) => {
    if (s.lines.length) sections.push(s);
  };

  // ---------- 最短モード：必要条件だけを短くまとめる ----------
  if (short) {
    push({ key: 'role', title: '役割', xmlTag: 'role', lines: [`あなたは${recipe.role}です。`], paragraph: true });
    push({ key: 'objective', title: '目的', xmlTag: 'goal', lines: [objective, ...org.objective], paragraph: true });
    push({
      key: 'conditions',
      title: '条件',
      xmlTag: 'conditions',
      lines: dedupe([
        ...org.background,
        ...org.requirements,
        ...org.features,
        ...org.constraints,
        ...(dev ? [dev.stackLine] : []),
        ...recipe.requirements.slice(0, 1),
        ...org.adds.slice(0, 3),
        ...searchRule,
      ]),
    });
    push({
      key: 'output',
      title: '出力',
      xmlTag: 'output_format',
      lines: dedupe([...org.output, ...recipe.output.slice(0, 1), ...(dev ? dev.shortRules : []), ...targetProfile.outputRules.slice(0, 1)]),
    });
    push({ key: 'done', title: '完成条件', xmlTag: 'done', lines: recipe.done.slice(0, 2) });
    return { title, sections };
  }

  // ---------- 標準・高品質モード ----------
  push({ key: 'role', title: 'あなたの役割', xmlTag: 'role', lines: [`あなたは${quality ? recipe.roleQuality : recipe.role}です。`], paragraph: true });
  push({ key: 'objective', title: '達成したい目的', xmlTag: 'goal', lines: [objective, ...org.objective], paragraph: true });
  push({
    key: 'background',
    title: '背景・前提条件',
    xmlTag: 'context',
    lines: dedupe([...org.background, ...(dev?.background ?? [])]),
  });
  push({
    key: 'requirements',
    title: '具体的な要件',
    xmlTag: 'requirements',
    lines: dedupe([...org.requirements, ...recipe.requirements, ...org.adds, ...searchRule]),
  });
  if (!omit.has('features')) {
    push({ key: 'features', title: '必要な機能', xmlTag: 'features', lines: dedupe(org.features) });
  }
  push({
    key: 'constraints',
    title: '制約条件',
    xmlTag: 'constraints',
    lines: dedupe([...org.constraints, ...org.constraintAdds, '個人情報・機密情報・APIキーなどの秘密情報を出力に含めないこと']),
  });

  if (dev) {
    push({ key: 'tech', title: '使用技術', xmlTag: 'tech_stack', lines: dev.stack });
    push({ key: 'files', title: 'ファイル構成（目安）', xmlTag: 'file_structure', lines: dev.files });
    push({ key: 'dev', title: '実装時のルール', xmlTag: 'implementation_rules', lines: dev.rules });
  }

  if (!omit.has('steps')) {
    const steps = dev ? dev.steps : recipe.steps;
    const planFirst = quality && !dev ? ['作業を始める前に、進め方の計画を簡潔に示す'] : [];
    push({ key: 'steps', title: '作業手順', xmlTag: 'process', lines: [...planFirst, ...steps], numbered: true });
  }

  push({
    key: 'output',
    title: '出力形式',
    xmlTag: 'output_format',
    lines: dedupe([...org.output, ...recipe.output, ...targetProfile.outputRules]),
  });

  if (!omit.has('quality')) {
    push({
      key: 'quality',
      title: '品質基準',
      xmlTag: 'quality_bar',
      lines: dedupe([...org.quality, ...recipe.quality, ...(quality ? recipe.qualityExtras : []), ...(dev && quality ? dev.qualityExtras : [])]),
    });
  }

  const unknownLines: string[] = [];
  if (org.unknown.length) {
    unknownLines.push(`次の項目は未定です。目的に照らして最適と思われる内容を選び、選んだ理由を明記してください：${org.unknown.join('、')}`);
  }
  unknownLines.push(...targetProfile.rules.filter((r) => /不明|質問/.test(r)));
  push({ key: 'unknowns', title: '不明点への対応', xmlTag: 'when_unclear', lines: dedupe(unknownLines) });

  const workRules = targetProfile.rules.filter((r) => !/不明|質問/.test(r));
  if (workRules.length || (dev && targetProfile.devRules)) {
    push({
      key: 'work',
      title: `${targetProfile.label.replace('向け', '')}での進め方`,
      xmlTag: 'working_style',
      lines: dedupe([...workRules, ...(dev ? targetProfile.devRules ?? [] : [])]),
    });
  }

  push({ key: 'done', title: '完成条件', xmlTag: 'definition_of_done', lines: dedupe([...recipe.done, ...(dev?.done ?? [])]) });
  push({
    key: 'checks',
    title: '最終確認項目',
    xmlTag: 'final_checklist',
    lines: dedupe([...recipe.checks, ...(dev && quality ? dev.checks : [])]),
  });

  return { title, sections };
}

function truncate(s: string, n: number): string {
  const one = s.replace(/\s+/g, ' ').trim();
  return one.length > n ? `${one.slice(0, n)}…` : one;
}

function renderMarkdown(title: string, sections: Section[], short: boolean): string {
  const out: string[] = [];
  out.push(short ? `# ${title}` : `# 依頼：${title}`);
  sections.forEach((s, i) => {
    out.push('');
    out.push(short ? `## ${s.title}` : `## ${i + 1}. ${s.title}`);
    if (s.paragraph) out.push(s.lines.join('\n'));
    else s.lines.forEach((l, j) => out.push(s.numbered ? `${j + 1}. ${l}` : `- ${l}`));
  });
  return out.join('\n');
}

function renderXml(title: string, sections: Section[]): string {
  const out: string[] = [`以下の依頼に取り組んでください。依頼内容はXMLタグで区切っています。`, '', `<task>${title}</task>`];
  for (const s of sections) {
    out.push('');
    out.push(`<${s.xmlTag}>`);
    if (s.paragraph) out.push(s.lines.join('\n'));
    else s.lines.forEach((l, j) => out.push(s.numbered ? `${j + 1}. ${l}` : `- ${l}`));
    out.push(`</${s.xmlTag}>`);
  }
  return out.join('\n');
}

export function generatePrompt(opts: GenerateOptions): GeneratedPrompt {
  const { title, sections } = buildSections(opts);
  const targetProfile = TARGET_PROFILES[opts.target];
  const text =
    targetProfile.format === 'xml' ? renderXml(title, sections) : renderMarkdown(title, sections, opts.mode === 'short');

  const recipe = resolveRecipe(opts.categoryId, opts.target);
  const rec = opts.recommendation;
  const top = rec ? rec.ranking.find((r) => r.ai === rec.topGroup[0]) : undefined;
  const recommendedAi = rec ? rec.topGroup.map((ai) => AI_PROFILES[ai].name).join(' / ') : '—';
  const reason = top?.strengths.length
    ? `${top.strengths.map((s) => s.text).join('。')}。`
    : '回答内容とカテゴリの傾向から判断しました。';

  return {
    text,
    explanation: {
      canDo: recipe.canDo,
      howTo: targetProfile.howTo,
      recommendedAi,
      reason,
      cautions: dedupe([
        ...targetProfile.cautions,
        'AIの回答には誤りが含まれることがあります。重要な内容は必ず自分で確認してください。',
        '個人情報・機密情報・パスワード・APIキーはプロンプトに含めないでください。',
      ]),
    },
  };
}

/** 回答の中に、出力先の推奨に関わる情報があるか（Claude Code を選んだ等） */
export function suggestTarget(categoryId: CategoryId, answers: Answers, rec?: Recommendation): PromptTarget {
  const env = answers.web_env?.values[0] ?? answers.code_env?.values[0];
  if (CATEGORY_MAP[categoryId].isDev) {
    if (env === 'claude-code') return 'claude-code';
    if (env === 'browser') return 'browser';
    if (env === 'other-agent' || env === 'vscode') return 'generic-code';
  }
  return rec?.topGroup[0] ?? 'chatgpt';
}

export function availableTargets(categoryId: CategoryId): PromptTarget[] {
  const base: PromptTarget[] = ['chatgpt', 'gemini', 'claude'];
  return CATEGORY_MAP[categoryId].isDev ? [...base, 'claude-code', 'browser', 'generic-code'] : base;
}

