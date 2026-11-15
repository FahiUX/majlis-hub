import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CornerUpLeft, VideoOff } from 'lucide-react';
import type { ChatMsg } from '../../data/types';
import { alive, whenLabel } from './media';

/** WhatsApp-style full-screen media viewer: swipe (native scroll-snap) or arrows through every photo/video in the thread */
export function Gallery({ items, start, who, onClose, onReply }: { items: ChatMsg[]; start: number; who: string; onClose: () => void; onReply?: (m: ChatMsg) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState(start);
  const close = useRef(onClose);
  close.current = onClose;
  const go = (i: number) => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: 'smooth' });

  useLayoutEffect(() => { track.current?.scrollTo({ left: start * track.current.clientWidth }); }, [start]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    back.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
      if (e.key === 'ArrowRight') go(Math.min(items.length - 1, at + 1));
      if (e.key === 'ArrowLeft') go(Math.max(0, at - 1));
    };
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); prev?.focus(); };
  }, [at, items.length]);

  // only the slide on screen keeps playing
  useEffect(() => { [...(track.current?.children ?? [])].forEach((el, i) => i !== at && el.querySelector('video')?.pause()); }, [at]);
  const m = items[at];
  return (
    <div role="dialog" aria-modal="true" aria-label="Media" className="absolute inset-0 z-50 bg-black text-white flex flex-col">
      <div className="w-full flex flex-row items-center gap-2 p-2">
        <button ref={back} aria-label="Tutup" onClick={onClose} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><ArrowLeft className="w-6 h-6 shrink-0" /></button>
        <span className="flex-1 min-w-0 flex flex-col">
          <span className="w-full text-[15px] font-semibold">{m?.me ? 'Anda' : who}</span>
          <span className="w-full text-xs text-white/70">{m && whenLabel(m)}</span>
        </span>
        {items.length > 1 && <span className="w-fit text-sm text-white/70 num">{at + 1} / {items.length}</span>}
        {onReply && <button aria-label="Balas" onClick={() => m && onReply(m)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><CornerUpLeft className="w-5 h-5 shrink-0" /></button>}
      </div>
      <div className="relative w-full flex-1 min-h-0">
        <div ref={track} onScroll={e => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="w-full h-full flex flex-row overflow-x-auto snap-x snap-mandatory">
          {items.map((x, i) => (
            <div key={i} className="w-full h-full shrink-0 snap-center flex items-center justify-center">
              {x.video
                ? (alive(x.video)
                  ? <video src={x.video} controls playsInline className="w-full h-full object-contain" aria-label="Video" />
                  : <span className="flex flex-col items-center gap-2 text-white/70 text-sm"><VideoOff className="w-8 h-8 shrink-0" />Video tidak lagi tersedia</span>)
                : <img src={x.photo} alt={x.text || 'Gambar'} className="w-full h-full object-contain" />}
            </div>
          ))}
        </div>
        {at > 0 && <button aria-label="Sebelum" onClick={() => go(at - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center"><ChevronLeft className="w-6 h-6 shrink-0" /></button>}
        {at < items.length - 1 && <button aria-label="Seterusnya" onClick={() => go(at + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 flex items-center justify-center"><ChevronRight className="w-6 h-6 shrink-0" /></button>}
      </div>
      <p className="w-full px-5 py-4 text-[15px] leading-[22px] text-center whitespace-pre-wrap break-words">{m?.text || ' '}</p>
    </div>
  );
}
