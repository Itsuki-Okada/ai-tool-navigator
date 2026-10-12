import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { Icon } from '../ui/Icon';

/** カテゴリ選択カード（データ src/data/categories.ts から表示） */
export function CategoryGrid({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <ul className="stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORIES.map((c, i) => (
        <li key={c.id}>
          <a
            href={`#/navigate/${c.id}`}
            className="hud glass group relative flex h-full gap-4 rounded-2xl p-5 transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.05] active:scale-[0.985]"
          >
            <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border hairline bg-ink-800 text-accent transition-colors duration-300 group-hover:border-accent/40 group-hover:bg-accent/10">
              <Icon name={c.icon} className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <H className="text-[15px] leading-snug font-semibold text-fg">{c.title}</H>
                <span className="font-mono text-[10px] text-faint">{String(i + 1).padStart(2, '0')}</span>
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-muted">{c.description}</span>
              <span className="mt-3 flex items-center gap-1 text-xs text-accent/0 transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent">
                診断をはじめる <ArrowUpRight className="size-3.5" aria-hidden />
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
