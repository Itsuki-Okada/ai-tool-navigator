import type { CategoryId, CategoryRule, CautionRule, PlaybookRule } from '../types';

/**
 * カテゴリ別の評価ルール
 * ----------------------------------------------------------------
 * baseNeeds: カテゴリを選んだ時点で想定されるニーズと重み（1〜3）
 * tasks:     各AIに向いている作業の例
 * howTo:     各AIのおすすめの使い方
 * 判定の調整はこのファイルと questions.ts の needs を編集してください。
 */
export const CATEGORY_RULES: Record<CategoryId, CategoryRule> = {
  web: {
    baseNeeds: { codeAssist: 3, structured: 2, agenticCoding: 1 },
    tasks: {
      chatgpt: ['画面構成や機能の相談', 'ページの文章・画像素材の作成', '部分的なコードの作成と説明'],
      gemini: ['Googleスプレッドシートやマップと連携する機能の相談', 'デザインの参考画像の作成', '部分的なコードの作成と説明'],
      claude: ['Claude Code でのプロジェクト作成から実装・修正まで', '長い要件をふまえた設計', '複数ファイルにまたがる変更'],
    },
    howTo: {
      chatgpt: ['まず「作りたいもの」と「機能」を伝えて、画面構成とファイル構成を提案してもらう', '1ファイルずつコードを出してもらい、動かしながら修正を依頼する'],
      gemini: ['まず要件を伝えて全体の構成を提案してもらう', 'Googleのサービスと連携する部分は、手順を細かく分けて確認しながら進める'],
      claude: ['まず要件を伝えて画面構成と実装計画を出してもらい、内容を確認してから実装を進める', '最後にビルドとテスト（Claude Code の場合）や動作確認の手順を必ず実行してもらう'],
    },
  },
  code: {
    baseNeeds: { codeAssist: 3, structured: 1 },
    tasks: {
      chatgpt: ['エラーメッセージの意味の説明', '小さな関数の作成', 'コードの解説'],
      gemini: ['Google Apps Script など Google 系のコード', 'エラーの原因調査', 'コードの解説'],
      claude: ['複数ファイルにまたがる修正', 'Claude Code での調査・修正・テスト実行', 'コードレビュー'],
    },
    howTo: {
      chatgpt: ['エラーメッセージと関連するコードをセットで貼り付ける', '修正後のコードを省略せずに出してもらう'],
      gemini: ['エラーメッセージと関連するコードをセットで貼り付ける', '原因の候補を複数挙げてもらい、1つずつ確認する'],
      claude: ['Claude Code ならプロジェクトを直接読ませ、原因調査→修正→テストまで任せる', 'ブラウザで使う場合は関連ファイルをまとめて貼り付ける'],
    },
  },
  image: {
    baseNeeds: { imageGen: 3, beginner: 1 },
    tasks: {
      chatgpt: ['会話しながらの画像生成と修正', '画像内の文字の調整', '用途に合わせた複数案の作成'],
      gemini: ['会話しながらの画像生成と編集', '手元の画像の部分的な修正', '複数案の比較'],
      claude: ['画像生成ツール向けの詳細なプロンプト作成', '画像の構図やコンセプトの言語化', '生成された画像の評価と改善案'],
    },
    howTo: {
      chatgpt: ['生成したプロンプトを貼り付けて画像を作り、「もう少し明るく」など言葉で修正する'],
      gemini: ['生成したプロンプトを貼り付けて画像を作り、気になる部分を具体的に伝えて修正する'],
      claude: ['Claude で画像生成用の指示文を作り、ChatGPT・Gemini などの画像生成機能に貼り付けて使う'],
    },
  },
  video: {
    baseNeeds: { ideation: 1, writing: 1, structured: 1, videoGen: 1, vision: 1 },
    tasks: {
      chatgpt: ['企画・台本の作成', 'サムネイル画像の作成', '映像素材の生成（利用条件あり）'],
      gemini: ['動画の内容の要約・分析', '企画・台本の作成', '映像素材の生成（利用条件あり）'],
      claude: ['長尺動画の構成・台本', 'ナレーション原稿の推敲', '字幕用テキストの整形'],
    },
    howTo: {
      chatgpt: ['企画→構成→台本の順に1ステップずつ依頼する', 'サムネイルは同じ会話の中で作成すると方向性がぶれにくい'],
      gemini: ['参考動画や撮影素材がある場合は内容を要約させてから構成に反映する'],
      claude: ['構成と台本を作り、映像そのものは動画生成ツールや編集ソフトで作る'],
    },
  },
  writing: {
    baseNeeds: { writing: 3, structured: 1 },
    tasks: {
      chatgpt: ['幅広いジャンルの文章作成', 'キャッチコピーの大量案出し', 'SNS向けの短文'],
      gemini: ['検索結果をふまえた記事の下調べ', 'Googleドキュメントで続けて編集する文章', '要約'],
      claude: ['長文記事・レポートの作成', '自然な日本語への推敲', 'トーンを細かく指定した文章'],
    },
    howTo: {
      chatgpt: ['まず構成案を出してもらい、確認してから本文を書いてもらう'],
      gemini: ['調べものが必要な記事は、先に情報を集めてから執筆を依頼する'],
      claude: ['参考にしたい文章があれば一緒に渡し、文体を合わせてもらう', '長文は構成→本文→推敲の順に進める'],
    },
  },
  idea: {
    baseNeeds: { ideation: 3, writing: 1 },
    tasks: {
      chatgpt: ['大量のアイデア出し', 'アイデアの評価・絞り込み', 'イメージ画像の作成'],
      gemini: ['トレンドをふまえたアイデア出し', '類似事例の検索', 'アイデアの評価'],
      claude: ['条件を細かく考慮したアイデア出し', 'アイデアの深掘りと企画書化', '多角的な評価'],
    },
    howTo: {
      chatgpt: ['まず数を出してもらい、評価基準で絞り込む', '気に入った案を深掘りしてもらう'],
      gemini: ['最新の事例を調べてもらってからアイデアを出してもらう'],
      claude: ['制約条件をすべて伝え、評価表付きで出してもらう'],
    },
  },
  marketing: {
    baseNeeds: { writing: 2, ideation: 2, webSearch: 1 },
    tasks: {
      chatgpt: ['投稿文と画像をまとめて作成', '広告コピーの案出し', '投稿カレンダー'],
      gemini: ['トレンドの調査', 'Googleスプレッドシートでの投稿管理', '投稿画像の作成'],
      claude: ['ブランドの方針に沿った文章', '運用戦略の整理', '長期の投稿計画'],
    },
    howTo: {
      chatgpt: ['ターゲットと商品情報を最初に伝え、投稿案→画像の順に作る'],
      gemini: ['最新トレンドを調べてから投稿案を作ってもらう'],
      claude: ['ブランドのトーンや禁止表現をまとめて渡し、一貫した文章を作ってもらう'],
    },
  },
  data: {
    baseNeeds: { dataAnalysis: 3, structured: 1 },
    tasks: {
      chatgpt: ['CSV・Excelのアップロード分析', 'グラフ作成', '集計結果の解説'],
      gemini: ['Googleスプレッドシートのデータ分析', '関数の作成', '資料の構成'],
      claude: ['長いレポートや資料の読み込み', '分析結果の考察・文章化', 'Python分析コードの作成'],
    },
    howTo: {
      chatgpt: ['機密情報を取り除いたファイルをアップロードし、何を知りたいかを伝える'],
      gemini: ['スプレッドシートを使う場合はGoogleのサービス内で分析を依頼する'],
      claude: ['データの概要と列の説明を渡し、分析手順と考察を作ってもらう'],
    },
  },
  automation: {
    baseNeeds: { integrations: 2, codeAssist: 2, beginner: 1 },
    tasks: {
      chatgpt: ['自動化の手順設計', 'スクリプトの作成', 'ノーコードツールの設定手順'],
      gemini: ['Google Apps Script による自動化', 'Gmail・スプレッドシートの連携', 'Googleサービス内での効率化'],
      claude: ['複雑な自動化スクリプト', 'MCP を使ったツール連携', 'Claude Code での自動化プログラム開発'],
    },
    howTo: {
      chatgpt: ['現在の作業手順を箇条書きで伝え、どこを自動化できるか提案してもらう'],
      gemini: ['Google Workspace を使っている場合は、Apps Script のコードと設定手順を作ってもらう'],
      claude: ['手順と例外ケースを伝え、エラー処理を含めたスクリプトを作ってもらう'],
    },
  },
  research: {
    baseNeeds: { webSearch: 3, deepResearch: 2, structured: 1 },
    tasks: {
      chatgpt: ['Web検索による情報収集', '調査レポートの作成', '比較表の作成'],
      gemini: ['Google検索を使った最新情報の調査', '調査レポートの作成', '長い資料の要約'],
      claude: ['手元の資料（PDFなど）の読み込みと分析', '集めた情報の整理・文章化', '論点の整理'],
    },
    howTo: {
      chatgpt: ['調査の目的と範囲を伝え、出典付きでまとめてもらう'],
      gemini: ['調べたい時期と範囲を伝え、出典付きでまとめてもらう'],
      claude: ['集めた資料を渡して、論点ごとに整理してもらう'],
    },
  },
  strategy: {
    baseNeeds: { structured: 3, writing: 1, longContext: 1 },
    tasks: {
      chatgpt: ['フレームワークを使った整理', '数値データの分析', '資料の構成'],
      gemini: ['市場データの調査', 'Googleスライド・ドキュメントでの資料化', '競合調査'],
      claude: ['長い事業計画書の作成', '論理構成の確認', '既存資料の読み込みと改善'],
    },
    howTo: {
      chatgpt: ['事業の概要を伝え、フレームワークごとに整理してもらう'],
      gemini: ['市場や競合の最新情報を調べてから計画に反映する'],
      claude: ['既存の資料をまとめて渡し、論理の抜け漏れを指摘してもらう'],
    },
  },
  other: {
    baseNeeds: { beginner: 1, writing: 1 },
    tasks: {
      chatgpt: ['幅広い相談', '画像も含めた成果物の作成'],
      gemini: ['Googleサービスを使った作業', '最新情報の確認'],
      claude: ['丁寧な文章での相談・整理', '長い資料の読み込み'],
    },
    howTo: {
      chatgpt: ['やりたいことを具体的に伝え、手順を提案してもらう'],
      gemini: ['やりたいことを具体的に伝え、必要なら検索してもらう'],
      claude: ['状況や条件を詳しく伝え、整理してもらう'],
    },
  },
};

