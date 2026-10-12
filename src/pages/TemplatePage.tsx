import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookmarkPlus, Check, CircleAlert, RefreshCw, SearchX } from 'lucide-react';
import { TEMPLATE_MAP } from '../data/templates';
import { PromptEditor } from '../components/prompt/PromptEditor';
import { Button, LinkButton } from '../components/ui/Button';
import { AiMark, Chip, EmptyState, PrivacyNote } from '../components/ui/misc';
import { fillTemplate, missingRequired } from '../lib/prompt/template';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import type { PromptTemplate } from '../types';

export function TemplatePage({ id }: { id: string }) {
  const t = TEMPLATE_MAP[id];
  if (!t) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<SearchX className="size-5" />}
          title="テンプレートが見つかりません"
          action={<LinkButton href="#/library">テンプレート一覧へ</LinkButton>}
        />
      </div>
    );
  }
  return <TemplateFill key={t.id} template={t} />;
}

const MAX = 4000;

function TemplateFill({ template: t }: { template: PromptTemplate }) {
  const { touchTemplate, savePrompt, updatePrompt, data } = useStore();
  const toast = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [manual, setManual] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    touchTemplate(t.id);
    return () => window.clearTimeout(timer.current);
  }, [t.id, touchTemplate]);

  const generated = useMemo(() => fillTemplate(t, values), [t, values]);
  const text = manual ?? generated;
  const missing = missingRequired(t, values);

  const onSave = () => {
    if (missing.length) {
      setShowErrors(true);
      toast.show(`必須項目が未入力です：${missing.join('、')}`, 'warn');
      document.getElementById(`f-${t.fields.find((f) => f.required && !values[f.key]?.trim())?.key}`)?.focus();
      return;
    }
    if (savedId && data.savedPrompts.some((p) => p.id === savedId)) {
      updatePrompt(savedId, { body: text });
      toast.show('保存したプロンプトを更新しました。', 'success', { label: '開く', href: `#/saved/${savedId}` });
    } else {
      const firstValue = values[t.fields[0].key]?.trim();
      const p = savePrompt({
        title: firstValue ? `${t.title}：${firstValue.slice(0, 30)}` : t.title,
        body: text,
        source: 'template',
        templateId: t.id,
        edited: manual !== null,
      });
      setSavedId(p.id);
      toast.show('プロンプトを保存しました。', 'success', { label: '保存一覧へ', href: '#/saved' });
    }
    setJustSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="pt-8 sm:pt-12">
      <a href="#/library" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden /> テンプレート一覧
      </a>
      <header className="mb-8 animate-fade-up">
        <Chip>{t.group}</Chip>
        <h1 tabIndex={-1} data-page-title className="mt-3 text-2xl font-semibold tracking-tight outline-none sm:text-3xl">
          {t.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{t.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-faint">推奨するAI</span>
          {t.recommended.map((ai) => (
            <AiMark key={ai} ai={ai} size="md" />
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---------- 入力フォーム ---------- */}
        <form
          className="glass h-fit animate-fade-up rounded-2xl p-5 lg:sticky lg:top-24"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          noValidate
        >
          <p className="label-mono mb-4">Step 01 — 必要な情報を入力</p>
          <div className="space-y-4">
            {t.fields.map((f) => {
              const err = showErrors && f.required && !values[f.key]?.trim();
              const common = {
                id: `f-${f.key}`,
                value: values[f.key] ?? '',
                maxLength: MAX,
                placeholder: f.placeholder,
                'aria-invalid': err || undefined,
                'aria-describedby': err ? `e-${f.key}` : undefined,
                onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f.key]: e.target.value })),
                className:
                  'block w-full rounded-xl border bg-ink-900/70 px-3.5 py-2.5 text-[15px] text-fg placeholder:text-faint focus:border-accent/50 focus:outline-none ' +
                  (err ? 'border-danger/60' : 'hairline'),
              };
              return (
                <div key={f.key}>
                  <label htmlFor={`f-${f.key}`} className="mb-1.5 flex items-center gap-2 text-sm text-fg-soft">
                    {f.label}
                    {f.required ? <span className="text-[10px] text-accent">必須</span> : <span className="text-[10px] text-faint">任意</span>}
                  </label>
                  {f.multiline ? <textarea rows={4} {...common} className={common.className + ' resize-y'} /> : <input type="text" {...common} />}
                  {err && (
                    <p id={`e-${f.key}`} className="mt-1 flex items-center gap-1 text-xs text-danger">
                      <CircleAlert className="size-3.5" aria-hidden /> 入力してください
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <PrivacyNote className="mt-5" />
        </form>

        {/* ---------- 完成したプロンプト ---------- */}
        <div className="min-w-0 animate-fade-up [animation-delay:.1s]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="label-mono">Step 02 — 完成したプロンプト</p>
            {manual !== null && manual !== generated && (
              <Button variant="ghost" size="sm" onClick={() => setManual(null)} icon={<RefreshCw className="size-3.5" aria-hidden />}>
                入力内容から作り直す
              </Button>
            )}
          </div>
          <PromptEditor
            value={text}
            edited={manual !== null && manual !== generated}
            onChange={setManual}
            onReset={() => setManual(null)}
            minRows={22}
            actions={
              <Button onClick={onSave} icon={justSaved ? <Check className="size-4 animate-pop" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}>
                {justSaved ? '保存しました' : savedId ? '上書き保存' : '保存'}
              </Button>
            }
          />
          {manual !== null && manual !== generated && (
            <p className="mt-2 text-xs text-warn">プロンプトを直接編集中のため、左の入力内容は反映されません。「入力内容から作り直す」で戻せます。</p>
          )}
          <div className="glass mt-4 rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-warn">
              <CircleAlert className="size-4" aria-hidden />
              <span className="text-fg">使用時の注意点</span>
            </p>
            <ul className="space-y-1.5 text-sm text-fg-soft">
              {t.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
              <li>AIの回答には誤りが含まれることがあります。重要な内容は必ず確認してください。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
