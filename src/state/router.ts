import { useEffect, useState } from 'react';

/**
 * シンプルなハッシュルーター
 * （#/compare のような形式。サーバー設定なしで GitHub Pages などに公開できます）
 */

export type Route =
  | { name: 'home' }
  | { name: 'navigate' }
  | { name: 'diagnosis'; category: string; resume: boolean }
  | { name: 'result'; id: string }
  | { name: 'compare' }
  | { name: 'library' }
  | { name: 'template'; id: string }
  | { name: 'saved'; tab: string | null }
  | { name: 'savedItem'; id: string }
  | { name: 'notFound' };

export function parseHash(hash: string): Route {
  const [pathPart, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = pathPart.split('/').filter(Boolean).map((p) => decodeURIComponent(p));
  const params = new URLSearchParams(query);
  const [a, b] = parts;
  if (!a) return { name: 'home' };
  if (a === 'navigate') return b ? { name: 'diagnosis', category: b, resume: params.has('resume') } : { name: 'navigate' };
  if (a === 'result' && b) return { name: 'result', id: b };
  if (a === 'compare') return { name: 'compare' };
  if (a === 'library') return b ? { name: 'template', id: b } : { name: 'library' };
  if (a === 'saved') return b ? { name: 'savedItem', id: b } : { name: 'saved', tab: params.get('tab') };
  return { name: 'notFound' };
}

export function navigate(path: string) {
  const next = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
