import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, RotateCcw, Sparkles, Zap, ListChecks } from 'lucide-react';
import { CATEGORY_MAP, isCategoryId } from '../data/categories';
import { Analyzing } from '../components/diagnosis/Analyzing';
import { ProgressBar } from '../components/diagnosis/Progress';
import { QuestionView } from '../components/diagnosis/QuestionView';
import { Button, LinkButton } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { EmptyState, PrivacyNote } from '../components/ui/misc';
import { Segmented } from '../components/ui/Segmented';
import { getVisibleQuestions, hasAnswer, hasConcreteAnswer, pruneAnswers } from '../lib/diagnosis/flow';
import { recommend } from '../lib/diagnosis/recommend';
import { cx, formatDate, prefersReducedMotion } from '../lib/utils';
import { navigate } from '../state/router';
import { useStore } from '../state/store';
import type { Answer, Answers, CategoryId, DiagnosisDepth } from '../types';

export function DiagnosisPage({ category, resume }: { category: string; resume: boolean }) {
  if (!isCategoryId(category)) {
    return (
      <div className="py-20">
        <EmptyState
          icon={<Sparkles className="size-5" />}
          title="カテゴリが見つかりません"
          description="URLが正しいか確認してください。"
          action={<LinkButton href="#/navigate">カテゴリを選ぶ</LinkButton>}
        />
      </div>
    );
  }
  return <Diagnosis key={category} categoryId={category} resume={resume} />;
}

