import { useEffect, useState } from 'react';
import { CalendarX, Check, CircleCheckBig, Lock, MessageCircle, PencilLine, PiggyBank, SearchX, Sparkles, Star } from 'lucide-react';
import { useStore, daysBetween, TODAY, addDays } from '../../store';
import { nav } from '../../router';
import { VENDORS, vendorById } from '../../data/mock';
import type { BookingStatus, Vendor } from '../../data/types';
import { Button, Divider, EmptyState, Img, StatusChip, TopBar, VerifiedBadge, cx, fmtDate, rm } from '../../components/ui';
import { DepositLine, effective } from './BookingList';
import { CancelSheet, PaySheet } from './BookingSheets';
import { buildPayments } from './plan';
import ReviewSheet from './ReviewSheet';
import { loadReviews, reviewsChanged } from '../vendor/reviews';

const STEPS = ['Diminta', 'Diterima', 'Deposit', 'Disahkan', 'Selesai'];
const STEP_OF: Partial<Record<BookingStatus, number>> = { requested: 0, accepted: 1, deposit_due: 2, confirmed: 3, completed: 4, reviewed: 4 };

/** "Cuba vendor serupa": 3 same-category vendors free on the date (C-4.1 expired / declined) */
function Similar({ v, date }: { v: Vendor; date: string }) {
  const list = VENDORS.filter(x => x.cat === v.cat && x.id !== v.id && !x.busy.includes(date)).sort((a, b) => b.rating - a.rating).slice(0, 3);
  if (!list.length) return null;
  return (
    <div className="w-full flex flex-col gap-3">
      <h2 className="w-full text-base font-semibold">Cuba vendor serupa</h2>
      {list.map(x => (
        <button key={x.id} onClick={() => nav(`/vendor/${x.id}`)} className="w-full flex flex-row items-center gap-3 p-3 rounded-2xl bg-white border border-line text-left">
          <Img src={x.img} cat={x.cat} alt="" className="w-12 h-12 shrink-0 rounded-xl" />
          <span className="flex-1 min-w-0 flex flex-col">
            <span className="w-full text-sm font-semibold">{x.name}</span>
            <span className="w-full text-xs text-muted">{x.area} · {x.km} km · kosong {fmtDate(date)}</span>
          </span>
          <span className="w-fit flex flex-row items-center gap-1 text-sm font-semibold num"><Star className="w-3.5 h-3.5 shrink-0 fill-ink" />{x.rating.toFixed(1)}</span>
        </button>
      ))}
    </div>
  );
}

