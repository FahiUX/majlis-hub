import { Check, Heart, Star } from 'lucide-react';
import { useStore, toggle } from '../../store';
import { nav } from '../../router';
import { Img, Stars, VerifiedBadge, cx, rm } from '../../components/ui';
import { catById, fromPrice, vendorById } from '../../data/mock';
import type { Vendor } from '../../data/types';

/** heart toggles the shortlist; guests go to login first */
export function HeartButton({ id, className }: { id: number; className?: string }) {
  const { s, set, toast } = useStore();
  const on = s.saved.includes(id);
  return (
    <button
      aria-label={on ? 'Buang dari simpanan' : 'Simpan vendor'} aria-pressed={on}
      onClick={e => {
        e.stopPropagation();
        // guest: log in first, then come back here and finish the save (?save=<id>)
        if (!s.authed) { const here = location.hash.slice(1) || '/'; return nav('/masuk?next=' + encodeURIComponent(here + (here.includes('?') ? '&' : '?') + 'save=' + id)); }
        set(p => ({ saved: toggle(p.saved, id) }));
        toast(on ? 'Dibuang dari simpanan' : 'Disimpan ke senarai pendek');
      }}
      className={cx('w-11 h-11 shrink-0 flex items-center justify-center pointer-events-auto', className)}
    >
      <span className="w-9 h-9 shrink-0 rounded-full bg-white/95 shadow-float flex items-center justify-center">
        <Heart className={cx('w-[18px] h-[18px] shrink-0', on ? 'fill-bahaya text-bahaya' : 'text-ink')} />
      </span>
    </button>
  );
}

/** compare checkbox: same category only, max 3 */
export function CompareCheck({ v }: { v: Vendor }) {
  const { s, set, toast } = useStore();
  const on = s.compare.includes(v.id);
  const other = s.compare.length > 0 && !on && vendorById(s.compare[0])?.cat !== v.cat;
  return (
    <button
      role="checkbox" aria-checked={on} aria-label={`Banding ${v.name}`}
      onClick={e => {
        e.stopPropagation();
        if (other) return toast('Hanya boleh banding vendor kategori yang sama');
        if (!on && s.compare.length >= 3) return toast('Maksimum 3 vendor untuk dibanding');
        set(p => ({ compare: toggle(p.compare, v.id) }));
      }}
      className="w-fit shrink-0 flex flex-row items-center gap-2 py-3 text-sm font-medium text-body"
    >
      <span className={cx('w-5 h-5 shrink-0 rounded-[6px] flex items-center justify-center', on ? 'bg-hijau text-white' : 'bg-white border-[1.5px] border-line2')}>
        {on && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />}
      </span>
      Banding
    </button>
  );
}

/** full-width result card: photo 4:3 with ONE overlay (verified pill + heart) */
export default function VendorCard({ v, compare = true }: { v: Vendor; compare?: boolean }) {
  return (
    <article className="w-full flex flex-col gap-3">
      <div className="relative w-full aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-skeleton">
        <button onClick={() => nav('/vendor/' + v.id)} className="w-full h-full" aria-label={`Lihat ${v.name}`}>
          <Img src={v.img} cat={v.cat} alt={v.name} className="w-full h-full" />
        </button>
        <div className="absolute inset-0 p-2 flex flex-row items-start justify-between pointer-events-none">
          <span className="p-1"><VerifiedBadge v={v} onPhoto /></span>
          <HeartButton id={v.id} />
        </div>
      </div>
      <div className="w-full flex flex-col gap-1">
        <div className="w-full flex flex-row items-center gap-2">
          <button onClick={() => nav('/vendor/' + v.id)} className="flex-1 min-w-0 text-left text-base font-semibold">{v.name}</button>
          <span className="w-fit shrink-0 flex flex-row items-center gap-1.5 text-sm font-semibold num"><Stars n={v.rating} size={12} />{v.rating.toFixed(1)}</span>
        </div>
        <p className="w-full text-sm text-muted">{catById(v.cat).name} · {v.area} · {v.km} km · {v.reviews} ulasan</p>
        <div className="w-full flex flex-row items-center gap-2">
          <p className="flex-1 min-w-0 text-[15px] text-ink"><span className="text-muted text-sm">dari </span><b className="font-bold num">{rm(fromPrice(v))}</b></p>
          {compare && <CompareCheck v={v} />}
        </div>
      </div>
    </article>
  );
}

/** small card for horizontal strips on Home */
export function MiniVendorCard({ v }: { v: Vendor }) {
  return (
    <button onClick={() => nav('/vendor/' + v.id)} className="w-[180px] shrink-0 flex flex-col gap-2 text-left">
      <span className="relative w-[180px] h-[135px] shrink-0 rounded-xl overflow-hidden bg-skeleton">
        <Img src={v.img} cat={v.cat} alt={v.name} className="w-full h-full" />
        <span className="absolute inset-0 p-2 flex flex-col justify-start pointer-events-none"><VerifiedBadge v={v} onPhoto /></span>
      </span>
      <span className="w-full text-sm font-semibold">{v.name}</span>
      <span className="w-full text-xs text-muted">{catById(v.cat).name} · {v.km} km</span>
      <span className="w-full flex flex-row items-center gap-1 text-sm num"><span className="text-muted text-xs">dari</span><b>{rm(fromPrice(v))}</b><span className="text-muted">·</span><Star className="w-3.5 h-3.5 shrink-0 fill-ink" />{v.rating.toFixed(1)}</span>
    </button>
  );
}