/**
 * 条件付きの注意事項
 * when のすべてを満たし、ai が指定されていればそのAIが上位のときに表示します。
 */
export const CAUTION_RULES: CautionRule[] = [
  { when: [{ q: 'budget', in: ['free'] }, { q: 'web_env', in: ['claude-code'] }], text: 'Claude Code は無料プランでは利用できません。無料で進める場合は、ブラウザ版のAIでコードを作る方法も検討してください。' },
  { when: [{ q: 'budget', in: ['free'] }, { q: 'code_env', in: ['claude-code'] }], text: 'Claude Code は無料プランでは利用できません。無料で進める場合は、ブラウザ版のAIにコードを貼り付ける方法も検討してください。' },
  { when: [{ q: 'web_env', in: ['claude-code'] }, { q: 'skill_code', in: ['none'] }], text: 'Claude Code は黒い画面（ターミナル）で操作します。はじめての場合は、公式ドキュメントのセットアップ手順を見ながら進めてください。' },
  { when: [{ q: 'code_env', in: ['claude-code'] }, { q: 'code_understanding', in: ['low'] }], text: 'Claude Code はファイルを直接変更します。変更内容が分からない場合は、作業前に Git で保存しておくと元に戻せます。' },
  { when: [{ q: 'web_storage', in: ['cloud'] }], text: 'サーバーにデータを保存する場合、セキュリティ設定（アクセス権限など）を必ず確認してください。' },
  { when: [{ q: 'web_features', in: ['payment'] }], text: '決済機能はカード情報を自分で扱わず、決済サービスの仕組みを使ってください。本番公開前に専門家の確認をおすすめします。' },
  { when: [{ q: 'code_error', in: ['message'] }], text: 'エラーメッセージを貼り付けるときは、APIキー・パスワード・個人情報が含まれていないか確認してください。' },
  { when: [{ q: 'img_use', in: ['commercial'] }], text: 'AI生成画像の商用利用条件は各サービスの利用規約で確認してください。実在の人物・ロゴ・キャラクターに似せた画像は避けてください。' },
  { when: [{ q: 'img_text', in: ['short'] }], text: '画像内の文字（特に日本語）は崩れることがあります。重要な文字は画像編集ソフトで後から入れると確実です。' },
  { when: [{ q: 'vid_tasks', in: ['footage'] }], text: 'AIによる映像生成は、利用できるプラン・地域・生成できる長さに制限があります。各サービスの最新の提供状況を確認してください。' },
  { when: [{ q: 'vid_type', in: ['generated'] }], text: 'AIによる映像生成は、利用できるプラン・地域・生成できる長さに制限があります。各サービスの最新の提供状況を確認してください。' },
  { when: [{ q: 'd_sensitivity', in: ['some', 'high'] }], text: '機密情報・個人情報を含むデータは、AIにアップロードする前に匿名化してください。会社の規定も確認してください。' },
  { when: [{ q: 'au_constraints', in: ['company'] }], text: '業務データを外部のAIサービスに送る前に、会社のセキュリティ規定で許可されているか確認してください。' },
  { when: [{ q: 'rs_freshness', in: ['latest'] }], text: 'AIの検索結果にも誤りや古い情報が含まれることがあります。重要な情報は必ず出典を開いて確認してください。' },
  { when: [{ q: 'freshness', in: ['need'] }], text: '最新情報は検索機能を有効にして確認し、出典を必ず確認してください。' },
  { when: [{ q: 'w_purpose', in: ['search'] }], text: 'AIが書いた記事をそのまま大量に公開すると品質の評価が下がる可能性があります。独自の経験や情報を加えてください。' },
  { when: [{ q: 'st_type', in: ['pitch', 'plan'] }], text: '数値や市場規模はAIの推測を含むことがあります。資料に使う前に必ず一次情報で確認してください。' },
  { when: [{ q: 'web_features', in: ['ai'] }], text: 'アプリにAI機能を組み込む場合、APIキーはフロントエンドに置かず、サーバー側で管理してください（API利用料も発生します）。' },
];

