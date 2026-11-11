import type { ReactNode } from 'react';
import { BadgeCheck, Check, ShieldCheck, Star, X } from 'lucide-react';
import { Img, rm } from '../../components/ui';
import { catById, fromPrice } from '../../data/mock';
import type { Booking, MajlisEvent, Vendor } from '../../data/types';
import { OPEN, effective } from '../booking/money';

/** "30 min" / "2 jam" -> minutes */
export const replyMins = (r: string) => (r.includes('min') ? parseInt(r) : parseInt(r) * 60);
const mainPkg = (v: Vendor) => v.packages[1] ?? v.packages[0];

export interface Row {
  label: string;
  /** fixed row height so the label column and vendor columns line up */
  h: string;
  cell: (v: Vendor) => ReactNode;
  /** numeric score, higher = better; omitted = no "best" highlight */
  score?: (v: Vendor) => number;
}

/** the customer's own open booking with this vendor on the event date (never shown as "Penuh") */
const ownOn = (v: Vendor, ev: MajlisEvent | null, bookings: Booking[]) => !!ev && bookings.some(b => b.vendorId === v.id && b.date === ev.date && OPEN.includes(effective(b)));
/** refund in RM if cancelled more than 60 days out, from this vendor's own package (policy: half the deposit back) */
const refund = (v: Vendor) => Math.round((mainPkg(v).price * mainPkg(v).depositPct) / 100 / 2);

export const rowsFor = (ev: MajlisEvent | null, bookings: Booking[], onPhoto: (v: Vendor, i: number) => void): Row[] => [
  { label: 'Harga dari', h: 'h-[52px]', cell: v => <b className="num">{rm(fromPrice(v))}</b>, score: v => -fromPrice(v) },
  { label: 'Rating', h: 'h-[52px]', cell: v => <b className="w-fit flex flex-row items-center gap-1 num"><Star className="w-3.5 h-3.5 shrink-0 fill-current" />{v.rating.toFixed(1)}</b>, score: v => v.rating },
  { label: 'Ulasan sebenar', h: 'h-[52px]', cell: v => <span className="num">{v.reviews}</span>, score: v => v.reviews },
  { label: 'Jarak', h: 'h-[52px]', cell: v => <span className="num">{v.km} km</span>, score: v => -v.km },
  { label: 'Disahkan', h: 'h-[52px]', cell: v => <span className="w-fit flex flex-row items-center gap-1 text-hijau">{v.freelancer ? <BadgeCheck className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}{v.freelancer ? 'Freelancer' : 'SSM'}</span> },
  {
    label: ev ? `Kosong ${new Date(ev.date + 'T00:00:00').getDate()} ${['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'][new Date(ev.date + 'T00:00:00').getMonth()]}?` : 'Kosong?',
    h: 'h-[52px]',
    cell: v => ownOn(v, ev, bookings) ? <span className="w-fit flex flex-row items-center gap-1 text-hijau"><Check className="w-4 h-4 shrink-0" />Tempahan anda</span>
      : ev && v.busy.includes(ev.date) ? <span className="w-fit flex flex-row items-center gap-1 text-bahaya"><X className="w-4 h-4 shrink-0" />Penuh</span> : <span className="w-fit flex flex-row items-center gap-1"><Check className="w-4 h-4 shrink-0" />Kosong</span>,
    score: v => (ev && v.busy.includes(ev.date) && !ownOn(v, ev, bookings) ? 0 : 1),
  },
  { label: 'Kandungan pakej', h: 'h-[136px]', cell: v => <span className="w-full flex flex-col gap-1 text-xs"><b className="w-full text-[13px]">{mainPkg(v).name}</b>{mainPkg(v).includes.slice(0, 3).map(i => <span key={i} className="w-full">{i}</span>)}</span>, score: v => mainPkg(v).includes.length },
  { label: 'Deposit', h: 'h-[52px]', cell: v => <span className="w-full flex flex-col num"><b>{rm((mainPkg(v).price * mainPkg(v).depositPct) / 100)}</b><span className="text-xs text-muted">{mainPkg(v).depositPct}% pakej ini</span></span>, score: v => -(mainPkg(v).price * mainPkg(v).depositPct) },
  { label: 'Ansuran', h: 'h-[52px]', cell: v => <span className="num">{mainPkg(v).plan.length} kali bayar</span>, score: v => mainPkg(v).plan.length },
  { label: 'Polisi batal', h: 'h-[72px]', cell: v => <span className="w-full text-xs">Batal &gt;60 hari: {rm(refund(v))} dipulangkan. &lt;60 hari: tiada.</span>, score: v => refund(v) },
  { label: 'Masa balas', h: 'h-[52px]', cell: v => <span>~{v.reply}</span>, score: v => -replyMins(v.reply) },
  { label: 'Di Majlis Hub sejak', h: 'h-[52px]', cell: v => <span className="num">{v.since}</span> },
  { label: 'Portfolio', h: 'h-[84px]', cell: v => <span className="w-full flex flex-row gap-1">{v.gallery.slice(0, 3).map((g, i) => (
    <button key={i} onClick={() => onPhoto(v, i)} aria-label={`Lihat foto ${i + 1} ${v.name}`} className="flex-1 min-w-0 h-[56px] rounded-xl overflow-hidden"><Img src={g} cat={v.cat} alt="" className="w-full h-full" /></button>
  ))}</span> },
];

export type Verdict = 'Nilai terbaik' | 'Rating tertinggi' | 'Dalam bajet anda';

export function verdicts(vs: Vendor[], ev: MajlisEvent | null): Record<number, Verdict[]> {
  const out: Record<number, Verdict[]> = Object.fromEntries(vs.map(v => [v.id, []]));
  const value = (v: Vendor) => v.rating / fromPrice(v);
  const bestValue = Math.max(...vs.map(value));
  const bestRating = Math.max(...vs.map(v => v.rating));
  vs.forEach(v => {
    if (value(v) === bestValue) out[v.id].push('Nilai terbaik');
    if (v.rating === bestRating) out[v.id].push('Rating tertinggi');
    if (ev) {
      const cap = (ev.budget * (ev.split[v.cat] ?? catById(v.cat).split)) / 100;
      if (fromPrice(v) <= cap) out[v.id].push('Dalam bajet anda');
    }
  });
  return out;
}

/** ids with the top score in a row (ties all win); none when every column is equal */
export const bestIds = (vs: Vendor[], score?: (v: Vendor) => number) => {
  if (!score) return [];
  const sc = vs.map(score);
  const top = Math.max(...sc);
  return sc.every(x => x === top) ? [] : vs.filter((_, i) => sc[i] === top).map(v => v.id);
};
