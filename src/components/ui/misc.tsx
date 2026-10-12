import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ExternalLink as ExternalIcon, ShieldCheck, Trash2 } from 'lucide-react';
import { AI_PROFILES } from '../../data/aiProfiles';
import { cx } from '../../lib/utils';
import type { AiId } from '../../types';
import { Button } from './Button';

export function Panel({ className, children, as: As = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'article' }) {
  return <As className={cx('glass rounded-2xl', className)}>{children}</As>;
}

export function SectionHeading({ eyebrow, title, description, action, id }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="label-mono mb-2 text-accent/80">{eyebrow}</p>}
        <h2 id={id} className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ children, tone = 'default', className }: { children: ReactNode; tone?: 'default' | 'accent' | 'warn'; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs leading-5',
        tone === 'default' && 'hairline bg-white/[0.03] text-fg-soft',
        tone === 'accent' && 'border-accent/30 bg-accent/10 text-accent',
        tone === 'warn' && 'border-warn/30 bg-warn/10 text-warn',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AiMark({ ai, size = 'sm', className }: { ai: AiId; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const p = AI_PROFILES[ai];
  return (
    <span className={cx('inline-flex items-center gap-1.5 font-medium', size === 'lg' && 'text-lg', size === 'md' && 'text-sm', size === 'sm' && 'text-xs', className)}>
      <span
        className={cx('inline-block rounded-full', size === 'lg' ? 'size-2.5' : 'size-2')}
        style={{ background: `var(${p.colorVar})`, boxShadow: `0 0 10px var(${p.colorVar})` }}
        aria-hidden
      />
      {p.name}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed hairline px-6 py-12 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl border hairline bg-white/[0.03] text-accent">{icon}</div>
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** 外部リンク（新しいタブで開き、参照元情報を渡さない） */
export function ExternalA({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const safe = /^https:\/\//.test(href) ? href : undefined;
  if (!safe) return <span className={className}>{children}</span>;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className={cx('inline-flex items-center gap-1 text-accent hover:underline', className)}>
      {children}
      <ExternalIcon className="size-3.5" aria-hidden />
      <span className="sr-only">（新しいタブで開きます）</span>
    </a>
  );
}

export function PrivacyNote({ className }: { className?: string }) {
  return (
    <p className={cx('flex items-start gap-2 text-xs leading-relaxed text-muted', className)}>
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent/80" aria-hidden />
      <span>
        入力内容はこのブラウザの中だけで処理され、外部に送信されません。個人情報・機密情報・パスワード・APIキーは入力しないでください。
      </span>
    </p>
  );
}

/** 2段階で確認する削除ボタン（誤操作防止） */
export function ConfirmButton({
  onConfirm,
  label = '削除',
  confirmLabel = '本当に削除する',
  size = 'sm',
  icon = true,
  className,
}: {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  size?: 'sm' | 'md';
  icon?: boolean;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Button
      variant={armed ? 'danger' : 'ghost'}
      size={size}
      className={cx(armed && 'bg-danger/10', className)}
      icon={icon ? <Trash2 className="size-4" aria-hidden /> : undefined}
      onClick={() => {
        if (armed) {
          window.clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timer.current = window.setTimeout(() => setArmed(false), 3500);
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}

/** 0〜4段階のレベル表示（精密な数値を見せないため） */
export function LevelBar({ level, max = 4, color = 'var(--color-accent)', label }: { level: number; max?: number; color?: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${label}：${max}段階中${level}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="h-1.5 w-4 rounded-full transition-colors duration-500"
          style={{ background: i < level ? color : 'rgb(255 255 255 / 0.08)' }}
        />
      ))}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description?: ReactNode; children?: ReactNode }) {
  return (
    <header className="animate-fade-up pt-10 pb-8 sm:pt-16 sm:pb-12">
      <p className="label-mono mb-3 text-accent/80">{eyebrow}</p>
      <h1 tabIndex={-1} data-page-title className="text-3xl font-semibold tracking-tight text-fg outline-none sm:text-4xl">
        {title}
      </h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>}
      {children}
    </header>
  );
}
