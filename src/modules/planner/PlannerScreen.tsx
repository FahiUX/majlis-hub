import { Bookmark, CalendarHeart, ChevronRight, LogIn, MailOpen, MapPin, PiggyBank, Plus, ReceiptText, Users } from 'lucide-react';
import { CATS, catById, vendorById } from '../../data/mock';
import type { Booking, CategoryId } from '../../data/types';
import { TODAY, daysBetween, useStore } from '../../store';
import { nav } from '../../router';
import { Button, Divider, EmptyState, Pill, StatusChip, fmtDate, rm } from '../../components/ui';
import { DEAD, liveStatus, plan } from '../tabung/calc';
import { OPEN, effective } from '../booking/money';
import { CatArt } from './CatArt';
import MoneyBar from '../booking/MoneyBar';
import { CustomChecklist } from './CustomChecklist';

export default function PlannerScreen() {
  const { s } = useStore();
  const e = s.event;

  if (!s.authed) {
    return (
      <Page>
        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-pucuk-50">
          <p className="w-full text-base font-semibold">Log masuk untuk rancang majlis anda</p>
          <p className="w-full text-sm text-body">Senarai semak, bajet, kad kahwin dan tabung, semua di satu tempat.</p>
          <Button onClick={() => nav('/masuk?next=/majlis')}><LogIn className="w-4 h-4 shrink-0" />Log masuk</Button>
        </div>
      </Page>
    );
  }
  if (!e) {
    return (
      <Page>
        <EmptyState icon={<CalendarHeart className="w-6 h-6 shrink-0" />} title="Belum ada majlis" body="Cipta majlis anda dan kami cadangkan pakej vendor ikut bajet."
          action={<Button onClick={() => nav('/majlis/baru')}><Plus className="w-4 h-4 shrink-0" />Cipta majlis</Button>} />
      </Page>
    );
  }

  const days = Math.max(0, daysBetween(TODAY, e.date));
  const [day1, day2] = e.type === 'Perkahwinan' ? ['Akad', 'Sanding'] : ['Hari 1', 'Hari 2'];
  const bookingFor = (c: CategoryId): Booking | undefined =>
    [...s.bookings].reverse().find(b => vendorById(b.vendorId)?.cat === c && !DEAD.includes(liveStatus(b))) ??
    [...s.bookings].reverse().find(b => vendorById(b.vendorId)?.cat === c);
  const done = e.cats.filter(c => { const b = bookingFor(c); return !!b && ['confirmed', 'completed', 'reviewed'].includes(liveStatus(b)); }).length;
  const hadir = s.rsvps.filter(r => r.attending).reduce((t, r) => t + r.count, 0);
  const { monthly } = plan(s.bookings, s.tabung);

  return (
    <Page>
      <section className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-pucuk-50">
        <div className="w-full flex flex-row items-center gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <p className="w-full text-xs font-semibold text-hijau">{e.type}</p>
            <h2 className="w-full font-display text-[28px] leading-[34px] font-semibold">{e.name}</h2>
          </div>
          <div className="w-[72px] h-[72px] shrink-0 rounded-full bg-white flex flex-col items-center justify-center border-2 border-emas">
            <span className="text-2xl leading-7 font-bold num">{days}</span>
            <span className="text-[11px] leading-[14px] font-semibold text-emas-teks">HARI LAGI</span>
          </div>
        </div>
        <div className="w-full flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-sm text-body">
          <span className="inline-flex flex-row items-center gap-1.5 w-fit"><CalendarHeart className="w-4 h-4 shrink-0" />{e.date2 ? `${day1} ${fmtDate(e.date, true)} · ${day2} ${fmtDate(e.date2, true)}` : fmtDate(e.date, true)}</span>
          <span className="inline-flex flex-row items-center gap-1.5 w-fit"><MapPin className="w-4 h-4 shrink-0" />{e.place}</span>
          <span className="inline-flex flex-row items-center gap-1.5 w-fit"><Users className="w-4 h-4 shrink-0" />{e.pax} tetamu</span>
        </div>
        <MoneyBar bookings={s.bookings} budget={e.budget} />
      </section>

      <div className="w-full flex flex-row items-stretch gap-3">
        <Shortcut icon={<MailOpen className="w-5 h-5 shrink-0" />} title="Kad Kahwin" value={`${hadir} hadir`} onClick={() => nav('/kad')} />
        <Shortcut icon={<PiggyBank className="w-5 h-5 shrink-0" />} title="Tabung" value={monthly ? `${rm(monthly)}/bln` : 'Tiada bayaran'} onClick={() => nav('/tabung')} />
        <Shortcut icon={<ReceiptText className="w-5 h-5 shrink-0" />} title="Tempahan" value={`${s.bookings.filter(b => OPEN.includes(effective(b))).length} aktif`} onClick={() => nav('/tempahan')} />
      </div>

      <section className="w-full flex flex-col gap-3">
        <div className="w-full flex flex-row items-center gap-2">
          <h2 className="flex-1 min-w-0 text-xl font-semibold">Senarai semak</h2>
          <span className="w-fit shrink-0 text-sm text-muted num">{done}/{e.cats.length} disahkan</span>
        </div>
        <div className="w-full flex flex-col rounded-2xl bg-white border border-line overflow-hidden">
          {CATS.filter(c => e.cats.includes(c.id)).map((c, i) => {
            const b = bookingFor(c.id);
            const sv = e.shortlist[c.id] ? vendorById(e.shortlist[c.id]!) : undefined;
            const v = b ? vendorById(b.vendorId) : sv;
            const row = (
              <>
                <CatArt art={c.art} size={40} />
                <div className="flex-1 min-w-0 flex flex-col gap-1 text-left">
                  <span className="w-full text-[15px] font-semibold">{c.name}</span>
                  {v && <span className="w-full text-sm text-muted">{v.name}</span>}
                  <span className="w-fit">{b ? <StatusChip s={liveStatus(b)} /> : sv ? <Pill><Bookmark className="w-3.5 h-3.5 shrink-0" />Disenarai pendek</Pill> : <Pill tone="muted">Belum mula</Pill>}</span>
                  {b && b.date !== e.date && <span className="w-full text-xs text-amaran">Tarikh tempahan lain: {fmtDate(b.date)}</span>}
                </div>
              </>
            );
            return (
              <div key={c.id} className="w-full flex flex-col">
                {i > 0 && <Divider />}
                {b && !DEAD.includes(liveStatus(b)) ? (
                  <button onClick={() => nav('/tempahan/' + b.id)} className="w-full flex flex-row items-center gap-3 p-4 hover:bg-kertas" aria-label={`${c.name}: lihat tempahan`}>
                    {row}<ChevronRight className="w-5 h-5 shrink-0 text-muted" />
                  </button>
                ) : (
                  <div className="w-full flex flex-row items-center gap-3 p-4">
                    {row}
                    <Button variant="secondary" className="py-2!" aria-label={sv ? `Lihat ${sv.name}` : `Cari ${c.name}`} onClick={() => nav(sv ? '/vendor/' + sv.id : `/cari?cat=${c.id}&from=majlis`)}>{sv ? 'Lihat' : 'Cari'}</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <p className="w-full text-xs text-muted">Kategori dalam majlis ini: {e.cats.map(c => catById(c).name).join(', ')}.</p>
      <CustomChecklist />
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex flex-col gap-5 p-5">
      <div className="w-full flex flex-row items-center gap-2">
        <h1 className="flex-1 min-w-0 text-2xl font-bold">Majlis Saya</h1>
        <Button variant="ghost" className="px-3! py-2!" onClick={() => nav('/majlis/baru')}><Plus className="w-4 h-4 shrink-0" />Majlis baru</Button>
      </div>
      {children}
    </div>
  );
}

function Shortcut({ icon, title, value, onClick }: { icon: React.ReactNode; title: string; value: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 min-w-0 flex flex-col items-start gap-2 p-3 rounded-2xl bg-white border border-line text-left hover:border-hijau">
      <span className="w-9 h-9 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center">{icon}</span>
      <span className="w-full text-sm font-semibold">{title}</span>
      <span className="w-full text-xs text-muted num">{value}</span>
    </button>
  );
}
