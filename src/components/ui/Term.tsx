import { useEffect, useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { GLOSSARY } from '../../data/glossary';

/**
 * 専門用語の補足。ホバー・フォーカス・タップで短い説明を表示します。
 */
export function Term({ id, label }: { id: string; label?: string }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!entry) return <>{label}</>;

  return (
    <span ref={ref} className="relative inline-flex items-center" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-md border-b border-dashed border-accent/40 text-inherit hover:text-accent"
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {label ?? entry.term}
        <CircleHelp className="size-3.5 opacity-70" aria-hidden />
        <span className="sr-only">（用語の説明）</span>
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="glass-strong absolute top-full left-1/2 z-40 mt-2 w-64 -translate-x-1/2 animate-fade-in rounded-xl p-3 text-left text-xs leading-relaxed font-normal text-fg-soft shadow-xl shadow-black/50"
        >
          <span className="mb-1 block font-semibold text-fg">{entry.term}</span>
          {entry.text}
        </span>
      )}
    </span>
  );
}