/**
 * 条件付きのおすすめ手順
 */
export const PLAYBOOK_RULES: PlaybookRule[] = [
  { when: [{ q: 'web_env', in: ['claude-code'] }], step: 'Claude Code はプロジェクト用の空フォルダで起動し、最初に生成したプロンプトを丸ごと貼り付けます。' },
  { when: [{ q: 'code_env', in: ['claude-code'] }], step: 'Claude Code はプロジェクトのフォルダで起動し、エラーの状況とプロンプトを貼り付けて調査から任せます。' },
  { when: [{ q: 'web_env', in: ['browser'] }], step: 'ブラウザのAIでは、完成したコードを1ファイルずつ出してもらい、ファイル名を確認しながら保存します。' },
  { when: [{ q: 'web_env', in: ['nocode'] }], step: 'ノーコードツールでは、AIにページ構成と文章を作ってもらい、ツール上で配置していきます。' },
  { when: [{ q: 'img_mode', in: ['prompt'] }], step: '生成されたプロンプトを使いたい画像生成ツールに貼り付け、結果を見ながら言葉を調整します。' },
  { when: [{ q: 'd_sensitivity', in: ['high'] }], step: '実データの代わりに列名とダミーデータだけを渡し、分析コードを作ってもらって手元で実行します。' },
  { when: [{ q: 'au_connect', in: ['gas'] }], step: 'Google Apps Script は、スプレッドシートの「拡張機能 → Apps Script」から作成したコードを貼り付けて実行します。' },
  { when: [{ q: 'rs_depth', in: ['deep'] }], step: 'リサーチ機能（Deep Research など）を使える場合は、調査範囲を指定して実行し、最後に出典を確認します。' },
  { when: [{ q: 'quality', in: ['high'] }], step: '一度で完成させようとせず、「計画 → 作成 → 自己チェック → 修正」の順に進めると品質が安定します。' },
];

/**
 * 1位との点数差（重み × レベルの合計の差）がこの値未満なら「同程度」とみなす
 * 例：重み1のニーズで1段階だけ差がある程度なら同程度
 * 判断材料が少ないほど不確かなので、幅を広げます
 */
export const TIE_POINTS = { high: 2, medium: 2.5, low: 3.5 } as const;
/** 「ふだん使っているAI」などの意向1つあたりの加点（点数） */
export const PREFER_POINTS = 1.5;
/** 意向による表示用スコアの加点 */
export const PREFER_BONUS = 0.04;
