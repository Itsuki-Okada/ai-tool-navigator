import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../../data/categories';
import { QUESTION_MAP } from '../../data/questions';
import { TEMPLATES } from '../../data/templates';
import { NEEDS } from '../../data/aiProfiles';
import { COMPARISON_ROWS } from '../../data/comparison';
import { getVisibleQuestions, pruneAnswers } from '../diagnosis/flow';
import { recommend } from '../diagnosis/recommend';
import { availableTargets, generatePrompt, suggestTarget } from '../prompt/generator';
import { fillTemplate, missingRequired, placeholdersOf, searchTemplates, UNFILLED } from '../prompt/template';
import { buildExport, createEmptyData, mergeData, parseImport, sanitizeAppData } from '../storage/validate';
import { adaptTemplate, availableTemplateTargets, defaultTemplateTarget } from '../prompt/templateAdapter';
import type { Answers } from '../../types';

const one = (v: string) => ({ values: [v] });

describe('データ定義の整合性', () => {
  it('全カテゴリの質問IDが存在する', () => {
    for (const c of CATEGORIES) for (const id of c.questionIds) expect(QUESTION_MAP[id], `${c.id}:${id}`).toBeDefined();
  });
  it('質問の選択肢のニーズはすべて定義済み', () => {
    for (const q of Object.values(QUESTION_MAP)) {
      for (const o of q.options ?? []) for (const n of Object.keys(o.needs ?? {})) expect(NEEDS[n as keyof typeof NEEDS], `${q.id}.${o.value}`).toBeDefined();
      if (q.type !== 'text') expect(q.options?.length, q.id).toBeGreaterThan(0);
    }
  });
  it('showIf が参照する質問は、同じカテゴリ内で先に出てくる', () => {
    for (const c of CATEGORIES) {
      c.questionIds.forEach((id, i) => {
        for (const cond of QUESTION_MAP[id].showIf ?? []) expect(c.questionIds.slice(0, i), `${c.id}:${id}`).toContain(cond.q);
      });
    }
  });
  it('テンプレートは30種類以上、IDは重複なし、プレースホルダーはすべて入力欄がある', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    for (const t of TEMPLATES) {
      const keys = new Set(t.fields.map((f) => f.key));
      for (const p of placeholdersOf(t.body)) expect(keys.has(p), `${t.id}:${p}`).toBe(true);
      for (const k of keys) expect(placeholdersOf(t.body), `${t.id}: unused ${k}`).toContain(k);
    }
  });
  it('かんたん診断の質問は5問で、詳しく診断の質問に含まれ、順番も同じ', () => {
    for (const c of CATEGORIES) {
      expect(c.quickQuestionIds, c.id).toHaveLength(5);
      expect(c.quickQuestionIds[0]).toBe('goal');
      const idx = c.quickQuestionIds.map((id) => c.questionIds.indexOf(id));
      expect(idx.every((i) => i >= 0), c.id).toBe(true);
      expect([...idx].sort((a, b) => a - b), c.id).toEqual(idx);
      expect(c.questionIds, c.id).toContain('using_ai');
    }
  });
  it('比較表は3つのAIすべての値を持つ', () => {
    for (const r of COMPARISON_ROWS) expect(Object.keys(r.cells).sort()).toEqual(['chatgpt', 'claude', 'gemini']);
  });
});

describe('診断フロー（分岐）', () => {
  it('バグ修正を選んだときだけエラーの質問が出る', () => {
    const ids = (a: Answers) => getVisibleQuestions('code', a).map((q) => q.id);
    expect(ids({ code_task: one('bugfix') })).toContain('code_error');
    expect(ids({ code_task: one('feature') })).not.toContain('code_error');
  });
  it('ゼロから作る場合は既存コードの質問を省略', () => {
    expect(getVisibleQuestions('code', { code_task: one('new') }).map((q) => q.id)).not.toContain('code_existing');
  });
  it('サーバー保存を選んだときだけログインの質問が出る', () => {
    expect(getVisibleQuestions('web', { web_storage: one('local') }).map((q) => q.id)).not.toContain('web_login');
    expect(getVisibleQuestions('web', { web_storage: one('cloud') }).map((q) => q.id)).toContain('web_login');
  });
  it('分岐が変わると不要になった回答は取り除かれる', () => {
    const pruned = pruneAnswers('web', { web_env: one('nocode'), web_storage: one('cloud'), web_login: one('yes') });
    expect(pruned.web_storage).toBeUndefined();
    expect(pruned.web_login).toBeUndefined();
  });
});

