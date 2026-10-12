import { isCategoryId } from '../../data/categories';
import { TEMPLATE_MAP } from '../../data/templates';
import type {
  AiId,
  Answer,
  Answers,
  AppData,
  DiagnosisDraft,
  DiagnosisRecord,
  PromptMode,
  PromptTarget,
  SavedPrompt,
} from '../../types';

/**
 * 保存データ・インポートデータの検証
 * LocalStorage や読み込んだファイルの内容は信用せず、
 * 形式が正しい項目だけを取り出します（不正な項目は捨てる）。
 */

export const LIMITS = {
  history: 50,
  savedPrompts: 500,
  recentTemplates: 10,
  title: 120,
  body: 50_000,
  answerText: 4_000,
  answersPerRecord: 60,
  importBytes: 5 * 1024 * 1024,
};

const AI_IDS: AiId[] = ['chatgpt', 'gemini', 'claude'];
const MODES: PromptMode[] = ['standard', 'quality', 'short'];
const TARGETS: PromptTarget[] = ['chatgpt', 'gemini', 'claude', 'claude-code', 'browser', 'generic-code'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number): string | null => (typeof v === 'string' ? v.slice(0, max) : null);
const isoDate = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};
const idStr = (v: unknown): string | null => (typeof v === 'string' && /^[\w-]{1,64}$/.test(v) ? v : null);

export function createEmptyData(): AppData {
  return {
    version: 1,
    history: [],
    favorites: [],
    savedPrompts: [],
    preferences: { mode: 'standard', target: null },
    recentTemplates: [],
    draft: null,
  };
}

function sanitizeAnswer(v: unknown): Answer | null {
  if (!isObj(v) || !Array.isArray(v.values)) return null;
  const values = v.values.filter((x): x is string => typeof x === 'string' && x.length <= 64).slice(0, 20);
  const text = str(v.text, LIMITS.answerText) ?? undefined;
  return text ? { values, text } : { values };
}

export function sanitizeAnswers(v: unknown): Answers {
  const out: Answers = {};
  if (!isObj(v)) return out;
  for (const [k, raw] of Object.entries(v).slice(0, LIMITS.answersPerRecord)) {
    if (!/^[\w-]{1,64}$/.test(k)) continue;
    const a = sanitizeAnswer(raw);
    if (a) out[k] = a;
  }
  return out;
}

function sanitizeRecord(v: unknown): DiagnosisRecord | null {
  if (!isObj(v)) return null;
  const id = idStr(v.id);
  const createdAt = isoDate(v.createdAt);
  if (!id || !createdAt || !isCategoryId(v.categoryId)) return null;
  const topAis = Array.isArray(v.topAis) ? v.topAis.filter((x): x is AiId => AI_IDS.includes(x as AiId)) : [];
  return {
    id,
    createdAt,
    categoryId: v.categoryId,
    answers: sanitizeAnswers(v.answers),
    topAis,
    summary: str(v.summary, LIMITS.title) ?? '',
  };
}

function sanitizePrompt(v: unknown): SavedPrompt | null {
  if (!isObj(v)) return null;
  const id = idStr(v.id);
  const title = str(v.title, LIMITS.title);
  const body = str(v.body, LIMITS.body);
  const createdAt = isoDate(v.createdAt);
  if (!id || title === null || body === null || !createdAt) return null;
  const source = v.source === 'diagnosis' || v.source === 'template' || v.source === 'manual' ? v.source : 'manual';
  const p: SavedPrompt = {
    id,
    title: title.trim() || '無題のプロンプト',
    body,
    createdAt,
    updatedAt: isoDate(v.updatedAt) ?? createdAt,
    source,
  };
  if (TARGETS.includes(v.target as PromptTarget)) p.target = v.target as PromptTarget;
  if (MODES.includes(v.mode as PromptMode)) p.mode = v.mode as PromptMode;
  if (isCategoryId(v.categoryId)) p.categoryId = v.categoryId;
  if (typeof v.templateId === 'string' && TEMPLATE_MAP[v.templateId]) p.templateId = v.templateId;
  if (v.edited === true) p.edited = true;
  return p;
}

