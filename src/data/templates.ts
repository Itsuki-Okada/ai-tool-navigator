import type { PromptTemplate } from '../types';

/**
 * プロンプトテンプレート
 * ----------------------------------------------------------------
 * body の {{key}} が fields の key に対応し、入力内容で置き換えられます。
 * 追加するときは id が重複しないようにしてください（テストで確認しています）。
 * featured は「おすすめテンプレート」としてトップページに表示されます
 * （利用データに基づく人気順ではありません）。
 */

export const TEMPLATE_GROUPS = [
  'Webアプリ開発',
  'Webサイト制作',
  'バグ修正',
  'コードレビュー',
  '画像生成',
  'ロゴ制作',
  'SNS投稿',
  'ブログ記事',
  '文章・メール',
  '企画書',
  '営業資料',
  'データ分析',
  '業務自動化',
  '市場調査',
  'アイデア出し',
  '動画制作',
] as const;

export const TEMPLATES: PromptTemplate[] = [
  // ---------------- Webアプリ開発 ----------------
  {
    id: 'webapp-claude-code',
    title: 'Claude CodeでWebアプリを新規開発',
    description: '空のフォルダからWebアプリを作り、ビルド・テストまで任せるための指示',
    group: 'Webアプリ開発',
    recommended: ['claude'],
    featured: true,
    fields: [
      { key: 'app', label: '作りたいアプリ', placeholder: '例：家計簿アプリ', required: true },
      { key: 'features', label: '必要な機能', placeholder: '例：収支の登録、月ごとのグラフ、カテゴリ別集計', multiline: true, required: true },
      { key: 'users', label: '使う人', placeholder: '例：自分と家族' },
      { key: 'design', label: 'デザインの方向性', placeholder: '例：シンプルで明るい、スマホ中心' },
    ],
    body: `あなたは経験豊富なフルスタックエンジニア兼UI/UXデザイナーです。
Claude Code で、次のWebアプリを開発してください。

## 作りたいもの
{{app}}

## 使う人
{{users}}

## 必要な機能
{{features}}

## デザイン
{{design}}

## 技術
- React + TypeScript + Vite + Tailwind CSS
- データ保存はまず LocalStorage（外部サービスは使わない）
- 不要なライブラリは追加しない

## 進め方
1. 現在のフォルダのファイル構成を確認する
2. 画面構成・ファイル構成・実装計画を短く示す
3. 小さな単位で実装し、その都度動作を確認する
4. エラー処理・空データ表示・スマートフォン表示を整える
5. 型チェック・ビルド・テストを実行し、エラーがあれば修正する
6. README.md に起動方法と使い方を書く

## ルール
- 見た目だけのモックで終わらせず、すべてのボタンとフォームを動作させる
- APIキーなどの秘密情報をコードに書かない
- テストできていない機能を「テスト済み」と報告しない

## 完了報告
実装した機能・主要なファイル・起動方法・ビルドとテストの結果・未対応の項目を簡潔に報告してください。`,
    notes: ['Claude Code の利用には有料プランまたはAPI契約が必要です', '大切なファイルがあるフォルダでは、事前にバックアップか Git での管理をおすすめします'],
  },
  {
    id: 'webapp-browser',
    title: 'ブラウザのAIで小さなWebツールを作る',
    description: 'HTMLファイル1つで動くツールを、チャットだけで作るための指示',
    group: 'Webアプリ開発',
    recommended: ['chatgpt', 'claude', 'gemini'],
    fields: [
      { key: 'tool', label: '作りたいツール', placeholder: '例：割り勘計算ツール', required: true },
      { key: 'features', label: 'できてほしいこと', placeholder: '例：人数と金額を入れると1人あたりの金額を表示', multiline: true, required: true },
    ],
    body: `あなたは初心者に教えるのが上手なWebエンジニアです。
次のWebツールを、HTMLファイル1つで動く形で作ってください。

【作りたいもの】
{{tool}}

【できてほしいこと】
{{features}}

【条件】
- HTML・CSS・JavaScript を1つのファイルにまとめる
- 外部のライブラリやサービスは使わない
- スマートフォンでも使いやすいデザインにする
- 入力ミスがあったときは、分かりやすいメッセージを表示する

【出力形式】
1. 完成したコードを省略せずに1つのコードブロックで出力
2. ファイルの保存方法と開き方を、初心者向けに番号付きで説明
3. 改造するときのヒントを3つ`,
    notes: ['出力が途中で途切れた場合は「続けて」と送ってください'],
  },
  {
    id: 'webapp-feature',
    title: '既存のWebアプリに機能を追加',
    description: '既存のコードを壊さずに新機能を追加するための指示',
    group: 'Webアプリ開発',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'stack', label: '使っている技術', placeholder: '例：Next.js 15 + Supabase' },
      { key: 'feature', label: '追加したい機能', placeholder: '例：お気に入り登録機能', required: true },
      { key: 'detail', label: '機能の詳細', placeholder: '例：ログインユーザーが記事をお気に入りに追加・削除できる', multiline: true },
    ],
    body: `既存のWebアプリに機能を追加してください。

## 使っている技術
{{stack}}

## 追加したい機能
{{feature}}

## 詳細
{{detail}}

## 進め方
1. 関連するファイルを確認し、既存の構成とコードスタイルを把握する
2. 変更が必要なファイルと影響範囲を示す
3. 既存の機能を壊さないように実装する
4. エラー処理と入力値の検証を入れる
5. 動作確認の方法を示す（可能ならテストを追加・実行する）

## 出力
- 変更したファイルの一覧と、それぞれの変更理由
- 追加・変更したコード（ファイルパスを明記）`,
    notes: ['ブラウザのAIで使う場合は、関連するファイルの内容も一緒に貼り付けてください'],
  },
  // ---------------- Webサイト制作 ----------------
  {
    id: 'lp',
    title: 'ランディングページ制作',
    description: '商品・サービスを紹介する1ページのサイトを、構成からコードまで作る',
    group: 'Webサイト制作',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'product', label: '商品・サービス', placeholder: '例：オンライン英会話「Talky」', required: true },
      { key: 'target', label: 'ターゲット', placeholder: '例：英語に苦手意識のある社会人' },
      { key: 'strength', label: '強み・特徴', placeholder: '例：1回15分、月額2,980円、日本人講師', multiline: true },
      { key: 'cta', label: '最終的にしてほしい行動', placeholder: '例：無料体験に申し込む' },
      { key: 'tone', label: 'デザインの雰囲気', placeholder: '例：明るく親しみやすい' },
    ],
    body: `あなたはコンバージョン率の高いLPを多数手がけてきたWebデザイナー兼コピーライターです。
次の商品のランディングページを作ってください。

# 商品・サービス
{{product}}

# ターゲット
{{target}}

# 強み・特徴
{{strength}}

# ゴール（CTA）
{{cta}}

# デザイン
{{tone}}

# 要件
- 構成：ファーストビュー → 悩みへの共感 → 解決策 → 特徴 → 利用の流れ → よくある質問 → CTA
- PCとスマートフォンの両方に対応
- HTML / CSS / JavaScript で作成し、画像の部分は差し替えやすいように仮の枠にする
- 根拠のない数字や誇大表現は使わない

# 出力
1. ページ構成とキャッチコピー案（3案）
2. 完成したコード（ファイルごとに省略せずに）
3. 公開前に確認すべきこと`,
    notes: ['料金や実績などの数字は、必ず正しい情報に差し替えてください'],
  },
  {
    id: 'portfolio',
    title: 'ポートフォリオサイト制作',
    description: '自分の作品や経歴を紹介するサイトを作る',
    group: 'Webサイト制作',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'job', label: '職種・肩書き', placeholder: '例：Webデザイナー', required: true },
      { key: 'works', label: '掲載したい作品', placeholder: '例：カフェのWebサイト、アプリのUIデザイン', multiline: true },
      { key: 'style', label: '雰囲気', placeholder: '例：余白多めで洗練された印象' },
    ],
    body: `あなたはポートフォリオサイトの制作に詳しいWebデザイナー兼エンジニアです。
次の内容でポートフォリオサイトを作ってください。

【職種】{{job}}
【掲載したい作品】
{{works}}
【雰囲気】{{style}}

【要件】
- セクション：ヒーロー / 作品一覧 / 作品詳細 / プロフィール / スキル / お問い合わせ
- 作品は、データ（配列）を編集するだけで追加できる構造にする
- スマートフォン対応、画像の遅延読み込み
- 問い合わせはメールアドレスへのリンク（フォーム送信サービスは使わない）

【出力】
- ファイル構成
- 完成したコード（省略しない）
- 無料で公開する方法（GitHub Pages など）の手順`,
    notes: ['自宅住所や電話番号などの個人情報は掲載しないよう注意してください'],
  },
  // ---------------- バグ修正 ----------------
  {
    id: 'bug-error',
    title: 'エラーメッセージから原因を特定して修正',
    description: 'エラーメッセージとコードを渡して、原因と修正方法を聞く',
    group: 'バグ修正',
    recommended: ['claude', 'chatgpt', 'gemini'],
    featured: true,
    fields: [
      { key: 'env', label: '環境', placeholder: '例：Next.js 15 / Node.js 22 / macOS' },
      { key: 'doing', label: '何をしたらエラーが出たか', placeholder: '例：npm run build を実行した', required: true },
      { key: 'error', label: 'エラーメッセージ', placeholder: 'エラー全文を貼り付け（APIキーなどは削除）', multiline: true, required: true },
      { key: 'code', label: '関連するコード', placeholder: '関連しそうなコードを貼り付け', multiline: true },
    ],
    body: `あなたは原因調査が得意なシニアエンジニアです。次のエラーを解決してください。

## 環境
{{env}}

## 実行したこと
{{doing}}

## エラーメッセージ
\`\`\`
{{error}}
\`\`\`

## 関連するコード
\`\`\`
{{code}}
\`\`\`

## お願い
1. エラーメッセージの意味を、分かりやすく説明してください
2. 原因の候補を、可能性の高い順に挙げてください
3. 最も可能性の高い原因に対する修正方法を、修正後のコードで示してください
4. 修正後に確認する方法を教えてください
5. 情報が足りない場合は、確認すべきことを具体的に教えてください`,
    notes: ['エラーメッセージにAPIキー・パスワード・個人情報が含まれていないか確認してから貼り付けてください'],
  },
  {
    id: 'bug-behavior',
    title: '想定と違う動作の原因調査',
    description: 'エラーは出ないのに動きがおかしいときの切り分け',
    group: 'バグ修正',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'expected', label: '期待する動作', placeholder: '例：保存ボタンを押すと一覧に追加される', required: true },
      { key: 'actual', label: '実際の動作', placeholder: '例：一覧に追加されず、リロードすると表示される', required: true },
      { key: 'code', label: '関連するコード', multiline: true },
    ],
    body: `エラーは出ていないのに、想定と違う動作をしています。原因を一緒に切り分けてください。

【期待する動作】
{{expected}}

【実際の動作】
{{actual}}

【関連するコード】
{{code}}

【お願い】
- 考えられる原因を3つ以上挙げ、それぞれの確認方法（console.log の位置など）を示してください
- 最も可能性が高い原因について、修正後のコードを示してください
- 同じ種類の不具合を防ぐためのポイントを教えてください`,
    notes: ['再現手順を具体的に書くほど、原因を特定しやすくなります'],
  },
  // ---------------- コードレビュー ----------------
  {
    id: 'review',
    title: 'コードレビュー',
    description: '不具合・セキュリティ・読みやすさの観点でコードを確認してもらう',
    group: 'コードレビュー',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'purpose', label: 'このコードの目的', placeholder: '例：ユーザー登録APIの処理' },
      { key: 'code', label: 'コード', multiline: true, required: true },
      { key: 'focus', label: '特に見てほしい点', placeholder: '例：セキュリティ、パフォーマンス' },
    ],
    body: `あなたは丁寧で建設的なレビューをするシニアエンジニアです。次のコードをレビューしてください。

<purpose>{{purpose}}</purpose>
<focus>{{focus}}</focus>
<code>
{{code}}
</code>

レビューの観点：
1. 不具合・バグの可能性
2. セキュリティ上の問題
3. エラー処理の不足
4. 読みやすさ・保守性
5. パフォーマンス

出力形式：
- 指摘ごとに「重要度（高・中・低）／該当箇所／問題点／修正案」を示す
- 重要度の高い順に並べる
- 良い点も最後に簡潔に挙げる`,
    notes: ['社外秘のコードは、会社の規定でAIへの入力が許可されているか確認してください'],
  },
  {
    id: 'refactor',
    title: 'リファクタリング（コード整理）の提案',
    description: '動作を変えずにコードを読みやすく整理してもらう',
    group: 'コードレビュー',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'code', label: 'コード', multiline: true, required: true },
      { key: 'issue', label: '困っていること', placeholder: '例：1ファイルが長すぎて修正しづらい' },
    ],
    body: `次のコードを、動作を変えずに読みやすく整理してください。

【困っていること】
{{issue}}

【コード】
{{code}}

【条件】
- 動作（入力と出力）は変えない
- 変更点ごとに理由を説明する
- 大きな変更は段階に分けて提案する

【出力】
1. 現状の問題点
2. 整理後のコード（ファイル名を明記）
3. 変更点の一覧と理由
4. 動作が変わっていないことを確認する方法`,
    notes: ['リファクタリング前に、元のコードを保存（または Git でコミット）しておきましょう'],
  },
  {
    id: 'code-explain',
    title: 'コードの解説（初心者向け）',
    description: 'よく分からないコードを、1行ずつ分かりやすく説明してもらう',
    group: 'コードレビュー',
    recommended: ['chatgpt', 'claude', 'gemini'],
    fields: [
      { key: 'code', label: 'コード', multiline: true, required: true },
      { key: 'level', label: '自分の理解度', placeholder: '例：HTMLは分かるがJavaScriptは初めて' },
    ],
    body: `プログラミング初心者の私に、次のコードを分かりやすく説明してください。

私の理解度：{{level}}

コード：
{{code}}

説明のしかた：
1. このコード全体が何をしているかを、3行以内で説明
2. 重要な部分を区切って、たとえ話も使いながら説明
3. 出てくる専門用語の簡単な説明
4. 理解を確かめるための小さな練習問題を2つ`,
    notes: ['分からない部分があれば、同じ会話で何度でも質問できます'],
  },
  // ---------------- 画像生成 ----------------
  {
    id: 'img-eyecatch',
    title: 'ブログのアイキャッチ画像',
    description: '記事の内容に合ったアイキャッチ画像を生成する',
    group: '画像生成',
    recommended: ['chatgpt', 'gemini'],
    featured: true,
    fields: [
      { key: 'title', label: '記事のタイトル', placeholder: '例：初心者向け 家庭菜園の始め方', required: true },
      { key: 'style', label: 'テイスト', placeholder: '例：やわらかい水彩風、明るい色' },
      { key: 'ratio', label: '縦横比', placeholder: '例：16:9' },
    ],
    body: `ブログ記事のアイキャッチ画像を作成してください。

記事タイトル：{{title}}
テイスト：{{style}}
縦横比：{{ratio}}

条件：
- 記事の内容がひと目で伝わるモチーフにする
- 後からタイトル文字を載せられるよう、片側に余白を確保する
- 画像の中に文字は入れない
- 実在の人物・ブランドロゴは描かない

生成後、印象を変えたいときに使える調整案を3つ提案してください。`,
    notes: ['生成画像の利用条件は、各サービスの利用規約を確認してください'],
  },
  {
    id: 'img-product',
    title: '商品写真風の画像',
    description: 'ECサイトやSNS用の、商品イメージ画像を作る',
    group: '画像生成',
    recommended: ['chatgpt', 'gemini'],
    fields: [
      { key: 'product', label: '商品', placeholder: '例：ガラス瓶入りのハーブティー', required: true },
      { key: 'scene', label: 'シーン・背景', placeholder: '例：朝日の差し込む木のテーブル' },
      { key: 'mood', label: '雰囲気', placeholder: '例：ナチュラル、上品' },
    ],
    body: `商品の写真風イメージ画像を生成してください。

商品：{{product}}
シーン・背景：{{scene}}
雰囲気：{{mood}}

撮影の指定：
- 自然光、浅い被写界深度（背景が少しぼける）
- 商品が主役になる構図、中央からやや左に配置
- 高級感のある色調、不自然な反射や歪みがないこと

※ 実際の商品と異なる印象を与えないよう、広告に使う場合はイメージ画像であることを明記します。`,
    notes: ['実際の商品写真の代わりに使う場合、誤解を与えないよう「イメージ」と表記してください'],
  },
  {
    id: 'img-character',
    title: 'オリジナルキャラクターのイラスト',
    description: 'キャラクターの設定から、イラストを生成する',
    group: '画像生成',
    recommended: ['chatgpt', 'gemini'],
    fields: [
      { key: 'character', label: 'キャラクターの設定', placeholder: '例：森に住む小さなキツネの郵便屋さん', multiline: true, required: true },
      { key: 'style', label: '絵柄', placeholder: '例：絵本風、やさしいタッチ' },
      { key: 'use', label: '用途', placeholder: '例：LINEスタンプ風の表情集' },
    ],
    body: `オリジナルキャラクターのイラストを作成してください。

【キャラクター設定】
{{character}}

【絵柄】{{style}}
【用途】{{use}}

【条件】
- 既存のアニメ・ゲームのキャラクターに似せない
- 背景はシンプルにし、キャラクターがはっきり分かるようにする
- まず全身の正面図を1枚作成する

作成後、同じキャラクターの別ポーズ・別表情を作るための指示文も提案してください。`,
    notes: ['同じキャラクターを何枚も作る場合、毎回同じ設定文を入れると見た目がそろいやすくなります'],
  },
  // ---------------- ロゴ制作 ----------------
  {
    id: 'logo-concept',
    title: 'ロゴのコンセプト案',
    description: 'ブランドの考え方からロゴの方向性とラフ案を作る',
    group: 'ロゴ制作',
    recommended: ['chatgpt', 'gemini', 'claude'],
    fields: [
      { key: 'brand', label: 'ブランド名', placeholder: '例：Hinata Bakery', required: true },
      { key: 'business', label: '事業内容', placeholder: '例：天然酵母のパン屋' },
      { key: 'values', label: '伝えたい印象', placeholder: '例：あたたかさ、手づくり、地域密着' },
    ],
    body: `ロゴの制作を手伝ってください。

ブランド名：{{brand}}
事業内容：{{business}}
伝えたい印象：{{values}}

お願いしたいこと：
1. ロゴのコンセプト案を3つ（それぞれの狙い・モチーフ・色・書体の方向性）
2. 各案のラフイメージ（画像生成できる場合は生成し、できない場合は画像生成用の指示文を作成）
3. 小さく表示したとき・白黒にしたときの見え方の注意点

注意：既存の有名ロゴに似ないようにしてください。`,
    notes: ['AIの画像は案出し用です。正式なロゴはベクター形式で作り直し、商標の確認もおすすめします'],
  },
  // ---------------- SNS投稿 ----------------
  {
    id: 'sns-instagram',
    title: 'Instagram投稿文',
    description: '写真に添えるキャプションとハッシュタグを作る',
    group: 'SNS投稿',
    recommended: ['chatgpt', 'claude', 'gemini'],
    featured: true,
    fields: [
      { key: 'account', label: 'アカウントの内容', placeholder: '例：駅前のカフェの公式アカウント', required: true },
      { key: 'content', label: '今回の投稿内容', placeholder: '例：秋限定のかぼちゃのタルト発売', multiline: true, required: true },
      { key: 'target', label: 'ターゲット', placeholder: '例：近隣で働く20〜30代' },
    ],
    body: `あなたはSNS運用に詳しいマーケターです。Instagramの投稿文を作ってください。

アカウント：{{account}}
投稿内容：{{content}}
ターゲット：{{target}}

条件：
- 1行目で興味を引く（最初の数行だけ表示されるため）
- 絵文字は適度に使う
- 最後に行動を促す一文を入れる（保存・来店など）
- 誇大表現は使わない

出力：
1. 投稿文を雰囲気の違う3案
2. ハッシュタグ案（大きいタグと小さいタグを混ぜて15個程度）
3. 投稿に合う写真の撮り方のヒント`,
    notes: ['価格や期間などの情報は、正しい内容か投稿前に確認してください'],
  },
  {
    id: 'sns-x-thread',
    title: 'X（旧Twitter）の投稿・スレッド',
    description: 'ノウハウや告知を、読まれやすい投稿にまとめる',
    group: 'SNS投稿',
    recommended: ['chatgpt', 'claude'],
    fields: [
      { key: 'theme', label: 'テーマ', placeholder: '例：在宅ワークの集中術', required: true },
      { key: 'points', label: '伝えたいポイント', multiline: true },
      { key: 'tone', label: '口調', placeholder: '例：親しみやすい、少しユーモア' },
    ],
    body: `Xの投稿を作成してください。

テーマ：{{theme}}
伝えたいポイント：
{{points}}
口調：{{tone}}

作るもの：
1. 単独の投稿案を3つ（それぞれ全角140字以内）
2. 5投稿程度のスレッド案（1投稿目で続きを読みたくなるように）

条件：根拠のない断定や煽り表現は避ける。`,
    notes: ['文字数の上限はアカウントの種類によって異なります'],
  },
  {
    id: 'sns-calendar',
    title: '1か月分の投稿カレンダー',
    description: 'ネタ切れを防ぐ投稿計画を表形式で作る',
    group: 'SNS投稿',
    recommended: ['chatgpt', 'gemini', 'claude'],
    fields: [
      { key: 'account', label: 'アカウントの内容', required: true, placeholder: '例：整体院の公式アカウント' },
      { key: 'platform', label: 'プラットフォーム', placeholder: '例：Instagram' },
      { key: 'frequency', label: '投稿頻度', placeholder: '例：週3回' },
      { key: 'goal', label: '目標', placeholder: '例：予約数を増やす' },
    ],
    body: `1か月分のSNS投稿カレンダーを作ってください。

アカウント：{{account}}
プラットフォーム：{{platform}}
投稿頻度：{{frequency}}
目標：{{goal}}

条件：
- 「役立つ情報」「親近感」「告知」の投稿をバランスよく混ぜる
- 季節やイベントも考慮する

出力：表形式（日付／投稿の種類／テーマ／投稿の概要／画像のアイデア）
最後に、効果を確認するための指標を3つ提案してください。`,
    notes: ['スプレッドシートに貼り付けると管理しやすくなります'],
  },
  // ---------------- ブログ記事 ----------------
  {
    id: 'blog-seo',
    title: 'SEOを意識したブログ記事',
    description: '検索から読まれる記事を、構成から本文まで作る',
    group: 'ブログ記事',
    recommended: ['claude', 'chatgpt'],
    featured: true,
    fields: [
      { key: 'keyword', label: '狙うキーワード', placeholder: '例：家計簿 続かない', required: true },
      { key: 'reader', label: '想定読者', placeholder: '例：家計簿が3日坊主になる20代' },
      { key: 'experience', label: '自分の経験・独自情報', placeholder: '例：アプリを5つ試した結果', multiline: true },
      { key: 'length', label: '文字数', placeholder: '例：3,000字' },
    ],
    body: `あなたは読者の悩みを解決する記事を書くのが得意なWebライターです。

<keyword>{{keyword}}</keyword>
<reader>{{reader}}</reader>
<my_experience>{{experience}}</my_experience>
<length>{{length}}</length>

手順：
1. このキーワードで検索する人の悩み・知りたいことを整理する
2. 見出し構成（H2・H3）を作る
3. 本文を書く。私の経験・独自情報を自然に盛り込む
4. タイトル案を3つ、メタディスクリプション（120字程度）を1つ作る

条件：
- 結論を先に書き、読みやすい短い段落にする
- 不確かな情報は書かない。確認が必要な箇所は【要確認】と明記する
- です・ます調`,
    notes: ['独自の経験や情報を加えることで、オリジナリティの高い記事になります'],
  },
  {
    id: 'blog-outline',
    title: '記事の構成案（見出し）づくり',
    description: '本文を書く前に、読みやすい見出し構成を考える',
    group: 'ブログ記事',
    recommended: ['chatgpt', 'claude', 'gemini'],
    fields: [
      { key: 'theme', label: '記事のテーマ', required: true, placeholder: '例：初めての一人暮らしで必要なもの' },
      { key: 'reader', label: '読者', placeholder: '例：春から大学生になる人' },
    ],
    body: `次のテーマの記事の構成案を作ってください。

テーマ：{{theme}}
読者：{{reader}}

出力：
1. 読者が知りたいこと（5つ）
2. 見出し構成（H2・H3）と、各見出しで書く内容の要約
3. 記事の最後に入れるまとめ・行動の提案
4. 構成案を3パターン（網羅型・ストーリー型・Q&A型）で比較し、おすすめを1つ`,
    notes: ['構成が決まったら、見出しごとに本文の作成を依頼すると品質が安定します'],
  },
  // ---------------- 文章・メール ----------------
  {
    id: 'proofread',
    title: '文章の添削・推敲',
    description: '書いた文章を、意味を変えずに読みやすく直してもらう',
    group: '文章・メール',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'text', label: '添削したい文章', multiline: true, required: true },
      { key: 'purpose', label: '文章の用途', placeholder: '例：社内報、志望動機' },
      { key: 'tone', label: '希望する文体', placeholder: '例：です・ます調で丁寧に' },
    ],
    body: `次の文章を添削してください。

用途：{{purpose}}
希望する文体：{{tone}}

<text>
{{text}}
</text>

お願い：
1. 誤字脱字・文法の誤り
2. 分かりにくい表現と改善案
3. 修正後の全文（意味や主張は変えない）
4. 変更点の一覧（変更前 → 変更後 → 理由）`,
    notes: ['個人情報が含まれる文章は、名前などを伏せてから貼り付けてください'],
  },
  {
    id: 'mail-business',
    title: 'ビジネスメール',
    description: '依頼・お詫び・お礼などのメールを、状況に合わせて作る',
    group: '文章・メール',
    recommended: ['chatgpt', 'claude', 'gemini'],
    fields: [
      { key: 'to', label: '相手', placeholder: '例：取引先の担当者（初めて連絡）', required: true },
      { key: 'purpose', label: 'メールの目的', placeholder: '例：打ち合わせ日程の調整', required: true },
      { key: 'points', label: '伝えたいこと', multiline: true, placeholder: '例：来週の候補日を3つ提示したい' },
    ],
    body: `次の条件でビジネスメールを作成してください。

相手：{{to}}
目的：{{purpose}}
伝えたいこと：
{{points}}

条件：
- 件名も作成する
- 失礼のない敬語で、簡潔にまとめる
- 相手が返信しやすいように、お願いしたいことを明確にする

丁寧版と簡潔版の2パターンを作成してください。`,
    notes: ['送信前に、日時・名前・金額などの情報が正しいか確認してください'],
  },
  // ---------------- 企画書 ----------------
  {
    id: 'proposal',
    title: '企画書の骨子',
    description: '上司や取引先に提案する企画書の構成と内容を作る',
    group: '企画書',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'idea', label: '企画の内容', multiline: true, required: true, placeholder: '例：社内勉強会を月1回開催する' },
      { key: 'reader', label: '提出先', placeholder: '例：部長' },
      { key: 'issue', label: '解決したい課題', placeholder: '例：部署間の知識共有が少ない' },
    ],
    body: `次の企画について、提案用の企画書の骨子を作ってください。

<idea>{{idea}}</idea>
<reader>{{reader}}</reader>
<issue>{{issue}}</issue>

構成：
1. 企画の概要（3行）
2. 背景と課題
3. 企画内容（何を・誰が・いつ・どのように）
4. 期待される効果
5. 必要なリソース（予算・人員・期間）
6. リスクと対策
7. スケジュール

提出先が判断するときに気にしそうな点を3つ挙げ、その答えも盛り込んでください。`,
    notes: ['数字（予算・効果）は推定であることを明記し、実際の値に置き換えてください'],
  },
  {
    id: 'business-plan',
    title: '事業計画書',
    description: '新規事業や起業のための事業計画書を作る',
    group: '企画書',
    recommended: ['claude', 'chatgpt', 'gemini'],
    fields: [
      { key: 'business', label: '事業の内容', multiline: true, required: true },
      { key: 'customer', label: '想定顧客', placeholder: '例：共働きの子育て世帯' },
      { key: 'resources', label: '使えるリソース', placeholder: '例：自己資金200万円、副業で週10時間' },
    ],
    body: `あなたは新規事業の立ち上げを支援してきた経営コンサルタントです。次の事業の事業計画書を作ってください。

【事業内容】
{{business}}

【想定顧客】{{customer}}
【使えるリソース】{{resources}}

【構成】
1. エグゼクティブサマリー
2. 顧客と課題
3. 解決策・提供価値
4. 市場と競合（推定の場合はその旨を明記）
5. ビジネスモデル（収益の仕組み）
6. マーケティング・販売方法
7. 実行計画（最初の3か月・1年）
8. 収支計画の考え方（前提条件を明記）
9. リスクと対策

最後に、この計画の弱い部分と、検証すべき仮説を挙げてください。`,
    notes: ['市場規模などの数字は必ず公的な統計などで確認してください'],
  },
  // ---------------- 営業資料 ----------------
  {
    id: 'sales-deck',
    title: '営業資料（スライド構成）',
    description: '商談で使うスライドの構成と各ページの内容を作る',
    group: '営業資料',
    recommended: ['claude', 'chatgpt', 'gemini'],
    fields: [
      { key: 'product', label: '商品・サービス', required: true, multiline: true },
      { key: 'customer', label: '提案先', placeholder: '例：中小企業の人事部' },
      { key: 'pages', label: 'ページ数', placeholder: '例：10枚程度' },
    ],
    body: `商談用の営業資料の構成を作ってください。

商品・サービス：{{product}}
提案先：{{customer}}
ページ数：{{pages}}

各スライドについて、次の形式で出力してください：
- スライド番号／タイトル／伝えたいこと（1行）／載せる内容（箇条書き）／図やグラフのアイデア

構成の流れ：提案先の課題 → 解決策 → 導入効果 → 事例 → 料金 → 導入の流れ → 次のステップ`,
    notes: ['事例や効果の数字は、実際のデータに差し替えてください'],
  },
  {
    id: 'sales-mail',
    title: '営業メール（新規開拓）',
    description: '初めての相手に送る、押し付けがましくない営業メール',
    group: '営業資料',
    recommended: ['chatgpt', 'claude'],
    fields: [
      { key: 'product', label: '商品・サービス', required: true },
      { key: 'target', label: '送る相手', placeholder: '例：飲食店のオーナー' },
      { key: 'benefit', label: '相手にとってのメリット', multiline: true },
    ],
    body: `新規開拓用の営業メールを作成してください。

商品・サービス：{{product}}
送る相手：{{target}}
相手にとってのメリット：{{benefit}}

条件：
- 件名は開封したくなるが、誇張しない
- 本文は300字程度で、相手のメリットを先に伝える
- 返信のハードルが低い行動（資料を見る、15分の相談など）を提案する

件名3案と本文2案を作成してください。`,
    notes: ['迷惑メールにならないよう、送信先の同意や関連する法律（特定電子メール法など）を確認してください'],
  },
  // ---------------- データ分析 ----------------
  {
    id: 'data-csv',
    title: 'CSV・Excelデータの分析',
    description: 'アップロードしたデータから傾向を見つけ、グラフにまとめる',
    group: 'データ分析',
    recommended: ['chatgpt', 'gemini', 'claude'],
    featured: true,
    fields: [
      { key: 'data', label: 'データの内容', placeholder: '例：2025年の月別・商品別の売上データ', required: true },
      { key: 'columns', label: '主な列（項目）', placeholder: '例：日付、商品名、数量、金額、店舗' },
      { key: 'question', label: '知りたいこと', multiline: true, placeholder: '例：売上が落ちている商品と、その原因の仮説' },
    ],
    body: `あなたはビジネスデータの分析に詳しいアナリストです。添付したデータを分析してください。

データ：{{data}}
主な列：{{columns}}
知りたいこと：{{question}}

手順：
1. データの概要（件数・期間・欠損や異常値）を確認して報告する
2. 知りたいことに答えるための集計・分析を行う
3. 結果をグラフで示す
4. 結論 → 根拠となる数値 → 考察 → 次に取るべき行動 の順でまとめる

注意：
- 計算結果は推測せず、実際に計算した値を示す
- データから言えないことは「言えない」と明記する`,
    notes: ['個人情報や機密情報を含むデータは、匿名化してからアップロードしてください'],
  },
  {
    id: 'data-survey',
    title: 'アンケート自由回答の分析',
    description: '自由記述の回答を分類し、意見の傾向をまとめる',
    group: 'データ分析',
    recommended: ['claude', 'chatgpt', 'gemini'],
    fields: [
      { key: 'survey', label: 'アンケートの内容', placeholder: '例：新サービスの利用者アンケート', required: true },
      { key: 'answers', label: '回答（貼り付け）', multiline: true, required: true },
    ],
    body: `次のアンケートの自由回答を分析してください。

アンケート：{{survey}}

<answers>
{{answers}}
</answers>

出力：
1. 回答を内容ごとに分類し、各分類の件数と代表的な意見
2. ポジティブ・ネガティブな意見の傾向
3. 特に重要な改善点トップ3と、その根拠
4. 次に取るべきアクションの提案

件数は実際に数えた値を示してください。`,
    notes: ['回答者の名前などの個人情報は削除してから貼り付けてください'],
  },
  {
    id: 'excel-formula',
    title: 'Excel・スプレッドシートの関数を作る',
    description: 'やりたい集計を伝えて、使える関数を教えてもらう',
    group: 'データ分析',
    recommended: ['chatgpt', 'gemini', 'claude'],
    fields: [
      { key: 'app', label: '使うソフト', placeholder: '例：Googleスプレッドシート' },
      { key: 'layout', label: '表の構成', placeholder: '例：A列=日付、B列=担当者、C列=売上', multiline: true },
      { key: 'want', label: 'やりたいこと', placeholder: '例：担当者ごとの今月の売上合計', required: true },
    ],
    body: `次の集計をするための関数を教えてください。

使うソフト：{{app}}
表の構成：
{{layout}}
やりたいこと：{{want}}

出力：
1. そのまま貼り付けられる関数（どのセルに入れるかも明記）
2. 関数の各部分の意味
3. よくある間違いと対処法
4. もっと便利にする方法（ピボットテーブルなど）があれば紹介`,
    notes: ['ソフトやバージョンによって使える関数が異なる場合があります'],
  },
  // ---------------- 業務自動化 ----------------
  {
    id: 'gas-automation',
    title: 'Google Apps Scriptで業務を自動化',
    description: 'Gmail・スプレッドシートなどの作業を自動化するスクリプトを作る',
    group: '業務自動化',
    recommended: ['gemini', 'claude', 'chatgpt'],
    fields: [
      { key: 'task', label: '自動化したい作業', multiline: true, required: true, placeholder: '例：毎朝、特定の件名のメールをスプレッドシートに記録したい' },
      { key: 'services', label: '使うサービス', placeholder: '例：Gmail、スプレッドシート' },
      { key: 'timing', label: '実行タイミング', placeholder: '例：毎朝9時' },
    ],
    body: `Google Apps Script で次の作業を自動化してください。プログラミング初心者にも分かるように説明してください。

【自動化したい作業】
{{task}}

【使うサービス】{{services}}
【実行タイミング】{{timing}}

【条件】
- 変更しやすい値（シート名・宛先など）はコードの先頭にまとめる
- エラーが起きたらメールで通知する
- 同じデータを二重に処理しないようにする
- 必要な権限は最小限にする

【出力】
1. 完成したコード（コメント付き）
2. 設定手順（Apps Script の開き方、貼り付け、権限の承認、トリガー設定）
3. テストのしかた
4. よくあるエラーと対処法`,
    notes: ['会社のアカウントで使う場合は、管理者の規定を確認してください', '最初はテスト用のシートやメールで動作を確認してください'],
  },
  {
    id: 'workflow-improve',
    title: '業務フローの改善案',
    description: '今の作業手順から、ムダや自動化できる部分を見つける',
    group: '業務自動化',
    recommended: ['claude', 'chatgpt', 'gemini'],
    fields: [
      { key: 'flow', label: '現在の作業手順', multiline: true, required: true, placeholder: '例：①注文メールを確認 ②Excelに転記 ③在庫を確認 ④発送依頼をチャットで送る' },
      { key: 'tools', label: '使っているツール', placeholder: '例：Gmail、Excel、Slack' },
      { key: 'time', label: 'かかっている時間', placeholder: '例：毎日1時間' },
    ],
    body: `次の業務の改善案を提案してください。

<current_flow>
{{flow}}
</current_flow>
<tools>{{tools}}</tools>
<time_spent>{{time}}</time_spent>

出力：
1. 現在の手順の課題（ムダ・ミスが起きやすい点）
2. 改善案を「すぐできる」「ツールを使う」「自動化する」の3段階で
3. 各案の効果の見込み・必要なコスト・難易度の比較表
4. 最初に取り組むべき改善と、その手順`,
    notes: ['社外秘の情報は、具体名を伏せて入力してください'],
  },
  // ---------------- 市場調査 ----------------
  {
    id: 'market-research',
    title: '市場調査レポート',
    description: '業界や市場の動向を、出典付きで調べてまとめる',
    group: '市場調査',
    recommended: ['gemini', 'chatgpt'],
    fields: [
      { key: 'market', label: '調べたい市場', required: true, placeholder: '例：国内のペット向けサブスクサービス' },
      { key: 'purpose', label: '調査の目的', placeholder: '例：参入を検討するため' },
      { key: 'period', label: '対象期間', placeholder: '例：直近3年' },
    ],
    body: `次の市場について調査し、レポートにまとめてください。

調査対象：{{market}}
目的：{{purpose}}
対象期間：{{period}}

調べる内容：
1. 市場規模と成長の傾向
2. 主なプレイヤーとその特徴
3. 顧客のニーズと変化
4. 今後のチャンスとリスク

条件：
- Web検索を使い、すべての情報に出典（URL）と日付を付ける
- 推定や意見は事実と区別して書く
- 情報が見つからない項目は、無理に埋めず「確認できず」と書く

最初に要点を5行でまとめてください。`,
    notes: ['出典のリンクを開き、内容が正しいか必ず確認してください'],
  },
  {
    id: 'competitor',
    title: '競合サービスの比較',
    description: '競合を同じ観点で比較し、自社の立ち位置を考える',
    group: '市場調査',
    recommended: ['gemini', 'chatgpt', 'claude'],
    fields: [
      { key: 'mine', label: '自社の商品・サービス', required: true },
      { key: 'competitors', label: '競合（分かれば）', placeholder: '例：A社、B社' },
      { key: 'points', label: '比較したい観点', placeholder: '例：価格、機能、サポート' },
    ],
    body: `競合サービスの比較表を作ってください。

自社：{{mine}}
競合：{{competitors}}
比較の観点：{{points}}

出力：
1. 比較表（行：観点、列：各サービス）
2. 各社の強み・弱み
3. 自社が差別化できるポイントの提案

条件：最新の情報は検索で確認し、出典を付けること。確認できない情報は空欄にすること。`,
    notes: ['料金などは変更されることがあるため、公式サイトでも確認してください'],
  },
  // ---------------- アイデア出し ----------------
  {
    id: 'brainstorm',
    title: 'アイデア出し（ブレインストーミング）',
    description: '制約条件をふまえて、たくさんのアイデアを出して絞り込む',
    group: 'アイデア出し',
    recommended: ['chatgpt', 'claude', 'gemini'],
    fields: [
      { key: 'theme', label: 'テーマ', required: true, placeholder: '例：地域の商店街を盛り上げるイベント' },
      { key: 'constraints', label: '制約条件', placeholder: '例：予算30万円、準備2か月' },
      { key: 'criteria', label: '評価基準', placeholder: '例：話題性、実現しやすさ' },
    ],
    body: `次のテーマでアイデアを出してください。

テーマ：{{theme}}
制約条件：{{constraints}}
評価基準：{{criteria}}

進め方：
1. まず、視点を変えながらアイデアを20個出す（定番・意外性・低コスト・デジタル活用 など）
2. 評価基準で5段階評価した表を作る
3. 上位3つを深掘りし、実行の最初の一歩とリスクを示す`,
    notes: ['気に入ったアイデアは「この案をもっと具体的に」と続けて依頼できます'],
  },
  {
    id: 'naming',
    title: 'ネーミング案',
    description: '商品・サービス・イベントの名前を考える',
    group: 'アイデア出し',
    recommended: ['chatgpt', 'claude'],
    fields: [
      { key: 'target', label: '名前をつけたいもの', required: true, placeholder: '例：子ども向けプログラミング教室' },
      { key: 'image', label: '伝えたいイメージ', placeholder: '例：楽しい、未来、挑戦' },
      { key: 'rules', label: '条件', placeholder: '例：ひらがな or カタカナ、5文字以内' },
    ],
    body: `次のもののネーミング案を考えてください。

名前をつけたいもの：{{target}}
伝えたいイメージ：{{image}}
条件：{{rules}}

出力：
- 方向性の異なる案を15個（それぞれ読み方と由来を1行で）
- おすすめトップ3と理由
- 注意：既存の有名な商標と重なっていないか、最終的に確認が必要な旨を添える`,
    notes: ['使う前に商標登録の有無やドメインの空きを確認してください'],
  },
  // ---------------- 動画制作 ----------------
  {
    id: 'video-script',
    title: 'YouTube動画の台本',
    description: '構成・ナレーション・テロップまで含めた台本を作る',
    group: '動画制作',
    recommended: ['claude', 'chatgpt'],
    fields: [
      { key: 'theme', label: '動画のテーマ', required: true, placeholder: '例：初心者向けキャンプ道具の選び方' },
      { key: 'length', label: '長さ', placeholder: '例：8分' },
      { key: 'viewer', label: '視聴者', placeholder: '例：キャンプを始めたい30代' },
    ],
    body: `YouTube動画の台本を作ってください。

テーマ：{{theme}}
長さ：{{length}}
視聴者：{{viewer}}

構成：
- 冒頭15秒：視聴者の興味を引くフック
- 本編：要点を3〜5つに分ける
- まとめと次の行動（チャンネル登録・関連動画など）

出力形式（表）：
時間の目安 ／ 映像の内容 ／ ナレーション ／ テロップ

最後に、タイトル案を5つとサムネイルの構図案を3つ提案してください。`,
    notes: ['事実関係（価格・仕様など）は撮影前に確認してください'],
  },
  {
    id: 'shorts',
    title: 'ショート動画の構成',
    description: 'TikTok・リール・Shorts向けの短い動画の構成を作る',
    group: '動画制作',
    recommended: ['chatgpt', 'gemini', 'claude'],
    fields: [
      { key: 'theme', label: 'テーマ', required: true, placeholder: '例：1分でできる肩こりストレッチ' },
      { key: 'account', label: 'アカウントのジャンル', placeholder: '例：整体院' },
    ],
    body: `縦型ショート動画（30〜60秒）の構成を作ってください。

テーマ：{{theme}}
アカウントのジャンル：{{account}}

条件：
- 最初の2秒で手を止めてもらう工夫を入れる
- テロップは短く、1画面1メッセージ
- 最後まで見たくなる流れにする

出力：構成案を3パターン（秒数／映像／テロップ／音声）
あわせて、投稿文とハッシュタグの案も作成してください。`,
    notes: ['使用する音源の利用条件は各プラットフォームで確認してください'],
  },
];

export const TEMPLATE_MAP: Record<string, PromptTemplate> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