describe('AI選定の公平性', () => {
  it('何も答えていないときは、どのカテゴリでも1つのAIだけを1位にしない', () => {
    for (const c of CATEGORIES) {
      expect(recommend(c.id, {}).topGroup.length, c.id).toBeGreaterThanOrEqual(2);
    }
  });
  it('ふだん使っているAIだけでは、機能差のある判定を覆さない', () => {
    const r = recommend('image', { img_mode: one('new'), using_ai: one('claude') });
    expect(r.topGroup).not.toContain('claude');
  });
  it('機能差がないときは、ふだん使っているAIが先頭に来る', () => {
    expect(recommend('writing', { using_ai: one('gemini') }).topGroup[0]).toBe('gemini');
  });
  it('画像生成ツール向けの指示文だけが欲しい場合は Claude も候補になる', () => {
    const r = recommend('image', { img_mode: one('prompt') });
    expect(r.topGroup).toContain('claude');
    expect(r.ranking.find((x) => x.ai === 'claude')!.blockedBy).toEqual([]);
  });
  it('かんたん診断の質問は depth=quick で絞り込まれる', () => {
    expect(getVisibleQuestions('web', {}, 'quick').map((q) => q.id)).toEqual(['goal', 'web_type', 'web_env', 'web_storage', 'using_ai']);
    expect(getVisibleQuestions('web', {}).length).toBeGreaterThan(5);
  });
});

describe('AI選定ロジック', () => {
  it('全カテゴリで回答なしでも結果が出る（判断材料不足を明示）', () => {
    for (const c of CATEGORIES) {
      const r = recommend(c.id, {});
      expect(r.ranking).toHaveLength(3);
      expect(r.topGroup.length).toBeGreaterThan(0);
      expect(r.confidence).toBe('low');
    }
  });
  it('画像の新規生成では Claude は1位にならず、制約が示される', () => {
    const r = recommend('image', { img_mode: one('new') });
    expect(r.topGroup).not.toContain('claude');
    const claude = r.ranking.find((x) => x.ai === 'claude')!;
    expect(claude.blockedBy).toContain('imageGen');
  });
  it('Web開発で Claude Code を選ぶと Claude が上位', () => {
    const r = recommend('web', { web_env: one('claude-code'), web_type: one('service') });
    expect(r.topGroup[0]).toBe('claude');
    expect(r.howTo.join()).toContain('Claude Code');
  });
  it('回答によって結果が変わる（Googleサービス中心の自動化は Gemini が上位）', () => {
    const google = recommend('automation', { au_services: one('google'), au_connect: one('gas') });
    expect(google.topGroup).toContain('gemini');
    const script = recommend('automation', { au_connect: one('script'), au_services: one('none') });
    expect(script.topGroup).not.toEqual(google.topGroup);
  });
  it('判断に影響した条件に回答内容が含まれる', () => {
    const r = recommend('research', { rs_freshness: one('latest'), rs_depth: one('deep') });
    expect(r.influentialFactors.join()).toMatch(/情報の新しさ|調査の深さ/);
  });
  it('無料 + Claude Code の組み合わせでは注意事項を表示', () => {
    const r = recommend('web', { budget: one('free'), web_env: one('claude-code') });
    expect(r.cautions.join()).toContain('無料プランでは利用できません');
  });
  it('スコアは段階評価のための 0〜1 の範囲', () => {
    for (const s of recommend('data', { d_format: one('excel') }).ranking) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(1);
    }
  });
});