function sanitizeDraft(v: unknown): DiagnosisDraft | null {
  if (!isObj(v) || !isCategoryId(v.categoryId)) return null;
  return {
    categoryId: v.categoryId,
    answers: sanitizeAnswers(v.answers),
    stepId: typeof v.stepId === 'string' ? v.stepId.slice(0, 64) : null,
    updatedAt: isoDate(v.updatedAt) ?? new Date().toISOString(),
  };
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

/** 任意の値を AppData に整える（壊れた項目は取り除く） */
export function sanitizeAppData(v: unknown): AppData {
  const base = createEmptyData();
  if (!isObj(v)) return base;
  const prefs = isObj(v.preferences) ? v.preferences : {};
  return {
    version: 1,
    history: uniqueById((Array.isArray(v.history) ? v.history : []).map(sanitizeRecord).filter((x): x is DiagnosisRecord => !!x)).slice(0, LIMITS.history),
    favorites: Array.isArray(v.favorites) ? [...new Set(v.favorites.filter((x): x is AiId => AI_IDS.includes(x as AiId)))] : [],
    savedPrompts: uniqueById((Array.isArray(v.savedPrompts) ? v.savedPrompts : []).map(sanitizePrompt).filter((x): x is SavedPrompt => !!x)).slice(0, LIMITS.savedPrompts),
    preferences: {
      mode: MODES.includes(prefs.mode as PromptMode) ? (prefs.mode as PromptMode) : base.preferences.mode,
      target: TARGETS.includes(prefs.target as PromptTarget) ? (prefs.target as PromptTarget) : null,
    },
    recentTemplates: Array.isArray(v.recentTemplates)
      ? [...new Set(v.recentTemplates.filter((x): x is string => typeof x === 'string' && !!TEMPLATE_MAP[x]))].slice(0, LIMITS.recentTemplates)
      : [],
    draft: sanitizeDraft(v.draft),
  };
}

// ---------- エクスポート / インポート ----------

export const EXPORT_APP_ID = 'ai-tool-navigator';

export interface ExportFile {
  app: typeof EXPORT_APP_ID;
  version: 1;
  exportedAt: string;
  data: AppData;
}

export function buildExport(data: AppData): ExportFile {
  return { app: EXPORT_APP_ID, version: 1, exportedAt: new Date().toISOString(), data: { ...data, draft: null } };
}

export type ImportResult =
  | { ok: true; data: AppData; counts: { history: number; savedPrompts: number; skipped: number } }
  | { ok: false; error: string };

export function parseImport(text: string): ImportResult {
  if (text.length > LIMITS.importBytes) return { ok: false, error: 'ファイルが大きすぎます（5MBまで）。' };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'JSONとして読み込めませんでした。ファイルが壊れていないか確認してください。' };
  }
  if (!isObj(json) || json.app !== EXPORT_APP_ID) {
    return { ok: false, error: 'AI TOOL NAVIGATOR でエクスポートしたファイルではないようです。' };
  }
  if (json.version !== 1) return { ok: false, error: '対応していないバージョンのファイルです。' };
  if (!isObj(json.data)) return { ok: false, error: 'データ部分が見つかりません。' };

  const raw = json.data;
  const data = sanitizeAppData(raw);
  data.draft = null;
  const rawCount = (Array.isArray(raw.history) ? raw.history.length : 0) + (Array.isArray(raw.savedPrompts) ? raw.savedPrompts.length : 0);
  const okCount = data.history.length + data.savedPrompts.length;
  return {
    ok: true,
    data,
    counts: { history: data.history.length, savedPrompts: data.savedPrompts.length, skipped: Math.max(0, rawCount - okCount) },
  };
}

/** 既存データに読み込んだデータを結合（同じIDは更新日時が新しい方を優先） */
export function mergeData(current: AppData, incoming: AppData): AppData {
  const promptMap = new Map(current.savedPrompts.map((p) => [p.id, p]));
  for (const p of incoming.savedPrompts) {
    const cur = promptMap.get(p.id);
    if (!cur || cur.updatedAt < p.updatedAt) promptMap.set(p.id, p);
  }
  const historyMap = new Map(current.history.map((h) => [h.id, h]));
  for (const h of incoming.history) if (!historyMap.has(h.id)) historyMap.set(h.id, h);

  return sanitizeAppData({
    ...current,
    savedPrompts: [...promptMap.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    history: [...historyMap.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    favorites: [...new Set([...current.favorites, ...incoming.favorites])],
    recentTemplates: [...new Set([...current.recentTemplates, ...incoming.recentTemplates])],
  });
}
