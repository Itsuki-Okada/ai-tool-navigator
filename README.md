# AI TOOL NAVIGATOR

**「作りたい」を、最適なAIとプロンプトに。**

何を作りたいか選んで、いくつかの質問に答えるだけ。
ChatGPT・Gemini・Claude の中から目的に合ったAIを提案し、そのまま使える高品質なプロンプトを自動生成するWebアプリです。

- AI API・APIキー・有料サービスは不要（すべてブラウザ内で動作）
- 入力内容は外部に送信されません
- PC・スマートフォン対応

---

## できること

| 機能 | 内容 |
| --- | --- |
| AIナビゲーション（診断） | 12カテゴリ × カテゴリ別の質問。回答に応じて次の質問が変わります。「分からない・おまかせ」やスキップも可能 |
| AI選定 | 回答から「ニーズ」を集計し、各AIの特徴データと照合。理由・影響した条件・注意点・2番目の候補・3つのAIの比較・使い方を表示。差が小さいときは「同程度の候補」として表示 |
| プロンプト自動生成 | 役割・目的・背景・要件・機能・制約・手順・出力形式・品質基準・不明点への対応・完成条件・最終確認項目に整理。開発系では使用技術・ファイル構成・エラー処理・セキュリティ・テストなども追加 |
| 生成モード | 標準 / 高品質 / 最短 |
| 出力先の切り替え | ChatGPT向け / Gemini向け / Claude向け（XMLタグ形式）＋開発系は Claude Code向け / ブラウザ上のAI向け / 一般的なコード生成向け |
| 編集・コピー・保存 | その場で編集 → コピー（使えない環境では手動コピーを案内）→ 保存 |
| AI比較ページ | 11項目の比較表＋用途別の目安。最終確認日と「プラン等で異なる」表示付き |
| プロンプトライブラリ | 36種類のテンプレート。検索・絞り込み → 必要事項を入力 → 完成 |
| 保存機能 | 診断履歴・お気に入りのAI・保存/編集したプロンプト・生成モード・最近使ったテンプレート・入力途中の診断を LocalStorage に保存 |
| エクスポート / インポート | JSONで書き出し・読み込み（形式を検証し、不正な項目は除外。「追加」か「置き換え」を選択） |

---

## 起動方法

