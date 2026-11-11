import { useEffect, useState } from 'react';
import { Check, MessageCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store';
import { nav } from '../../router';
import type { Vendor } from '../../data/types';
import { Button, Divider, EmptyState, Img, Pill, Stars, cx, fmtDate, rm } from '../../components/ui';
import { effective } from '../booking/BookingList';
import { loadReviews, reviewsChanged } from './reviews';

export function PackagesTab({ v, onBook }: { v: Vendor; onBook: (pkgId: string) => void }) {
  return (
    <>
      <h2 className="w-full text-xl font-semibold">Pakej</h2>
      {v.packages.map(p => (
        <div key={p.id} className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
          <div className="w-full flex flex-row items-center gap-3">
            <h3 className="flex-1 min-w-0 text-base font-semibold">{p.name}</h3>
            <span className="w-fit text-lg font-bold num">{rm(p.price)}</span>
          </div>
          <div className="w-full flex flex-col gap-2">
            {p.includes.map(i => (
              <div key={i} className="w-full flex flex-row items-center gap-2 text-sm text-body">
                <Check className="w-4 h-4 shrink-0 text-hijau" /><span className="flex-1 min-w-0">{i}</span>
              </div>
            ))}
          </div>
          <Divider />
          <div className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">Deposit {p.depositPct}% · {p.plan.length} kali bayaran</span>
            {p.plan.map(i => (
              <div key={i.label} className="w-full flex flex-row items-center gap-2 text-sm text-body">
                <span className="flex-1 min-w-0">{i.label} ({i.pct}%)</span>
                <span className="w-fit text-muted">{i.daysBefore === null ? 'dalam 30 hari' : `${i.daysBefore} hari sebelum majlis`}</span>
              </div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => onBook(p.id)}>Pilih pakej ini</Button>
        </div>
      ))}
      <Calendar v={v} />
    </>
  );
}

/** Feb 2027 availability, the month of the demo event (spec C-2.2) */
function Calendar({ v }: { v: Vendor }) {
  const { s } = useStore();
  const ev = s.event?.date ?? '2027-02-14';
  const [y, m] = ev.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const iso = (d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const cells = [...Array(first).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)];
  // OD10: a date is held while a customer's deposit is due. Mine = my deposit_due booking; others = demo hold.
  // The customer's own dates always win over "taken", so her lock never reads as someone else's (PM audit B2).
  const mineHeld = s.bookings.filter(b => b.vendorId === v.id && effective(b) === 'deposit_due').map(b => b.date);
  const mineBooked = s.bookings.filter(b => b.vendorId === v.id && ['confirmed', 'completed', 'reviewed'].includes(effective(b))).map(b => b.date);
  const mineAsked = s.bookings.filter(b => b.vendorId === v.id && ['requested', 'accepted'].includes(effective(b))).map(b => b.date);
  const isMine = (d: string) => mineBooked.includes(d) || mineHeld.includes(d) || mineAsked.includes(d);
  const evBusy = v.busy.includes(ev) && !isMine(ev);
  const evText = mineBooked.includes(ev) ? ['bg-pucuk-50 text-hijau', 'tempahan anda, tarikh sudah dikunci']
    : mineHeld.includes(ev) ? ['bg-amaran-50 text-amaran', 'ditahan untuk anda, bayar deposit untuk kunci']
      : mineAsked.includes(ev) ? ['bg-pucuk-50 text-hijau', 'permintaan anda sedang menunggu jawapan vendor']
        : evBusy ? ['bg-bahaya-50 text-bahaya', 'sudah ditempah'] : ['bg-pucuk-50 text-hijau', 'masih kosong'];
  const othersHeld = v.id % 2 === 0 && !v.busy.includes(`${y}-${String(m).padStart(2, '0')}-20`) ? [`${y}-${String(m).padStart(2, '0')}-20`] : [];
  return (
    <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
      <h2 className="w-full text-xl font-semibold">Kekosongan · {fmtDate(iso(1)).replace(/^1 /, '')}</h2>
      <div className={cx('w-full flex flex-row items-center gap-2 p-3 rounded-xl text-sm font-semibold', evText[0])}>
        <span className="flex-1 min-w-0">Tarikh majlis anda ({fmtDate(ev)}): {evText[1]}</span>
      </div>
      <div className="w-full grid grid-cols-7 gap-1 text-center">
        {['A', 'I', 'S', 'R', 'K', 'J', 'S'].map((d, i) => <span key={i} className="text-xs font-semibold text-muted">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const own = mineBooked.includes(iso(d));
          const busy = !isMine(iso(d)) && v.busy.includes(iso(d));
          const held = !busy && !own && (mineHeld.includes(iso(d)) || othersHeld.includes(iso(d)));
          const mine = iso(d) === ev;
          const label = own ? 'tempahan anda' : busy ? 'ditempah' : held ? (mineHeld.includes(iso(d)) ? 'ditahan untuk anda' : 'ditahan, menunggu deposit') : mineAsked.includes(iso(d)) ? 'kosong, permintaan anda dihantar' : 'kosong';
          return (
            <span key={i} role="img" aria-label={`${d}: ${label}${mine ? ', tarikh majlis anda' : ''}`}
              className={cx('h-10 flex items-center justify-center rounded-full text-sm num', own ? 'text-white bg-hijau font-semibold' : busy ? 'text-muted line-through bg-skeleton' : held ? 'text-amaran bg-amaran-50 border border-dashed border-amaran' : 'text-ink', mine && 'ring-2 ring-hijau font-bold')}>
              {d}
            </span>
          );
        })}
      </div>
      <div className="w-full flex flex-row flex-wrap items-center gap-4 text-xs text-body">
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-3 h-3 shrink-0 rounded-full bg-white border border-line2" />Kosong</span>
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-3 h-3 shrink-0 rounded-full bg-skeleton" />Ditempah (bergaris)</span>
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-3 h-3 shrink-0 rounded-full bg-amaran-50 border border-dashed border-amaran" />Ditahan (deposit belum dibayar)</span>
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-3 h-3 shrink-0 rounded-full ring-2 ring-hijau" />Tarikh majlis anda</span>
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-3 h-3 shrink-0 rounded-full bg-hijau" />Tempahan anda</span>
      </div>
    </div>
  );
}

export function ReviewsTab({ v }: { v: Vendor }) {
  const [mine, setMine] = useState(() => loadReviews().filter(r => r.vendorId === v.id));
  useEffect(() => {
    const on = () => setMine(loadReviews().filter(r => r.vendorId === v.id));
    window.addEventListener(reviewsChanged, on);
    return () => window.removeEventListener(reviewsChanged, on);
  }, [v.id]);
  const all = [...mine.map(r => ({ name: r.name, rating: r.rating, date: fmtDate(r.at).replace(/^\d+ /, ''), text: r.text, photos: r.photos, reply: undefined as string | undefined, isNew: true })),
    ...v.sampleReviews.map(r => ({ ...r, photos: [] as string[], isNew: false }))];
  // ponytail: 5→1 breakdown estimated from the average (mock has no per-star counts); use real counts with a backend
  const five = Math.min(95, Math.max(40, Math.round((v.rating - 4) * 85 + 10)));
  const dist = [five, ...[0.7, 0.2, 0.06, 0.04].map(f => Math.round((100 - five) * f))];
  if (!all.length) return <EmptyState icon={<ShieldCheck className="w-6 h-6" />} title="Belum ada ulasan" body="Ulasan hanya datang daripada pelanggan yang selesai menempah melalui Majlis Hub." />;
  return (
    <>
      <div className="w-full flex flex-row items-center gap-5 p-5 rounded-2xl bg-white border border-line">
        <div className="w-fit flex flex-col items-center gap-1">
          <span className="w-fit font-display text-5xl leading-[52px] font-semibold num">{v.rating.toFixed(1)}</span>
          <Stars n={v.rating} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {dist.map((p, i) => (
            <div key={i} className="w-full flex flex-row items-center gap-2 text-xs text-muted">
              <span className="w-3 shrink-0 num">{5 - i}</span>
              <span className="flex-1 min-w-0 h-1.5 rounded-full bg-skeleton overflow-hidden"><span className="block h-full bg-ink" style={{ width: `${p}%` }} /></span>
            </div>
          ))}
        </div>
      </div>
      {all.map(rv => (
        <div key={rv.name + rv.text.slice(0, 12)} className="w-full flex flex-col gap-2.5 p-5 rounded-2xl bg-white border border-line">
          <div className="w-full flex flex-row items-center gap-3">
            <span className="w-10 h-10 shrink-0 rounded-full bg-pucuk-100 text-hijau text-sm font-bold flex items-center justify-center">{rv.name[0]}</span>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="w-full text-sm font-semibold">{rv.name}</span>
              <span className="w-full text-xs text-muted">{rv.isNew ? 'Baru · ' : ''}Perkahwinan · {rv.date}</span>
            </div>
            <Stars n={rv.rating} size={12} />
          </div>
          <Pill><ShieldCheck className="w-3.5 h-3.5 shrink-0" />Tempahan melalui Majlis Hub</Pill>
          <p className="w-full text-[15px] leading-[22px] text-body">{rv.text}</p>
          {rv.photos.length > 0 && (
            <div className="w-full flex flex-row flex-wrap gap-2">{rv.photos.map(g => <Img key={g} src={g} cat={v.cat} alt="Gambar daripada pelanggan" className="w-16 h-16 shrink-0 rounded-xl" />)}</div>
          )}
          {rv.reply && (
            <div className="w-full flex flex-col gap-1 p-3 rounded-xl bg-pucuk-50">
              <span className="w-full text-xs font-semibold text-hijau">Balasan {v.name}</span>
              <span className="w-full text-sm text-body">{rv.reply}</span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export function PortfolioTab({ v }: { v: Vendor }) {
  const pics = [...v.gallery, ...v.gallery];
  const rows = Array.from({ length: Math.ceil(pics.length / 2) }, (_, i) => pics.slice(i * 2, i * 2 + 2));
  return (
    <div className="w-full flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="w-full flex flex-row gap-2">
          {row.map((g, j) => <Img key={j} src={g} cat={v.cat} alt={`Portfolio ${v.name} ${i * 2 + j + 1}`} className="flex-1 min-w-0 aspect-square rounded-xl" />)}
        </div>
      ))}
    </div>
  );
}

export function AboutTab({ v }: { v: Vendor }) {
  const rows: [string, string][] = [['Kawasan', `${v.area}, ${v.state}`], ['Disahkan sejak', v.since], ['Masa balas', v.reply], ['Polisi pembatalan', v.cancelPolicy]];
  return (
    <>
      <p className="w-full text-[15px] leading-[22px] text-body">{v.about}</p>
      <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
        {rows.map(([k, val]) => (
          <div key={k} className="w-full flex flex-row items-start gap-3 text-sm">
            <span className="w-[120px] shrink-0 text-muted">{k}</span>
            <span className="flex-1 min-w-0">{val}</span>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={() => nav(`/mesej/${v.id}`)}><MessageCircle className="w-4 h-4 shrink-0" />Mesej vendor</Button>
    </>
  );
}
