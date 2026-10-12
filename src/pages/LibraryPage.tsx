import { useMemo, useState } from 'react';
import { ArrowUpRight, Clock, Search, SearchX, X } from 'lucide-react';
import { TEMPLATE_GROUPS, TEMPLATE_MAP, TEMPLATES } from '../data/templates';
import { AiMark, Chip, EmptyState, PageHeader } from '../components/ui/misc';
import { searchTemplates } from '../lib/prompt/template';
import { cx } from '../lib/utils';
import { useStore } from '../state/store';

export function LibraryPage() {
  const { data } = useStore();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<string | null>(null);
  const list = useMemo(() => searchTemplates(TEMPLATES, query, group), [query, group]);
  const recent = data.recentTemplates.map((id) => TEMPLATE_MAP[id]).filter(Boolean).slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow="Prompt Library"
        title="プロンプトを作成する"
        description={`${TEMPLATES.length}種類のテンプレートから選び、必要な情報を入力するだけで完成したプロンプトを作れます。診断から作る場合はホームのカテゴリを選んでください。`}
      />

      {recent.length > 0 && (
        <section aria-labelledby="recent-tpl" className="mb-10">
          <h2 id="recent-tpl" className="label-mono mb-3 flex items-center gap-2">
            <Clock className="size-3.5" aria-hidden /> 最近使用したテンプレート
          </h2>
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {recent.map((t) => (
              <li key={t.id} className="shrink-0">
                <a href={`#/library/${t.id}`} className="glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-fg-soft transition-colors hover:border-accent/30 hover:text-fg">
                  {t.title}
                  <ArrowUpRight className="size-3.5 text-accent" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- 検索・絞り込み ---------- */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b hairline bg-ink-950/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="tpl-search" className="sr-only">
            テンプレートを検索
          </label>
          <input
            id="tpl-search"
            type="text" role="searchbox" enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで検索（例：エラー、Instagram、事業計画）"
            className="h-11 w-full rounded-xl border hairline bg-ink-900/80 pr-10 pl-10 text-[15px] text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg" aria-label="検索をクリア">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto" role="group" aria-label="カテゴリで絞り込み">
          {[null, ...TEMPLATE_GROUPS].map((g) => {
            const active = group === g;
            return (
              <button
                key={g ?? 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => setGroup(g)}
                className={cx(
                  'h-8 shrink-0 rounded-full border px-3 text-xs transition-all active:scale-[0.97]',
                  active ? 'border-accent/50 bg-accent/12 text-accent' : 'hairline text-fg-soft hover:border-accent/30',
                )}
              >
                {g ?? 'すべて'}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-4 text-xs text-muted" aria-live="polite">
        {list.length}件のテンプレート
      </p>

      {list.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-5" />}
          title="条件に合うテンプレートがありません"
          description="キーワードを変えるか、絞り込みを解除してください。"
          action={
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setGroup(null);
              }}
              className="text-sm text-accent hover:underline"
            >
              条件をリセット
            </button>
          }
        />
      ) : (
        <ul key={`${group}-${query}`} className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <li key={t.id}>
              <a
                href={`#/library/${t.id}`}
                className="hud glass group flex h-full flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 active:scale-[0.985]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Chip>{t.group}</Chip>
                  <ArrowUpRight className="size-4 text-faint transition-colors group-hover:text-accent" aria-hidden />
                </div>
                <h2 className="font-medium text-fg">{t.title}</h2>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t hairline pt-3">
                  <span className="text-[11px] text-faint">推奨</span>
                  {t.recommended.map((ai) => (
                    <AiMark key={ai} ai={ai} />
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
