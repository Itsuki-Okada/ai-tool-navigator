import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/utils';

/**
 * ヒーローの演出：目的 → 条件 → 最適なAI へとルートが引かれていく「ナビゲーションシステム」
 * 表示している例は演出用のサンプルです（実際の診断結果ではありません）。
 */

const SCENARIOS = [
  { goal: 'ポートフォリオサイト', cond: '開発環境：Claude Code', target: 2, prompt: 'Claude Code 向けプロンプト' },
  { goal: 'SNS用のバナー画像', cond: '用途：Instagram 1:1', target: 0, prompt: '画像生成プロンプト' },
  { goal: '競合サービスの調査', cond: '情報：最新が必要', target: 1, prompt: 'リサーチ用プロンプト' },
];

const AIS = [
  { name: 'ChatGPT', y: 92, color: 'var(--ai-chatgpt)' },
  { name: 'Gemini', y: 210, color: 'var(--ai-gemini)' },
  { name: 'Claude', y: 328, color: 'var(--ai-claude)' },
];
const MID = [120, 210, 300];

export function NavVisual() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % SCENARIOS.length), 3200);
    return () => window.clearInterval(t);
  }, []);
  const s = SCENARIOS[i];
  const ai = AIS[s.target];
  const mid = MID[s.target];

  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden>
      <div className="glass relative overflow-hidden rounded-3xl p-3 sm:p-4">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="label-mono">route.engine</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-accent/80">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            LOCAL / NO DATA SENT
          </span>
        </div>
        <svg viewBox="0 0 480 420" className="w-full">
          <defs>
            <radialGradient id="nv-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity=".18" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="nv-sweep" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity=".22" />
            </linearGradient>
          </defs>

          {/* レーダー */}
          <g opacity=".9">
            {[60, 110, 160, 205].map((r) => (
              <circle key={r} cx="240" cy="210" r={r} fill="none" stroke="rgb(140 200 220 / .08)" />
            ))}
            <line x1="20" y1="210" x2="460" y2="210" stroke="rgb(140 200 220 / .06)" />
            <line x1="240" y1="0" x2="240" y2="420" stroke="rgb(140 200 220 / .06)" />
            <g className="radar-sweep" style={{ transformOrigin: '240px 210px' }}>
              <path d="M240 210 L445 210 A205 205 0 0 0 418 108 Z" fill="url(#nv-sweep)" />
            </g>
          </g>

          {/* すべての候補ルート（薄く） */}
          {MID.map((my) =>
            AIS.map((a) => (
              <path
                key={`${my}-${a.y}`}
                d={`M200 ${my} C 300 ${my}, 300 ${a.y}, 392 ${a.y}`}
                fill="none"
                stroke="rgb(140 200 220 / .07)"
              />
            )),
          )}
          {MID.map((my) => (
            <path key={my} d={`M64 210 C 130 210, 130 ${my}, 200 ${my}`} fill="none" stroke="rgb(140 200 220 / .1)" />
          ))}

          {/* 選択されたルート */}
          <g key={i}>
            <path
              d={`M64 210 C 130 210, 130 ${mid}, 200 ${mid} C 300 ${mid}, 300 ${ai.y}, 392 ${ai.y}`}
              fill="none"
              stroke={ai.color}
              strokeOpacity=".9"
              strokeWidth="1.6"
              className="route-draw"
            />
            <path
              d={`M64 210 C 130 210, 130 ${mid}, 200 ${mid} C 300 ${mid}, 300 ${ai.y}, 392 ${ai.y}`}
              fill="none"
              stroke="#fff"
              strokeOpacity=".5"
              strokeWidth="1.2"
              className="route-flow"
            />
          </g>

          {/* 出発点 */}
          <circle cx="64" cy="210" r="40" fill="url(#nv-glow)" />
          <circle cx="64" cy="210" r="7" fill="var(--color-accent)" className="node-pulse" />
          <circle cx="64" cy="210" r="6" fill="var(--color-accent)" />
          <text x="64" y="246" textAnchor="middle" className="fill-[var(--color-muted)] font-mono text-[10px] tracking-[0.2em]">
            YOU
          </text>

          {/* 中継点 */}
          {MID.map((my, k) => (
            <g key={my}>
              <rect
                x="192"
                y={my - 8}
                width="16"
                height="16"
                rx="4"
                transform={`rotate(45 200 ${my})`}
                fill={k === s.target ? 'var(--color-accent)' : 'var(--color-ink-700)'}
                stroke="rgb(140 200 220 / .3)"
                style={{ transition: 'fill .4s' }}
              />
            </g>
          ))}

          {/* AI ノード */}
          {AIS.map((a, k) => {
            const on = k === s.target;
            return (
              <g key={a.name} style={{ transition: 'opacity .4s' }} opacity={on ? 1 : 0.45}>
                {on && <circle cx="404" cy={a.y} r="12" fill={a.color} className="node-pulse" />}
                <circle cx="404" cy={a.y} r="11" fill="var(--color-ink-850)" stroke={a.color} strokeWidth={on ? 2 : 1} />
                <circle cx="404" cy={a.y} r="4" fill={a.color} />
                <text x="404" y={a.y + 30} textAnchor="middle" className="text-[12px] font-medium" fill={on ? '#fff' : 'var(--color-muted)'}>
                  {a.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ルートの説明（演出用サンプル） */}
        <div key={`log-${i}`} className="mx-1 mb-1 rounded-xl border hairline bg-ink-950/70 px-4 py-3 font-mono text-[11px] leading-6 sm:text-xs">
          <p className="animate-fade-in text-muted">
            <span className="text-faint">01</span> 目的 <span className="text-fg-soft">{s.goal}</span>
          </p>
          <p className="animate-fade-in text-muted [animation-delay:.25s]">
            <span className="text-faint">02</span> 条件 <span className="text-fg-soft">{s.cond}</span>
          </p>
          <p className="animate-fade-in text-muted [animation-delay:.5s]">
            <span className="text-faint">03</span> 推奨 <span style={{ color: ai.color }}>{ai.name}</span>
            <span className="text-faint"> → </span>
            <span className="text-accent">{s.prompt}</span>
            <span className="blink ml-0.5 text-accent">▍</span>
          </p>
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[10px] tracking-wider text-faint">※ 表示は演出用のサンプルです</p>
    </div>
  );
}
