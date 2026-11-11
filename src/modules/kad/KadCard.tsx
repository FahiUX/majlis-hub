import { MapPin } from 'lucide-react';
import { cx, fmtDate } from '../../components/ui';
import type { Invitation } from '../../data/types';

export type Accent = 'hijau' | 'emas' | 'malam';
/** photo + accent live on the invitation; ponytail: typed locally until types.ts gains `photo`/`accent` */
export type KadInv = Invitation & { photo?: string; accent?: Accent };
export const PHOTOS: { src: string; name: string }[] = [
  { src: '', name: 'Tiada foto' },
  { src: 'img/gen/couple.jpg', name: 'Taman' },
  { src: 'img/gen/planning.jpg', name: 'Kafe' },
];
export const ACCENTS: { id: Accent; name: string; swatch: string }[] = [
  { id: 'hijau', name: 'Hijau', swatch: 'bg-hijau' },
  { id: 'emas', name: 'Emas', swatch: 'bg-emas' },
  { id: 'malam', name: 'Malam', swatch: 'bg-malam' },
];
const DEFAULT_ACCENT: Record<Invitation['template'], Accent> = { songket: 'emas', krim: 'emas', moden: 'hijau', emas: 'emas' };
/** accent text colour: dark songket card needs light tones */
const accentCls = (t: Invitation['template'], a: Accent) =>
  t === 'songket' ? { hijau: 'text-pucuk-200', emas: 'text-emas', malam: 'text-white' }[a] : { hijau: 'text-hijau', emas: 'text-emas-teks', malam: 'text-malam' }[a];

type T = Invitation['template'];
export const TEMPLATES: { id: T; name: string }[] = [
  { id: 'songket', name: 'Songket Hijau' },
  { id: 'krim', name: 'Klasik Krim' },
  { id: 'moden', name: 'Moden Minimal' },
  { id: 'emas', name: 'Bunga Emas' },
];

const SKIN: Record<T, { card: string; ink: string; soft: string; accent: string; rule: string }> = {
  songket: { card: 'bg-malam', ink: 'text-white', soft: 'text-pucuk-200', accent: 'text-emas', rule: 'bg-emas/60' },
  krim: { card: 'bg-kertas border border-emas/40', ink: 'text-ink', soft: 'text-body', accent: 'text-emas-teks', rule: 'bg-emas/50' },
  moden: { card: 'bg-white border border-line', ink: 'text-hijau', soft: 'text-muted', accent: 'text-hijau', rule: 'bg-hijau/30' },
  emas: { card: 'bg-emas-50', ink: 'text-ink', soft: 'text-body', accent: 'text-emas-teks', rule: 'bg-emas/60' },
};

/** names shrink so long ones still fit one card width */
const nameSize = (n: string) => (n.length > 22 ? 'text-[22px] leading-7' : n.length > 15 ? 'text-[26px] leading-8' : 'text-[32px] leading-10');

/** songket diamond lattice, gold on green (real SVG, not a pseudo-element) */
const Songket = () => (
  <svg aria-hidden="true" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none text-emas">
    <defs>
      <pattern id="kad-songket" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20 4 36 20 20 36 4 20Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M20 13 27 20 20 27 13 20Z" fill="currentColor" fillOpacity=".5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#kad-songket)" />
  </svg>
);

/** gold floral corner, mirrored into all four corners */
const Corner = ({ className }: { className: string }) => (
  <svg aria-hidden="true" viewBox="0 0 80 80" className={cx('absolute w-20 h-20 pointer-events-none text-emas', className)}>
    <path d="M4 76C4 36 36 4 76 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 76C14 42 42 14 76 14" fill="none" stroke="currentColor" strokeWidth=".8" />
    <circle cx="24" cy="24" r="7" fill="currentColor" fillOpacity=".35" />
    <circle cx="24" cy="24" r="3" fill="currentColor" />
    <path d="M24 10c4 6 4 8 0 14-4-6-4-8 0-14ZM10 24c6-4 8-4 14 0-6 4-8 4-14 0Z" fill="currentColor" fillOpacity=".6" />
  </svg>
);

