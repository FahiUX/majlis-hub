import { ChevronRight, LogIn, Play, Search, ShieldCheck, SlidersHorizontal, Star, Tag, CalendarPlus } from 'lucide-react';
import { useStore, TODAY, daysBetween } from '../../store';
import { nav } from '../../router';
import { Button, cx } from '../../components/ui';
import { CATS, REELS, VENDORS, vendorById } from '../../data/mock';
import { MiniVendorCard } from '../search/VendorCard';

const SONGKET = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 4 36 20 20 36 4 20Z' fill='none' stroke='%23B9DFCD' stroke-width='1'/%3E%3Cpath d='M20 14 26 20 20 26 14 20Z' fill='%23B98A2E'/%3E%3C/svg%3E\")";

/** countdown ring: gold arc = share of categories with a confirmed vendor */
function Ring({ days, pct }: { days: number; pct: number }) {
  const r = 29, c = 2 * Math.PI * r;
  return (
    <span className="relative w-16 h-16 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 w-16 h-16 -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="#B98A2E" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`} />
      </svg>
      <span className="relative w-fit flex flex-col items-center">
        <b className="w-fit font-display text-xl leading-5 font-semibold num">{days}</b>
        <small className="w-fit text-[10px] font-semibold tracking-wider uppercase text-pucuk-200">Hari</small>
      </span>
    </span>
  );
}

function SectionHead({ title, link, to }: { title: string; link?: string; to?: string }) {
  return (
    <div className="w-full flex flex-row items-center gap-2">
      <h2 className="flex-1 min-w-0 text-xl leading-[26px] font-semibold">{title}</h2>
      {link && to && <button onClick={() => nav(to)} className="w-fit shrink-0 py-2 text-sm font-semibold text-hijau">{link}</button>}
    </div>
  );
}

