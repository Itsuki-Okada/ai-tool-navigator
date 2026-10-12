import type { Category, CategoryId } from '../types';

/**
 * カテゴリ定義
 * 新しいカテゴリを追加するときは:
 *  1. ここに1件追加（questionIds で質問の順番、quickQuestionIds で「かんたん診断」の5問を指定）
 *  2. src/data/questions.ts に必要な質問を追加
 *  3. src/data/scoringRules.ts と src/data/promptRecipes.ts にルールを追加
 *  4. src/types.ts の CategoryId に id を追加
 */
export const CATEGORIES: Category[] = [
  {
    id: 'web',
    title: 'Webサイト・Webアプリ開発',
    short: 'Web開発',
    description: 'LP、ポートフォリオ、ツール、Webサービスなどを作りたい',
    icon: 'Globe',
    examples: ['ポートフォリオサイト', '予約フォーム付きのLP', 'ToDo管理アプリ'],
    isDev: true,
    questionIds: [
      'goal', 'web_type', 'web_features', 'web_env', 'web_storage', 'web_login',
      'web_integrations', 'web_design', 'skill_code', 'quality', 'priority', 'budget', 'deadline', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'web_type', 'web_env', 'web_storage', 'using_ai'],
  },
  {
    id: 'code',
    title: 'プログラミング・コード修正',
    short: 'コード',
    description: 'エラーを直したい、機能を追加したい、コードを理解したい',
    icon: 'Code2',
    examples: ['エラーの原因を知りたい', '既存アプリに機能を追加', 'コードの読み方を学ぶ'],
    isDev: true,
    questionIds: [
      'goal', 'code_task', 'code_lang', 'code_env', 'code_existing', 'code_error',
      'code_understanding', 'priority', 'budget', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'code_task', 'code_env', 'code_error', 'using_ai'],
  },
  {
    id: 'image',
    title: '画像生成・イラスト・デザイン',
    short: '画像',
    description: 'イラスト、バナー、写真風の画像、ロゴ案などを作りたい',
    icon: 'Palette',
    examples: ['ブログのアイキャッチ', 'SNS用バナー', 'キャラクターのイラスト'],
    questionIds: [
      'goal', 'img_mode', 'img_type', 'img_use', 'img_style', 'img_ratio', 'img_text',
      'img_quality', 'budget', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'img_mode', 'img_type', 'img_style', 'using_ai'],
  },
  {
    id: 'video',
    title: '動画制作・編集',
    short: '動画',
    description: '動画の企画・台本・編集・生成をAIで効率化したい',
    icon: 'Clapperboard',
    examples: ['YouTubeの台本', 'ショート動画の構成', '商品紹介動画'],
    questionIds: [
      'goal', 'vid_type', 'vid_length', 'vid_tasks', 'vid_software', 'vid_caption', 'vid_use',
      'budget', 'deadline', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'vid_type', 'vid_length', 'vid_tasks', 'using_ai'],
  },
  {
    id: 'writing',
    title: '文章・ブログ・コピーライティング',
    short: '文章',
    description: 'ブログ記事、メール、キャッチコピー、説明文を書きたい',
    icon: 'PenLine',
    examples: ['SEOブログ記事', '商品紹介文', 'ビジネスメール'],
    questionIds: ['goal', 'w_type', 'w_reader', 'w_purpose', 'w_tone', 'w_length', 'w_media', 'quality', 'using_ai', 'notes'],
    quickQuestionIds: ['goal', 'w_type', 'w_reader', 'w_length', 'using_ai'],
  },
  {
    id: 'idea',
    title: '企画・アイデア出し',
    short: '企画',
    description: '新しい企画、イベント、商品などのアイデアを広げたい',
    icon: 'Lightbulb',
    examples: ['新サービスのアイデア', 'イベント企画', 'YouTubeのネタ'],
    questionIds: [
      'goal', 'idea_type', 'idea_target', 'idea_purpose', 'idea_constraints', 'idea_count', 'idea_criteria',
      'freshness', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'idea_type', 'idea_target', 'idea_purpose', 'using_ai'],
  },
  {
    id: 'marketing',
    title: 'マーケティング・SNS運用',
    short: 'マーケ',
    description: 'SNS投稿、広告文、集客施策を考えたい',
    icon: 'Megaphone',
    examples: ['Instagram投稿案', '広告コピー', 'キャンペーン施策'],
    questionIds: [
      'goal', 'mk_platform', 'mk_target', 'mk_product', 'mk_goal', 'mk_issue', 'mk_output', 'budget', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'mk_platform', 'mk_product', 'mk_output', 'using_ai'],
  },
  {
    id: 'data',
    title: 'データ分析・資料作成',
    short: 'データ',
    description: 'Excel・CSVの分析、グラフ作成、プレゼン資料づくり',
    icon: 'ChartColumn',
    examples: ['売上データの集計', 'アンケート分析', '報告資料の作成'],
    questionIds: [
      'goal', 'd_format', 'd_size', 'd_purpose', 'd_output', 'd_software', 'd_sensitivity', 'skill_general', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'd_format', 'd_purpose', 'd_sensitivity', 'using_ai'],
  },
  {
    id: 'automation',
    title: '業務効率化・自動化',
    short: '自動化',
    description: '毎日の作業を減らしたい、ツール同士をつなぎたい',
    icon: 'Workflow',
    examples: ['メールの自動振り分け', 'スプレッドシートの自動集計', '定型文の作成'],
    isDev: true,
    questionIds: [
      'goal', 'au_task', 'au_steps', 'au_services', 'au_frequency', 'au_connect', 'au_constraints', 'skill_code', 'using_ai', 'notes',
    ],
    quickQuestionIds: ['goal', 'au_task', 'au_services', 'au_connect', 'using_ai'],
  },
  {
    id: 'research',
    title: '情報収集・リサーチ',
    short: 'リサーチ',
    description: '市場調査、競合調査、テーマの下調べをしたい',
    icon: 'Search',
    examples: ['競合サービスの比較', '業界動向の調査', '論文の要約'],
    questionIds: ['goal', 'rs_topic', 'rs_freshness', 'rs_sources', 'rs_depth', 'rs_output', 'using_ai', 'notes'],
    quickQuestionIds: ['goal', 'rs_topic', 'rs_freshness', 'rs_depth', 'using_ai'],
  },
  {
    id: 'strategy',
    title: 'ビジネス戦略・事業計画',
    short: '戦略',
    description: '事業計画書、戦略の整理、意思決定の材料を作りたい',
    icon: 'Briefcase',
    examples: ['事業計画書の骨子', 'SWOT分析', '新規事業の検討'],
    questionIds: ['goal', 'st_type', 'st_stage', 'st_inputs', 'st_output', 'freshness', 'priority', 'deadline', 'using_ai', 'notes'],
    quickQuestionIds: ['goal', 'st_type', 'st_stage', 'st_inputs', 'using_ai'],
  },
  {
    id: 'other',
    title: 'その他・自由入力',
    short: 'その他',
    description: '当てはまるものがない場合は、自由に入力してください',
    icon: 'Sparkles',
    examples: ['学習の計画', '旅行プラン', '悩み相談の整理'],
    questionIds: ['goal', 'other_output', 'other_input', 'tools', 'skill_general', 'freshness', 'quality', 'priority', 'budget', 'using_ai', 'notes'],
    quickQuestionIds: ['goal', 'other_output', 'other_input', 'tools', 'using_ai'],
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export function isCategoryId(v: unknown): v is CategoryId {
  return typeof v === 'string' && v in CATEGORY_MAP;
}
