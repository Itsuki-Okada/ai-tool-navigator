import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadData, saveData, type LoadResult } from '../lib/storage/storage';
import { LIMITS, mergeData, sanitizeAppData } from '../lib/storage/validate';
import { createId } from '../lib/utils';
import type { AiId, AppData, DiagnosisDraft, DiagnosisRecord, SavedPrompt } from '../types';
import { useToast } from './toast';

/**
 * アプリの状態（LocalStorage と同期）
 * 画面のコンポーネントはここで公開している操作だけを使い、
 * LocalStorage を直接さわらないようにしています。
 */

type NewPrompt = Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>;

interface StoreValue {
  data: AppData;
  storageStatus: LoadResult['status'];
  addHistory: (rec: Omit<DiagnosisRecord, 'id' | 'createdAt'>) => DiagnosisRecord;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (ai: AiId) => void;
  savePrompt: (p: NewPrompt) => SavedPrompt;
  updatePrompt: (id: string, patch: Partial<Pick<SavedPrompt, 'title' | 'body'>>) => void;
  deletePrompt: (id: string) => void;
  setPreferences: (patch: Partial<AppData['preferences']>) => void;
  touchTemplate: (id: string) => void;
  setDraft: (draft: DiagnosisDraft | null) => void;
  importData: (incoming: AppData, mode: 'merge' | 'replace') => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children, initial }: { children: ReactNode; initial?: AppData }) {
  const [loaded] = useState<LoadResult>(() => (initial ? { data: initial, status: 'ok' } : loadData()));
  const [data, setData] = useState<AppData>(loaded.data);
  const toast = useToast();
  const warned = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    if (loaded.status === 'recovered') toast.show('保存データが壊れていたため、初期状態から開始しました。', 'warn');
    if (loaded.status === 'unavailable') toast.show('このブラウザではデータを保存できません（プライベートモードなど）。', 'warn');
  }, [loaded.status, toast]);

  // 変更があれば LocalStorage へ保存
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      const err = saveData(data);
      if (err && !warned.current) {
        warned.current = true;
        toast.show(
          err === 'quota' ? '保存容量が不足しています。不要なプロンプトを削除してください。' : 'データを保存できませんでした。',
          'error',
        );
      }
      if (!err) warned.current = false;
    }, 200);
    return () => window.clearTimeout(t);
  }, [data, toast]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  // 操作関数は参照が変わらないようにする（useEffect の依存に入れても再実行されない）
  const actions = useMemo<Omit<StoreValue, 'data' | 'storageStatus'>>(() => {
    const now = () => new Date().toISOString();
    return {
      addHistory: (rec) => {
        const full: DiagnosisRecord = { ...rec, id: createId(), createdAt: now() };
        update((d) => ({ ...d, history: [full, ...d.history].slice(0, LIMITS.history) }));
        return full;
      },
      removeHistory: (id) => update((d) => ({ ...d, history: d.history.filter((h) => h.id !== id) })),
      clearHistory: () => update((d) => ({ ...d, history: [] })),
      toggleFavorite: (ai) =>
        update((d) => ({ ...d, favorites: d.favorites.includes(ai) ? d.favorites.filter((x) => x !== ai) : [...d.favorites, ai] })),
      savePrompt: (p) => {
        const t = now();
        const full: SavedPrompt = {
          ...p,
          title: p.title.trim().slice(0, LIMITS.title) || '無題のプロンプト',
          body: p.body.slice(0, LIMITS.body),
          id: createId(),
          createdAt: t,
          updatedAt: t,
        };
        update((d) => ({ ...d, savedPrompts: [full, ...d.savedPrompts].slice(0, LIMITS.savedPrompts) }));
        return full;
      },
      updatePrompt: (id, patch) =>
        update((d) => ({
          ...d,
          savedPrompts: d.savedPrompts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...(patch.title !== undefined ? { title: patch.title.trim().slice(0, LIMITS.title) || '無題のプロンプト' } : {}),
                  ...(patch.body !== undefined ? { body: patch.body.slice(0, LIMITS.body) } : {}),
                  edited: true,
                  updatedAt: now(),
                }
              : p,
          ),
        })),
      deletePrompt: (id) => update((d) => ({ ...d, savedPrompts: d.savedPrompts.filter((p) => p.id !== id) })),
      setPreferences: (patch) => update((d) => ({ ...d, preferences: { ...d.preferences, ...patch } })),
      touchTemplate: (id) =>
        update((d) => ({ ...d, recentTemplates: [id, ...d.recentTemplates.filter((x) => x !== id)].slice(0, LIMITS.recentTemplates) })),
      setDraft: (draft) => update((d) => ({ ...d, draft })),
      importData: (incoming, mode) => update((d) => (mode === 'replace' ? sanitizeAppData({ ...incoming, draft: d.draft }) : mergeData(d, incoming))),
      resetAll: () => update(() => sanitizeAppData({})),
    };
  }, [update]);

  const value = useMemo<StoreValue>(() => ({ data, storageStatus: loaded.status, ...actions }), [data, loaded.status, actions]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore は StoreProvider の内側で使用してください');
  return ctx;
}
