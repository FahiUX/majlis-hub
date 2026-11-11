import { useEffect, useState } from 'react';

/**
 * Hash router: `#/vendor/7?tab=ulasan`. Every screen and state is a link,
 * so Phase 7 can capture each one by URL.
 * ponytail: no react-router; add it if nested layouts or loaders are ever needed.
 */
export interface Route { path: string; parts: string[]; q: URLSearchParams }

const parse = (): Route => {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path, parts: path.split('/').filter(Boolean), q: new URLSearchParams(qs) };
};

export function useRoute(): Route {
  const [r, setR] = useState(parse);
  useEffect(() => {
    const on = () => setR(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

/** in-app depth lives in history.state, so it survives browser/Android back (QA B5) */
const depth = () => (history.state as { d?: number } | null)?.d ?? 0;
const fire = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
export const nav = (to: string) => { history.pushState({ d: depth() + 1 }, '', '#' + to); fire(); };
/** replace the current entry (tabs, filters, finished flows) so Back skips it */
export const swap = (to: string) => { history.replaceState({ d: depth() }, '', '#' + to); fire(); };
/** back inside the app; a page opened from a shared link goes to the fallback instead of leaving the app */
export const back = (fallback = '/') => { if (depth() > 0) history.back(); else swap(fallback); };
