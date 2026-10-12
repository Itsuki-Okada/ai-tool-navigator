// アプリ全体で共有する型定義
// データ（src/data）とロジック（src/lib）はこの型だけに依存し、UIから独立しています。

export type AiId = 'chatgpt' | 'gemini' | 'claude';

export type CategoryId =
  | 'web'
  | 'code'
  | 'image'
  | 'video'
  | 'writing'
  | 'idea'
  | 'marketing'
  | 'data'
  | 'automation'
  | 'research'
  | 'strategy'
  | 'other';

/** lucide-react のアイコン名（src/components/ui/Icon.tsx で解決） */
export type IconName = string;

export interface Category {
  id: CategoryId;
  title: string;
  short: string;
  description: string;
  icon: IconName;
  examples: string[];
  /** この順番で質問を表示（showIf により一部は自動で省略） */
  questionIds: string[];
  /** 「かんたん診断」で使う質問（questionIds の一部・5問程度） */
  quickQuestionIds: string[];
  /** 開発系カテゴリ（Claude Code 向けなどの出力先を表示する） */
  isDev?: boolean;
}

/**
 * 評価の観点（要件の「評価項目」に対応）
 */
export type Criterion =
  | 'task'
  | 'features'
  | 'environment'
  | 'files'
  | 'ease'
  | 'cost'
  | 'freshness'
  | 'code'
  | 'media'
  | 'output';

/**
 * ユーザーの目的から導かれる「ニーズ」。AIの特徴データはニーズごとに定義します。
 */
export type NeedId =
  | 'longContext'
  | 'agenticCoding'
  | 'codeAssist'
  | 'writing'
  | 'imageGen'
  | 'imageEdit'
  | 'videoGen'
  | 'vision'
  | 'webSearch'
  | 'deepResearch'
  | 'googleIntegration'
  | 'integrations'
  | 'dataAnalysis'
  | 'ideation'
  | 'beginner'
  | 'freeUse'
  | 'structured'
  | 'voice';

export type NeedWeights = Partial<Record<NeedId, number>>;

/** 回答に関する条件。いずれかの値を含めば一致 */
export interface Condition {
  q: string;
  in?: string[];
  notIn?: string[];
  /** 何らかの回答がある */
  answered?: boolean;
}

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
  needs?: NeedWeights;
  /** 特定のAIを既に使う予定など、ユーザーの意向を反映（小さな加点） */
  prefer?: Partial<Record<AiId, number>>;
  /** プロンプト生成時にこの選択肢から追加される要件 */
  promptAdds?: string[];
}

export type PromptSection =
  | 'objective'
  | 'background'
  | 'requirements'
  | 'features'
  | 'constraints'
  | 'output'
  | 'quality'
  | 'none';

export interface Question {
  id: string;
  title: string;
  help?: string;
  type: 'single' | 'multi' | 'text';
  options?: QuestionOption[];
  /** 選択式でも自由入力欄を表示する */
  allowFreeText?: boolean;
  placeholder?: string;
  /** すべて満たすときだけ表示 */
  showIf?: Condition[];
  /** 「分からない・おまかせ」を出さない */
  noUnsure?: boolean;
  /** プロンプト内での見出しラベル */
  promptLabel: string;
  promptSection: PromptSection;
  /** 専門用語の補足（glossary のキー） */
  terms?: string[];
}

export const UNSURE = '__unsure';

export interface Answer {
  /** single: 1件 / multi: 複数 / text: 空配列 */
  values: string[];
  text?: string;
}

export type Answers = Record<string, Answer>;

// ---------- AI の特徴データ ----------

export interface Capability {
  /** 0: 標準では非対応 / 1: 限定的 / 2: 対応 / 3: 主要な強み（相対的な目安） */
  level: 0 | 1 | 2 | 3;
  note: string;
  limitation?: string;
  /** プランやモデルで差がある場合 */
  varies?: boolean;
}

export interface AiProfile {
  id: AiId;
  name: string;
  vendor: string;
  tagline: string;
  colorVar: string;
  officialUrl: string;
  pricingUrl: string;
  capabilities: Record<NeedId, Capability>;
  goodFor: string[];
  cautions: string[];
  /** この特徴データを最後に見直した日（YYYY-MM-DD） */
  lastReviewed: string;
}

export interface NeedMeta {
  id: NeedId;
  label: string;
  criterion: Criterion;
}

// ---------- 診断ルール ----------

export interface CautionRule {
  when: Condition[];
  ai?: AiId;
  text: string;
}

export interface PlaybookRule {
  when: Condition[];
  ai?: AiId;
  step: string;
}

export interface CategoryRule {
  baseNeeds: NeedWeights;
  /** カテゴリごとの、各AIに向いている作業 */
  tasks: Record<AiId, string[]>;
  /** カテゴリごとの、おすすめの使い方 */
  howTo: Record<AiId, string[]>;
}

// ---------- 診断結果 ----------

export type Tier = 'best' | 'good' | 'conditional' | 'weak';
export type Confidence = 'high' | 'medium' | 'low';

export interface NeedContribution {
  need: NeedId;
  weight: number;
  sources: string[];
}

export interface AiScore {
  ai: AiId;
  score: number;
  tier: Tier;
  blockedBy: NeedId[];
  strengths: { need: NeedId; text: string }[];
  limitations: string[];
  criteria: Partial<Record<Criterion, number>>;
}

export interface Recommendation {
  ranking: AiScore[];
  /** 1位と同程度とみなしたAI（1位を含む） */
  topGroup: AiId[];
  isTie: boolean;
  confidence: Confidence;
  confidenceNote: string;
  influentialFactors: string[];
  needs: NeedContribution[];
  tasks: string[];
  cautions: string[];
  howTo: string[];
  skippedQuestionIds: string[];
}

// ---------- プロンプト ----------

export type PromptMode = 'standard' | 'quality' | 'short';
export type PromptTarget = 'chatgpt' | 'gemini' | 'claude' | 'claude-code' | 'browser' | 'generic-code';

export interface PromptExplanation {
  canDo: string[];
  howTo: string[];
  recommendedAi: string;
  reason: string;
  cautions: string[];
}

export interface GeneratedPrompt {
  text: string;
  explanation: PromptExplanation;
}

export interface TemplateField {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  group: string;
  recommended: AiId[];
  fields: TemplateField[];
  body: string;
  notes: string[];
  featured?: boolean;
}

// ---------- 保存データ ----------

export interface DiagnosisRecord {
  id: string;
  createdAt: string;
  categoryId: CategoryId;
  answers: Answers;
  topAis: AiId[];
  summary: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  source: 'diagnosis' | 'template' | 'manual';
  target?: PromptTarget;
  mode?: PromptMode;
  categoryId?: CategoryId;
  templateId?: string;
  edited?: boolean;
}

export type DiagnosisDepth = 'quick' | 'full';

export interface DiagnosisDraft {
  categoryId: CategoryId;
  depth?: DiagnosisDepth;
  answers: Answers;
  stepId: string | null;
  updatedAt: string;
}

export interface AppData {
  version: 1;
  history: DiagnosisRecord[];
  favorites: AiId[];
  savedPrompts: SavedPrompt[];
  preferences: { mode: PromptMode; target: PromptTarget | null; depth: DiagnosisDepth };
  recentTemplates: string[];
  draft: DiagnosisDraft | null;
}
