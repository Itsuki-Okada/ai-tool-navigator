import type { AiId, AiProfile, NeedId, NeedMeta } from '../types';

/**
 * AIごとの特徴データ
 * ----------------------------------------------------------------
 * - level は「この用途にどの程度向いているか」の相対的な目安です（0〜3）。
 *   ベンチマークの数値ではありません。
 * - 機能や料金はプラン・モデル・地域・時期で変わります。
 *   見直したら lastReviewed を更新してください。
 * - 確認できていない内容は note に断定的に書かず、varies: true を付けます。
 *
 * 【判定の公平性について】
 * 文章の上手さ・コードの品質・発想力のような「主観的な品質」は、
 * 根拠のある優劣をつけられないため3つとも同じ値にしています。
 * 差をつけるのは、画像・動画の生成機能の有無、Googleサービスとの統合、
 * 扱える資料の長さなど「機能として確認できる違い」だけです。
 */

export const DATA_LAST_REVIEWED = '2026-10-12';

export const NEEDS: Record<NeedId, NeedMeta> = {
  longContext: { id: 'longContext', label: '長い資料・大量テキストの処理', criterion: 'files' },
  agenticCoding: { id: 'agenticCoding', label: 'ローカル環境での開発エージェント', criterion: 'environment' },
  codeAssist: { id: 'codeAssist', label: 'コード生成・修正', criterion: 'code' },
  writing: { id: 'writing', label: '自然で読みやすい文章作成', criterion: 'output' },
  imageGen: { id: 'imageGen', label: '画像の生成', criterion: 'media' },
  imageEdit: { id: 'imageEdit', label: '画像の編集', criterion: 'media' },
  videoGen: { id: 'videoGen', label: '動画の生成', criterion: 'media' },
  vision: { id: 'vision', label: '画像・PDFの読み取り', criterion: 'files' },
  webSearch: { id: 'webSearch', label: '最新情報の検索', criterion: 'freshness' },
  deepResearch: { id: 'deepResearch', label: '複数ソースを使った調査レポート', criterion: 'freshness' },
  googleIntegration: { id: 'googleIntegration', label: 'Googleサービスとの連携', criterion: 'environment' },
  integrations: { id: 'integrations', label: '外部サービス・ツール連携', criterion: 'features' },
  dataAnalysis: { id: 'dataAnalysis', label: 'ファイルを使ったデータ分析', criterion: 'files' },
  ideation: { id: 'ideation', label: 'アイデア出し・壁打ち', criterion: 'task' },
  beginner: { id: 'beginner', label: '初心者の使いやすさ', criterion: 'ease' },
  freeUse: { id: 'freeUse', label: '無料で始められる範囲', criterion: 'cost' },
  structured: { id: 'structured', label: '長く構造化された指示への対応', criterion: 'output' },
  voice: { id: 'voice', label: '音声での対話', criterion: 'media' },
};

export const CRITERIA_LABELS = {
  task: 'タスクとの適合性',
  features: '必要な機能との適合性',
  environment: '使用環境との適合性',
  files: '扱う情報やファイルとの適合性',
  ease: '操作のしやすさ',
  cost: 'コスト条件との適合性',
  freshness: '最新情報への対応',
  code: 'コード生成・修正',
  media: '画像・音声・動画の扱い',
  output: '出力形式との適合性',
} as const;