必要なもの：[Node.js](https://nodejs.org/)（バージョン 20 以上推奨）

```bash
cd ai-tool-navigator
npm install      # 初回のみ
npm run dev      # 開発サーバーを起動 → 表示された http://localhost:5173 を開く
```

その他のコマンド：

```bash
npm test          # テストを実行（Vitest）
npm run typecheck # TypeScript の型チェック
npm run build     # 本番用ファイルを dist/ に作成
npm run preview   # ビルドしたものをローカルで確認
```

---

## ファイル構成

```
src/
├── data/                  ← 内容を変えたいときはここを編集
│   ├── categories.ts      カテゴリ（表示順・質問の順番）
│   ├── questions.ts       質問・選択肢・分岐条件・選択肢が表す「ニーズ」
│   ├── aiProfiles.ts      AIごとの特徴データ（0〜3の目安）・最終確認日
│   ├── scoringRules.ts    カテゴリ別の評価ルール・注意事項・使い方
│   ├── promptRecipes.ts   プロンプトの骨組み・出力先ごとの調整
│   ├── templates.ts       プロンプトテンプレート（36種類）
│   ├── comparison.ts      AI比較ページの表
│   └── glossary.ts        専門用語の説明
├── lib/                   ← 画面に依存しないロジック
│   ├── diagnosis/flow.ts       質問の分岐・回答の整理
│   ├── diagnosis/recommend.ts  AI選定エンジン
│   ├── prompt/generator.ts     プロンプト生成
│   ├── prompt/devSpec.ts       開発用途の追加指示
│   ├── prompt/template.ts      テンプレートの穴埋め・検索
│   ├── storage/storage.ts      LocalStorage の読み書き
│   └── storage/validate.ts     保存データ・インポートの検証
├── state/                 ← アプリの状態（ストア・ルーター・通知）
├── components/            ← 画面の部品
├── pages/                 ← 画面ごとのコンポーネント
└── test/                  ← 画面の結合テスト（ロジックのテストは lib/__tests__）
```

### よくある編集

- **カテゴリを追加**：`categories.ts` に1件追加 → `types.ts` の `CategoryId` に追加 → `scoringRules.ts` と `promptRecipes.ts` にルールを追加（足りないとTypeScriptがエラーで教えてくれます）
- **質問を追加**：`questions.ts` に追加し、`categories.ts` の `questionIds` に id を並べる。`showIf` で分岐できます
- **AIの機能・料金が変わった**：`aiProfiles.ts` と `comparison.ts` を更新し、`DATA_LAST_REVIEWED` を確認した日付に変更
- **判定を調整**：選択肢の `needs`（重み）や `scoringRules.ts` の `baseNeeds` を変更。`npm test` で全カテゴリの動作を確認できます
- **テンプレートを追加**：`templates.ts` に追加。本文の `{{key}}` と `fields` の key をそろえる（テストで自動チェック）

---

## AI選定の考え方

1. カテゴリと回答から「必要なこと（ニーズ）」と重みを集計します（例：開発環境＝Claude Code →「ローカル環境での開発エージェント」+3）
2. 各AIの特徴データ（ニーズごとに 0〜3 の相対的な目安）と掛け合わせて評価します
3. 1位と2位の差が小さい場合は、無理に順位をつけず「同程度の候補」とします
4. 未回答が多い場合は「判断材料：不足」と表示し、追加の質問へ誘導します
5. 画面には精密な数値（適合率○%など）は出さず、段階的な表示にしています

ロジックは `src/lib` にまとまっており画面から独立しているため、将来 AI API による判定へ差し替えることもできます。

> 掲載しているAIの機能・料金は作成時点の一般的な公開情報に基づく目安です。サービスの仕様は頻繁に変わるため、利用前に各公式サイトで確認してください。ChatGPT・Gemini・Claude は各社の商標で、本アプリは各社とは無関係です。

---

## 無料で公開する方法

ビルド結果（`dist/`）は静的ファイルだけなので、無料のホスティングで公開できます。ページ遷移は `#/compare` のような形式のため、サーバー側の設定は不要です。

- **GitHub Pages**：GitHub にリポジトリを作成 → `npm run build` → `dist/` の中身を `gh-pages` ブランチに公開（または GitHub Actions の「Static HTML」/「Vite」ワークフローを使用）
- **Netlify / Cloudflare Pages / Vercel**：リポジトリを連携し、ビルドコマンド `npm run build`、公開ディレクトリ `dist` を指定

---

## データとプライバシー

- 保存データはブラウザの LocalStorage（キー：`ai-tool-navigator:v1`）にだけ保存されます
- **別の端末・別のブラウザとは自動で同期されません。** 移行するときは「保存したプロンプト → データ管理」からエクスポート / インポートしてください
- 外部へ送信する処理はありません（読み込む外部リソースは Google Fonts のフォントのみ）
- 入力内容はテキストとして表示し、HTMLとして実行しません

### 将来 AI API を導入する場合

APIキーをフロントエンドに置かないよう、必ずバックエンド（例：Cloudflare Workers、Vercel Functions など）を用意し、キーはサーバー側の環境変数で管理してください。
`src/lib/diagnosis/recommend.ts` や `src/lib/prompt/generator.ts` と同じ形の結果を返す関数を作り、バックエンド経由で呼び出す形にすると画面の変更を最小限にできます。

---

## 使用技術

React 19 / TypeScript / Vite / Tailwind CSS v4 / Lucide React / LocalStorage / Vitest + Testing Library
