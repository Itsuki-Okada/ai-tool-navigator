import { CATEGORY_MAP } from '../../data/categories';
import type { Answers, CategoryId, PromptMode, PromptTarget } from '../../types';

/**
 * 開発用途（Web開発・コード・自動化）のプロンプトに追加する内容
 * 使用技術・ファイル構成・実装手順・エラー処理・セキュリティ・テストなど
 */

export interface DevSpec {
  stack: string[];
  stackLine: string;
  files: string[];
  rules: string[];
  steps: string[];
  background: string[];
  qualityExtras: string[];
  checks: string[];
  done: string[];
  shortRules: string[];
}

const v = (answers: Answers, id: string) => answers[id]?.values ?? [];
const has = (answers: Answers, id: string, value: string) => v(answers, id).includes(value);

export function isDevPrompt(categoryId: CategoryId, answers: Answers, _target: PromptTarget): boolean {
  if (!CATEGORY_MAP[categoryId].isDev) return false;
  if (categoryId === 'web' && has(answers, 'web_env', 'nocode')) return false;
  if (categoryId === 'automation' && (has(answers, 'au_connect', 'nocode') || has(answers, 'au_connect', 'ai-only'))) return false;
  if (categoryId === 'code' && has(answers, 'code_task', 'learn')) return false;
  return true;
}

function webStack(answers: Answers): { stack: string[]; files: string[]; simple: boolean } {
  const beginner = v(answers, 'skill_code').some((x) => x === 'none' || x === 'basic');
  const browserOnly = has(answers, 'web_env', 'browser');
  const simple = browserOnly && beginner;
  const stack: string[] = [];
  if (simple) {
    stack.push('HTML / CSS / JavaScript（ビルド作業が不要な構成。ファイルをブラウザで開くだけで動くこと）');
  } else {
    stack.push('React + TypeScript + Vite（既存のプロジェクトがある場合は、その構成を優先）');
    stack.push('スタイル：Tailwind CSS（既存のスタイル方針があればそれに合わせる）');
  }
  if (has(answers, 'web_type', 'game')) stack.push('描画：Canvas API（必要な場合のみ軽量なライブラリを追加）');
  if (has(answers, 'web_storage', 'local')) stack.push('データ保存：ブラウザの LocalStorage');
  if (has(answers, 'web_storage', 'cloud')) stack.push('データ保存：Supabase または Firebase（無料枠で始められる構成。候補を比較して提案）');
  if (has(answers, 'web_login', 'yes') || has(answers, 'web_login', 'admin')) stack.push('認証：利用するBaaSの認証機能（パスワードを自前で保存しない）');
  stack.push('不要なライブラリは追加しないこと');

  const files = simple
    ? ['index.html … ページの構造', 'style.css … 見た目', 'script.js … 動き・処理', 'README.md … 使い方']
    : [
        'src/components/ … ボタンやカードなど画面の部品',
        'src/pages/ … 画面ごとのコンポーネント',
        'src/lib/ … データ処理などのロジック（画面から分離）',
        'src/data/ … 定数・初期データ',
        'src/types.ts … 型定義',
        'README.md … 起動方法と使い方',
      ];
  return { stack, files, simple };
}

function codeStack(answers: Answers): { stack: string[]; files: string[] } {
  const lang = answers.code_lang;
  const label: Record<string, string> = {
    js: 'JavaScript / TypeScript',
    react: 'React / Next.js',
    python: 'Python',
    html: 'HTML / CSS',
    gas: 'Google Apps Script',
  };
  const names = (lang?.values ?? []).map((x) => label[x]).filter(Boolean);
  if (lang?.text?.trim()) names.push(lang.text.trim());
  const stack = names.length ? [`言語・フレームワーク：${names.join('、')}`] : ['言語・フレームワーク：既存のコードに合わせる（新規の場合は目的に合うものを提案）'];
  stack.push('新しい依存ライブラリは、必要な理由を説明できる場合だけ追加する');
  return { stack, files: ['変更・追加するファイルは、既存の構成に合わせて配置する', '変更したファイルの一覧を最後に示す'] };
}

function automationStack(answers: Answers): { stack: string[]; files: string[] } {
  if (has(answers, 'au_connect', 'gas')) {
    return {
      stack: ['Google Apps Script（Googleアカウントで無料で利用）', 'トリガー（時間主導型など）による自動実行'],
      files: ['コード.gs … メインの処理', '設定用のシートまたはスクリプトプロパティ … 変更しやすい値（宛先・シート名など）'],
    };
  }
  return {
    stack: ['Python 3（標準ライブラリを優先し、必要なものだけ追加）', '設定値は .env または設定ファイルで管理'],
    files: ['main.py … メインの処理', 'config.example.env … 設定の例（実際の値は含めない）', 'requirements.txt … 依存ライブラリ', 'README.md … セットアップと実行方法'],
  };
}

