import { AI_IDS, AI_PROFILES, NEEDS } from '../../data/aiProfiles';
import { CATEGORY_MAP } from '../../data/categories';
import { CAUTION_RULES, CATEGORY_RULES, PLAYBOOK_RULES, PREFER_BONUS, PREFER_POINTS, TIE_POINTS } from '../../data/scoringRules';
import type {
  AiId,
  AiScore,
  Answers,
  CategoryId,
  Confidence,
  Criterion,
  NeedContribution,
  NeedId,
  Recommendation,
  Tier,
} from '../../types';
import { getVisibleQuestions, hasConcreteAnswer, matchesAll, selectedOptions } from './flow';

/**
 * AI選定エンジン
 * ----------------------------------------------------------------
 * 1. カテゴリと回答から「ニーズ（何が必要か）」と重みを集計
 * 2. 各AIの特徴データ（0〜3の目安）とニーズを掛け合わせて「点数」を計算
 *    （ユーザーがふだん使っているAIなどの意向は小さな加点）
 * 3. 1位との点数差が TIE_POINTS 未満なら、無理に順位をつけず同程度の候補とする
 *    回答が少ないほど判断が不確かなので、同程度とみなす幅を広げる
 * UIに依存しないため、将来AI APIによる判定に差し替えることもできます。
 */

const MAX_LEVEL = 3;

export function collectNeeds(categoryId: CategoryId, answers: Answers) {
  const needs = new Map<NeedId, NeedContribution>();
  const prefer: Record<AiId, { bonus: number; sources: string[] }> = {
    chatgpt: { bonus: 0, sources: [] },
    gemini: { bonus: 0, sources: [] },
    claude: { bonus: 0, sources: [] },
  };
  const add = (need: NeedId, weight: number, source: string) => {
    const cur = needs.get(need) ?? { need, weight: 0, sources: [] };
    cur.weight += weight;
    if (!cur.sources.includes(source)) cur.sources.push(source);
    needs.set(need, cur);
  };

  const category = CATEGORY_MAP[categoryId];
  for (const [need, w] of Object.entries(CATEGORY_RULES[categoryId].baseNeeds)) {
    add(need as NeedId, w ?? 0, `目的のカテゴリ：${category.short}`);
  }

  for (const q of getVisibleQuestions(categoryId, answers)) {
    for (const opt of selectedOptions(q, answers[q.id])) {
      const source = `${q.promptLabel}：${opt.label}`;
      for (const [need, w] of Object.entries(opt.needs ?? {})) add(need as NeedId, w ?? 0, source);
      for (const [ai, b] of Object.entries(opt.prefer ?? {})) {
        prefer[ai as AiId].bonus += b ?? 0;
        prefer[ai as AiId].sources.push(source);
      }
    }
  }
  // マイナスの重みで打ち消されたニーズ（合計0以下）は評価に使わない
  return { needs: [...needs.values()].filter((n) => n.weight > 0), prefer };
}

function tierFor(score: number, inTop: boolean, blocked: boolean): Tier {
  if (inTop && !blocked) return 'best';
  if (blocked) return score >= 0.5 ? 'conditional' : 'weak';
  if (score >= 0.72) return 'good';
  if (score >= 0.5) return 'conditional';
  return 'weak';
}

function evaluateConfidence(categoryId: CategoryId, answers: Answers): { confidence: Confidence; note: string; skipped: string[] } {
  const visible = getVisibleQuestions(categoryId, answers).filter((q) => q.id !== 'notes');
  const skipped = visible.filter((q) => !hasConcreteAnswer(answers[q.id])).map((q) => q.id);
  const answeredRatio = visible.length ? (visible.length - skipped.length) / visible.length : 0;
  const hasGoal = hasConcreteAnswer(answers.goal);

  if (answeredRatio >= 0.6 && hasGoal) {
    return { confidence: 'high', note: '回答が十分にそろっているため、条件をふまえた判定ができています。', skipped };
  }
  if (answeredRatio >= 0.3) {
    return {
      confidence: 'medium',
      note: '一部の質問が未回答・おまかせのため、カテゴリの一般的な傾向も含めて判定しています。',
      skipped,
    };
  }
  return {
    confidence: 'low',
    note: '判断材料が少ないため、結果はカテゴリの一般的な傾向に近い参考値です。追加の質問に答えると精度が上がります。',
    skipped,
  };
}

