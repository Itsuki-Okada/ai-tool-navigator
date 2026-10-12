import { useEffect, useId, useRef } from 'react';
import { Check, CircleHelp } from 'lucide-react';
import { UNSURE, type Answer, type Question } from '../../types';
import { cx } from '../../lib/utils';
import { Term } from '../ui/Term';

const MAX_TEXT = 2000;

interface Props {
  question: Question;
  answer: Answer | undefined;
  onChange: (a: Answer | undefined) => void;
  /** 単一選択で選んだあと自動で次へ進む */
  onPicked: () => void;
  placeholder?: string;
  examples?: string[];
  stepLabel: string;
}

export function QuestionView({ question: q, answer, onChange, onPicked, placeholder, examples, stepLabel }: Props) {
  const values = answer?.values ?? [];
  const text = answer?.text ?? '';
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textId = useId();
  const helpId = useId();

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [q.id]);

  const emit = (nextValues: string[], nextText: string) => {
    if (nextValues.length === 0 && !nextText.trim()) onChange(undefined);
    else onChange({ values: nextValues, ...(nextText ? { text: nextText } : {}) });
  };

  const pick = (value: string) => {
    if (q.type === 'multi') {
      if (value === UNSURE) return emit(values.includes(UNSURE) ? [] : [UNSURE], text);
      const base = values.filter((v) => v !== UNSURE);
      return emit(base.includes(value) ? base.filter((v) => v !== value) : [...base, value], text);
    }
    const already = values[0] === value;
    emit(already ? [] : [value], text);
    if (!already && !q.allowFreeText) onPicked();
  };

  // 数字キーで選択（入力欄にフォーカスがないとき）
  useEffect(() => {
    if (!q.options) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n)) return;
      if (n === 0 && !q.noUnsure) pick(UNSURE);
      else if (n >= 1 && n <= (q.options?.length ?? 0)) pick(q.options![n - 1].value);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const isMulti = q.type === 'multi';
  const showText = q.type === 'text' || q.allowFreeText;
  const ph = q.type === 'text' && q.id === 'goal' ? placeholder ?? q.placeholder : q.placeholder;

  return (
    <div>
      <p className="label-mono mb-3 text-accent/80">{stepLabel}</p>
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl leading-snug font-semibold tracking-tight text-fg outline-none sm:text-[1.75rem]">
        {q.title}
      </h2>
      {(q.help || isMulti) && (
        <p id={helpId} className="mt-2 text-sm text-muted">
          {q.help}
          {isMulti && <span className="ml-1 text-accent/80">複数選択できます。</span>}
        </p>
      )}
      {q.terms && q.terms.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>用語：</span>
          {q.terms.map((t) => (
            <Term key={t} id={t} />
          ))}
        </p>
      )}

      {q.options && (
        <div
          role={isMulti ? 'group' : 'radiogroup'}
          aria-label={q.title}
          className={cx('mt-7 grid gap-2.5', q.options.length > 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-2')}
        >
          {q.options.map((o, i) => {
            const on = values.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                role={isMulti ? 'checkbox' : 'radio'}
                aria-checked={on}
                data-active={on}
                onClick={() => pick(o.value)}
                className={cx(
                  'hud group relative flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 active:scale-[0.985]',
                  on
                    ? 'border-accent/55 bg-accent/[0.09] shadow-[0_0_0_1px_rgb(95_227_220/0.15),0_10px_30px_-12px_rgb(95_227_220/0.35)]'
                    : 'hairline bg-white/[0.025] hover:border-accent/30 hover:bg-white/[0.045]',
                )}
              >
                <span
                  className={cx(
                    'grid size-5 shrink-0 place-items-center border transition-all duration-200',
                    isMulti ? 'rounded-md' : 'rounded-full',
                    on ? 'border-accent bg-accent text-ink-950' : 'border-white/20',
                  )}
                  aria-hidden
                >
                  {on && <Check className="size-3.5 animate-pop" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cx('block text-[15px] leading-snug', on ? 'text-white' : 'text-fg')}>{o.label}</span>
                  {o.hint && <span className="mt-0.5 block text-xs text-muted">{o.hint}</span>}
                </span>
                <kbd className="hidden font-mono text-[10px] text-faint sm:block" aria-hidden>
                  {i + 1}
                </kbd>
              </button>
            );
          })}
        </div>
      )}

      {q.options && !q.noUnsure && (
        <button
          type="button"
          role={isMulti ? 'checkbox' : 'radio'}
          aria-checked={values.includes(UNSURE)}
          onClick={() => pick(UNSURE)}
          className={cx(
            'mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all active:scale-[0.97]',
            values.includes(UNSURE) ? 'border-accent/55 bg-accent/10 text-accent' : 'hairline text-muted hover:border-accent/30 hover:text-fg',
          )}
        >
          <CircleHelp className="size-4" aria-hidden />
          分からない・おまかせ
          <kbd className="hidden font-mono text-[10px] text-faint sm:inline" aria-hidden>
            0
          </kbd>
        </button>
      )}

      {showText && (
        <div className="mt-6">
          <label htmlFor={textId} className="mb-2 block text-sm text-fg-soft">
            {q.type === 'text' ? '回答を入力' : '自由入力（任意）'}
          </label>
          <textarea
            id={textId}
            value={text}
            maxLength={MAX_TEXT}
            rows={q.type === 'text' ? 4 : 2}
            placeholder={ph}
            onChange={(e) => emit(values, e.target.value)}
            aria-describedby={q.help ? helpId : undefined}
            className="block w-full resize-y rounded-xl border hairline bg-ink-900/70 px-4 py-3 text-[15px] text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none focus-visible:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-faint">
            <span>個人情報・パスワード・APIキーは入力しないでください。</span>
            <span className="font-mono">
              {text.length}/{MAX_TEXT}
            </span>
          </div>
          {q.id === 'goal' && examples && examples.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">例：</span>
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => emit(values, ex)}
                  className="rounded-full border hairline px-3 py-1 text-xs text-fg-soft transition-colors hover:border-accent/40 hover:text-accent active:scale-[0.97]"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
