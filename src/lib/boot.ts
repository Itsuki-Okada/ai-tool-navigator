import { prefersReducedMotion } from './utils';

/**
 * 起動画面（index.html の #boot）を閉じる
 * - 演出が最後まで見えるよう、ページを開いてから最低限の時間は表示
 * - クリック・キー操作でスキップ可能
 * - 同じタブで2回目以降は表示しない（sessionStorage に記録）
 */

const MIN_MS = 2100;
const MIN_MS_REDUCED = 350;

export function finishBoot() {
  const el = document.getElementById('boot');
  if (!el) return;

  let done = false;
  const close = () => {
    if (done) return;
    done = true;
    try {
      sessionStorage.setItem('atn:booted', '1');
    } catch {
      /* 保存できなくても続行 */
    }
    el.classList.add('boot-out');
    window.setTimeout(() => el.remove(), 700);
    window.removeEventListener('keydown', close);
  };

  // すでに非表示（2回目以降）の場合はすぐ取り除く
  if (getComputedStyle(el).display === 'none') {
    el.remove();
    return;
  }

  el.addEventListener('click', close);
  window.addEventListener('keydown', close);
  const min = prefersReducedMotion() ? MIN_MS_REDUCED : MIN_MS;
  window.setTimeout(close, Math.max(0, min - performance.now()));
}
