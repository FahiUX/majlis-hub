import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Clapperboard, RotateCcw, Search, WifiOff } from 'lucide-react';
import { cx } from '../../components/ui';
import { CATS, REELS, kmFrom, vendorById } from '../../data/mock';
import type { CategoryId, Reel } from '../../data/types';
import { toggle, useStore } from '../../store';
import { nav, swap, useRoute } from '../../router';
import { ReelSlide } from './ReelSlide';
import { CommentsSheet, ReportSheet, ShareSheet, type ReelComment } from './ReelSheets';

/** posted comments per reel; the store has no field for them (ponytail: move into AppState if comments grow) */
const CKEY = 'majlishub.comments';
const loadComments = (): Record<number, ReelComment[]> => { try { return JSON.parse(localStorage.getItem(CKEY) ?? '{}'); } catch { return {}; } };

export default function InspirasiScreen() {
  const { s, set } = useStore();
  const q = useRoute().q;
  const demo = q.get('demo');
  const loading = demo === 'loading';
  const startId = Number(q.get('v')) || 0;
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [added, setAdded] = useState<Record<number, ReelComment[]>>(loadComments);
  useEffect(() => { try { localStorage.setItem(CKEY, JSON.stringify(added)); } catch { /* private mode: comments live for this visit only */ } }, [added]);
  const [sheet, setSheet] = useState<{ kind: 'comments' | 'share' | 'report'; reel: Reel } | null>(null);
  const feed = useRef<HTMLDivElement>(null);

  // C-7.0: nearest to the majlis first (mock has no upload dates, so freshness is not ranked)
  const place = s.event?.place;
  const reels = useMemo(() => REELS.filter(r => cat === 'all' || vendorById(r.vendorId)?.cat === cat)
    .map(r => ({ r, km: kmFrom(vendorById(r.vendorId)!, place) })).sort((a, b) => a.km - b.km).map(x => x.r), [cat, place]);

  // start at the reel from ?v= (Home strip, shared link)
  useLayoutEffect(() => {
    const el = feed.current;
    const at = Math.max(0, reels.findIndex(r => r.id === startId));
    if (el) el.scrollTop = at * el.clientHeight;
  }, [reels, startId]);

  // a guest who tapped like is sent to login with &like=<id>; apply it once on return (idempotent: add, never toggle)
  const pendingLike = Number(q.get('like')) || 0;
  useEffect(() => {
    if (!s.authed || !pendingLike) return;
    set(st => ({ liked: st.liked.includes(pendingLike) ? st.liked : [...st.liked, pendingLike] }));
    swap('/inspirasi?v=' + pendingLike);
  }, [s.authed, pendingLike, set]);

  const login = (r: Reel, extra = '') => nav('/masuk?next=' + encodeURIComponent(`/inspirasi?v=${r.id}${extra}`));
  const guard = (fn: () => void, r: Reel) => () => (s.authed ? fn() : login(r));
  const comments = (r: Reel) => [...r.comments, ...(added[r.id] ?? [])];

  return (
    <div className="relative w-full flex-1 min-h-0 flex flex-col bg-black">
      <h1 className="sr-only">Inspirasi</h1>
      <div role="group" aria-label="Kategori video" className="absolute top-0 inset-x-0 z-20 flex flex-row gap-2 p-3 overflow-x-auto">
        {[{ id: 'all' as const, name: 'Semua' }, ...CATS].map(c => (
          <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}
            className={cx('w-fit shrink-0 px-3.5 py-2 leading-5 rounded-full text-sm font-semibold whitespace-nowrap backdrop-blur', cat === c.id ? 'bg-white text-ink' : 'bg-black/35 text-white border border-white/25')}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        // Loading state (?demo=loading): dark skeleton in the shape of a reel
        <div aria-busy="true" aria-label="Memuatkan video" className="absolute inset-0 flex flex-col justify-end gap-2 p-4 bg-black">
          <div className="w-40 h-4 rounded-full bg-white/10" />
          <div className="w-64 h-5 rounded-full bg-white/10" />
          <div className="w-52 h-3 rounded-full bg-white/10" />
          <div className="w-full h-11 rounded-xl bg-white/10" />
        </div>
      ) : demo === 'error' ? (
        // Error state (?demo=error): offline / feed failed to load
        <div role="alert" className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
          <span className="w-14 h-14 shrink-0 rounded-full bg-white/10 flex items-center justify-center"><WifiOff className="w-7 h-7 shrink-0" /></span>
          <p className="w-full text-base font-semibold">Video tidak dapat dimuatkan</p>
          <p className="w-full text-sm text-white/70">Semak sambungan internet anda dan cuba lagi.</p>
          <button onClick={() => swap('/inspirasi')} className="w-fit inline-flex flex-row items-center gap-2 px-5 py-3 leading-5 rounded-[10px] bg-white text-ink text-[15px] font-semibold"><RotateCcw className="w-4 h-4 shrink-0" />Cuba lagi</button>
        </div>
      ) : reels.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
          <span className="w-14 h-14 shrink-0 rounded-full bg-white/10 flex items-center justify-center"><Clapperboard className="w-7 h-7 shrink-0" /></span>
          <p className="w-full text-base font-semibold">Belum ada video untuk kategori ini</p>
          <p className="w-full text-sm text-white/70">Vendor disahkan sedang memuat naik hasil kerja mereka.</p>
          <button onClick={() => setCat('all')} className="w-fit px-5 py-3 leading-5 rounded-[10px] bg-white text-ink text-[15px] font-semibold">Tengok semua video</button>
        </div>
      ) : (
        <div ref={feed} className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory">
          {reels.map(r => (
            <ReelSlide key={r.id} reel={r}
              liked={s.liked.includes(r.id)} saved={s.savedReels.includes(r.id)} followed={s.followed.includes(r.vendorId)}
              commentCount={comments(r).length}
              onLike={s.authed ? () => set(st => ({ liked: toggle(st.liked, r.id) })) : () => login(r, '&like=' + r.id)}
              onSave={guard(() => set(st => ({ savedReels: toggle(st.savedReels, r.id) })), r)}
              onFollow={guard(() => set(st => ({ followed: toggle(st.followed, r.vendorId) })), r)}
              onComments={() => setSheet({ kind: 'comments', reel: r })}
              onShare={() => setSheet({ kind: 'share', reel: r })}
              onReport={guard(() => setSheet({ kind: 'report', reel: r }), r)} />
          ))}
          {/* C-7.0 edge: end of feed */}
          <section aria-label="Tamat suapan" className="w-full h-full snap-start shrink-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-white">
            <span className="w-14 h-14 shrink-0 rounded-full bg-white/10 flex items-center justify-center"><Clapperboard className="w-7 h-7 shrink-0" /></span>
            <p className="w-full text-base font-semibold">Anda dah tengok semua</p>
            <p className="w-full text-sm text-white/70">Video baharu dimuat naik setiap minggu. Sementara itu, lihat vendor yang anda suka.</p>
            <button onClick={() => feed.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="w-fit inline-flex flex-row items-center gap-2 px-5 py-3 leading-5 rounded-[10px] bg-white text-ink text-[15px] font-semibold"><RotateCcw className="w-4 h-4 shrink-0" />Tonton semula</button>
            <button onClick={() => nav(cat === 'all' ? '/cari' : `/cari?cat=${cat}`)} className="w-fit inline-flex flex-row items-center gap-2 px-5 py-3 leading-5 rounded-[10px] border border-white/40 text-white text-[15px] font-semibold"><Search className="w-4 h-4 shrink-0" />Cari vendor</button>
          </section>
        </div>
      )}

      <CommentsSheet reel={sheet?.kind === 'comments' ? sheet.reel : null} comments={sheet ? comments(sheet.reel) : []} onClose={() => setSheet(null)}
        loading={q.get('cdemo') === 'loading'}
        onSend={text => sheet && setAdded(a => ({ ...a, [sheet.reel.id]: [...(a[sheet.reel.id] ?? []), { name: s.userName, text, time: 'baru', likes: 0, failed: q.get('net') === 'off' }] }))}
        onRetry={c => sheet && setAdded(a => ({ ...a, [sheet.reel.id]: (a[sheet.reel.id] ?? []).map(x => (x === c ? { ...x, failed: false } : x)) }))} />
      <ShareSheet reel={sheet?.kind === 'share' ? sheet.reel : null} onClose={() => setSheet(null)} />
      <ReportSheet reel={sheet?.kind === 'report' ? sheet.reel : null} onClose={() => setSheet(null)} />
    </div>
  );
}
