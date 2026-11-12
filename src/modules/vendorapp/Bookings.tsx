import { useMemo, useState } from 'react';
import { CalendarCheck, Check, CircleCheckBig, Download, Hourglass, Lock, MessageCircle, Phone, Search, SearchX, TriangleAlert, X } from 'lucide-react';
import { nav } from '../../router';
import { useStore, addDays, TODAY } from '../../store';
import type { BookingStatus } from '../../data/types';
import { effective } from '../booking/money';
import { buildPayments, depositDeadline } from '../booking/plan';
import { Button, Chip, Divider, EmptyState, Pill, Sheet, StatusChip, TopBar, cx, fmtDate, rm, statusLabel } from '../../components/ui';
import { Card, inputCls, patchBooking, pkgOf, sendMsg, useRows, type VRow } from './kit';
import { byUrgency, depositStatus, hoursLeft, replyLabel, toCsv, usedOn, wouldExceed } from './logic';

const FILTERS: [string, (s: BookingStatus) => boolean][] = [
  ['Semua', () => true],
  ['Diminta', s => s === 'requested'],
  ['Deposit', s => s === 'deposit_due'],
  ['Disahkan', s => s === 'accepted' || s === 'confirmed'],
  ['Selesai', s => s === 'completed' || s === 'reviewed'],
  ['Ditutup', s => ['declined', 'expired', 'lapsed', 'cancelled'].includes(s)],
];

function Countdown({ b }: { b: VRow }) {
  const h = hoursLeft(b);
  return (
    <span className={cx('w-full flex flex-row items-center gap-1.5 text-sm font-semibold', h < 6 ? 'text-bahaya' : 'text-amaran')}>
      {h < 6 ? <TriangleAlert className="w-4 h-4 shrink-0" /> : <Hourglass className="w-4 h-4 shrink-0" />}
      <span className="flex-1 min-w-0">Balas dalam {replyLabel(h)}</span>
    </span>
  );
}

const DEP_TONE = { Dibayar: 'hijau', 'Belum bayar': 'amaran', Luput: 'muted' } as const;
export const DepositPill = ({ b }: { b: VRow }) => {
  const d = depositStatus(b);
  return d ? <Pill tone={DEP_TONE[d]}>{d === 'Dibayar' ? <Check className="w-3.5 h-3.5 shrink-0" /> : d === 'Luput' ? <X className="w-3.5 h-3.5 shrink-0" /> : <Hourglass className="w-3.5 h-3.5 shrink-0" />}Deposit {d.toLowerCase()}</Pill> : null;
};

