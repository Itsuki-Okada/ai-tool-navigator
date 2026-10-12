import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

/**
 * ラジオボタンとして振る舞う切り替えボタン（矢印キーで移動できます）
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex flex-wrap gap-1.5', className)}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-all duration-200 active:scale-[0.97]',
              active
                ? 'border-accent/60 bg-accent/12 text-accent shadow-[inset_0_0_0_1px_rgb(95_227_220/0.15)]'
                : 'hairline bg-white/[0.02] text-fg-soft hover:border-accent/30 hover:text-fg',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
