import { ArrowRight, BookOpen, Bookmark, Clock, Compass, History, Scale, Sparkles } from 'lucide-react';
import { CATEGORY_MAP } from '../data/categories';
import { TEMPLATES } from '../data/templates';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { NavVisual } from '../components/home/NavVisual';
import { Button, LinkButton } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { AiMark, Chip, EmptyState, PrivacyNote, SectionHeading } from '../components/ui/misc';
import { useStore } from '../state/store';
import { formatDate } from '../lib/utils';
import { navigate } from '../state/router';

export function HomePage() {
  const { data } = useStore();
  const recent = data.history.slice(0, 3);
  const featured = TEMPLATES.filter((t) => t.featured).slice(0, 6);
  const draft = data.draft && Object.keys(data.draft.answers).length > 0 ? data.draft : null;

  const scrollToCategories = () => {
    const el = document.getElementById('categories');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    (el?.querySelector('a') as HTMLElement | null)?.focus({ preventScroll: true });
  };

  return (
    <>
      {/* ---------------- ヒーロー ---------------- */}
      <section className="grid items-center gap-10 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-20 lg:pb-24">
        <div className="animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.07] px-3 py-1 text-xs text-accent">
            <Compass className="size-3.5" aria-hidden />
            「作りたい」を、最適なAIとプロンプトに。
          </p>
          <h1 tabIndex={-1} data-page-title className="text-[2.15rem] leading-[1.25] font-semibold tracking-tight outline-none sm:text-5xl sm:leading-[1.2]">
            あなたの目的に、
            <br />
            <span className="text-gradient">最適なAIを。</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-fg-soft sm:text-base">
            作りたいものや解決したい課題を教えてください。
            <br className="hidden sm:block" />
            最適なAIと、すぐに使えるプロンプトを提案します。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" size="lg" onClick={scrollToCategories} iconRight={<ArrowRight className="size-4" aria-hidden />}>
              AIナビゲーションを開始
            </Button>
            <LinkButton href="#/compare" size="lg" icon={<Scale className="size-4" aria-hidden />}>
              AIの違いを比較する
            </LinkButton>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t hairline pt-6">
            {[
              ['12', 'カテゴリ'],
              ['3', '比較するAI'],
              [String(TEMPLATES.length), 'テンプレート'],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="sr-only">{l}</dt>
                <dd className="font-mono text-2xl text-fg">{n}</dd>
                <dd className="text-xs text-muted">{l}</dd>
              </div>
            ))}
          </dl>
          <PrivacyNote className="mt-6 max-w-md" />
        </div>
        <div className="animate-fade-up [animation-delay:.15s]">
          <NavVisual />
        </div>
      </section>

      {/* ---------------- 途中の診断 ---------------- */}
      {draft && (
        <div className="glass mb-12 flex animate-fade-up flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
              <Clock className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-fg">「{CATEGORY_MAP[draft.categoryId].title}」の診断が途中です</p>
              <p className="text-xs text-muted">{formatDate(draft.updatedAt)} に回答した内容から再開できます</p>
            </div>
          </div>
          <LinkButton href={`#/navigate/${draft.categoryId}?resume`} variant="primary" size="sm" iconRight={<ArrowRight className="size-4" aria-hidden />}>
            続きから再開
          </LinkButton>
        </div>
      )}

      {/* ---------------- カテゴリ ---------------- */}
      <section id="categories" aria-labelledby="cat-heading" className="scroll-mt-24 pb-20">
        <SectionHeading
          id="cat-heading"
          eyebrow="Step 01 — Select"
          title="何を作りたいですか？"
          description="近いものを選ぶと、目的に合わせた質問が始まります。答えにくい質問は「分からない・おまかせ」やスキップで進められます。"
        />
        <CategoryGrid />
      </section>

      {/* ---------------- ショートカット ---------------- */}
      <section aria-label="ショートカット" className="grid gap-3 pb-20 sm:grid-cols-3">
        {[
          { href: '#/compare', icon: Scale, title: 'AI比較', text: 'ChatGPT・Gemini・Claude の違いを項目ごとに比較' },
          { href: '#/library', icon: BookOpen, title: 'プロンプト作成', text: `${TEMPLATES.length}種類のテンプレートから、入力するだけで作成` },
          { href: '#/saved', icon: Bookmark, title: '保存したプロンプト', text: `保存済み ${data.savedPrompts.length} 件。再編集・コピー・書き出し` },
        ].map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="hud glass group flex items-center gap-4 rounded-2xl p-5 transition-all duration-300 hover:border-accent/35 active:scale-[0.985]"
          >
            <s.icon className="size-5 shrink-0 text-accent" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-fg">{s.title}</span>
              <span className="block text-xs text-muted">{s.text}</span>
            </span>
            <ArrowRight className="size-4 text-faint transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" aria-hidden />
          </a>
        ))}
      </section>

      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        {/* ---------------- 最近の診断 ---------------- */}
        <section aria-labelledby="recent-heading">
          <SectionHeading
            id="recent-heading"
            eyebrow="History"
            title="最近の診断"
            action={
              data.history.length > 0 ? (
                <a href="#/saved?tab=history" className="text-sm text-accent hover:underline">
                  すべて見る
                </a>
              ) : undefined
            }
          />
          {recent.length === 0 ? (
            <EmptyState
              icon={<History className="size-5" />}
              title="まだ診断履歴はありません"
              description="カテゴリを選んで診断すると、結果がここに表示されます。"
            />
          ) : (
            <ul className="space-y-2.5">
              {recent.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#/result/${h.id}`}
                    className="glass group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-colors hover:border-accent/30"
                  >
                    <Icon name={CATEGORY_MAP[h.categoryId].icon} className="size-4 shrink-0 text-accent" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-fg">{h.summary || CATEGORY_MAP[h.categoryId].title}</span>
                      <span className="block text-xs text-faint">{formatDate(h.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      {h.topAis.map((ai) => (
                        <AiMark key={ai} ai={ai} />
                      ))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------------- おすすめテンプレート ---------------- */}
        <section aria-labelledby="featured-heading">
          <SectionHeading
            id="featured-heading"
            eyebrow="Templates"
            title="おすすめテンプレート"
            description="はじめての方が使いやすいテンプレートを選んでいます。"
            action={
              <a href="#/library" className="text-sm text-accent hover:underline">
                すべて見る
              </a>
            }
          />
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {featured.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/library/${t.id}`)}
                  className="glass group flex h-full w-full flex-col items-start gap-2 rounded-xl p-4 text-left transition-colors hover:border-accent/30 active:scale-[0.985]"
                >
                  <Chip>{t.group}</Chip>
                  <span className="text-sm font-medium text-fg">{t.title}</span>
                  <span className="line-clamp-2 text-xs text-muted">{t.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-20 overflow-hidden rounded-3xl border border-accent/15 bg-[linear-gradient(120deg,rgb(95_227_220/0.08),transparent_60%)] p-8 sm:p-12">
        <Sparkles className="mb-4 size-6 text-accent" aria-hidden />
        <h2 className="text-2xl font-semibold tracking-tight">迷ったら「その他・自由入力」から。</h2>
        <p className="mt-2 max-w-xl text-sm text-muted">やりたいことを一言書くだけでも、合いそうなAIと、そのまま使えるプロンプトの形に整えます。</p>
        <LinkButton href="#/navigate/other" variant="primary" className="mt-6" iconRight={<ArrowRight className="size-4" aria-hidden />}>
          自由入力ではじめる
        </LinkButton>
      </section>
    </>
  );
}