function Diagnosis({ categoryId, resume }: { categoryId: CategoryId; resume: boolean }) {
  const category = CATEGORY_MAP[categoryId];
  const { data, setDraft, addHistory, setPreferences } = useStore();
  const savedDraft = data.draft?.categoryId === categoryId && Object.keys(data.draft.answers).length > 0 ? data.draft : null;

  const [answers, setAnswersState] = useState<Answers>(() => (resume && savedDraft ? savedDraft.answers : {}));
  // 自動で次へ進むときに最新の回答を参照するため、ref にも保持
  const answersRef = useRef(answers);
  const setAnswers = (next: Answers) => {
    answersRef.current = next;
    setAnswersState(next);
  };
  const [currentId, setCurrentId] = useState<string>(() => {
    const first = getVisibleQuestions(categoryId, {})[0].id;
    return resume && savedDraft?.stepId ? savedDraft.stepId : first;
  });
  // かんたん診断（5問）／詳しく診断（全問）
  const [depth, setDepth] = useState<DiagnosisDepth>(() => (resume && savedDraft?.depth) || data.preferences.depth);
  // 選択肢を選んだとき、「次へ」ボタンを光らせて次の操作を案内する（自動では進まない）
  const [nudge, setNudge] = useState(0);
  const [askResume, setAskResume] = useState(!resume && !!savedDraft);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const [phase, setPhase] = useState<'questions' | 'analyzing'>('questions');

  const visible = useMemo(() => getVisibleQuestions(categoryId, answers, depth), [categoryId, answers, depth]);
  const fullCount = useMemo(() => getVisibleQuestions(categoryId, answers, 'full').length, [categoryId, answers]);
  const rawIndex = visible.findIndex((q) => q.id === currentId);
  const index = rawIndex === -1 ? 0 : rawIndex;
  const question = visible[index];
  const isLast = index === visible.length - 1;

  useEffect(() => setNudge(0), [question.id]);

  // 入力途中の状態を保存（ページを離れても再開できる）
  useEffect(() => {
    if (askResume || phase !== 'questions') return;
    if (Object.keys(answers).length === 0) return;
    setDraft({ categoryId, depth, answers, stepId: question.id, updatedAt: new Date().toISOString() });
  }, [answers, question.id, categoryId, depth, askResume, phase, setDraft]);

  const finish = useCallback(
    (finalAnswers: Answers) => {
      const clean = pruneAnswers(categoryId, finalAnswers);
      const rec = recommend(categoryId, clean);
      const goal = clean.goal?.text?.trim();
      const record = addHistory({
        categoryId,
        answers: clean,
        topAis: rec.topGroup,
        summary: goal ? goal.slice(0, 60) : category.title,
      });
      setDraft(null);
      setPhase('analyzing');
      const duration = prefersReducedMotion() ? 250 : 1500;
      window.setTimeout(() => navigate(`/result/${record.id}`), duration);
    },
    [addHistory, category.title, categoryId, setDraft],
  );

  const goNext = useCallback(
    (from: Answers = answers) => {
      const list = getVisibleQuestions(categoryId, from, depth);
      const i = Math.max(0, list.findIndex((q) => q.id === question.id));
      setDir('next');
      if (i >= list.length - 1) finish(from);
      else setCurrentId(list[i + 1].id);
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [answers, categoryId, depth, finish, question.id],
  );

  const goBack = () => {
    if (index === 0) return navigate('/navigate');
    setDir('prev');
    setCurrentId(visible[index - 1].id);
  };

  const restart = () => {
    setAnswers({});
    setDraft(null);
    setDir('prev');
    setCurrentId(getVisibleQuestions(categoryId, {}, depth)[0].id);
    setAskResume(false);
  };

  const changeDepth = (d: DiagnosisDepth) => {
    setDepth(d);
    setPreferences({ depth: d });
    const list = getVisibleQuestions(categoryId, answersRef.current, d);
    if (!list.some((q) => q.id === question.id)) {
      // 切り替え先に今の質問がない場合は、まだ答えていない最初の質問へ
      const next = list.find((q) => !hasAnswer(answersRef.current[q.id])) ?? list[list.length - 1];
      setDir('next');
      setCurrentId(next.id);
    }
  };

  const onChange = (a: Answer | undefined) => {
    const next = { ...answersRef.current };
    if (a) next[question.id] = a;
    else delete next[question.id];
    setAnswers(pruneAnswers(categoryId, next));
  };

  // 選択しても自動では次へ進まない（「次へ」ボタン or Enter で進む）
  const onPicked = () => setNudge((n) => n + 1);

  // Enter で次へ（テキスト入力中は除く）
  useEffect(() => {
    if (phase !== 'questions' || askResume) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.isComposing) return;
      const t = e.target as HTMLElement;
      if (t.closest('textarea, button, a, input')) return;
      goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, phase, askResume]);

  if (phase === 'analyzing') return <Analyzing duration={prefersReducedMotion() ? 250 : 1500} />;

  if (askResume && savedDraft) {
    return (
      <div className="mx-auto max-w-lg animate-fade-up py-20">
        <div className="glass rounded-3xl p-8 text-center">
          <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Clock className="size-6" aria-hidden />
          </span>
          <h1 tabIndex={-1} data-page-title className="text-xl font-semibold outline-none">
            前回の続きがあります
          </h1>
          <p className="mt-2 text-sm text-muted">
            {formatDate(savedDraft.updatedAt)} に回答した「{category.title}」の診断を、続きから再開できます。
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              variant="primary"
              onClick={() => {
                setAnswers(savedDraft.answers);
                if (savedDraft.depth) setDepth(savedDraft.depth);
                if (savedDraft.stepId) setCurrentId(savedDraft.stepId);
                setAskResume(false);
              }}
            >
              続きから再開
            </Button>
            <Button onClick={restart} icon={<RotateCcw className="size-4" aria-hidden />}>
              最初からはじめる
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const answered = hasAnswer(answers[question.id]);
  const goalPlaceholder = `例：${category.examples[0]}を作りたい`;

  return (
    <div className="grid gap-8 pt-8 pb-28 sm:pt-12 lg:grid-cols-[260px_1fr] lg:gap-12 lg:pb-12">
      {/* ---------- サイド：カテゴリと質問一覧 ---------- */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Icon name={category.icon} className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="label-mono">Navigation</p>
            <h1 tabIndex={-1} data-page-title className="truncate text-sm font-semibold text-fg outline-none">
              {category.title}
            </h1>
          </div>
        </div>
        <div className="mt-6">
          <ProgressBar current={index + 1} total={visible.length} />
        </div>
        <div className="mt-5">
          <p className="label-mono mb-2">診断の詳しさ</p>
          <Segmented
            label="診断の詳しさ"
            value={depth}
            onChange={changeDepth}
            options={[
              { value: 'quick', label: 'かんたん 5問', icon: <Zap className="size-3.5" aria-hidden /> },
              { value: 'full', label: `詳しく ${fullCount}問`, icon: <ListChecks className="size-3.5" aria-hidden /> },
            ]}
          />
          <p className="mt-2 text-xs text-muted">
            {depth === 'quick' ? '重要な質問だけで診断します。あとから「詳しく」に切り替えても回答は残ります。' : 'すべての質問に答えると、判定とプロンプトの精度が上がります。'}
          </p>
        </div>
        <ol className="mt-6 hidden space-y-1 lg:block" aria-label="質問一覧">
          {visible.map((q, i) => {
            const done = hasConcreteAnswer(answers[q.id]);
            const current = i === index;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => {
                    setDir(i < index ? 'prev' : 'next');
                    setCurrentId(q.id);
                  }}
                  aria-current={current ? 'step' : undefined}
                  className={cx(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                    current ? 'bg-white/[0.05] text-fg' : 'text-muted hover:text-fg',
                  )}
                >
                  <span
                    className={cx(
                      'grid size-4 shrink-0 place-items-center rounded-full border text-[9px]',
                      done ? 'border-accent bg-accent text-ink-950' : current ? 'border-accent text-accent' : 'border-white/15',
                    )}
                  >
                    {done ? <Check className="size-2.5" strokeWidth={3} /> : null}
                  </span>
                  <span className="truncate">{q.promptLabel}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <PrivacyNote className="mt-6 hidden lg:flex" />
      </aside>

      {/* ---------- 質問 ---------- */}
      <section aria-label="質問">
        <div key={question.id} className={dir === 'next' ? 'animate-slide-next' : 'animate-slide-prev'}>
          <QuestionView
            question={question}
            answer={answers[question.id]}
            onChange={onChange}
            onPicked={onPicked}
            placeholder={goalPlaceholder}
            examples={category.examples}
            stepLabel={`Question ${String(index + 1).padStart(2, '0')}`}
          />
        </div>

        {/* ---------- 操作ボタン（スマホでは画面下に固定） ---------- */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-ink-950/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:mt-10 lg:border-t lg:bg-transparent lg:px-0 lg:pt-6 lg:pb-0 lg:backdrop-blur-none">
          <div className="mx-auto flex max-w-6xl items-center gap-2">
            <Button variant="ghost" onClick={goBack} icon={<ArrowLeft className="size-4" aria-hidden />}>
              戻る
            </Button>
            <Button variant="ghost" onClick={restart} icon={<RotateCcw className="size-4" aria-hidden />} className="max-sm:px-2.5" aria-label="診断をやり直す">
              <span className="hidden sm:inline">やり直す</span>
            </Button>
            <div className="flex-1" />
            <Button
              key={`next-${nudge}`}
              variant="primary"
              onClick={() => goNext()}
              iconRight={<ArrowRight className="size-4" aria-hidden />}
              className={nudge > 0 && answered ? 'animate-nudge' : undefined}
            >
              {isLast ? '結果を見る' : answered ? '次へ' : 'スキップして次へ'}
            </Button>
          </div>
        </div>
        <p className="mt-4 hidden text-xs text-faint lg:block">ヒント：数字キーで選択、Enter で次へ進めます。</p>
      </section>
    </div>
  );
}