describe('プロンプト生成', () => {
  const answers: Answers = {
    goal: { values: [], text: '家計簿アプリを作りたい' },
    web_type: one('tool'),
    web_env: one('claude-code'),
    web_storage: one('local'),
    web_features: { values: ['crud', 'search'] },
    skill_code: one('none'),
  };
  const rec = recommend('web', answers);

  it('出力先ごとに構成が変わる', () => {
    const cc = generatePrompt({ categoryId: 'web', answers, mode: 'standard', target: 'claude-code', recommendation: rec }).text;
    const claude = generatePrompt({ categoryId: 'web', answers, mode: 'standard', target: 'claude', recommendation: rec }).text;
    const gpt = generatePrompt({ categoryId: 'web', answers, mode: 'standard', target: 'chatgpt', recommendation: rec }).text;
    const browser = generatePrompt({ categoryId: 'web', answers, mode: 'standard', target: 'browser', recommendation: rec }).text;
    expect(cc).toContain('ファイル構成');
    expect(cc).toMatch(/ビルド.*テスト/);
    expect(claude).toContain('<requirements>');
    expect(gpt).not.toContain('<requirements>');
    expect(browser).toContain('省略せず');
    expect(new Set([cc, claude, gpt, browser]).size).toBe(4);
  });
  it('回答内容が整理されて含まれる', () => {
    const t = generatePrompt({ categoryId: 'web', answers, mode: 'standard', target: 'claude-code' }).text;
    expect(t).toContain('家計簿アプリを作りたい');
    expect(t).toContain('LocalStorage');
    expect(t).toContain('データの登録・編集・削除');
    expect(t).toContain('エラー処理');
    expect(t).toContain('セキュリティ');
    expect(t).toContain('レスポンシブ');
  });
  it('モードで長さが変わる（最短 < 標準 < 高品質）', () => {
    const len = (mode: 'short' | 'standard' | 'quality') => generatePrompt({ categoryId: 'web', answers, mode, target: 'chatgpt' }).text.length;
    expect(len('short')).toBeLessThan(len('standard'));
    expect(len('standard')).toBeLessThan(len('quality'));
  });
  it('未回答の項目は「不明点への対応」にまとめる', () => {
    const t = generatePrompt({ categoryId: 'writing', answers: { w_type: one('blog') }, mode: 'standard', target: 'chatgpt' }).text;
    expect(t).toContain('不明点への対応');
    expect(t).toContain('文体');
  });
  it('画像カテゴリで Claude 向けは画像生成用プロンプトの作成に切り替わる', () => {
    const t = generatePrompt({ categoryId: 'image', answers: {}, mode: 'standard', target: 'claude' }).text;
    expect(t).toContain('画像生成ツール');
  });
  it('全カテゴリ・全出力先・全モードで生成できる', () => {
    for (const c of CATEGORIES) {
      for (const target of availableTargets(c.id)) {
        for (const mode of ['short', 'standard', 'quality'] as const) {
          const g = generatePrompt({ categoryId: c.id, answers: {}, mode, target });
          expect(g.text.length, `${c.id}/${target}/${mode}`).toBeGreaterThan(80);
          expect(g.explanation.howTo.length).toBeGreaterThan(0);
        }
      }
    }
  });
  it('開発環境の回答から出力先を提案', () => {
    expect(suggestTarget('web', { web_env: one('claude-code') })).toBe('claude-code');
    expect(suggestTarget('web', { web_env: one('browser') })).toBe('browser');
    expect(availableTargets('writing')).toEqual(['chatgpt', 'gemini', 'claude']);
  });
});

describe('テンプレート', () => {
  const t = TEMPLATES.find((x) => x.id === 'bug-error')!;
  it('入力内容で置き換わり、未入力は補足文になる', () => {
    const out = fillTemplate(t, { doing: 'npm run build', error: 'TypeError: x is undefined' });
    expect(out).toContain('npm run build');
    expect(out).toContain('TypeError');
    expect(out).toContain(UNFILLED);
    expect(out).not.toMatch(/\{\{\w+\}\}/);
  });
  it('必須項目のチェック', () => {
    expect(missingRequired(t, {})).toEqual(['何をしたらエラーが出たか', 'エラーメッセージ']);
  });
  it('検索と絞り込み', () => {
    expect(searchTemplates(TEMPLATES, 'Instagram', null).map((x) => x.id)).toContain('sns-instagram');
    expect(searchTemplates(TEMPLATES, '', 'バグ修正').every((x) => x.group === 'バグ修正')).toBe(true);
  });
});

