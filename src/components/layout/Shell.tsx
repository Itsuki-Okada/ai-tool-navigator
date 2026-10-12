import type { ReactNode } from 'react';
import { DATA_LAST_REVIEWED } from '../../data/aiProfiles';
import type { Route } from '../../state/router';
import { Header, Logo } from './Header';

function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-8%,rgb(40_120_140/0.22),transparent_70%)]" />
      <div className="absolute -top-40 right-[-10%] size-[520px] rounded-full bg-[radial-gradient(circle,rgb(70_110_200/0.10),transparent_65%)]" />
      <div className="bg-grid absolute inset-0" />
    </div>
  );
}

export function Shell({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only z-[70] rounded-lg bg-accent px-4 py-2 text-ink-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        本文へスキップ
      </a>
      <Background />
      <Header route={route} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 outline-none sm:px-6">
        {children}
      </main>
      <footer className="border-t hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Logo />
          <div className="space-y-1 sm:text-right">
            <p>入力内容は外部に送信されず、このブラウザ内だけで処理・保存されます。</p>
            <p>
              AIサービスの情報は {DATA_LAST_REVIEWED} 時点の一般的な公開情報に基づく目安です。最新の機能・料金は各公式サイトでご確認ください。
            </p>
            <p className="text-faint">ChatGPT・Gemini・Claude は各社の商標です。本サービスは各社とは関係のない非公式ツールです。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