export const AI_PROFILES: Record<AiId, AiProfile> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    tagline: '画像生成・検索・データ分析まで1か所で扱える万能型',
    colorVar: '--ai-chatgpt',
    officialUrl: 'https://chatgpt.com/',
    pricingUrl: 'https://openai.com/chatgpt/pricing/',
    lastReviewed: DATA_LAST_REVIEWED,
    goodFor: [
      '画像生成と文章作成を同じ会話で進める作業',
      'アップロードしたファイルの集計・グラフ作成',
      'Web検索を使った調べもの',
      '幅広い用途の相談・壁打ち',
    ],
    cautions: [
      '利用できるモデルや回数の上限はプランによって異なります',
      '生成した内容（特に数値・固有名詞）は自分で確認が必要です',
    ],
    capabilities: {
      longContext: { level: 2, note: '長めの資料も扱えます', limitation: '一度に扱える量はモデル・プランによって異なります', varies: true },
      agenticCoding: { level: 3, note: 'Codex などの開発向けツールでプロジェクトを直接編集できます', varies: true },
      codeAssist: { level: 3, note: 'コードの生成・説明・修正に幅広く対応します' },
      writing: { level: 3, note: '多様な文体の文章作成に対応します' },
      imageGen: { level: 3, note: '会話の中で画像を生成できます', varies: true },
      imageEdit: { level: 3, note: 'アップロードした画像をもとに編集・再生成できます', varies: true },
      videoGen: { level: 2, note: '動画生成機能（Sora）が提供されています', limitation: '動画生成はプランや地域によって利用条件が異なります', varies: true },
      vision: { level: 3, note: '画像やPDFの内容を読み取って回答できます' },
      webSearch: { level: 3, note: 'Web検索を使った回答に対応します' },
      deepResearch: { level: 3, note: '複数のWebページを調べてレポートにまとめる機能があります', varies: true },
      googleIntegration: { level: 1, note: '一部のサービスはコネクタ経由で連携できます', limitation: 'Googleサービスとの統合はGeminiほど深くありません', varies: true },
      integrations: { level: 3, note: 'GPTs やアプリ連携などで機能を拡張できます', varies: true },
      dataAnalysis: { level: 3, note: 'ファイルをアップロードして、コードを実行しながら集計・グラフ化できます' },
      ideation: { level: 3, note: 'アイデア出しや壁打ちに使えます' },
      beginner: { level: 3, note: '利用者が多く、使い方の情報を見つけやすいです' },
      freeUse: { level: 2, note: '無料プランがあります', limitation: '無料プランでは利用できる機能や回数が限られます', varies: true },
      structured: { level: 3, note: '見出しや箇条書きで整理された長い指示にも対応します' },
      voice: { level: 3, note: '音声での対話モードがあります', varies: true },
    },
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    tagline: 'Google検索・Googleドキュメントなどと連携しやすい',
    colorVar: '--ai-gemini',
    officialUrl: 'https://gemini.google.com/',
    pricingUrl: 'https://gemini.google/subscriptions/',
    lastReviewed: DATA_LAST_REVIEWED,
    goodFor: [
      'Gmail・Googleドキュメント・ドライブを使う作業',
      'Google検索を使った最新情報の確認',
      '長い資料や動画の内容整理',
      '画像生成や動画生成を試す作業',
    ],
    cautions: [
      'Google Workspace との連携機能はアカウントの種類や設定で使えない場合があります',
      '利用できるモデルや機能はプランによって異なります',
    ],
    capabilities: {
      longContext: { level: 3, note: '非常に長い資料を一度に扱えるモデルが提供されています', varies: true },
      agenticCoding: { level: 3, note: 'Gemini CLI などの開発向けツールでプロジェクトを直接編集できます', varies: true },
      codeAssist: { level: 3, note: 'コードの生成・説明・修正に対応します' },
      writing: { level: 3, note: '文章作成や要約に対応します' },
      imageGen: { level: 3, note: '会話の中で画像を生成・編集できます', varies: true },
      imageEdit: { level: 3, note: 'アップロードした画像の編集に対応します', varies: true },
      videoGen: { level: 2, note: '動画生成機能（Veo）が提供されています', limitation: '動画生成は有料プランなど利用条件があります', varies: true },
      vision: { level: 3, note: '画像・PDF・動画の内容を読み取れます', varies: true },
      webSearch: { level: 3, note: 'Google検索と組み合わせた回答に対応します' },
      deepResearch: { level: 3, note: '複数のWebページを調べてレポートにまとめる機能があります', varies: true },
      googleIntegration: { level: 3, note: 'Gmail・ドキュメント・ドライブなどと連携できます', varies: true },
      integrations: { level: 2, note: 'Googleサービスを中心に連携機能があります', varies: true },
      dataAnalysis: { level: 3, note: 'ファイルやスプレッドシートの分析に対応します', varies: true },
      ideation: { level: 3, note: 'アイデア出しや壁打ちに使えます' },
      beginner: { level: 3, note: 'Googleアカウントがあればすぐに始められます' },
      freeUse: { level: 2, note: '無料で使える範囲があります', limitation: '無料の範囲では利用できるモデルや回数が限られます', varies: true },
      structured: { level: 3, note: '見出しや箇条書きで整理された長い指示に対応します' },
      voice: { level: 3, note: '音声での対話機能があります', varies: true },
    },
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    tagline: '長い資料・文章・コーディング、Claude Codeでの開発に向く',
    colorVar: '--ai-claude',
    officialUrl: 'https://claude.ai/',
    pricingUrl: 'https://claude.com/pricing',
    lastReviewed: DATA_LAST_REVIEWED,
    goodFor: [
      'Claude Code を使ったアプリ開発・既存コードの修正',
      '長い資料を読み込んだ要約・分析',
      '丁寧で自然な長文の作成・推敲',
      '細かい条件を含む長い指示に沿った作業',
    ],
    cautions: [
      '画像や動画を直接生成する機能は標準では備えていません',
      'Claude Code の利用には有料プランまたはAPIの利用契約が必要です',
      '利用できる機能や回数はプランによって異なります',
    ],
    capabilities: {
      longContext: { level: 3, note: '長い資料を読み込んで処理するのに向いています', varies: true },
      agenticCoding: { level: 3, note: 'Claude Code でプロジェクト全体を読み、編集・実行・修正まで進められます', limitation: 'Claude Code は有料プランまたはAPI契約が必要です', varies: true },
      codeAssist: { level: 3, note: 'コードの生成・レビュー・修正に対応します' },
      writing: { level: 3, note: '長文の作成・推敲に対応します' },
      imageGen: { level: 0, note: '画像生成用のプロンプト作成には活用できます', limitation: '画像を直接生成する機能は標準では備えていません' },
      imageEdit: { level: 0, note: '画像の内容を読み取って改善案を出せます', limitation: '画像を直接編集する機能は標準では備えていません' },
      videoGen: { level: 0, note: '台本や構成づくりには活用できます', limitation: '動画を直接生成する機能は標準では備えていません' },
      vision: { level: 3, note: '画像やPDFの内容を読み取れます' },
      webSearch: { level: 3, note: 'Web検索機能を使った回答に対応します', varies: true },
      deepResearch: { level: 3, note: '複数のWebページを調べてレポートにまとめる機能があります', varies: true },
      googleIntegration: { level: 1, note: '一部のGoogleサービスはコネクタ経由で連携できます', limitation: 'Googleサービスとの統合はGeminiほど深くありません', varies: true },
      integrations: { level: 3, note: 'MCP（外部ツールとつなぐ仕組み）で多様なサービスと連携できます', varies: true },
      dataAnalysis: { level: 3, note: 'ファイルを読み込んだ分析やコード実行に対応します', varies: true },
      ideation: { level: 3, note: 'アイデア出しや壁打ちに使えます' },
      beginner: { level: 3, note: 'シンプルな画面ですぐに使い始められます' },
      freeUse: { level: 2, note: '無料プランがあります', limitation: '無料プランでは利用回数が限られ、Claude Code は利用できません', varies: true },
      structured: { level: 3, note: '細かい条件を含む長い指示に対応します' },
      voice: { level: 3, note: '音声での対話に対応しています', varies: true },
    },
  },
};

export const AI_IDS: AiId[] = ['chatgpt', 'gemini', 'claude'];
