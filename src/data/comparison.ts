import type { AiId } from '../types';
import { DATA_LAST_REVIEWED } from './aiProfiles';

/**
 * AI比較ページのデータ
 * ----------------------------------------------------------------
 * - text は「一般的に公開されている情報」に基づく要約です。
 * - varies: true の項目は、モデル・プラン・地域などで差があることを画面に表示します。
 * - 料金の具体的な金額は変動するため掲載せず、公式ページへのリンクを表示します。
 * - 内容を見直したら lastReviewed を更新してください。
 */

export interface ComparisonCell {
  text: string;
  varies?: boolean;
}

export interface ComparisonRow {
  id: string;
  label: string;
  help?: string;
  cells: Record<AiId, ComparisonCell>;
}

export const COMPARISON_LAST_REVIEWED = DATA_LAST_REVIEWED;

export const COMPARISON_NOTE =
  'この比較は作成時点で一般に公開されている情報をもとにした目安です。AIサービスの機能・料金・利用条件は頻繁に変わり、モデルやプラン、地域によっても異なります。利用前に必ず各公式サイトで最新情報を確認してください。';

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: 'strength',
    label: '得意な用途',
    cells: {
      chatgpt: { text: '文章・画像生成・データ分析・検索などを1つの画面で幅広く扱える' },
      gemini: { text: 'Google検索やGmail・ドキュメントなどGoogleのサービスと組み合わせた作業' },
      claude: { text: '長い資料の読み込み、丁寧な長文作成、コーディング（Claude Code での開発を含む）' },
    },
  },
  {
    id: 'coding',
    label: 'コーディング',
    cells: {
      chatgpt: { text: 'コード生成・説明・修正に対応。開発向けツール（Codex）も提供', varies: true },
      gemini: { text: 'コード生成・説明・修正に対応。開発向けツール（Gemini CLI など）も提供', varies: true },
      claude: { text: 'コード生成・レビュー・修正に対応。Claude Code でプロジェクトを直接編集・実行できる', varies: true },
    },
  },
  {
    id: 'writing',
    label: '文章作成',
    cells: {
      chatgpt: { text: '幅広い文体・形式に対応。画像生成と組み合わせた制作がしやすい' },
      gemini: { text: '文章作成・要約に対応。Googleドキュメントへの書き出しがしやすい', varies: true },
      claude: { text: '長文の作成・推敲に対応。長い参考資料をふまえた執筆がしやすい' },
    },
  },
  {
    id: 'files',
    label: '画像やファイルの取り扱い',
    help: '画像・PDF・表データなどの読み取り、画像の生成',
    cells: {
      chatgpt: { text: '画像・PDF・表データの読み取りに対応。画像生成にも対応', varies: true },
      gemini: { text: '画像・PDF・動画などの読み取りに対応。画像生成にも対応', varies: true },
      claude: { text: '画像・PDFなどの読み取りに対応。画像の生成は標準では非対応' },
    },
  },
  {
    id: 'search',
    label: '情報検索',
    cells: {
      chatgpt: { text: 'Web検索を使った回答・調査レポート機能に対応', varies: true },
      gemini: { text: 'Google検索と組み合わせた回答・調査レポート機能に対応', varies: true },
      claude: { text: 'Web検索を使った回答・調査機能に対応', varies: true },
    },
  },
  {
    id: 'long',
    label: '長い資料の処理',
    help: '一度に読み込める文章の量（コンテキスト長）',
    cells: {
      chatgpt: { text: '長めの資料に対応。扱える量はモデル・プランで異なる', varies: true },
      gemini: { text: '非常に長い資料を扱えるモデルが提供されている', varies: true },
      claude: { text: '長い資料の読み込みに対応したモデルが提供されている', varies: true },
    },
  },
  {
    id: 'integrations',
    label: '外部サービスとの連携',
    cells: {
      chatgpt: { text: 'GPTs やアプリ・コネクタで外部サービスと連携できる', varies: true },
      gemini: { text: 'Gmail・ドライブ・カレンダーなどGoogleのサービスと連携しやすい', varies: true },
      claude: { text: 'MCP（外部ツールとつなぐ共通の仕組み）やコネクタで連携できる', varies: true },
    },
  },
  {
    id: 'beginner',
    label: '初心者向けの使いやすさ',
    cells: {
      chatgpt: { text: '利用者が多く、使い方の情報を探しやすい' },
      gemini: { text: 'Googleアカウントがあればすぐに使い始められる' },
      claude: { text: 'チャット画面はシンプル。Claude Code はターミナル操作に慣れが必要' },
    },
  },
  {
    id: 'devenv',
    label: '開発環境との相性',
    cells: {
      chatgpt: { text: 'ブラウザでの相談のほか、開発向けツールやエディタ拡張がある', varies: true },
      gemini: { text: 'ブラウザでの相談のほか、CLIツールやGoogleの開発環境との連携がある', varies: true },
      claude: { text: 'Claude Code（ターミナル・エディタ拡張・デスクトップアプリ）でプロジェクト全体を扱える', varies: true },
    },
  },
  {
    id: 'pricing',
    label: '料金体系',
    help: '具体的な金額は変動するため掲載していません',
    cells: {
      chatgpt: { text: '無料プランと有料プランあり。利用できる機能・回数はプランで異なる', varies: true },
      gemini: { text: '無料で使える範囲と有料プランあり。Google One などとセットのプランもある', varies: true },
      claude: { text: '無料プランと有料プランあり。Claude Code は有料プランまたはAPI契約で利用', varies: true },
    },
  },
  {
    id: 'limits',
    label: '主な制約',
    cells: {
      chatgpt: { text: '無料プランでは利用回数・機能に上限がある。回答の正確性は自分で確認が必要', varies: true },
      gemini: { text: '一部の連携機能はアカウントの種類（個人・組織）や設定で使えない場合がある', varies: true },
      claude: { text: '画像・動画の生成機能は標準では非対応。無料プランでは利用回数に上限がある', varies: true },
    },
  },
];
