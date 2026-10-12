import { useEffect, useState } from 'react';
import { BookOpen, Bookmark, House, Menu, Scale, X } from 'lucide-react';
import type { Route } from '../../state/router';
import { useStore } from '../../state/store';
import { cx } from '../../lib/utils';

const NAV = [
  { href: '#/', label: 'ホーム', icon: House, match: ['home', 'navigate', 'diagnosis', 'result'] },
  { href: '#/compare', label: 'AI比較', icon: Scale, match: ['compare'] },
  { href: '#/library', label: 'プロンプト作成', icon: BookOpen, match: ['library', 'template'] },
  { href: '#/saved', label: '保存したプロンプト', icon: Bookmark, match: ['saved', 'savedItem'] },
];

export function Logo() {
  return (
    <a href="#/" className="group flex items-center gap-2.5" aria-label="AI TOOL NAVIGATOR ホーム">
      <span className="relative grid size-8 place-items-center rounded-lg border border-accent/30 bg-ink-800">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <circle cx="16" cy="16" r="11" fill="none" stroke="var(--color-accent)" strokeOpacity=".35" strokeWidth="1.5" />
          <path d="M16 5 L20.5 18 L16 15.3 L11.5 18 Z" fill="var(--color-accent)" className="origin-center transition-transform duration-500 group-hover:rotate-45" />
          <circle cx="16" cy="16" r="1.8" fill="#e6fbfa" />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[13px] font-semibold tracking-[0.14em] text-fg">AI TOOL</span>
        <span className="block font-mono text-[10px] tracking-[0.32em] text-accent/80">NAVIGATOR</span>
      </span>
    </a>
  );
}

export function Header({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data } = useStore();
  const savedCount = data.savedPrompts.length;

  useEffect(() => setOpen(false), [route]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 transition-[background,border-color] duration-300',
        scrolled || open ? 'border-b hairline bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="メインメニュー" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.match.includes(route.name);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
                      active ? 'text-fg' : 'text-muted hover:text-fg',
                    )}
                  >
                    {n.label}
                    {n.href === '#/saved' && savedCount > 0 && (
                      <span className="rounded-full bg-accent/15 px-1.5 font-mono text-[10px] text-accent">{savedCount}</span>
                    )}
                    {active && <span className="absolute inset-x-3 -bottom-[13px] h-px bg-accent shadow-[0_0_10px_var(--color-accent)]" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg text-fg-soft hover:bg-white/5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="メインメニュー" className="animate-fade-in border-t hairline md:hidden">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-2 px-4 py-4">
            {NAV.map((n) => {
              const active = n.match.includes(route.name);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'flex min-h-16 flex-col justify-center gap-1.5 rounded-xl border px-4 py-3 text-sm transition-colors active:scale-[0.98]',
                      active ? 'border-accent/40 bg-accent/8 text-fg' : 'hairline bg-white/[0.02] text-fg-soft',
                    )}
                  >
                    <n.icon className={cx('size-4', active ? 'text-accent' : 'text-muted')} aria-hidden />
                    <span>
                      {n.label}
                      {n.href === '#/saved' && savedCount > 0 && <span className="ml-1.5 font-mono text-xs text-accent">{savedCount}</span>}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
