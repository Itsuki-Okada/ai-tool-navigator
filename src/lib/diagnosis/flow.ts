import { CATEGORY_MAP } from '../../data/categories';
import { QUESTION_MAP } from '../../data/questions';
import { UNSURE, type Answer, type Answers, type CategoryId, type Condition, type Question, type QuestionOption } from '../../types';

/** 回答が条件を満たすか */
export function matchesCondition(cond: Condition, answers: Answers): boolean {
  const a = answers[cond.q];
  const values = a?.values ?? [];
  if (cond.answered !== undefined) {
    const has = values.length > 0 || Boolean(a?.text?.trim());
    if (has !== cond.answered) return false;
  }
  if (cond.in && !cond.in.some((v) => values.includes(v))) return false;
  if (cond.notIn && cond.notIn.some((v) => values.includes(v))) return false;
  return true;
}

export function matchesAll(conds: Condition[] | undefined, answers: Answers): boolean {
  return !conds || conds.every((c) => matchesCondition(c, answers));
}

/** 現在の回答で表示すべき質問の一覧（回答に応じて分岐） */
export function getVisibleQuestions(categoryId: CategoryId, answers: Answers): Question[] {
  const category = CATEGORY_MAP[categoryId];
  return category.questionIds
    .map((id) => QUESTION_MAP[id])
    .filter((q): q is Question => Boolean(q))
    .filter((q) => matchesAll(q.showIf, answers));
}

export function hasAnswer(a: Answer | undefined): boolean {
  return Boolean(a && (a.values.length > 0 || a.text?.trim()));
}

/** 「分からない・おまかせ」以外の実質的な回答があるか */
export function hasConcreteAnswer(a: Answer | undefined): boolean {
  if (!a) return false;
  return a.values.some((v) => v !== UNSURE) || Boolean(a.text?.trim());
}

export function selectedOptions(q: Question, a: Answer | undefined): QuestionOption[] {
  if (!a || !q.options) return [];
  return q.options.filter((o) => a.values.includes(o.value));
}

/** 回答を読みやすい文字列にする（プロンプトや履歴の表示で使用） */
export function describeAnswer(q: Question, a: Answer | undefined): string | null {
  if (!a) return null;
  const parts: string[] = selectedOptions(q, a).map((o) => o.label);
  const text = a.text?.trim();
  if (text) parts.push(text);
  if (parts.length === 0 && a.values.includes(UNSURE)) return null;
  return parts.length ? parts.join('、') : null;
}

/** 表示対象外になった質問の回答を取り除く（分岐が変わったとき用） */
export function pruneAnswers(categoryId: CategoryId, answers: Answers): Answers {
  // 分岐が連鎖する場合に備えて、変化がなくなるまで繰り返す
  let current = answers;
  for (let i = 0; i < 5; i++) {
    const visible = new Set(getVisibleQuestions(categoryId, current).map((q) => q.id));
    const next: Answers = {};
    for (const [k, v] of Object.entries(current)) if (visible.has(k)) next[k] = v;
    if (Object.keys(next).length === Object.keys(current).length) return next;
    current = next;
  }
  return current;
}