export function recommend(categoryId: CategoryId, answers: Answers): Recommendation {
  const { needs, prefer } = collectNeeds(categoryId, answers);
  const totalWeight = needs.reduce((s, n) => s + n.weight, 0) || 1;
  const conf = evaluateConfidence(categoryId, answers);

  const raw = AI_IDS.map((ai) => {
    const profile = AI_PROFILES[ai];
    let sum = 0;
    const critSum: Partial<Record<Criterion, { s: number; m: number }>> = {};
    const blockedBy: NeedId[] = [];
    for (const n of needs) {
      const level = profile.capabilities[n.need].level;
      sum += n.weight * level;
      const crit = NEEDS[n.need].criterion;
      const c = critSum[crit] ?? { s: 0, m: 0 };
      c.s += n.weight * level;
      c.m += n.weight * MAX_LEVEL;
      critSum[crit] = c;
      // 重視されているニーズに標準で対応していない
      if (level === 0 && n.weight >= 2) blockedBy.push(n.need);
    }
    const base = sum / (totalWeight * MAX_LEVEL);
    const preferUnits = Math.min(prefer[ai].bonus, 3);
    const criteria: Partial<Record<Criterion, number>> = {};
    for (const [k, v] of Object.entries(critSum)) criteria[k as Criterion] = v.m ? v.s / v.m : 0;
    return {
      ai,
      // 表示用（段階評価）の 0〜1 の値
      score: Math.min(1, base + preferUnits * PREFER_BONUS),
      // 順位づけ用の点数（重み × レベル ＋ 意向の加点）
      points: sum + preferUnits * PREFER_POINTS,
      blockedBy,
      criteria,
    };
  }).sort((a, b) => b.points - a.points || b.score - a.score);

  const best = raw[0];
  const tieWidth = TIE_POINTS[conf.confidence];
  const topGroup = raw.filter((r) => best.points - r.points < tieWidth && r.blockedBy.length === 0).map((r) => r.ai);
  if (topGroup.length === 0) topGroup.push(best.ai);

  const ranking: AiScore[] = raw.map((r) => {
    const profile = AI_PROFILES[r.ai];
    const others = AI_IDS.filter((x) => x !== r.ai);
    const strengths = needs
      .map((n) => {
        const own = profile.capabilities[n.need].level;
        const avg = others.reduce((s, o) => s + AI_PROFILES[o].capabilities[n.need].level, 0) / others.length;
        return { need: n.need, diff: n.weight * (own - avg), own, weight: n.weight };
      })
      .filter((x) => x.own >= 2)
      .sort((a, b) => b.diff - a.diff || b.weight - a.weight)
      .slice(0, 3)
      .map((x) => ({ need: x.need, text: profile.capabilities[x.need].note }));
    const limitations = needs
      .filter((n) => profile.capabilities[n.need].level <= 1 && profile.capabilities[n.need].limitation)
      .sort((a, b) => b.weight - a.weight)
      .map((n) => profile.capabilities[n.need].limitation as string);
    return {
      ai: r.ai,
      score: r.score,
      tier: tierFor(r.score, topGroup.includes(r.ai), r.blockedBy.length > 0),
      blockedBy: r.blockedBy,
      strengths,
      limitations: [...new Set(limitations)],
      criteria: r.criteria,
    };
  });

  // 判断に影響した条件：AI間で差が出たニーズ × 重み の大きい順
  const spread = (need: NeedId) => {
    const levels = AI_IDS.map((ai) => AI_PROFILES[ai].capabilities[need].level);
    return Math.max(...levels) - Math.min(...levels);
  };
  const influential: string[] = [];
  for (const n of [...needs].sort((a, b) => b.weight * spread(b.need) - a.weight * spread(a.need))) {
    if (spread(n.need) === 0) continue;
    const answerSources = n.sources.filter((s) => !s.startsWith('目的のカテゴリ'));
    const src = (answerSources.length ? answerSources : n.sources).slice(0, 2).join(' / ');
    influential.push(`${src} → 「${NEEDS[n.need].label}」を重視`);
    if (influential.length >= 4) break;
  }
  for (const ai of AI_IDS) {
    if (prefer[ai].bonus > 0) {
      influential.push(`${prefer[ai].sources.join(' / ')} → ${AI_PROFILES[ai].name}を${prefer[ai].bonus >= 3 ? '優先' : '少し優先'}`);
    }
  }

  const lead = topGroup[0];
  const rule = CATEGORY_RULES[categoryId];
  const tasks = [...new Set(topGroup.flatMap((ai) => rule.tasks[ai].map((t) => (topGroup.length > 1 ? `${AI_PROFILES[ai].name}：${t}` : t))))];

  const cautions = [
    ...CAUTION_RULES.filter((c) => matchesAll(c.when, answers) && (!c.ai || topGroup.includes(c.ai))).map((c) => c.text),
    ...ranking.filter((r) => topGroup.includes(r.ai)).flatMap((r) => r.limitations.map((l) => `${AI_PROFILES[r.ai].name}：${l}`)),
  ];
  const variesNeeds = needs.filter((n) => n.weight >= 2 && AI_PROFILES[lead].capabilities[n.need].varies);
  if (variesNeeds.length) {
    cautions.push(
      `${variesNeeds.map((n) => NEEDS[n.need].label).join('・')}に関する機能は、プランやモデルによって利用条件が異なります。公式サイトで最新情報を確認してください。`,
    );
  }

  const howTo = [
    ...rule.howTo[lead],
    ...PLAYBOOK_RULES.filter((p) => matchesAll(p.when, answers) && (!p.ai || topGroup.includes(p.ai))).map((p) => p.step),
  ];

  let confidenceNote = conf.note;
  if (topGroup.length > 1) {
    confidenceNote +=
      ' 今回の条件では機能面で大きな差がないため、無理に1つに絞らず同程度のおすすめとして表示しています。ふだん使っているAIや、使い慣れたAIを選んで問題ありません。';
  }

  return {
    ranking,
    topGroup,
    isTie: topGroup.length > 1,
    confidence: conf.confidence,
    confidenceNote,
    influentialFactors: influential,
    needs: [...needs].sort((a, b) => b.weight - a.weight),
    tasks,
    cautions: [...new Set(cautions)],
    howTo: [...new Set(howTo)],
    skippedQuestionIds: conf.skipped,
  };
}

export const TIER_LABEL: Record<Tier, string> = {
  best: '最も適している',
  good: '適している',
  conditional: '条件付きで使える',
  weak: 'この用途には不向き',
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: '判断材料：十分',
  medium: '判断材料：やや不足',
  low: '判断材料：不足',
};

/** 相対的な評価値を、根拠のない精密な数値ではなく段階で表す */
export function levelBand(v: number): 0 | 1 | 2 | 3 | 4 {
  if (v >= 0.85) return 4;
  if (v >= 0.68) return 3;
  if (v >= 0.5) return 2;
  if (v >= 0.3) return 1;
  return 0;
}
