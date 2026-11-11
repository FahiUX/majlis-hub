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

/** in-app pushes, so Back on a page opened from a shared link goes to the fallback instead of leaving the app */
let depth = 0;
export const nav = (to: string) => { depth++; location.hash = to; };
/** replace the current entry (tabs, filters) so Back skips it */
export const swap = (to: string) => { history.replaceState(null, '', '#' + to); window.dispatchEvent(new HashChangeEvent('hashchange')); };
export const back = (fallback = '/') => { if (depth > 0) { depth--; history.back(); } else { location.hash = fallback; } };
