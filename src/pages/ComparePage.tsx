import { useState } from 'react';
import { ArrowRight, CalendarCheck, Heart, Info } from 'lucide-react';
import { AI_IDS, AI_PROFILES, NEEDS } from '../data/aiProfiles';
import { COMPARISON_LAST_REVIEWED, COMPARISON_NOTE, COMPARISON_ROWS } from '../data/comparison';
import { Button, LinkButton } from '../components/ui/Button';
import { AiMark, Chip, ExternalA, LevelBar, PageHeader, SectionHeading } from '../components/ui/misc';
import { Segmented } from '../components/ui/Segmented';
import { Term } from '../components/ui/Term';
import { cx } from '../lib/utils';
import { useStore } from '../state/store';
import type { AiId, NeedId } from '../types';

const LEVEL_TEXT = ['標準では非対応', '限定的', '対応', '主要な強み'];

export function ComparePage() {
  const { data, toggleFavorite } = useStore();
  const [focus, setFocus] = useState<AiId>('chatgpt');

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="AIの違いを比較する"
        description="ChatGPT・Gemini・Claude の得意なことと制約を、同じ観点で並べました。どれが一番というより、目的によって向き・不向きが変わります。"
      >
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-warn/20 bg-warn/[0.06] p-4 text-sm text-fg-soft sm:flex-row sm:items-start">
          <Info className="size-5 shrink-0 text-warn" aria-hidden />
          <div>
            <p>{COMPARISON_NOTE}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <CalendarCheck className="size-3.5" aria-hidden /> 掲載情報の最終確認日：
              <time dateTime={COMPARISON_LAST_REVIEWED} className="font-mono text-fg-soft">
                {COMPARISON_LAST_REVIEWED}
              </time>
            </p>
          </div>
        </div>
      </PageHeader>

      {/* ---------- AIカード ---------- */}
      <div className="stagger grid gap-3 md:grid-cols-3">
        {AI_IDS.map((ai) => {
          const p = AI_PROFILES[ai];
          const fav = data.favorites.includes(ai);
          return (
            <article key={ai} className="glass flex flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-semibold" style={{ color: `var(${p.colorVar})` }}>
                    {p.name}
                  </h2>
                  <p className="text-xs text-muted">{p.vendor}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(ai)}
                  aria-pressed={fav}
                  aria-label={fav ? `${p.name}をお気に入りから外す` : `${p.name}をお気に入りに追加`}
                  icon={<Heart className={cx('size-4', fav && 'fill-current text-danger')} aria-hidden />}
                />
              </div>
              <p className="mt-3 text-sm text-fg-soft">{p.tagline}</p>
              <ul className="mt-4 flex-1 space-y-1.5 text-xs text-muted">
                {p.goodFor.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full" style={{ background: `var(${p.colorVar})` }} aria-hidden />
                    {g}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t hairline pt-4 text-xs">
                <ExternalA href={p.officialUrl}>公式サイト</ExternalA>
                <ExternalA href={p.pricingUrl}>料金ページ</ExternalA>
              </div>
            </article>
          );
        })}
      </div>

      {/* ---------- 比較表（PC） ---------- */}
      <section aria-labelledby="table-heading" className="mt-16">
        <SectionHeading id="table-heading" eyebrow="Matrix" title="項目ごとの比較" description={<>「プラン等で異なる」が付いた項目は、モデル・プラン・地域によって内容が変わります。</>} />

        <div className="hidden overflow-hidden rounded-2xl border hairline md:block">
          <table className="w-full table-fixed border-collapse text-sm">
            <caption className="sr-only">ChatGPT・Gemini・Claude の比較表</caption>
            <thead>
              <tr className="bg-white/[0.03]">
                <th scope="col" className="w-44 px-5 py-3 text-left text-xs font-medium text-muted">
                  比較項目
                </th>
                {AI_IDS.map((ai) => (
                  <th key={ai} scope="col" className="px-5 py-3 text-left">
                    <AiMark ai={ai} size="md" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.id} className="border-t hairline align-top transition-colors hover:bg-white/[0.02]">
                  <th scope="row" className="px-5 py-4 text-left font-medium text-fg">
                    {row.id === 'long' ? <Term id="context" label={row.label} /> : row.label}
                    {row.help && <span className="mt-1 block text-xs font-normal text-faint">{row.help}</span>}
                  </th>
                  {AI_IDS.map((ai) => (
                    <td key={ai} className="px-5 py-4 text-fg-soft">
                      {row.cells[ai].text}
                      {row.cells[ai].varies && <VariesBadge />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------- 比較（スマホ）：AIを切り替えて表示 ---------- */}
        <div className="md:hidden">
          <Segmented
            label="表示するAI"
            options={AI_IDS.map((ai) => ({ value: ai, label: AI_PROFILES[ai].name }))}
            value={focus}
            onChange={setFocus}
            className="mb-4"
          />
          <dl className="space-y-2">
            {COMPARISON_ROWS.map((row) => (
              <div key={row.id} className="glass rounded-xl p-4">
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="mt-1 text-sm text-fg-soft">
                  {row.cells[focus].text}
                  {row.cells[focus].varies && <VariesBadge />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- 用途別の目安 ---------- */}
      <section aria-labelledby="needs-heading" className="mt-16">
        <SectionHeading
          id="needs-heading"
          eyebrow="Capabilities"
          title="用途別の向き・不向き（目安）"
          description="診断ロジックで使っている特徴データです。4段階の相対的な目安で、ベンチマークの数値ではありません。"
        />
        <div className="overflow-x-auto rounded-2xl border hairline">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <caption className="sr-only">用途別の向き・不向き</caption>
            <thead>
              <tr className="bg-white/[0.03]">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted">
                  用途
                </th>
                {AI_IDS.map((ai) => (
                  <th key={ai} scope="col" className="px-4 py-3 text-left">
                    <AiMark ai={ai} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(NEEDS) as NeedId[]).map((n) => (
                <tr key={n} className="border-t hairline">
                  <th scope="row" className="px-4 py-3 text-left text-xs font-normal text-fg-soft">
                    {NEEDS[n].label}
                  </th>
                  {AI_IDS.map((ai) => {
                    const c = AI_PROFILES[ai].capabilities[n];
                    return (
                      <td key={ai} className="px-4 py-3" title={`${c.note}${c.limitation ? `（${c.limitation}）` : ''}`}>
                        <span className="flex flex-col gap-1">
                          <LevelBar level={c.level} max={3} color={`var(${AI_PROFILES[ai].colorVar})`} label={`${AI_PROFILES[ai].name} ${NEEDS[n].label}`} />
                          <span className="text-[11px] text-faint">
                            {LEVEL_TEXT[c.level]}
                            {c.varies && '・プランで異なる'}
                          </span>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted">自分の目的に合うAIを知りたい場合は、質問に答えて診断できます。</p>
        <LinkButton href="#/navigate" variant="primary" iconRight={<ArrowRight className="size-4" aria-hidden />}>
          AIナビゲーションを開始
        </LinkButton>
      </div>
    </>
  );
}

function VariesBadge() {
  return (
    <Chip tone="warn" className="mt-2 flex w-fit text-[10px]">
      プラン等で異なる
    </Chip>
  );
}
