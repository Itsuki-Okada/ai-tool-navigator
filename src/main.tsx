import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { finishBoot } from './lib/boot';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root が見つかりません');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// アプリの描画が始まったら起動画面を閉じる
// （requestAnimationFrame はバックグラウンドのタブで止まるため setTimeout を使う）
window.setTimeout(finishBoot, 0);
