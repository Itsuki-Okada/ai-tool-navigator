import type { PromptTarget } from '../types';

/**
 * テンプレートの出力先（使うAI）の設定
 * ----------------------------------------------------------------
 * - DEV_TEMPLATE_GROUPS のテンプレートは、Claude Code などの開発向け出力先も選べます
 * - TEMPLATE_TARGET_OVERRIDE で、特定のテンプレートの出力先を限定できます
 * - GROUP_TARGET_NOTES で、グループ × 出力先ごとに注意書き（指示文の先頭に追加）を設定できます
 */

export const DEV_TEMPLATE_GROUPS = ['Webアプリ開発', 'Webサイト制作', 'バグ修正', 'コードレビュー', '業務自動化'];

/** 本文が特定の環境向けに書かれているテンプレートは、出力先を限定 */
export const TEMPLATE_TARGET_OVERRIDE: Record<string, PromptTarget[]> = {
  'webapp-claude-code': ['claude-code'],
  'webapp-browser': ['chatgpt', 'gemini', 'claude', 'browser'],
  'workflow-improve': ['chatgpt', 'gemini', 'claude'],
};

export const GROUP_TARGET_NOTES: Record<string, Partial<Record<PromptTarget, string>>> = {
  画像生成: {
    claude:
      'Claudeは画像を直接生成する機能を標準では備えていないため、以下の内容をもとに、画像生成ツール（ChatGPT・Geminiなど）にそのまま貼り付けられるプロンプトを日本語版・英語版で作成してください。',
  },
  ロゴ制作: {
    claude: 'ラフ画像は生成せず、画像生成ツールに貼り付けるためのプロンプトを日本語版・英語版で作成してください。',
  },
  動画制作: {
    claude: '映像そのものは生成せず、構成・台本・テロップなどの文章として作成してください。',
  },
  市場調査: {
    chatgpt: 'Web検索機能を使って最新情報を確認してください。',
    gemini: 'Google検索を使って最新情報を確認してください。',
    claude: 'Web検索機能を使って最新情報を確認してください（利用できない場合は、確認が必要な箇所を明記してください）。',
  },
};
