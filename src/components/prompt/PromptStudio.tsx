import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BadgeCheck, BookmarkPlus, Check, CircleAlert, ListOrdered, Target, Wand2 } from 'lucide-react';
import { TARGET_PROFILES } from '../../data/promptRecipes';
import { availableTargets, generatePrompt, suggestTarget } from '../../lib/prompt/generator';
import { useStore } from '../../state/store';
import { useToast } from '../../state/toast';
import type { Answers, CategoryId, PromptMode, PromptTarget, Recommendation } from '../../types';
import { Button } from '../ui/Button';
import { Segmented } from '../ui/Segmented';
import { PromptEditor } from './PromptEditor';

export const MODE_OPTIONS: { value: PromptMode; label: string; hint: string }[] = [
  { value: 'standard', label: '標準', hint: '初心者でも扱いやすい、必要な指示が整理されたプロンプト' },
  { value: 'quality', label: '高品質', hint: 'デザイン・機能・保守性・エラー処理まで重視した詳細なプロンプト' },
  { value: 'short', label: '最短', hint: '必要な条件を残しつつ短くまとめたプロンプト' },
];

export function PromptStudio({
  categoryId,
  answers,
  recommendation,
  title,
}: {
  categoryId: CategoryId;
  answers: Answers;
  recommendation: Recommendation;
  title: string;
}) {
  const { data, setPreferences, savePrompt, updatePrompt } = useStore();
  const toast = useToast();
  const targets = availableTargets(categoryId);
  const [mode, setMode] = useState<PromptMode>(data.preferences.mode);
  const [target, setTarget] = useState<PromptTarget>(() => suggestTarget(categoryId, answers, recommendation));
  const suggested = useMemo(() => suggestTarget(categoryId, answers, recommendation), [categoryId, answers, recommendation]);

  // 出力先・モードごとに編集内容を保持（切り替えても編集が消えない）
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);
  const savedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  const key = `${mode}:${target}`;
  const generated = useMemo(
    () => generatePrompt({ categoryId, answers, mode, target, recommendation }),
    [categoryId, answers, mode, target, recommendation],
  );
  const text = edits[key] ?? generated.text;
  const edited = edits[key] !== undefined && edits[key] !== generated.text;

  const changeMode = (m: PromptMode) => {
    setMode(m);
    setPreferences({ mode: m });
  };
  const changeTarget = (t: PromptTarget) => {
    setTarget(t);
    setPreferences({ target: t });
  };

  const onSave = () => {
    if (!text.trim()) return toast.show('プロンプトが空のため保存できません。', 'warn');
    const existing = savedIds[key];
    if (existing && data.savedPrompts.some((p) => p.id === existing)) {
      updatePrompt(existing, { body: text });
      toast.show('保存したプロンプトを更新しました。', 'success', { label: '開く', href: `#/saved/${existing}` });
    } else {
      const p = savePrompt({
        title: `${title}（${TARGET_PROFILES[target].label}）`,
        body: text,
        source: 'diagnosis',
        target,
        mode,
        categoryId,
        edited,
      });
      setSavedIds((s) => ({ ...s, [key]: p.id }));
      toast.show('プロンプトを保存しました。', 'success', { label: '保存一覧へ', href: '#/saved' });
    }
    setJustSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2000);
  };

  const ex = generated.explanation;
  const chatTargets = targets.filter((t) => !TARGET_PROFILES[t].devOnly);
  const devTargets = targets.filter((t) => TARGET_PROFILES[t].devOnly);
  const toOptions = (ts: PromptTarget[]) =>
    ts.map((t) => ({ value: t, label: TARGET_PROFILES[t].label + (t === suggested ? ' ★' : ''), hint: TARGET_PROFILES[t].description }));

  return (
    <div>
      <div className="glass mb-4 grid gap-5 rounded-2xl p-4 sm:p-5 lg:grid-cols-[auto_1fr]">
        <div>
          <p className="label-mono mb-2">生成モード</p>
          <Segmented label="生成モード" options={MODE_OPTIONS} value={mode} onChange={changeMode} />
          <p className="mt-2 text-xs text-muted">{MODE_OPTIONS.find((m) => m.value === mode)?.hint}</p>
        </div>
        <div className="min-w-0 lg:border-l lg:hairline lg:pl-5">
          <p className="label-mono mb-2">使用するAI</p>
          <Segmented label="使用するAI" options={toOptions(chatTargets)} value={target} onChange={changeTarget} />
          {devTargets.length > 0 && (
            <>
              <p className="label-mono mt-4 mb-2">開発での使い方</p>
              <Segmented label="開発での使い方" options={toOptions(devTargets)} value={target} onChange={changeTarget} />
            </>
          )}
          <p className="mt-2 text-xs text-muted">
            {TARGET_PROFILES[target].description}
            <span className="ml-2 text-faint">★ = 回答内容からのおすすめ</span>
          </p>
        </div>
      </div>

      <PromptEditor
        key={key}
        value={text}
        edited={edited}
        onChange={(v) => setEdits((e) => ({ ...e, [key]: v }))}
        onReset={() =>
          setEdits((e) => {
            const n = { ...e };
            delete n[key];
            return n;
          })
        }
        actions={
          <Button onClick={onSave} icon={justSaved ? <Check className="size-4 animate-pop" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}>
            {justSaved ? '保存しました' : savedIds[key] ? '上書き保存' : '保存'}
          </Button>
        }
      />

      {/* ---------- プロンプトの説明 ---------- */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoCard icon={<Wand2 className="size-4" />} title="このプロンプトでできること">
          <ul className="space-y-1.5">
            {ex.canDo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </InfoCard>
        <InfoCard icon={<ListOrdered className="size-4" />} title="使い方">
          <ol className="list-decimal space-y-1.5 pl-4 marker:text-accent/70">
            {ex.howTo.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
        </InfoCard>
        <InfoCard icon={<Target className="size-4" />} title="推奨するAIと選んだ理由">
          <p className="font-medium text-fg">{ex.recommendedAi}</p>
          <p className="mt-1">{ex.reason}</p>
        </InfoCard>
        <InfoCard icon={<CircleAlert className="size-4" />} title="実行時の注意点" tone="warn">
          <ul className="space-y-1.5">
            {ex.cautions.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </InfoCard>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-faint">
        <BadgeCheck className="size-3.5" aria-hidden />
        プロンプトはこのブラウザ内で生成しています（外部のAIには送信していません）。
      </p>
    </div>
  );
}

function InfoCard({ icon, title, children, tone }: { icon: ReactNode; title: string; children: ReactNode; tone?: 'warn' }) {
  return (
    <div className="glass rounded-2xl p-5 text-sm leading-relaxed text-fg-soft">
      <p className={`mb-3 flex items-center gap-2 font-medium ${tone === 'warn' ? 'text-warn' : 'text-accent'}`}>
        {icon}
        <span className="text-fg">{title}</span>
      </p>
      {children}
    </div>
  );
}
