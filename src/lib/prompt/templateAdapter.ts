import { TARGET_PROFILES } from '../../data/promptRecipes';
import { DEV_TEMPLATE_GROUPS, GROUP_TARGET_NOTES, TEMPLATE_TARGET_OVERRIDE } from '../../data/templateTargets';
import type { AiId, PromptTarget, PromptTemplate } from '../../types';

/**
 * テンプレートで作ったプロンプトを、使うAI（出力先）に合わせて調整する
 * ----------------------------------------------------------------
 * テンプレート本文の内容はそのままに、
 * - Claude 向け：本文を <instructions> タグで囲み、進め方・出力形式をタグで分ける
 * - ChatGPT / Gemini 向け：見出し付きで「回答のルール」を追加
 * - Claude Code 向け：ファイル調査・ビルド・テストなどの進め方を追加し、
 *   「コードを出力する」指示をファイルの直接編集に読み替えるよう明記
 * - ブラウザ上のAI / 一般的なコード生成向け：コードの出し方のルールを追加
 */

export function availableTemplateTargets(t: PromptTemplate): PromptTarget[] {
  const override = TEMPLATE_TARGET_OVERRIDE[t.id];
  if (override) return override;
  const base: PromptTarget[] = ['chatgpt', 'gemini', 'claude'];
  return DEV_TEMPLATE_GROUPS.includes(t.group) ? [...base, 'claude-code', 'browser', 'generic-code'] : base;
}

export function defaultTemplateTarget(t: PromptTemplate): PromptTarget {
  const list = availableTemplateTargets(t);
  const first: AiId | undefined = t.recommended[0];
  return first && list.includes(first) ? first : list[0];
}

const isDevTarget = (target: PromptTarget) => target === 'claude-code' || target === 'browser' || target === 'generic-code';

export function adaptTemplate(filled: string, t: PromptTemplate, target: PromptTarget): string {
  const profile = TARGET_PROFILES[target];
  const note = GROUP_TARGET_NOTES[t.group]?.[target];
  const dev = isDevTarget(target);

  const rules = [...profile.rules, ...(dev ? profile.devRules ?? [] : [])];
  if (target === 'claude-code') {
    rules.unshift('この依頼では、コードをチャットに出力する代わりに、ファイルを直接作成・編集して構いません（本文の「コードを示す」「出力する」はファイルの作成・編集に読み替えてください）。');
  }
  const output = profile.outputRules;

  // 本文がすでにこの出力先向けに書かれている場合は、追加ルールを最小限にする
  const only = TEMPLATE_TARGET_OVERRIDE[t.id];
  if (only && only.length === 1 && only[0] === target) return filled;

  if (profile.format === 'xml') {
    const parts = ['以下の依頼に取り組んでください。依頼内容と進め方をXMLタグで区切っています。', ''];
    if (note) parts.push('<important>', note, '</important>', '');
    parts.push('<instructions>', filled.trim(), '</instructions>', '');
    parts.push('<working_style>', ...rules.map((r) => `- ${r}`), '</working_style>', '');
    parts.push('<output_format>', ...output.map((r) => `- ${r}`), '</output_format>');
    return parts.join('\n');
  }

  const parts: string[] = [];
  if (note) parts.push(`【重要】${note}`, '');
  parts.push(filled.trim(), '', `## ${profile.label.replace('向け', '')}での進め方と回答のルール`);
  parts.push(...[...rules, ...output].map((r) => `- ${r}`));
  return parts.join('\n');
}
