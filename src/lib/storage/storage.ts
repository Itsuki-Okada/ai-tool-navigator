import type { AppData } from '../../types';
import { createEmptyData, sanitizeAppData } from './validate';

/**
 * LocalStorage の読み書き
 * - 保存先はこのブラウザだけです（他の端末とは同期されません）
 * - プライベートブラウズや容量不足で失敗しても、アプリは動き続けます
 */

export const STORAGE_KEY = 'ai-tool-navigator:v1';

export type LoadResult = { data: AppData; status: 'ok' | 'empty' | 'recovered' | 'unavailable' };

export function loadData(): LoadResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { data: createEmptyData(), status: 'unavailable' };
  }
  if (!raw) return { data: createEmptyData(), status: 'empty' };
  try {
    return { data: sanitizeAppData(JSON.parse(raw)), status: 'ok' };
  } catch {
    // 壊れたデータは退避してから初期化
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:broken`, raw);
    } catch {
      /* 退避できなくても続行 */
    }
    return { data: createEmptyData(), status: 'recovered' };
  }
}

export type SaveError = 'quota' | 'unavailable' | null;

export function saveData(data: AppData): SaveError {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return null;
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) return 'quota';
    return 'unavailable';
  }
}

export function clearData(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
