/**
 * 専門用語の短い説明（画面上の「?」ボタンで表示）
 */
export const GLOSSARY: Record<string, { term: string; text: string }> = {
  prompt: { term: 'プロンプト', text: 'AIへの指示文のことです。目的や条件をはっきり書くほど、思いどおりの回答が得られやすくなります。' },
  'claude-code': { term: 'Claude Code', text: 'Anthropic が提供する開発用のAIツール。パソコンのフォルダ内のファイルをAIが読み書きし、コマンドも実行しながら開発を進めます。' },
  vscode: { term: 'VS Code', text: 'Microsoft が無料で提供しているコードエディタ（プログラムを書くためのソフト）です。' },
  nocode: { term: 'ノーコード', text: 'プログラムを書かずに、画面上の操作だけでWebサイトやアプリを作れるツールのことです。' },
  localstorage: { term: 'LocalStorage', text: 'ブラウザの中にデータを保存する仕組み。無料で手軽ですが、他の端末やブラウザとは共有されません。' },
  database: { term: 'データベース', text: 'たくさんのデータを整理して保存・検索するための仕組みです。複数の人や端末でデータを共有できます。' },
  framework: { term: 'フレームワーク', text: 'アプリ開発でよく使う機能をまとめた土台のこと。React や Next.js などがあります。' },
  gas: { term: 'Google Apps Script', text: 'Googleのサービス（Gmail・スプレッドシートなど）を自動で動かすためのプログラム。Googleアカウントがあれば無料で使えます。' },
  'nocode-automation': { term: 'ノーコード連携ツール', text: 'Zapier・Make・Power Automate など、サービス同士をプログラムなしでつなげて自動化できるツールです。' },
  api: { term: 'API', text: 'ソフトウェア同士が機能やデータをやり取りするための窓口です。利用にはキー（合言葉）が必要なことが多く、キーは秘密に管理します。' },
  mcp: { term: 'MCP', text: 'Model Context Protocol の略。AIを外部のツールやデータにつなぐための共通の仕組みです。' },
  json: { term: 'JSON', text: 'データを文字で表すための形式です。バックアップの保存や読み込みに使います。' },
  context: { term: 'コンテキスト長', text: 'AIが一度に読み込んで考慮できる文章の量のことです。' },
};
