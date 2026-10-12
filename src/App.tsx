import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { Compass, TriangleAlert } from 'lucide-react';
import { Shell } from './components/layout/Shell';
import { LinkButton } from './components/ui/Button';
import { EmptyState } from './components/ui/misc';
import { ComparePage } from './pages/ComparePage';
import { DiagnosisPage } from './pages/DiagnosisPage';
import { HomePage } from './pages/HomePage';
import { LibraryPage } from './pages/LibraryPage';
import { NavigatePage } from './pages/NavigatePage';
import { ResultPage } from './pages/ResultPage';
import { SavedItemPage } from './pages/SavedItemPage';
import { SavedPage } from './pages/SavedPage';
import { TemplatePage } from './pages/TemplatePage';
import { useRoute, type Route } from './state/router';
import { StoreProvider } from './state/store';
import { ToastProvider } from './state/toast';
import type { AppData } from './types';

const TITLES: Partial<Record<Route['name'], string>> = {
  home: 'AI TOOL NAVIGATOR — 「作りたい」を、最適なAIとプロンプトに。',
  navigate: 'カテゴリを選ぶ',
  diagnosis: 'AIナビゲーション',
  result: '診断結果',
  compare: 'AI比較',
  library: 'プロンプト作成',
  template: 'テンプレート',
  saved: '保存したプロンプト',
  savedItem: 'プロンプトの編集',
};

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'navigate':
      return <NavigatePage />;
    case 'diagnosis':
      return <DiagnosisPage category={route.category} resume={route.resume} />;
    case 'result':
      return <ResultPage id={route.id} />;
    case 'compare':
      return <ComparePage />;
    case 'library':
      return <LibraryPage />;
    case 'template':
      return <TemplatePage id={route.id} />;
    case 'saved':
      return <SavedPage tab={route.tab} />;
    case 'savedItem':
      return <SavedItemPage id={route.id} />;
    default:
      return (
        <div className="py-24">
          <EmptyState
            icon={<Compass className="size-5" />}
            title="ページが見つかりません"
            description="URLが正しいか確認してください。"
            action={<LinkButton href="#/" variant="primary">ホームへ戻る</LinkButton>}
          />
        </div>
      );
  }
}

/** 予期しないエラーで画面が真っ白にならないようにする */
class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AI TOOL NAVIGATOR]', error, info.componentStack);
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="py-24">
          <EmptyState
            icon={<TriangleAlert className="size-5" />}
            title="画面を表示できませんでした"
            description="一時的な問題が発生しました。ホームに戻るか、ページを再読み込みしてください。保存したデータは消えていません。"
            action={<LinkButton href="#/" variant="primary">ホームへ戻る</LinkButton>}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

function Routed() {
  const route = useRoute();
  const key = JSON.stringify(route);

  // ページ切り替え時：先頭へスクロールし、見出しへフォーカス（読み上げソフト向け）
  useEffect(() => {
    window.scrollTo(0, 0);
    const title = TITLES[route.name];
    document.title = route.name === 'home' || !title ? TITLES.home! : `${title} | AI TOOL NAVIGATOR`;
    const t = window.setTimeout(() => {
      const h = document.querySelector<HTMLElement>('[data-page-title]');
      h?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(t);
  }, [key, route.name]);

  return (
    <Shell route={route}>
      <ErrorBoundary resetKey={key}>
        <Page route={route} />
      </ErrorBoundary>
    </Shell>
  );
}

export default function App({ initialData }: { initialData?: AppData }) {
  return (
    <ToastProvider>
      <StoreProvider initial={initialData}>
        <Routed />
      </StoreProvider>
    </ToastProvider>
  );
}
