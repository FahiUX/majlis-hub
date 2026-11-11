import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import { cx } from '../../components/ui';
import { CATS, REELS, vendorById } from '../../data/mock';
import type { CategoryId, Reel } from '../../data/types';
import { toggle, useStore } from '../../store';
import { nav } from '../../router';
import { ReelSlide } from './ReelSlide';
import { CommentsSheet, ReportSheet, ShareSheet, type ReelComment } from './ReelSheets';

/** feed repeats 3x; when the user reaches the first or last copy we jump to the same reel in the middle copy, so swiping never ends */
const COPIES = 3;

export default function InspirasiScreen() {
  const { s, set } = useStore();
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [added, setAdded] = useState<Record<number, ReelComment[]>>({});
  const [sheet, setSheet] = useState<{ kind: 'comments' | 'share' | 'report'; reel: Reel } | null>(null);
  const feed = useRef<HTMLDivElement>(null);

  const reels = useMemo(() => (cat === 'all' ? REELS : REELS.filter(r => vendorById(r.vendorId)?.cat === cat)), [cat]);
  const loop = reels.length > 1;
  const slides = loop ? Array.from({ length: COPIES }, () => reels).flat() : reels;

  // start in the middle copy
  useLayoutEffect(() => {
    const el = feed.current;
    if (el) el.scrollTop = loop ? reels.length * el.clientHeight : 0;
  }, [reels, loop]);

  // runs once scrolling settles (debounced), using the real fractional slide height
  const settle = useRef(0);
  const recentre = () => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = feed.current;
      const first = el?.firstElementChild as HTMLElement | null;
      if (!el || !first || !loop) return;
      const h = first.getBoundingClientRect().height, n = reels.length, i = Math.round(el.scrollTop / h);
      if (i < n) el.scrollTop = (i + n) * h;
      else if (i >= 2 * n) el.scrollTop = (i - n) * h;
    }, 120);
  };

  const guard = (fn: () => void) => () => (s.authed ? fn() : nav('/masuk?next=/inspirasi'));
  const comments = (r: Reel) => [...r.comments, ...(added[r.id] ?? [])];

  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col bg-black">
      <div role="group" aria-label="Kategori video" className="absolute top-0 inset-x-0 z-20 flex flex-row gap-2 p-3 overflow-x-auto">
        {[{ id: 'all' as const, name: 'Semua' }, ...CATS].map(c => (
          <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}
            className={cx('w-fit shrink-0 px-3.5 py-2 leading-5 rounded-full text-sm font-semibold whitespace-nowrap backdrop-blur', cat === c.id ? 'bg-white text-ink' : 'bg-black/35 text-white border border-white/25')}>
            {c.name}
          </button>
        ))}
      </div>

      {reels.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
          <span className="w-14 h-14 shrink-0 rounded-full bg-white/10 flex items-center justify-center"><Clapperboard className="w-7 h-7 shrink-0" /></span>
          <p className="w-full text-base font-semibold">Belum ada video untuk kategori ini</p>
          <p className="w-full text-sm text-white/70">Vendor disahkan sedang memuat naik hasil kerja mereka.</p>
          <button onClick={() => setCat('all')} className="w-fit px-5 py-3 leading-5 rounded-[10px] bg-white text-ink text-[15px] font-semibold">Tengok semua video</button>
        </div>
      ) : (
        <div ref={feed} onScroll={recentre} className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory">
          {slides.map((r, i) => (
            <ReelSlide key={`${r.id}-${i}`} reel={r}
              liked={s.liked.includes(r.id)} saved={s.savedReels.includes(r.id)} followed={s.followed.includes(r.vendorId)}
              commentCount={comments(r).length}
              onLike={guard(() => set(st => ({ liked: toggle(st.liked, r.id) })))}
              onSave={guard(() => set(st => ({ savedReels: toggle(st.savedReels, r.id) })))}
              onFollow={guard(() => set(st => ({ followed: toggle(st.followed, r.vendorId) })))}
              onComments={() => setSheet({ kind: 'comments', reel: r })}
              onShare={() => setSheet({ kind: 'share', reel: r })}
              onReport={guard(() => setSheet({ kind: 'report', reel: r }))} />
          ))}
        </div>
      )}

      <CommentsSheet reel={sheet?.kind === 'comments' ? sheet.reel : null} comments={sheet ? comments(sheet.reel) : []} onClose={() => setSheet(null)}
        onSend={text => sheet && setAdded(a => ({ ...a, [sheet.reel.id]: [...(a[sheet.reel.id] ?? []), { name: s.userName, text, time: 'baru', likes: 0 }] }))} />
      <ShareSheet reel={sheet?.kind === 'share' ? sheet.reel : null} onClose={() => setSheet(null)} />
      <ReportSheet reel={sheet?.kind === 'report' ? sheet.reel : null} onClose={() => setSheet(null)} />
    </div>
  );
}
