import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom に存在しないブラウザ機能を補う
window.scrollTo = (() => {}) as typeof window.scrollTo;
Element.prototype.scrollIntoView = function () {};
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: query.includes('reduce'), // テストではアニメーションを減らす設定として扱う
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList);

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = '';
});