/** thin line art for the cream template */
const LineArt = () => (
  <svg aria-hidden="true" viewBox="0 0 200 24" className="w-[160px] h-[19px] shrink-0 text-emas">
    <path d="M0 12h76M124 12h76" stroke="currentColor" strokeWidth="1" />
    <path d="M100 2l10 10-10 10-10-10Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="100" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

export function KadCard({ inv }: { inv: KadInv }) {
  const k = { ...SKIN[inv.template], accent: accentCls(inv.template, inv.accent ?? DEFAULT_ACCENT[inv.template]) };
  const couple = `${inv.bride} & ${inv.groom}`;
  return (
    <article aria-label="Kad kahwin digital" className={cx('relative w-full flex flex-col items-center gap-5 p-8 rounded-2xl overflow-hidden text-center', k.card)}>
      {inv.template === 'songket' && <Songket />}
      {inv.template === 'emas' && (
        <>
          <Corner className="top-0 left-0" />
          <Corner className="top-0 right-0 -scale-x-100" />
          <Corner className="bottom-0 left-0 -scale-y-100" />
          <Corner className="bottom-0 right-0 -scale-100" />
        </>
      )}
      <div className="relative w-full flex flex-col items-center gap-5">
        {inv.photo && <img src={inv.photo} alt={`Foto ${inv.bride} dan ${inv.groom}`} className="w-24 h-24 shrink-0 rounded-full object-cover border-2 border-white/80" />}
        <p className={cx('w-full self-stretch text-xs font-semibold tracking-[.2em] uppercase', k.accent)}>Walimatul Urus</p>
        {inv.template === 'krim' ? <LineArt /> : <div className={cx('w-16 h-px shrink-0', k.rule)} />}
        <p className={cx('w-full self-stretch text-sm italic', k.soft)}>{inv.ayat}</p>
        <p className={cx('w-full self-stretch text-sm', k.soft)}>Dengan segala hormatnya kami {inv.parents || '…'} menjemput ke majlis perkahwinan anakanda kami</p>
        <h2 className={cx('w-full self-stretch font-display font-semibold', nameSize(couple), k.ink)}>{inv.bride || 'Pengantin perempuan'}<span className={cx('block text-lg', k.accent)}>&amp;</span>{inv.groom || 'Pengantin lelaki'}</h2>
        <div className={cx('w-16 h-px shrink-0', k.rule)} />
        <div className="w-full self-stretch flex flex-col gap-1">
          <p className={cx('w-full text-base font-semibold num', k.ink)}>{inv.date ? fmtDate(inv.date, true) : 'Tarikh'}</p>
          <p className={cx('w-full text-sm num', k.soft)}>{inv.time}</p>
        </div>
        <div className="w-full self-stretch flex flex-col items-center gap-2">
          <p className={cx('w-full text-sm font-medium', k.ink)}>{inv.venue}</p>
          {inv.mapUrl && (
            <a href={inv.mapUrl} target="_blank" rel="noreferrer" className={cx('inline-flex flex-row items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold w-fit border', k.accent, inv.template === 'songket' ? 'border-emas/50' : 'border-current/30')}>
              <MapPin className="w-3.5 h-3.5 shrink-0" />Lihat peta
            </a>
          )}
        </div>
        {inv.aturcara.length > 0 && (
          <div className="w-full self-stretch flex flex-col gap-2">
            <p className={cx('w-full text-xs font-semibold tracking-[.15em] uppercase', k.accent)}>Aturcara</p>
            {inv.aturcara.map((a, i) => (
              <div key={i} className="w-full flex flex-row items-center gap-3 text-sm">
                <span className={cx('w-[84px] shrink-0 text-right num', k.soft)}>{a.time}</span>
                <span className={cx('flex-1 min-w-0 text-left', k.ink)}>{a.item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
