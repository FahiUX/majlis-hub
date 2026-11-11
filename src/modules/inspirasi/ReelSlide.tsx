import { useEffect, useRef, useState } from 'react';
import { Bookmark, ChevronRight, Ellipsis, Heart, MapPin, MessageCircle, Play, Plus, Share2 } from 'lucide-react';
import { VerifiedBadge, cx, rm } from '../../components/ui';
import { catById, fromPrice, vendorById } from '../../data/mock';
import { nav } from '../../router';
import type { Reel } from '../../data/types';

const fmtN = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'K' : String(n));

export interface SlideProps {
  reel: Reel;
  liked: boolean; saved: boolean; followed: boolean; commentCount: number;
  onLike: () => void; onSave: () => void; onFollow: () => void;
  onComments: () => void; onShare: () => void; onReport: () => void;
}

export function ReelSlide({ reel, liked, saved, followed, commentCount, onLike, onSave, onFollow, onComments, onShare, onReport }: SlideProps) {
  const v = vendorById(reel.vendorId)!;
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const tap = useRef<{ at: number; t?: number }>({ at: 0 });

  // autoplay only the slide that is mostly on screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (active && !paused) el.play().catch(() => setNoVideo(true)); else el.pause();
    if (!active) setPaused(false);
  }, [active, paused]);

  // single tap = pause/play, double tap = like with a gold burst
  const onTap = () => {
    const now = Date.now();
    if (now - tap.current.at < 280) {
      window.clearTimeout(tap.current.t);
      tap.current.at = 0;
      if (!liked) onLike();
      setBurst(b => b + 1);
      return;
    }
    tap.current.at = now;
    tap.current.t = window.setTimeout(() => setPaused(p => !p), 280);
  };

  const short = reel.desc.length > 80 && !open;
  const rail = 'w-12 shrink-0 flex flex-col items-center gap-1 text-xs font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,.6)]';
  const railIcon = 'w-[30px] h-[30px] shrink-0 drop-shadow';

  return (
    <article ref={root} aria-label={reel.title} className="relative w-full h-full shrink-0 snap-start snap-always overflow-hidden bg-black text-white">
      <button aria-label={paused ? 'Main video' : 'Jeda video'} onClick={onTap} className="absolute inset-0 w-full h-full cursor-default">
        <img src={reel.poster} alt="" className={cx('absolute inset-0 w-full h-full object-cover', noVideo && active && !paused && 'animate-[kenburns_10s_ease-in-out_infinite_alternate]')} />
        {!noVideo && <video ref={video} src={reel.video} poster={reel.poster} muted playsInline loop preload="metadata" onError={() => setNoVideo(true)} className="absolute inset-0 w-full h-full object-cover" />}
      </button>
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(0,0,0,.5)_0,rgba(0,0,0,0)_20%,rgba(0,0,0,0)_42%,rgba(0,0,0,.82)_100%)]" />
      {/* right-edge scrim so the white rail stays readable over light footage (QA W14) */}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 w-24 pointer-events-none bg-gradient-to-l from-black/40 to-transparent" />
      {paused && <span aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-black/45 flex items-center justify-center pointer-events-none"><Play className="w-8 h-8 shrink-0 fill-white" /></span>}
      {burst > 0 && <Heart key={burst} aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 fill-emas text-emas pointer-events-none animate-[pop_.8s_ease-out_forwards]" />}

      <div className="absolute right-2 bottom-[100px] z-10 flex flex-col items-center gap-4">
        <div className="relative w-12 h-14 shrink-0 flex flex-col items-center">
          <button aria-label={`Profil ${v.name}`} onClick={() => nav('/vendor/' + v.id)} className="w-12 h-12 shrink-0 rounded-full border-2 border-white overflow-hidden bg-pucuk-100">
            <img src={v.img} alt="" className="w-full h-full object-cover" />
          </button>
          {!followed && <button aria-label={`Ikut ${v.name}`} onClick={onFollow} className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-hijau text-white flex items-center justify-center"><Plus className="w-4 h-4 shrink-0" /></button>}
        </div>
        <button aria-label="Suka" aria-pressed={liked} onClick={onLike} className={rail}><Heart className={cx(railIcon, liked && 'fill-emas text-emas')} />{fmtN(reel.likes + (liked ? 1 : 0))}</button>
        <button aria-label="Komen" onClick={onComments} className={rail}><MessageCircle className={railIcon} />{fmtN(commentCount)}</button>
        <button aria-label="Simpan" aria-pressed={saved} onClick={onSave} className={rail}><Bookmark className={cx(railIcon, saved && 'fill-white')} />{saved ? 'Disimpan' : 'Simpan'}</button>
        <button aria-label="Kongsi" onClick={onShare} className={rail}><Share2 className={railIcon} />{fmtN(reel.shares)}</button>
        <button aria-label="Lagi pilihan" onClick={onReport} className={rail}><Ellipsis className={railIcon} /></button>
      </div>

      <div className="absolute left-4 right-[76px] bottom-6 z-10 flex flex-col gap-1.5 [text-shadow:0_1px_6px_rgba(0,0,0,.5)]">
        <button onClick={() => nav('/vendor/' + v.id)} className="w-full flex flex-row flex-wrap items-center gap-2 text-left">
          <span className="w-fit text-[15px] font-bold">{v.name}</span>
          <span className="w-fit [text-shadow:none]"><VerifiedBadge v={v} onPhoto /></span>
        </button>
        <h2 className="w-full text-[17px] leading-snug font-bold">{reel.title}</h2>
        <p className="w-full flex flex-row items-center gap-1 text-[13px]"><MapPin className="w-3.5 h-3.5 shrink-0" />{reel.loc} · {v.km} km · {catById(v.cat).name}</p>
        <p className="w-full text-sm leading-snug">
          {short ? reel.desc.slice(0, 80).trimEnd() + '… ' : reel.desc + ' '}
          {!short && <span className="font-semibold">{reel.tags}</span>}
        </p>
        {reel.desc.length > 80 && <button onClick={() => setOpen(o => !o)} className="w-fit py-3 text-[13px] leading-5 font-bold">{open ? 'Tutup' : 'lagi'}</button>}
        <span className="relative w-full h-[3px] shrink-0 rounded-full bg-white/30 overflow-hidden" aria-hidden="true">
          {active && !paused && <span className="absolute inset-y-0 left-0 w-full origin-left bg-white animate-[grow_10s_linear_infinite]" />}
        </span>
        <button onClick={() => nav('/vendor/' + v.id)} className="w-full flex flex-row items-center gap-2 px-3 py-2.5 rounded-xl bg-white/16 backdrop-blur border border-white/28 text-sm font-semibold [text-shadow:none]">
          <span className="flex-1 min-w-0 text-left">Lihat pakej · dari {rm(fromPrice(v))}</span>
          <ChevronRight className="w-4 h-4 shrink-0" />
        </button>
      </div>
    </article>
  );
}
