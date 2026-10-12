import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  Bookmark,
  Database,
  Download,
  FilePlus2,
  Heart,
  History,
  Info,
  Pencil,
  Search,
  SearchX,
  Upload,
} from 'lucide-react';
import { CATEGORY_MAP } from '../data/categories';
import { TARGET_PROFILES } from '../data/promptRecipes';
import { MODE_OPTIONS } from '../components/prompt/PromptStudio';
import { Button, LinkButton } from '../components/ui/Button';
import { CopyButton } from '../components/ui/CopyButton';
import { Icon } from '../components/ui/Icon';
import { AiMark, Chip, ConfirmButton, EmptyState, PageHeader } from '../components/ui/misc';
import { Term } from '../components/ui/Term';
import { buildExport, LIMITS, parseImport } from '../lib/storage/validate';
import { cx, downloadText, formatDate } from '../lib/utils';
import { navigate } from '../state/router';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import type { AppData, SavedPrompt } from '../types';

type Tab = 'prompts' | 'history' | 'data';
const TABS: { id: Tab; label: string; icon: typeof Bookmark }[] = [
  { id: 'prompts', label: '保存したプロンプト', icon: Bookmark },
  { id: 'history', label: '診断履歴', icon: History },
  { id: 'data', label: 'データ管理', icon: Database },
];

