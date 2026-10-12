import { useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { cx } from '../../lib/utils';

const STEPS = ['回答を整理しています', 'AIの特徴データと照合しています', '判定の理由をまとめています', 'プロンプトを組み立てています'];

/** 診断結果を計算している間のローディング演出 */
export function Analyzing({ duration }: { duration: number }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const per = Math.max(60, duration / STEPS.length);
    const t = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length)), per);
    return () => window.clearInterval(t);
  }, [duration]);

  return (
    <div className="mx-auto max-w-lg animate-fade-in py-20" role="status" aria-live="polite">
      <div className="glass relative overflow-hidden rounded-3xl p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="scanline absolute inset-x-0 h-1/2 bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent" />
        </div>
        <p className="label-mono mb-6 text-accent/80">Calculating route</p>
        <ul className="space-y-3.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s} className={cx('flex items-center gap-3 text-sm transition-opacity duration-300', i > step ? 'opacity-30' : 'opacity-100')}>
                <span
                  className={cx(
                    'grid size-6 place-items-center rounded-full border',
                    done ? 'border-accent bg-accent text-ink-950' : 'border-white/15 text-accent',
                  )}
                >
                  {done ? <Check className="size-3.5 animate-pop" strokeWidth={3} /> : active ? <LoaderCircle className="size-3.5 animate-spin" /> : null}
                </span>
                <span className={done ? 'text-fg' : 'text-muted'}>{s}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-7 h-px overflow-hidden bg-white/5">
          <div className="shimmer h-full w-full" />
        </div>
      </div>
    </div>
  );
}