/* ---------- V-3.0 list ---------- */
export function BookingList() {
  const { s } = useStore();
  const rows = useRows();
  const [q, setQ] = useState('');
  const [f, setF] = useState(0);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [per, setPer] = useState(10);
  const [page, setPage] = useState(0);

  const list = useMemo(() => byUrgency(rows).filter(b => {
    const st = effective(b);
    const pkg = pkgOf(s, b.packageId)?.name ?? '';
    return FILTERS[f][1](st)
      && (!q || `${b.customer} ${b.place} ${pkg} ${b.id} ${b.note}`.toLowerCase().includes(q.toLowerCase()))
      && (!from || b.date >= from) && (!to || b.date <= to);
  }), [rows, f, q, from, to, s]);
  const pages = Math.max(1, Math.ceil(list.length / per));
  const shown = list.slice(page * per, page * per + per);

  const exportCsv = () => {
    const csv = toCsv([
      ['ID', 'Tarikh majlis', 'Pelanggan', 'Telefon', 'Pakej', 'Pax', 'Anggaran (RM)', 'Status', 'Masa untuk balas', 'Deposit'],
      ...list.map(b => { const st = effective(b); return [b.id, b.date, b.customer, b.phone, pkgOf(s, b.packageId)?.name ?? '', b.pax, b.total, statusLabel(st), st === 'requested' ? replyLabel(hoursLeft(b)) : '', depositStatus(b) ?? '']; }),
    ]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `tempahan-${TODAY}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Tempahan" fallback="/v" right={<button aria-label="Eksport CSV" onClick={exportCsv} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-50"><Download className="w-5 h-5 shrink-0" /></button>} />
      <div className="w-full flex flex-col gap-4 p-5">
        <label className="w-full flex flex-row items-center gap-2 px-3.5 py-3 rounded-full bg-white border border-line2 focus-within:border-hijau">
          <Search className="w-4 h-4 shrink-0 text-muted" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(0); }} placeholder="Cari pelanggan, lokasi, pakej" aria-label="Cari tempahan" className="flex-1 min-w-0 bg-transparent outline-none text-[15px]" />
        </label>
        <div className="w-full flex flex-row gap-2 overflow-x-auto">
          {FILTERS.map(([label, fn], i) => (
            <Chip key={label} on={f === i} onClick={() => { setF(i); setPage(0); }}>{label} · {rows.filter(b => fn(effective(b))).length}</Chip>
          ))}
        </div>
        <div className="w-full flex flex-row items-end gap-3">
          <label className="flex-1 min-w-0 flex flex-col gap-1.5"><span className="w-full text-[13px] font-semibold">Dari</span><input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(0); }} className={inputCls()} /></label>
          <label className="flex-1 min-w-0 flex flex-col gap-1.5"><span className="w-full text-[13px] font-semibold">Hingga</span><input type="date" value={to} min={from || undefined} onChange={e => { setTo(e.target.value); setPage(0); }} className={inputCls()} /></label>
        </div>
        {(from || to || q || f) ? <Button variant="ghost" onClick={() => { setQ(''); setF(0); setFrom(''); setTo(''); }}>Kosongkan penapis</Button> : null}

        {rows.length === 0 ? (
          <EmptyState icon={<CalendarCheck className="w-6 h-6" />} title="Belum ada permintaan" body="Lengkapkan profil anda untuk naik ranking dalam carian." action={<Button onClick={() => nav('/v/profil')}>Lengkapkan profil</Button>} />
        ) : list.length === 0 ? (
          <EmptyState icon={<SearchX className="w-6 h-6" />} title="Tiada tempahan sepadan" body="Cuba ubah carian atau tarikh." />
        ) : (
          <div className="w-full flex flex-col gap-3">
            <span className="w-full text-sm text-muted">{list.length} tempahan · disusun ikut keutamaan</span>
            {shown.map(b => {
              const st = effective(b);
              return (
                <div key={b.id} className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
                  <button onClick={() => nav(`/v/tempahan/${b.id}`)} aria-label={`Lihat ${b.id} ${b.customer}`} className="w-full flex flex-col gap-1 text-left">
                    <span className="w-full flex flex-row items-center gap-2">
                      <span className="flex-1 min-w-0 text-[15px] font-semibold">{b.customer}</span>
                      <span className="w-fit text-sm font-bold num">{rm(b.total)}</span>
                    </span>
                    <span className="w-full text-sm text-body">{fmtDate(b.date, true)} · {pkgOf(s, b.packageId)?.name}</span>
                    <span className="w-full text-sm text-muted">{b.pax} pax · {b.place} · {b.id}</span>
                  </button>
                  <div className="w-full flex flex-row flex-wrap items-center gap-2"><StatusChip s={st} />{st !== 'deposit_due' && <DepositPill b={b} />}</div>
                  {st === 'requested' && <Countdown b={b} />}
                  {st === 'requested' && (
                    <div className="w-full flex flex-row gap-3">
                      <Button variant="secondary" block onClick={() => nav(`/v/tempahan/${b.id}?aksi=tolak`)}>Tolak</Button>
                      <Button block onClick={() => nav(`/v/tempahan/${b.id}?aksi=terima`)}>Terima</Button>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="w-full flex flex-row items-center gap-3">
              <label className="flex-1 min-w-0 flex flex-row items-center gap-2 text-sm">
                <span className="w-fit shrink-0 text-muted">Setiap halaman</span>
                <select value={per} onChange={e => { setPer(Number(e.target.value)); setPage(0); }} className="w-fit px-3.5 py-2.5 rounded-[10px] bg-white border border-line2">
                  {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <Button variant="secondary" aria-label="Halaman sebelum" disabled={page === 0} onClick={() => setPage(page - 1)} className="disabled:opacity-40">‹</Button>
              <span className="w-fit text-sm num">{page + 1}/{pages}</span>
              <Button variant="secondary" aria-label="Halaman seterusnya" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="disabled:opacity-40">›</Button>
            </div>
            <Button variant="secondary" onClick={exportCsv}><Download className="w-4 h-4 shrink-0" />Eksport CSV</Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- V-3.1 / V-3.2 / V-9.0 detail ---------- */
const REASONS = ['Penuh pada tarikh ini', 'Luar kawasan', 'Lain-lain'];

export function BookingDetail({ id, action }: { id: string; action: string | null }) {
  const { s, set, toast } = useStore();
  const rows = useRows();
  const b = rows.find(x => x.id === id);
  const [accept, setAccept] = useState(action === 'terima');
  const [decline, setDecline] = useState(action === 'tolak');
  const [why, setWhy] = useState('');
  const [more, setMore] = useState('');
  const [alt, setAlt] = useState('');
  const [tried, setTried] = useState(false);

  if (!b) return (
    <div className="w-full flex flex-col"><TopBar title="Tempahan" fallback="/v/tempahan" />
      <EmptyState icon={<SearchX className="w-6 h-6" />} title="Tempahan tidak dijumpai" action={<Button onClick={() => nav('/v/tempahan')}>Semua tempahan</Button>} />
    </div>
  );
  const st = effective(b);
  const pkg = pkgOf(s, b.packageId) ?? s.listing.packages[0];
  const over = wouldExceed(rows, b, s.listing.capacity);
  const blocked = s.listing.blocked.includes(b.date);
  const canComplete = st === 'confirmed' && b.date < TODAY;

  const doAccept = () => {
    const deadline = depositDeadline(b.date);
    // same transition as the customer side (BookingDetail simulateAccept): deposit due + schedule from the package plan
    set(patchBooking(b.id, x => ({ status: 'deposit_due', depositDeadline: deadline, payments: buildPayments(pkg, x.total, x.date, deadline) })));
    setAccept(false);
    toast(`Tempahan ${b.id} diterima. Pelanggan ada sehingga ${fmtDate(deadline)} untuk bayar deposit.`);
  };
  const reasonText = why === 'Lain-lain' ? more.trim() : why;
  const reasonErr = tried && (!why ? 'Pilih sebab' : why === 'Lain-lain' && !more.trim() ? 'Tulis sebabnya' : '');
  const doDecline = () => {
    setTried(true);
    if (!why || (why === 'Lain-lain' && !more.trim())) return;
    set(patchBooking(b.id, () => ({ status: 'declined', cancelReason: alt ? `${reasonText} · Cadang tarikh lain: ${fmtDate(alt)}` : reasonText })));
    if (alt) set(sendMsg(b, `Maaf, ${fmtDate(b.date)} tidak dapat. Saya cadangkan ${fmtDate(alt, true)}, boleh hantar permintaan baru untuk tarikh itu.`));
    setDecline(false);
    toast(`Tempahan ${b.id} ditolak`);
  };
  const complete = () => { set(patchBooking(b.id, () => ({ status: 'completed' }))); toast('Ditanda selesai. Pelanggan kini boleh tulis ulasan.'); };

  return (
    <div className="w-full flex flex-col">
      <TopBar title={`Tempahan ${b.id}`} fallback="/v/tempahan" />
      <div className="w-full flex flex-col gap-4 p-5">
        <Card>
          <span className="w-full text-lg font-semibold">{b.customer}</span>
          <span className="w-full flex flex-row items-center gap-1.5 text-sm text-body"><Phone className="w-4 h-4 shrink-0 text-muted" /><span className="flex-1 min-w-0">{b.phone}</span></span>
          <div className="w-full flex flex-row flex-wrap items-center gap-2"><StatusChip s={st} />{st !== 'deposit_due' && <DepositPill b={b} />}</div>
          {st === 'requested' && <Countdown b={b} />}
        </Card>

        {st === 'requested' && (
          <div className="w-full flex flex-row gap-3">
            <Button variant="secondary" block onClick={() => setDecline(true)}>Tolak</Button>
            <Button block onClick={() => setAccept(true)}>Terima</Button>
          </div>
        )}

        <Card>
          {[['Pakej', pkg?.name ?? '-'], ['Tarikh majlis', fmtDate(b.date, true)], ['Anggaran', rm(b.total)], ['Tetamu', `${b.pax} pax`], ['Lokasi', b.place], ['Dihantar', fmtDate(b.createdAt)],
            ...(b.note ? [['Nota', b.note]] : []), ...(b.cancelReason ? [[st === 'declined' ? 'Sebab ditolak' : 'Sebab batal', b.cancelReason]] : [])].map(([k, v]) => (
            <div key={k} className="w-full flex flex-row items-start gap-3 text-sm"><span className="w-[104px] shrink-0 text-muted">{k}</span><span className="flex-1 min-w-0 font-medium num">{v}</span></div>
          ))}
        </Card>

        {b.payments.length > 0 && (
          <Card>
            <h2 className="w-full text-base font-semibold">Deposit & ansuran</h2>
            {st === 'deposit_due' && <span className="w-full flex flex-row items-center gap-1.5 text-sm text-amaran"><Lock className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Tarikh ditahan sehingga {fmtDate(b.depositDeadline ?? TODAY)}. Jika deposit tidak dibayar, tempahan luput.</span></span>}
            {b.payments.map((p, i) => (
              <div key={p.label} className="w-full flex flex-col gap-3">
                {i > 0 && <Divider />}
                <div className="w-full flex flex-row items-center gap-3">
                  <span className={cx('w-8 h-8 shrink-0 rounded-full flex items-center justify-center', p.paidAt ? 'bg-hijau text-white' : 'bg-kertas border border-line2 text-muted')}>{p.paidAt ? <Check className="w-4 h-4 shrink-0" /> : <span className="text-xs font-bold">{i + 1}</span>}</span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="w-full text-sm font-semibold">{p.label}</span>
                    <span className="w-full text-xs text-muted">{p.paidAt ? `Dibayar ${fmtDate(p.paidAt)}` : `${!p.paidAt && p.due < TODAY && st !== 'lapsed' ? 'Lewat · ' : ''}Tarikh akhir ${fmtDate(p.due)}`}</span>
                  </span>
                  <span className="w-fit text-sm font-bold num">{rm(p.amount)}</span>
                </div>
              </div>
            ))}
          </Card>
        )}

        {canComplete && (
          <div className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-pucuk-50">
            <span className="w-full text-sm text-body">Majlis sudah berlangsung pada {fmtDate(b.date)}. Tanda selesai untuk buka ulasan pelanggan. Jika tidak ditanda, ia selesai sendiri pada {fmtDate(addDays(b.date, 2))}.</span>
            <Button onClick={complete}><CircleCheckBig className="w-4 h-4 shrink-0" />Tanda selesai</Button>
          </div>
        )}
        {st === 'confirmed' && !canComplete && <p className="w-full text-sm text-muted">Boleh ditanda selesai selepas {fmtDate(b.date)}.</p>}
        {st === 'cancelled' && <p className="w-full text-sm text-muted">Pelanggan membatalkan tempahan ini, jadi ia tidak boleh ditanda selesai.</p>}

        <Button variant="secondary" onClick={() => nav(`/v/mesej/${b.id}`)}><MessageCircle className="w-4 h-4 shrink-0" />Mesej {b.customer.split(' ')[0]}</Button>
      </div>

      <Sheet open={accept} onClose={() => setAccept(false)} title="Terima tempahan?"
        footer={<><Button variant="secondary" block onClick={() => setAccept(false)}>Batal</Button><Button block onClick={doAccept}>{over || blocked ? 'Terima juga' : 'Terima'}</Button></>}>
        {(over || blocked) && (
          <div role="alert" className="w-full flex flex-row gap-2 p-4 rounded-xl bg-amaran-50 text-amaran">
            <TriangleAlert className="w-4 h-4 shrink-0" />
            <span className="flex-1 min-w-0 text-sm">{blocked ? <><b>Tarikh ini anda tutup.</b> <span className="text-body">Menerima akan guna slot pada tarikh yang ditutup.</span></> : <><b>Melebihi kapasiti harian.</b> <span className="text-body">{usedOn(rows, b.date, b.id)} daripada {s.listing.capacity} slot pada {fmtDate(b.date)} sudah diambil.</span></>}</span>
          </div>
        )}
        <p className="w-full text-sm text-body">{b.customer} akan ada sehingga {fmtDate(depositDeadline(b.date))} untuk bayar deposit {rm(buildPayments(pkg, b.total, b.date)[0]?.amount ?? 0)}. Tarikh {fmtDate(b.date)} ditahan untuknya.</p>
      </Sheet>

      <Sheet open={decline} onClose={() => setDecline(false)} title="Tolak permintaan"
        footer={<><Button variant="secondary" block onClick={() => setDecline(false)}>Batal</Button><Button variant="danger" block onClick={doDecline}>Tolak</Button></>}>
        <div role="radiogroup" aria-label="Sebab tolak" className="w-full flex flex-col gap-2">
          {REASONS.map(rs => (
            <label key={rs} className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border cursor-pointer', why === rs ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
              <input type="radio" name="why" checked={why === rs} onChange={() => setWhy(rs)} className="w-5 h-5 shrink-0 accent-hijau" />
              <span className="flex-1 min-w-0 text-sm">{rs === 'Penuh pada tarikh ini' ? 'Penuh' : rs}</span>
            </label>
          ))}
        </div>
        {why === 'Lain-lain' && <textarea value={more} onChange={e => setMore(e.target.value)} rows={3} aria-label="Sebab lain" placeholder="Tulis sebabnya" className={cx(inputCls(tried && !more.trim()), 'resize-none')} />}
        {reasonErr && <span role="alert" className="w-full text-sm text-bahaya">{reasonErr}</span>}
        <label className="w-full flex flex-col gap-1.5">
          <span className="w-full text-[13px] font-semibold">Cadang tarikh lain (pilihan)</span>
          <input type="date" value={alt} min={TODAY} onChange={e => setAlt(e.target.value)} className={inputCls()} />
          <span className="w-full text-xs text-muted">Cadangan dihantar sebagai mesej kepada pelanggan.</span>
        </label>
      </Sheet>
    </div>
  );
}
