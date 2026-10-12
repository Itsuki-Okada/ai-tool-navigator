import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cx } from '../lib/utils';

type ToastKind = 'success' | 'info' | 'warn' | 'error';
interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
  action?: { label: string; href: string };
}

interface ToastApi {
  show: (message: string, kind?: ToastKind, action?: ToastItem['action']) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const show = useCallback<ToastApi['show']>(
    (message, kind = 'info', action) => {
      const id = ++seq.current;
      setItems((xs) => [...xs.slice(-2), { id, message, kind, action }]);
      window.setTimeout(() => dismiss(id), kind === 'error' || kind === 'warn' ? 6500 : 3800);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        aria-live="polite"
        role="status"
      >
        {items.map((t) => {
          const Icon = t.kind === 'success' ? CircleCheck : t.kind === 'info' ? Info : CircleAlert;
          return (
            <div
              key={t.id}
              className={cx(
                'glass-strong pointer-events-auto flex w-full max-w-md animate-fade-up items-start gap-3 rounded-xl px-4 py-3 text-sm shadow-2xl shadow-black/40',
              )}
            >
              <Icon
                className={cx(
                  'mt-0.5 size-4 shrink-0',
                  t.kind === 'success' && 'text-accent',
                  t.kind === 'info' && 'text-fg-soft',
                  t.kind === 'warn' && 'text-warn',
                  t.kind === 'error' && 'text-danger',
                )}
                aria-hidden
              />
              <p className="flex-1 leading-relaxed text-fg">{t.message}</p>
              {t.action && (
                <a href={t.action.href} className="shrink-0 font-medium text-accent hover:underline" onClick={() => dismiss(t.id)}>
                  {t.action.label}
                </a>
              )}
              <button type="button" onClick={() => dismiss(t.id)} className="shrink-0 text-muted hover:text-fg" aria-label="通知を閉じる">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast は ToastProvider の内側で使用してください');
  return ctx;
}