export default function BookingDetail({ id }: { id?: number | string }) {
  const { s, set, toast } = useStore();
  const [pay, setPay] = useState<number | null>(null);
  const [cancel, setCancel] = useState(false);
  const [review, setReview] = useState(false);
  const [mine, setMine] = useState(() => loadReviews().find(r => r.bookingId === id));
  useEffect(() => {
    const on = () => setMine(loadReviews().find(r => r.bookingId === id));
    window.addEventListener(reviewsChanged, on);
    return () => window.removeEventListener(reviewsChanged, on);
  }, [id]);
  const b = s.bookings.find(x => x.id === id);
  const v = b && vendorById(b.vendorId);
  if (!b || !v) return (
    <div className="w-full flex flex-col"><TopBar title="Tempahan" fallback="/tempahan" />
      <EmptyState icon={<SearchX className="w-6 h-6" />} title="Tempahan tidak dijumpai" action={<Button onClick={() => nav('/tempahan')}>Semua tempahan</Button>} />
    </div>
  );
  const pkg = v.packages.find(p => p.id === b.packageId) ?? v.packages[0];
  const st = effective(b);
  const step = STEP_OF[st];
  const left = daysBetween(TODAY, b.depositDeadline ?? TODAY);
  const nextDue = b.payments.findIndex(p => !p.paidAt);

  const simulateAccept = () => {
    const deadline = addDays(TODAY, 30);
    set(p => ({ bookings: p.bookings.map(x => (x.id === b.id ? { ...x, status: 'deposit_due', depositDeadline: deadline, payments: buildPayments(pkg, x.total, x.date, deadline) } : x)) }));
    toast(`${v.name} terima permintaan anda`);
  };

  return (
    <div className="w-full flex flex-col">
      <TopBar title={`Tempahan ${b.id}`} fallback="/tempahan" />
      <div className="w-full flex flex-col gap-4 p-5">
        <button onClick={() => nav(`/vendor/${v.id}`)} className="w-full flex flex-row items-center gap-3 p-4 rounded-2xl bg-white border border-line text-left">
          <Img src={v.img} cat={v.cat} alt="" className="w-16 h-16 shrink-0 rounded-xl" />
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="w-full text-base font-semibold">{v.name}</span>
            <VerifiedBadge v={v} />
          </div>
        </button>
        <StatusChip s={st} />

        {st === 'deposit_due' && (
          <div className={cx('w-full flex flex-col gap-3 p-5 rounded-2xl border-2', left <= 3 ? 'border-bahaya bg-bahaya-50' : 'border-amaran/40 bg-amaran-50')}>
            <p className="w-full text-base font-semibold">Bayar deposit {rm(b.payments[0]?.amount ?? 0)} dalam {Math.max(left, 0)} hari untuk kunci tarikh</p>
            <DepositLine b={b} />
            <span className="w-full flex flex-row items-center gap-1.5 text-sm text-body"><Lock className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Tarikh {fmtDate(b.date)} ditahan untuk anda sehingga {fmtDate(b.depositDeadline ?? TODAY)}. Jika tidak dibayar, tempahan dibatalkan secara automatik.</span></span>
            <Button block onClick={() => setPay(0)}>Bayar deposit</Button>
          </div>
        )}

        {st === 'lapsed' && (
          <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
            <span className="w-full flex flex-row items-center gap-2 text-base font-semibold"><CalendarX className="w-5 h-5 shrink-0 text-muted" /><span className="flex-1 min-w-0">Tempahan luput</span></span>
            <p className="w-full text-sm text-body">Deposit tidak dibayar sebelum {fmtDate(b.depositDeadline ?? TODAY)}, jadi tarikh telah dilepaskan.</p>
            {v.busy.includes(b.date) ? <p className="w-full text-sm text-muted">Tarikh ini sudah diambil orang lain.</p> : <Button block onClick={() => nav(`/vendor/${v.id}?book=1`)}>Tempah semula</Button>}
          </div>
        )}

        {(st === 'expired' || st === 'declined') && (
          <div className="w-full flex flex-col gap-2 p-5 rounded-2xl bg-white border border-line">
            <span className="w-full flex flex-row items-center gap-2 text-base font-semibold"><CalendarX className="w-5 h-5 shrink-0 text-muted" /><span className="flex-1 min-w-0">{st === 'expired' ? 'Vendor tidak membalas dalam 48 jam' : 'Vendor menolak permintaan ini'}</span></span>
            <p className="w-full text-sm text-body">{st === 'expired' ? 'Permintaan ini tamat tempoh secara automatik supaya anda boleh terus mencari. Tiada caj dikenakan.' : `Sebab: ${b.cancelReason ?? 'tidak dinyatakan'}. Tiada caj dikenakan.`}</p>
          </div>
        )}
        {(st === 'expired' || st === 'declined') && <Similar v={v} date={b.date} />}

        {(st === 'completed' || st === 'reviewed') && (
          <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-pucuk-50">
            {mine ? (
              <>
                <span className="w-full text-base font-semibold">Ulasan anda</span>
                <span className="w-fit flex flex-row items-center gap-0.5" aria-label={`${mine.rating} daripada 5 bintang`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} className={cx('w-4 h-4 shrink-0 text-ink', n <= mine.rating ? 'fill-ink' : 'fill-none')} />)}</span>
                <p className="w-full text-sm text-body">{mine.text}</p>
                {daysBetween(mine.at, TODAY) <= 7 && <Button variant="secondary" onClick={() => setReview(true)}><PencilLine className="w-4 h-4 shrink-0" />Ubah ulasan</Button>}
                <Button variant="ghost" onClick={() => nav(`/vendor/${v.id}?tab=ulasan`)}>Lihat di profil vendor</Button>
              </>
            ) : (
              <>
                <span className="w-full text-base font-semibold">Bagaimana {v.name}?</span>
                <p className="w-full text-sm text-body">Majlis selesai pada {fmtDate(b.date)}. Ulasan anda akan bertanda "Tempahan melalui Majlis Hub" dan membantu pasangan lain.</p>
                <Button block onClick={() => setReview(true)}><Star className="w-4 h-4 shrink-0" />Tulis ulasan</Button>
              </>
            )}
          </div>
        )}

        {step !== undefined && (
          <ol aria-label="Status tempahan" className="w-full flex flex-row items-start">
            {STEPS.map((l, i) => (
              <li key={l} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 text-center">
                <span className={cx('w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold', i < step || st === 'completed' || st === 'reviewed' ? 'bg-hijau text-white' : i === step ? 'border-[1.5px] border-hijau text-hijau bg-white' : 'border-[1.5px] border-line2 text-muted bg-white')}>
                  {i < step ? <Check className="w-4 h-4 shrink-0" /> : i + 1}
                </span>
                <span className={cx('w-full text-xs font-semibold', i <= step ? 'text-ink' : 'text-muted')}>{l}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line text-sm">
          {[['Pakej', pkg.name], ['Tarikh majlis', fmtDate(b.date, true)], ['Jumlah', rm(b.total)], ['Dihantar', fmtDate(b.createdAt)], ...(b.note ? [['Nota', b.note]] : []), ...(b.cancelReason ? [[st === 'declined' ? 'Sebab ditolak' : 'Sebab batal', b.cancelReason]] : [])].map(([k, val]) => (
            <div key={k} className="w-full flex flex-row items-start gap-3"><span className="w-[110px] shrink-0 text-muted">{k}</span><span className="flex-1 min-w-0 font-medium num">{val}</span></div>
          ))}
        </div>

        {st === 'confirmed' && (
          <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
            <h2 className="w-full text-base font-semibold">Jadual bayaran</h2>
            {b.payments.map((p, i) => (
              <div key={p.label} className="w-full flex flex-col gap-3">
                {i > 0 && <Divider />}
                <div className="w-full flex flex-row items-center gap-3">
                  <span className={cx('w-8 h-8 shrink-0 rounded-full flex items-center justify-center', p.paidAt ? 'bg-hijau text-white' : 'bg-kertas border border-line2 text-muted')}>{p.paidAt ? <Check className="w-4 h-4 shrink-0" /> : <span className="text-xs font-bold">{i + 1}</span>}</span>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="w-full text-sm font-semibold">{p.label}</span>
                    <span className="w-full text-xs text-muted">{p.paidAt ? `Dibayar ${fmtDate(p.paidAt)}` : `Perlu dibayar sebelum ${fmtDate(p.due)}`}</span>
                  </div>
                  <span className="w-fit text-sm font-bold num">{rm(p.amount)}</span>
                </div>
                {i === nextDue && <Button variant="secondary" onClick={() => setPay(i)}>Bayar {rm(p.amount)}</Button>}
              </div>
            ))}
            <Button variant="ghost" onClick={() => nav('/tabung')}><PiggyBank className="w-4 h-4 shrink-0" />Lihat pelan Tabung</Button>
          </div>
        )}

        {st === 'requested' && (
          <div className="w-full flex flex-col gap-2 p-4 rounded-xl border border-dashed border-line2">
            <span className="w-full flex flex-row items-center gap-1.5 text-xs font-semibold text-muted"><Sparkles className="w-3.5 h-3.5 shrink-0" />Demo sahaja</span>
            <Button variant="secondary" onClick={simulateAccept}><CircleCheckBig className="w-4 h-4 shrink-0" />Simulasi: vendor terima</Button>
          </div>
        )}

        <div className="w-full flex flex-row gap-3">
          <Button variant="secondary" block onClick={() => nav(`/mesej/${v.id}`)}><MessageCircle className="w-4 h-4 shrink-0" />Mesej vendor</Button>
          {['requested', 'accepted', 'deposit_due', 'confirmed'].includes(st) && <Button variant="danger" block onClick={() => setCancel(true)}>Batalkan</Button>}
        </div>
      </div>
      <PaySheet b={b} idx={pay ?? 0} open={pay !== null} onClose={() => setPay(null)} />
      <ReviewSheet b={b} v={v} existing={mine} open={review} onClose={() => setReview(false)} />
      <CancelSheet b={b} policy={st === 'confirmed' ? v.cancelPolicy : undefined} open={cancel} onClose={() => setCancel(false)} />
    </div>
  );
}