function Hero() {
  const { s } = useStore();
  const ev = s.event;
  const confirmed = s.bookings.filter(b => ['confirmed', 'completed', 'reviewed'].includes(b.status)).length;
  const total = ev?.cats.length ?? 0;
  return (
    <section className="relative w-full flex flex-col overflow-hidden text-white"
      style={{ background: 'radial-gradient(120% 80% at 100% 0%, rgba(185,138,46,.22) 0%, rgba(185,138,46,0) 55%), linear-gradient(170deg, #062E25 0%, #0A4A3B 55%, #0E5E4B 100%)' }}>
      {/* songket pattern layer, fading out downward */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-[.16]"
        style={{ backgroundImage: SONGKET, maskImage: 'linear-gradient(180deg,#000 30%,transparent 100%)', WebkitMaskImage: 'linear-gradient(180deg,#000 30%,transparent 100%)' }} />
      <div className="relative w-full flex flex-col gap-5 px-4 py-5">
        <span className="w-fit flex flex-row items-center gap-2 text-base font-bold">
          <span className="w-8 h-8 shrink-0 rounded-lg bg-white text-hijau font-display text-lg flex items-center justify-center">M</span>Majlis Hub
        </span>
        <div className="w-full flex flex-col gap-1">
          <p className="w-full text-sm text-pucuk-200">{s.authed ? `Assalamualaikum, ${s.userName}` : 'Assalamualaikum'}</p>
          <h1 className="w-full font-display text-[28px] leading-[34px] font-semibold">Apa yang anda perlukan untuk majlis?</h1>
        </div>
        <div className="w-full flex flex-row items-center gap-2 py-1.5 pl-[18px] pr-1.5 rounded-full bg-white text-ink shadow-float">
          <button onClick={() => nav('/cari?focus=1')} className="flex-1 min-w-0 flex flex-row items-center gap-2 py-2.5 text-left">
            <Search className="w-5 h-5 shrink-0 text-muted" /><span className="flex-1 min-w-0 text-[15px] text-muted">Cari jurugambar, MC, pelamin…</span>
          </button>
          <button aria-label="Tapis carian" onClick={() => nav('/cari')} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center"><SlidersHorizontal className="w-5 h-5 shrink-0" /></button>
        </div>
        {!s.authed ? (
          <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white/[.06]">
            <p className="w-full text-base font-semibold">Rancang majlis anda di satu tempat</p>
            <p className="w-full text-sm text-pucuk-200">Log masuk untuk simpan vendor, hantar tempahan dan urus bajet.</p>
            <Button className="!bg-white !text-hijau" onClick={() => nav('/masuk')}><LogIn className="w-4 h-4 shrink-0" />Log masuk</Button>
          </div>
        ) : ev ? (
          <button onClick={() => nav('/majlis')} className="w-full flex flex-row items-center gap-3.5 p-4 rounded-2xl bg-white/[.06] text-left" aria-label={`${ev.name}, ${daysBetween(TODAY, ev.date)} hari lagi`}>
            <Ring days={Math.max(0, daysBetween(TODAY, ev.date))} pct={total ? (confirmed / total) * 100 : 0} />
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="w-full font-display text-lg leading-6 font-semibold">{ev.name}</span>
              <span className="w-full text-[13px] text-pucuk-200">{new Date(ev.date + 'T00:00:00').toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {ev.pax} pax</span>
              <span className="w-full text-[13px] text-pucuk-200">{confirmed}/{total} vendor disahkan</span>
            </span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        ) : (
          <button onClick={() => nav('/majlis/baru')} className="w-full flex flex-row items-center gap-3 p-4 rounded-2xl bg-white/[.06] text-left">
            <CalendarPlus className="w-6 h-6 shrink-0 text-emas" />
            <span className="flex-1 min-w-0 text-base font-semibold">Mula rancang majlis anda</span>
            <ChevronRight className="w-5 h-5 shrink-0" />
          </button>
        )}
      </div>
      {/* green-to-white fade: a real layer so it exports to Figma */}
      <div aria-hidden="true" className="relative w-full h-[120px] shrink-0"
        style={{ background: 'linear-gradient(180deg, rgba(251,250,247,0) 0%, rgba(251,250,247,.08) 20%, rgba(251,250,247,.25) 40%, rgba(251,250,247,.5) 60%, rgba(251,250,247,.8) 80%, #FBFAF7 100%)' }} />
    </section>
  );
}

const TRUST = [
  { Icon: ShieldCheck, t: 'Setiap vendor disahkan', d: 'Kami semak SSM atau IC sebelum vendor boleh terima tempahan.' },
  { Icon: Star, t: 'Ulasan sebenar sahaja', d: 'Hanya pelanggan yang selesai tempah melalui Majlis Hub boleh mengulas.' },
  { Icon: Tag, t: 'Harga jelas, tarikh dikunci', d: 'Harga RM tertera. Bayar deposit dalam 30 hari dan tarikh anda selamat.' },
];

export default function HomeScreen() {
  const near = VENDORS.filter(v => v.km <= 30).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 6);
  return (
    <div className="w-full flex flex-col">
      <Hero />
      <div className="w-full flex flex-col gap-8 p-4">
        <section className="w-full flex flex-col gap-3">
          <SectionHead title="Kategori" link="Lihat semua" to="/cari" />
          <div className="w-full grid grid-cols-4 gap-2">
            {CATS.map(c => (
              <button key={c.id} onClick={() => nav('/cari?cat=' + c.id)} className="w-full flex flex-col items-center gap-1 p-2 rounded-2xl bg-white border border-line text-center">
                <img src={`img/cat/${c.art}.png`} alt="" className="w-14 h-14 shrink-0 object-contain" style={{ filter: 'drop-shadow(0 6px 6px rgba(14,94,75,.28))' }}
                  onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                <span className="w-full text-xs leading-4 font-semibold">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="w-full flex flex-col gap-3">
          <SectionHead title="Tonton inspirasi" link="Lihat semua" to="/inspirasi" />
          <div className="w-full flex flex-row gap-3 overflow-x-auto">
            {REELS.map(r => (
              <button key={r.id} onClick={() => nav('/inspirasi?v=' + r.id)} className="relative w-[132px] h-[200px] shrink-0 rounded-xl overflow-hidden bg-malam text-left text-white">
                <img src={r.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute inset-0 p-2.5 flex flex-col justify-between" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,.7) 100%)' }}>
                  <span className="w-fit flex flex-row items-center gap-1 text-xs font-semibold"><Play className="w-3.5 h-3.5 shrink-0 fill-white" />{r.views}</span>
                  <span className="w-full flex flex-col gap-0.5">
                    <span className="w-full text-[13px] leading-4 font-semibold">{r.title}</span>
                    <span className="w-full text-[11px] text-white/80">{vendorById(r.vendorId)?.name}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="w-full flex flex-col gap-3">
          <SectionHead title="Vendor disahkan berhampiran" link="Lihat semua" to="/cari?sort=top&km=30" />
          <div className="w-full flex flex-row gap-3 overflow-x-auto">{near.map(v => <MiniVendorCard key={v.id} v={v} />)}</div>
        </section>

        <section className={cx('w-full flex flex-col gap-3 p-4 rounded-2xl bg-pucuk-50')} aria-label="Kenapa Majlis Hub">
          {TRUST.map(({ Icon, t, d }) => (
            <div key={t} className="w-full flex flex-row items-start gap-3">
              <span className="w-9 h-9 shrink-0 rounded-full bg-white text-hijau flex items-center justify-center"><Icon className="w-[18px] h-[18px] shrink-0" /></span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="w-full text-sm font-semibold">{t}</span>
                <span className="w-full text-[13px] text-body">{d}</span>
              </span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