describe('テンプレートの出力先切り替え', () => {
  const bug = TEMPLATES.find((x) => x.id === 'bug-error')!;
  const img = TEMPLATES.find((x) => x.id === 'img-eyecatch')!;
  it('出力先ごとに構成が変わる', () => {
    const filled = fillTemplate(bug, { doing: 'build', error: 'E' });
    const claude = adaptTemplate(filled, bug, 'claude');
    const gpt = adaptTemplate(filled, bug, 'chatgpt');
    const cc = adaptTemplate(filled, bug, 'claude-code');
    expect(claude).toContain('<instructions>');
    expect(claude).toContain('<working_style>');
    expect(gpt).not.toContain('<instructions>');
    expect(gpt).toContain('回答のルール');
    expect(cc).toContain('ファイルを直接作成・編集');
    expect(cc).toContain('ビルド');
    for (const t of [claude, gpt, cc]) expect(t).toContain('build');
  });
  it('開発系だけ開発向けの出力先を選べる', () => {
    expect(availableTemplateTargets(bug)).toContain('claude-code');
    expect(availableTemplateTargets(img)).toEqual(['chatgpt', 'gemini', 'claude']);
    expect(availableTemplateTargets(TEMPLATES.find((x) => x.id === 'webapp-claude-code')!)).toEqual(['claude-code']);
  });
  it('画像テンプレートを Claude 向けにすると、画像生成用プロンプトの作成に切り替わる', () => {
    expect(adaptTemplate(fillTemplate(img, { title: 'x' }), img, 'claude')).toContain('画像生成ツール');
  });
  it('すべてのテンプレートの既定の出力先は選択肢に含まれる', () => {
    for (const t of TEMPLATES) expect(availableTemplateTargets(t)).toContain(defaultTemplateTarget(t));
  });
});

describe('保存データの検証・インポート', () => {
  it('不正なJSONや他アプリのファイルを拒否', () => {
    expect(parseImport('not json').ok).toBe(false);
    expect(parseImport(JSON.stringify({ foo: 1 })).ok).toBe(false);
    expect(parseImport(JSON.stringify({ app: 'ai-tool-navigator', version: 99, data: {} })).ok).toBe(false);
  });
  it('壊れた項目だけを取り除いて読み込む', () => {
    const file = {
      app: 'ai-tool-navigator',
      version: 1,
      data: {
        savedPrompts: [
          { id: 'ok-1', title: 'A', body: 'body', createdAt: '2026-01-01T00:00:00Z', source: 'manual' },
          { id: '<script>', title: 'B', body: 'x', createdAt: '2026-01-01' },
          { title: 'no id' },
        ],
        history: [{ id: 'h1', createdAt: '2026-01-01T00:00:00Z', categoryId: 'unknown', answers: {} }],
        favorites: ['claude', 'hacker'],
      },
    };
    const r = parseImport(JSON.stringify(file));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.savedPrompts.map((p) => p.id)).toEqual(['ok-1']);
    expect(r.data.history).toHaveLength(0);
    expect(r.data.favorites).toEqual(['claude']);
    expect(r.counts.skipped).toBe(3);
  });
  it('エクスポートしたものを再インポートできる', () => {
    const data = createEmptyData();
    data.savedPrompts.push({ id: 'p1', title: 't', body: 'b', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', source: 'manual' });
    const r = parseImport(JSON.stringify(buildExport(data)));
    expect(r.ok && r.data.savedPrompts[0].id).toBe('p1');
  });
  it('結合時は新しい方を優先', () => {
    const a = sanitizeAppData({ savedPrompts: [{ id: 'p', title: 'old', body: '', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }] });
    const b = sanitizeAppData({ savedPrompts: [{ id: 'p', title: 'new', body: '', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' }] });
    expect(mergeData(a, b).savedPrompts[0].title).toBe('new');
  });
  it('LocalStorage の値が想定外の型でも初期値に戻す', () => {
    expect(sanitizeAppData('string').history).toEqual([]);
    expect(sanitizeAppData({ preferences: { mode: 'evil' } }).preferences.mode).toBe('standard');
  });
});