export function SavedPage({ tab }: { tab: string | null }) {
  const current: Tab = tab === 'history' || tab === 'data' ? tab : 'prompts';
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (t: Tab) => navigate(t === 'prompts' ? '/saved' : `/saved?tab=${t}`);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const n = (i + d + TABS.length) % TABS.length;
    select(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="保存したプロンプト"
        description="保存したプロンプトや診断履歴は、このブラウザの中に保存されています。"
      />
      <div role="tablist" aria-label="保存データの種類" className="no-scrollbar -mx-4 mb-8 flex gap-1 overflow-x-auto border-b hairline px-4 sm:mx-0 sm:px-0">
        {TABS.map((t, i) => {
          const active = current === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`tab-${t.id}`}
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cx(
                'relative inline-flex h-11 shrink-0 items-center gap-2 px-4 text-sm transition-colors',
                active ? 'text-fg' : 'text-muted hover:text-fg',
              )}
            >
              <t.icon className={cx('size-4', active && 'text-accent')} aria-hidden />
              {t.label}
              {active && <span className="absolute inset-x-2 -bottom-px h-px bg-accent shadow-[0_0_8px_var(--color-accent)]" />}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`panel-${current}`} aria-labelledby={`tab-${current}`} className="animate-fade-in">
        {current === 'prompts' && <PromptsTab />}
        {current === 'history' && <HistoryTab />}
        {current === 'data' && <DataTab />}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- プロンプト

const PAGE = 20;

function PromptsTab() {
  const { data, deletePrompt, savePrompt } = useStore();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | SavedPrompt['source']>('all');
  const [sort, setSort] = useState<'updated' | 'created' | 'title'>('updated');
  const [limit, setLimit] = useState(PAGE);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.savedPrompts
      .filter((p) => (source === 'all' ? true : p.source === source))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === 'title' ? a.title.localeCompare(b.title, 'ja') : sort === 'created' ? b.createdAt.localeCompare(a.createdAt) : b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [data.savedPrompts, query, source, sort]);

  const createBlank = () => {
    const p = savePrompt({ title: '新しいプロンプト', body: '', source: 'manual' });
    navigate(`/saved/${p.id}`);
  };

  if (data.savedPrompts.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark className="size-5" />}
        title="保存したプロンプトはまだありません"
        description="診断結果やテンプレートで作成したプロンプトの「保存」ボタンを押すと、ここに表示されます。"
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <LinkButton href="#/navigate" variant="primary" size="sm">
              診断して作る
            </LinkButton>
            <LinkButton href="#/library" size="sm">
              テンプレートから作る
            </LinkButton>
            <Button size="sm" variant="ghost" onClick={createBlank} icon={<FilePlus2 className="size-4" aria-hidden />}>
              白紙から作る
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="saved-search" className="sr-only">
            保存したプロンプトを検索
          </label>
          <input
            id="saved-search"
            type="text" role="searchbox" enterKeyHint="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="タイトル・本文で検索"
            className="h-11 w-full rounded-xl border hairline bg-ink-900/80 pr-3 pl-10 text-[15px] text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none"
          />
        </div>
        <Select label="種類" value={source} onChange={(v) => setSource(v as typeof source)} options={[['all', 'すべて'], ['diagnosis', '診断から'], ['template', 'テンプレートから'], ['manual', '手動作成']]} />
        <Select label="並び順" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[['updated', '更新が新しい順'], ['created', '作成が新しい順'], ['title', 'タイトル順']]} />
        <Button onClick={createBlank} icon={<FilePlus2 className="size-4" aria-hidden />}>
          新規作成
        </Button>
      </div>
      <p className="mb-3 text-xs text-muted" aria-live="polite">
        {list.length}件 / 全{data.savedPrompts.length}件（最大{LIMITS.savedPrompts}件まで保存できます）
      </p>

      {list.length === 0 ? (
        <EmptyState icon={<SearchX className="size-5" />} title="条件に合うプロンプトがありません" />
      ) : (
        <>
          <ul className="space-y-2.5">
            {list.slice(0, limit).map((p) => (
              <li key={p.id} className="glass rounded-2xl p-4 transition-colors hover:border-accent/25 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <a href={`#/saved/${p.id}`} className="min-w-0 flex-1 rounded-lg">
                    <h2 className="truncate font-medium text-fg hover:text-accent">{p.title}</h2>
                    <p className="mt-1 line-clamp-2 font-mono text-xs leading-relaxed text-muted">{p.body || '（本文が空です）'}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Chip>{p.source === 'diagnosis' ? '診断' : p.source === 'template' ? 'テンプレート' : '手動作成'}</Chip>
                      {p.target && <Chip>{TARGET_PROFILES[p.target].label}</Chip>}
                      {p.mode && <Chip>{MODE_OPTIONS.find((m) => m.value === p.mode)?.label}モード</Chip>}
                      {p.edited && <Chip tone="accent">編集済み</Chip>}
                      <span className="ml-1 text-[11px] text-faint">更新 {formatDate(p.updatedAt)}</span>
                    </div>
                  </a>
                  <div className="flex shrink-0 flex-wrap items-start gap-1.5">
                    <LinkButton href={`#/saved/${p.id}`} size="sm" variant="ghost" icon={<Pencil className="size-4" aria-hidden />}>
                      編集
                    </LinkButton>
                    <CopyButton getText={() => p.body} label="コピー" size="sm" variant="secondary" />
                    <ConfirmButton
                      onConfirm={() => {
                        deletePrompt(p.id);
                        toast.show('プロンプトを削除しました。', 'info');
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {list.length > limit && (
            <div className="mt-6 text-center">
              <Button onClick={() => setLimit((l) => l + PAGE)}>さらに表示（残り{list.length - limit}件）</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border hairline bg-ink-900/80 pr-9 pl-3.5 text-sm text-fg focus:border-accent/50 focus:outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-ink-900">
            {l}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs text-muted" aria-hidden>
        ▾
      </span>
    </label>
  );
}

// ---------------------------------------------------------------- 診断履歴

function HistoryTab() {
  const { data, removeHistory, clearHistory } = useStore();
  if (data.history.length === 0) {
    return (
      <EmptyState
        icon={<History className="size-5" />}
        title="診断履歴はまだありません"
        description="診断を最後まで進めると、結果が自動で保存されます。"
        action={
          <LinkButton href="#/navigate" variant="primary" size="sm">
            診断をはじめる
          </LinkButton>
        }
      />
    );
  }
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted">
          {data.history.length}件（新しい順・最大{LIMITS.history}件まで保存）
        </p>
        <ConfirmButton label="すべて削除" confirmLabel="履歴をすべて削除する" onConfirm={clearHistory} />
      </div>
      <ul className="space-y-2">
        {data.history.map((h) => {
          const c = CATEGORY_MAP[h.categoryId];
          return (
            <li key={h.id} className="glass flex items-center gap-3 rounded-xl p-3 pl-4">
              <a href={`#/result/${h.id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg">
                <Icon name={c.icon} className="size-4 shrink-0 text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-fg hover:text-accent">{h.summary || c.title}</span>
                  <span className="block text-xs text-faint">
                    {c.short} ・ {formatDate(h.createdAt)}
                  </span>
                </span>
                <span className="hidden shrink-0 gap-3 sm:flex">
                  {h.topAis.map((ai) => (
                    <AiMark key={ai} ai={ai} />
                  ))}
                </span>
              </a>
              <ConfirmButton onConfirm={() => removeHistory(h.id)} label="削除" confirmLabel="削除する" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- データ管理

function DataTab() {
  const { data, importData, resetAll, toggleFavorite } = useStore();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ data: AppData; counts: { history: number; savedPrompts: number; skipped: number }; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadText(`ai-tool-navigator-${stamp}.json`, JSON.stringify(buildExport(data), null, 2));
    toast.show('JSONファイルを書き出しました。', 'success');
  };

  const onFile = async (file: File | undefined) => {
    setError(null);
    setPending(null);
    if (!file) return;
    if (file.size > LIMITS.importBytes) return setError('ファイルが大きすぎます（5MBまで）。');
    if (!/\.json$/i.test(file.name) && file.type !== 'application/json') return setError('JSON形式（.json）のファイルを選択してください。');
    try {
      const result = parseImport(await file.text());
      if (!result.ok) return setError(result.error);
      setPending({ data: result.data, counts: result.counts, name: file.name });
    } catch {
      setError('ファイルを読み込めませんでした。');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const apply = (mode: 'merge' | 'replace') => {
    if (!pending) return;
    importData(pending.data, mode);
    toast.show(mode === 'merge' ? 'データを結合して読み込みました。' : 'データを置き換えました。', 'success');
    setPending(null);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="glass rounded-2xl p-6 lg:col-span-2">
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Info className="size-4 text-accent" aria-hidden /> データの保存場所について
        </h2>
        <div className="space-y-2 text-sm leading-relaxed text-fg-soft">
          <p>
            保存したプロンプト・診断履歴・設定は、お使いのブラウザの <Term id="localstorage" /> に保存されています。サーバーには送信されません。
          </p>
          <p className="text-warn">
            そのため、別の端末や別のブラウザとは自動で同期されません。また、ブラウザの閲覧データを削除すると、保存内容も消えます。
          </p>
          <p>大切なデータは下の「エクスポート」で <Term id="json" label="JSONファイル" /> に書き出し、別の端末では「インポート」で読み込んでください。</p>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Download className="size-4 text-accent" aria-hidden /> エクスポート
        </h2>
        <p className="mb-4 text-sm text-muted">
          保存したプロンプト {data.savedPrompts.length}件・診断履歴 {data.history.length}件・設定を書き出します。
        </p>
        <Button variant="primary" onClick={onExport} icon={<Download className="size-4" aria-hidden />}>
          JSONで書き出す
        </Button>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-1 flex items-center gap-2 font-semibold">
          <Upload className="size-4 text-accent" aria-hidden /> インポート
        </h2>
        <p className="mb-4 text-sm text-muted">このアプリで書き出したJSONファイルを読み込みます。形式が正しくない項目は読み込まれません。</p>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" id="import-file" onChange={(e) => onFile(e.target.files?.[0])} />
        <Button onClick={() => fileRef.current?.click()} icon={<Upload className="size-4" aria-hidden />}>
          ファイルを選択
        </Button>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {pending && (
          <div className="mt-4 animate-fade-up rounded-xl border border-accent/30 bg-accent/[0.06] p-4 text-sm">
            <p className="font-medium text-fg">{pending.name}</p>
            <p className="mt-1 text-fg-soft">
              プロンプト {pending.counts.savedPrompts}件・診断履歴 {pending.counts.history}件を読み込めます。
              {pending.counts.skipped > 0 && <span className="text-warn">（形式が正しくない {pending.counts.skipped}件は除外）</span>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => apply('merge')}>
                今のデータに追加
              </Button>
              <ConfirmButton size="sm" icon={false} label="置き換える" confirmLabel="今のデータを消して置き換える" onConfirm={() => apply('replace')} />
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Heart className="size-4 text-accent" aria-hidden /> お気に入りのAI
        </h2>
        {data.favorites.length === 0 ? (
          <p className="text-sm text-muted">診断結果やAI比較ページの ♡ ボタンで登録できます。</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {data.favorites.map((ai) => (
              <li key={ai} className="glass inline-flex items-center gap-2 rounded-full py-1 pr-1 pl-3">
                <AiMark ai={ai} size="md" />
                <button type="button" onClick={() => toggleFavorite(ai)} className="rounded-full px-2 text-xs text-muted hover:text-danger" aria-label="お気に入りから外す">
                  外す
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-danger/20 p-6">
        <h2 className="mb-1 font-semibold text-danger">すべてのデータを削除</h2>
        <p className="mb-4 text-sm text-muted">このブラウザに保存したプロンプト・履歴・設定をすべて削除します。元に戻せないため、必要なら先にエクスポートしてください。</p>
        <ConfirmButton
          size="md"
          label="すべて削除"
          confirmLabel="もう一度押すと削除します"
          onConfirm={() => {
            resetAll();
            toast.show('すべてのデータを削除しました。', 'info');
          }}
        />
      </section>
    </div>
  );
}
