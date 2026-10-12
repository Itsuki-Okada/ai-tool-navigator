export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between font-mono text-xs">
        <span className="text-muted">
          <span className="text-accent">{String(current).padStart(2, '0')}</span>
          <span className="text-faint"> / {String(total).padStart(2, '0')}</span>
        </span>
        <span className="text-faint">{pct}%</span>
      </div>
      <div
        className="relative h-1 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label="診断の進み具合"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`${total}問中${current}問目`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-deep to-accent shadow-[0_0_12px_var(--color-accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