export function buildDevSpec(categoryId: CategoryId, answers: Answers, target: PromptTarget, mode: PromptMode): DevSpec {
  const isWeb = categoryId === 'web';
  const isAutomation = categoryId === 'automation';
  const built = isWeb ? webStack(answers) : isAutomation ? automationStack(answers) : codeStack(answers);
  const quality = mode === 'quality';

  const rules: string[] = [
    'エラー処理：失敗する可能性のある処理（通信・保存・読み込み・入力）には必ずエラー処理を入れ、利用者に分かる言葉で表示する',
    'セキュリティ：APIキーやパスワードをコードに直接書かない。ユーザーの入力はそのままHTMLとして実行しない',
    '入力値は保存・送信の前に検証する',
  ];
  if (isWeb) {
    rules.push('レスポンシブ対応：スマートフォン（幅375px程度）からPCまで表示が崩れないようにする');
    rules.push('アクセシビリティ：キーボードで操作でき、フォーカス位置が見えるようにする');
  }
  if (isAutomation) {
    rules.push('処理の途中で失敗した場合に、どこまで完了したか分かるようログを残す');
    rules.push('同じデータを二重に処理しないようにする');
  }
  if (quality) {
    rules.push('ロジックと画面（UI）を分離し、1つのファイルに処理を詰め込みすぎない');
    rules.push('命名・型定義を一貫させ、後から機能を追加しやすい構造にする');
    if (isWeb) rules.push('ローディング・空データ・エラーの各状態を用意する');
  }

  const steps: string[] = [];
  if (target === 'claude-code') steps.push('現在のフォルダのファイル構成と設定を調査する（既存プロジェクトがあれば構成を理解してから変更する）');
  steps.push('要件を整理し、実装計画（画面・機能・ファイル構成）を短く示す');
  if (isWeb) {
    steps.push(built.files[0].startsWith('index.html') ? '必要なファイルを作成する' : 'プロジェクトを作成し、必要な依存関係をインストールする');
    steps.push('共通レイアウトとデザインの基本設定を作る');
    steps.push('主要な機能を1つずつ実装し、その都度動作を確認する');
    steps.push('エラー時・データが空のときの表示と、スマートフォン表示を調整する');
  } else if (isAutomation) {
    steps.push('テスト用のデータで動く最小限の処理を作る');
    steps.push('エラー処理・ログ・通知を追加する');
    steps.push('自動実行の設定方法をまとめる');
  } else {
    steps.push('原因の調査、または実装方針の決定を行う');
    steps.push('必要な範囲だけ変更する');
  }
  if (target === 'claude-code') {
    steps.push('ビルド・型チェック・テストを実行し、エラーがあれば修正して再実行する');
    steps.push('README（使い方・起動方法）を更新する');
  } else {
    steps.push('動作確認の方法と、エラーが出たときの対処方法を示す');
  }
  if (quality) steps.push('最終確認項目に沿ってセルフレビューを行い、問題があれば修正する');

  const background: string[] = [];
  if (target === 'claude-code') background.push('作業は Claude Code で行います。あなたはファイルの作成・編集・コマンドの実行ができます。');
  if (target === 'browser') background.push('作業はブラウザのチャット画面で行います。あなたが出力したコードを私がファイルに保存して実行します。');

  const qualityExtras = [
    'テスト：主要なロジックにテストを用意し、すべて通過している',
    'ビルド・型チェックでエラーや警告が出ていない',
  ];
  const checks = ['READMEの手順どおりに起動できるか', '入力値の検証とエラー表示が機能しているか'];
  const done = target === 'claude-code' ? ['ビルドとテストが成功し、その結果が報告されている'] : ['動作確認の手順が示されている'];

  const stackLine = `使用技術：${built.stack[0]}`;
  const shortRules =
    target === 'claude-code'
      ? ['最初にファイル構成を確認し、実装後にビルドとテストを実行してエラーを修正すること']
      : target === 'browser'
        ? ['コードはファイルごとに、省略せず完全な形で示すこと']
        : ['コードはファイルのパスを明記して示すこと'];

  return { stack: built.stack, stackLine, files: built.files, rules, steps, background, qualityExtras, checks, done, shortRules };
}
