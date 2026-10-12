import { useMemo, type ReactNode } from 'react';
import {
  ArrowRight,
  CircleAlert,
  Compass,
  Gauge,
  Heart,
  ListChecks,
  MessageSquareText,
  RotateCcw,
  SearchX,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { AI_PROFILES, CRITERIA_LABELS } from '../data/aiProfiles';
import { CATEGORY_MAP } from '../data/categories';
import { QUESTION_MAP } from '../data/questions';
import { PromptStudio } from '../components/prompt/PromptStudio';
import { Button, LinkButton } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { AiMark, Chip, EmptyState, ExternalA, LevelBar, SectionHeading } from '../components/ui/misc';
import { CONFIDENCE_LABEL, levelBand, recommend, TIER_LABEL } from '../lib/diagnosis/recommend';
import { describeAnswer, getVisibleQuestions } from '../lib/diagnosis/flow';
import { cx, formatDate } from '../lib/utils';
import { navigate } from '../state/router';
import { useStore } from '../state/store';
import type { AiId, AiScore, Criterion, Tier } from '../types';

const TIER_STYLE: Record<Tier, string> = {
  best: 'border-accent/40 bg-accent/10 text-accent',
  good: 'border-white/15 bg-white/5 text-fg-soft',
  conditional: 'border-warn/30 bg-warn/10 text-warn',
  weak: 'border-white/10 bg-white/[0.02] text-muted',
};

export function ResultPage({ id }: { id: string }) {
  const { data, toggleFavorite, setDraft } = useStore();
  const record = data.history.find((h) => h.id === id);
  const rec = useMemo(() => (record ? recommend(record.categoryId, record.answers) : null), [record]);

  if (!record || !rec) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<SearchX className="size-5" />}
          title="診断結果が見つかりません"
          description="削除されたか、別のブラウザで行った診断の可能性があります。診断履歴はこのブラウザの中だけに保存されます。"
          action={<LinkButton href="#/navigate" variant="primary">診断をはじめる</LinkButton>}
        />
      </div>
    );
  }

  const category = CATEGORY_MAP[record.categoryId];
  const top = rec.ranking.filter((r) => rec.topGroup.includes(r.ai));
  const second = rec.ranking.find((r) => !rec.topGroup.includes(r.ai));
  const criteriaUsed = [...new Set(rec.ranking.flatMap((r) => Object.keys(r.criteria)))] as Criterion[];
  const answeredList = getVisibleQuestions(record.categoryId, record.answers)
    .map((q) => ({ q, text: describeAnswer(q, record.answers[q.id]) }))
    .filter((x) => x.text);

  const improve = () => {
    setDraft({
      categoryId: record.categoryId,
      answers: record.answers,
      stepId: rec.skippedQuestionIds[0] ?? null,
      updatedAt: new Date().toISOString(),
    });
    navigate(`/navigate/${record.categoryId}?resume`);
  };

  return (
    <div className="pt-8 sm:pt-12">
      {/* ---------- ヘッダー ---------- */}
      <header className="mb-8 flex animate-fade-up flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="label-mono mb-3 flex items-center gap-2 text-accent/80">
            <Icon name={category.icon} className="size-3.5" /> Result — {category.short}
          </p>
          <h1 tabIndex={-1} data-page-title className="text-2xl font-semibold tracking-tight outline-none sm:text-3xl">
            {record.summary || category.title}
          </h1>
          <p className="mt-2 text-xs text-faint">{formatDate(record.createdAt)} の診断</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={`#/navigate/${record.categoryId}`} size="sm" icon={<RotateCcw className="size-4" aria-hidden />}>
            もう一度診断
          </LinkButton>
          <Button size="sm" variant="primary" onClick={() => document.getElementById('prompt')?.scrollIntoView({ behavior: 'smooth' })} iconRight={<ArrowRight className="size-4" aria-hidden />}>
            プロンプトへ
          </Button>
        </div>
      </header>

      <div className="stagger space-y-6">
        {/* ---------- 最適なAI ---------- */}
        <section aria-labelledby="best-heading" className="relative overflow-hidden rounded-3xl border border-accent/25 bg-[linear-gradient(135deg,rgb(95_227_220/0.09),rgb(10_16_28/0.6)_55%)] p-6 sm:p-8">
          <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(95_227_220/0.16),transparent_65%)]" aria-hidden />
          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Chip tone="accent">
                <Compass className="size-3.5" aria-hidden />
                {rec.isTie ? '同程度のおすすめ候補' : '最も適したAI'}
              </Chip>
              <Chip tone={rec.confidence === 'high' ? 'default' : 'warn'}>
                <Gauge className="size-3.5" aria-hidden />
                {CONFIDENCE_LABEL[rec.confidence]}
              </Chip>
            </div>
            <h2 id="best-heading" className="sr-only">
              最も適したAI
            </h2>
            <div className={cx('grid gap-6', top.length > 1 && 'md:grid-cols-2')}>
              {top.map((t) => (
                <TopCard key={t.ai} score={t} favorite={data.favorites.includes(t.ai)} onFavorite={() => toggleFavorite(t.ai)} />
              ))}
            </div>
            <p className="mt-6 border-t hairline pt-4 text-sm text-muted">{rec.confidenceNote}</p>
            {rec.confidence !== 'high' && rec.skippedQuestionIds.length > 0 && (
              <Button size="sm" className="mt-3" onClick={improve} icon={<SlidersHorizontal className="size-4" aria-hidden />}>
                未回答の質問に答えて精度を上げる（{rec.skippedQuestionIds.length}問）
              </Button>
            )}
          </div>
        </section>

        {/* ---------- 判断の根拠 ---------- */}
        <div className="grid gap-4 md:grid-cols-3">
          <InfoBlock icon={<SlidersHorizontal className="size-4" />} title="判断に影響した条件">
            {rec.influentialFactors.length ? (
              <ul className="space-y-2">
                {rec.influentialFactors.map((f) => (
                  <li key={f} className="leading-relaxed">
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p>回答が少ないため、カテゴリの一般的な傾向で判断しました。</p>
            )}
          </InfoBlock>
          <InfoBlock icon={<ListChecks className="size-4" />} title="適していると考えられる作業">
            <ul className="space-y-2">
              {rec.tasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </InfoBlock>
          <InfoBlock icon={<CircleAlert className="size-4" />} title="注意すべき制約" tone="warn">
            {rec.cautions.length ? (
              <ul className="space-y-2">
                {rec.cautions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p>特に大きな制約は見つかりませんでした。利用条件は公式サイトで確認してください。</p>
            )}
          </InfoBlock>
        </div>

        {/* ---------- 2番目のおすすめ ---------- */}
        {second && (
          <section aria-labelledby="second-heading" className="glass rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-mono mb-1">{rec.isTie ? 'Next option' : 'Second choice'}</p>
                <h2 id="second-heading" className="flex items-center gap-3 text-lg font-semibold">
                  {rec.isTie ? '次の候補' : '2番目におすすめ'}：<AiMark ai={second.ai} size="lg" />
                </h2>
              </div>
              <span className={cx('rounded-full border px-3 py-1 text-xs', TIER_STYLE[second.tier])}>{TIER_LABEL[second.tier]}</span>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-fg-soft sm:grid-cols-2">
              {second.strengths.map((s) => (
                <li key={s.need} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {s.text}
                </li>
              ))}
              {second.limitations.slice(0, 2).map((l) => (
                <li key={l} className="flex gap-2 text-warn/90">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-warn" aria-hidden />
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- 3つのAIの比較 ---------- */}
        <section aria-labelledby="cmp-heading">
          <SectionHeading
            id="cmp-heading"
            eyebrow="Comparison"
            title="3つのAIの比較"
            description="あなたの目的で重要な観点だけを、5段階の目安で表示しています（精密な数値ではありません）。"
          />
          <div className="grid gap-3 md:grid-cols-3">
            {rec.ranking.map((r) => (
              <div key={r.ai} className={cx('glass rounded-2xl p-5', rec.topGroup.includes(r.ai) && 'border-accent/30')}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <AiMark ai={r.ai} size="md" />
                  <span className={cx('rounded-full border px-2.5 py-0.5 text-[11px]', TIER_STYLE[r.tier])}>{TIER_LABEL[r.tier]}</span>
                </div>
                <dl className="space-y-2.5">
                  {criteriaUsed.map((c) => (
                    <div key={c} className="flex items-center justify-between gap-3">
                      <dt className="text-xs text-muted">{CRITERIA_LABELS[c]}</dt>
                      <dd>
                        <LevelBar level={levelBand(r.criteria[c] ?? 0)} color={`var(${AI_PROFILES[r.ai].colorVar})`} label={CRITERIA_LABELS[c]} />
                      </dd>
                    </div>
                  ))}
                </dl>
                {r.blockedBy.length > 0 && (
                  <p className="mt-4 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">この目的の中心となる機能に標準では対応していません。</p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">
            機能や料金はプラン・モデルによって異なり、変更されることがあります。<a href="#/compare" className="text-accent hover:underline">AI比較ページ</a>
            で詳細と最終確認日を確認できます。
          </p>
        </section>

        {/* ---------- おすすめの使用方法 ---------- */}
        <section aria-labelledby="howto-heading" className="glass rounded-2xl p-6">
          <h2 id="howto-heading" className="mb-4 flex items-center gap-2 font-semibold">
            <Sparkles className="size-4 text-accent" aria-hidden /> おすすめの使用方法
          </h2>
          <ol className="space-y-3">
            {rec.howTo.map((h, i) => (
              <li key={h} className="flex gap-3 text-sm text-fg-soft">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-accent/30 font-mono text-[11px] text-accent">{i + 1}</span>
                <span className="pt-0.5">{h}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- 回答内容 ---------- */}
        <details className="glass group rounded-2xl p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
            <span className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-accent" aria-hidden /> あなたの回答（{answeredList.length}件）
            </span>
            <span className="text-xs font-normal text-muted group-open:hidden">表示する</span>
          </summary>
          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {answeredList.map(({ q, text }) => (
              <div key={q.id} className="border-b hairline pb-2">
                <dt className="text-xs text-muted">{QUESTION_MAP[q.id].promptLabel}</dt>
                <dd className="whitespace-pre-wrap break-words text-fg-soft">{text}</dd>
              </div>
            ))}
          </dl>
        </details>

        {/* ---------- プロンプト ---------- */}
        <section id="prompt" aria-labelledby="prompt-heading" className="scroll-mt-24 pt-6">
          <SectionHeading
            id="prompt-heading"
            eyebrow="Prompt"
            title="すぐに使えるプロンプト"
            description="回答内容を「役割・目的・条件・手順・出力形式」などに整理しています。使うAIやモードを切り替えると、構成も変わります。"
          />
          <PromptStudio categoryId={record.categoryId} answers={record.answers} recommendation={rec} title={record.summary || category.title} />
        </section>
      </div>
    </div>
  );
}

function TopCard({ score, favorite, onFavorite }: { score: AiScore; favorite: boolean; onFavorite: () => void }) {
  const p = AI_PROFILES[score.ai as AiId];
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: `var(${p.colorVar})` }}>
            {p.name}
          </p>
          <p className="mt-1 text-xs text-muted">{p.vendor}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? `${p.name}をお気に入りから外す` : `${p.name}をお気に入りに追加`}
          icon={<Heart className={cx('size-4 transition-transform', favorite && 'scale-110 fill-current text-danger')} aria-hidden />}
        >
          <span className="hidden sm:inline">{favorite ? 'お気に入り' : 'お気に入りに追加'}</span>
        </Button>
      </div>
      <p className="mt-4 text-[15px] text-fg">{p.tagline}</p>
      <p className="label-mono mt-5 mb-2">おすすめする理由</p>
      <ul className="space-y-2">
        {score.strengths.map((s) => (
          <li key={s.need} className="flex gap-2.5 text-sm text-fg-soft">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_6px_var(--color-accent)]" aria-hidden />
            {s.text}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs">
        <ExternalA href={p.officialUrl}>{p.name} 公式サイト</ExternalA>
      </p>
    </div>
  );
}

function InfoBlock({ icon, title, children, tone }: { icon: ReactNode; title: string; children: ReactNode; tone?: 'warn' }) {
  return (
    <section className="glass rounded-2xl p-5 text-sm text-fg-soft">
      <h2 className={cx('mb-3 flex items-center gap-2 text-sm font-semibold', tone === 'warn' ? 'text-warn' : 'text-accent')}>
        {icon}
        <span className="text-fg">{title}</span>
      </h2>
      {children}
    </section>
  );
}
