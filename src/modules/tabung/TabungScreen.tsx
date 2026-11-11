import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronDown, Landmark, PiggyBank, Plus, TriangleAlert } from 'lucide-react';
import { vendorById } from '../../data/mock';
import { TODAY, daysBetween, useStore } from '../../store';
import { nav } from '../../router';
import { Button, Divider, EmptyState, Pill, Sheet, TopBar, cx, fmtDate, rm } from '../../components/ui';
import { plan } from './calc';

export default function TabungScreen() {
  const { s, set, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState('');
  const [note, setNote] = useState('');
  const p = plan(s.bookings, s.tabung);

  if (!p.active.length) {
    return (
      <div className="w-full flex flex-col">
        <TopBar title="Tabung" fallback="/majlis" />
        <EmptyState icon={<PiggyBank className="w-6 h-6 shrink-0" />} title="Tiada bayaran lagi" body="Tempah vendor untuk mula menabung. Kami kira berapa perlu disimpan setiap bulan."
          action={<Button onClick={() => nav('/cari')}>Cari vendor</Button>} />
      </div>
    );
  }

  const n = Number(amt);
  const err = amt === '' ? '' : !(n > 0) ? 'Masukkan jumlah lebih daripada RM 0.' : n > p.remaining ? `Jumlah melebihi baki yang perlu disimpan (${rm(p.remaining)}).` : '';
  const save = () => {
    set(o => ({ tabung: [...o.tabung, { id: 't' + Date.now(), amount: n, note: note.trim() || 'Simpanan', at: TODAY }] }));
    toast(`${rm(n)} direkod dalam tabung`);
    setOpen(false); setAmt(''); setNote('');
  };
  const paid = s.bookings.flatMap(b => b.payments.filter(x => x.paidAt).map(x => ({ id: b.id + x.label, at: x.paidAt!, amount: -x.amount, note: `${x.label} · ${vendorById(b.vendorId)?.name}` })));
  const timeline = [...s.tabung, ...paid].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Tabung" fallback="/majlis" />
      <div className="w-full flex flex-col gap-5 p-5">
        {p.overdue.length > 0 && (
          <div role="alert" className="w-full flex flex-row gap-3 p-4 rounded-2xl bg-amaran-50 text-amaran">
            <TriangleAlert className="w-5 h-5 shrink-0" />
            <div className="flex-1 min-w-0 flex flex-col gap-1 text-sm">
              <p className="w-full font-semibold">{p.overdue.length} ansuran sudah lewat</p>
              <p className="w-full text-body">{p.overdue.map(d => `${d.label} ${d.vendorName} (${fmtDate(d.due)})`).join(', ')}. Vendor sudah dimaklumkan. Tempahan anda tidak dibatalkan, tapi bayar segera.</p>
            </div>
          </div>
        )}
        <section className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-pucuk-50">
          <div className="w-full flex flex-row items-center gap-2">
            <span className="flex-1 min-w-0 text-sm font-semibold text-hijau">Simpan setiap bulan</span>
            {p.remaining === 0 ? <Pill>Cukup</Pill> : p.short > 0 ? <Pill tone="amaran"><TriangleAlert className="w-3.5 h-3.5 shrink-0" />Kurang {rm(p.short)}</Pill> : <Pill>Ikut rancangan</Pill>}
          </div>
          <p className="w-full font-display text-[48px] leading-[52px] font-semibold num">{rm(p.monthly)}<span className="text-lg font-sans font-semibold text-muted">/bulan</span></p>
          <p className="w-full text-sm text-body">Untuk {p.dues.length} bayaran belum dibayar ({rm(p.owed)}) dalam {p.months} bulan.</p>
          <div className="w-full flex flex-row items-stretch gap-3">
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 p-3 rounded-xl bg-white">
              <span className="w-full text-xs text-muted">Jumlah disimpan</span>
              <span className="w-full text-base font-semibold num">{rm(p.total)}</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5 p-3 rounded-xl bg-white">
              <span className="w-full text-xs text-muted">Baki tabung</span>
              <span className="w-full text-base font-semibold num text-hijau">{rm(p.saved)}</span>
              {p.spentFromTabung > 0 && <span className="w-full text-xs text-muted num">−{rm(p.spentFromTabung)} sudah dibayar</span>}
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white overflow-hidden" role="progressbar" aria-label="Simpanan" aria-valuenow={Math.round((p.saved / p.owed) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-hijau" style={{ width: `${Math.min(100, (p.saved / p.owed) * 100)}%` }} />
          </div>
          {p.short > 0 && <p className="w-full text-sm text-amaran">Kurang {rm(p.short)} bulan ini ikut rancangan asal. Simpan {rm(p.monthly)} sebulan untuk kembali tepat masa.</p>}
          <Button onClick={() => setOpen(true)} className="w-full"><Plus className="w-4 h-4 shrink-0" />Saya dah simpan</Button>
          <p className="w-full flex flex-row items-center gap-2 text-xs text-body"><Landmark className="w-4 h-4 shrink-0 text-hijau" /><span className="flex-1 min-w-0">Duit kekal dalam akaun bank anda. Majlis Hub cuma bantu rancang &amp; ingatkan.</span></p>
        </section>

        <details className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white border border-line group">
          <summary className="w-full flex flex-row items-center gap-2 text-sm font-semibold cursor-pointer list-none">
            <span className="flex-1 min-w-0">Cara kira</span><ChevronDown className="w-4 h-4 shrink-0 group-open:rotate-180" />
          </summary>
          <p className="w-full text-sm text-body">Baki perlu disimpan = jumlah bayaran belum dibayar ({rm(p.owed)}) tolak baki tabung ({rm(p.saved)}) = {rm(p.remaining)}. Baki tabung = jumlah disimpan ({rm(p.total)}) tolak ansuran yang sudah dibayar sejak mula menabung ({rm(p.spentFromTabung)}). Dibahagi dengan {p.months} bulan sehingga bayaran terakhir, dibundar ke RM 10.</p>
        </details>

        <section className="w-full flex flex-col gap-3">
          <h2 className="w-full text-xl font-semibold">Bayaran akan datang</h2>
          <div className="w-full flex flex-col rounded-2xl bg-white border border-line overflow-hidden">
            {p.dues.map((d, i) => {
              const pct = d.covered / d.amount;
              const left = daysBetween(TODAY, d.due);
              return (
                <div key={d.bookingId + d.label} className="w-full flex flex-col">
                  {i > 0 && <Divider />}
                  <div className="w-full flex flex-row items-center gap-3 p-4">
                    <Ring pct={pct} />
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="w-full text-[15px] font-semibold">{d.vendorName}</span>
                      <span className="w-full text-sm text-muted">{d.label} · {fmtDate(d.due)}</span>
                      {left < 0 ? <Pill tone="bahaya">Lewat {-left} hari</Pill> : left <= 30 && <Pill tone="amaran">Dalam {left} hari</Pill>}
                      <span className="w-full text-sm num"><b>{rm(d.amount)}</b> <span className="text-muted">· {Math.round(pct * 100)}% disimpan</span></span>
                    </div>
                    <Button variant="secondary" className="px-3! py-2!" aria-label={`Bayar ${d.label} ${d.vendorName}`} onClick={() => nav('/tempahan/' + d.bookingId)}>Bayar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="w-full flex flex-col gap-3">
          <h2 className="w-full text-xl font-semibold">Sejarah</h2>
          <div className="w-full flex flex-col rounded-2xl bg-white border border-line overflow-hidden">
            {timeline.map((t, i) => (
              <div key={t.id} className="w-full flex flex-col">
                {i > 0 && <Divider />}
                <div className="w-full flex flex-row items-center gap-3 p-4">
                  <span className={cx('w-9 h-9 shrink-0 rounded-full flex items-center justify-center', t.amount > 0 ? 'bg-pucuk-100 text-hijau' : 'bg-line text-ink')}>
                    {t.amount > 0 ? <ArrowDownLeft className="w-4 h-4 shrink-0" /> : <ArrowUpRight className="w-4 h-4 shrink-0" />}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <span className="w-full text-sm font-semibold">{t.amount > 0 ? t.note : 'Dibayar kepada vendor'}</span>
                    <span className="w-full text-xs text-muted">{t.amount > 0 ? 'Simpanan' : t.note} · {fmtDate(t.at)}</span>
                  </div>
                  <span className={cx('w-fit shrink-0 text-sm font-bold num', t.amount > 0 ? 'text-hijau' : 'text-ink')}>{t.amount > 0 ? '+' : '−'}{rm(Math.abs(t.amount))}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Rekod simpanan" footer={<Button block disabled={!amt || !!err} onClick={save}>Simpan rekod</Button>}>
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="tb-amt" className="w-full text-[13px] leading-4 font-semibold">Jumlah</label>
          <div className={cx('w-full flex flex-row items-center gap-2 px-3.5 py-3 rounded-[10px] border', err ? 'border-bahaya' : 'border-line2')}>
            <span className="w-fit shrink-0 font-semibold text-muted">RM</span>
            <input id="tb-amt" type="number" inputMode="numeric" value={amt} onChange={e => setAmt(e.target.value)} aria-invalid={!!err} className="flex-1 min-w-0 text-xl font-bold num outline-none" placeholder="0" />
          </div>
          {err ? <p role="alert" className="w-full text-sm text-bahaya">{err}</p> : <p className="w-full text-xs text-muted">Baki perlu disimpan: {rm(p.remaining)}</p>}
        </div>
        <div className="w-full flex flex-col gap-2">
          <label htmlFor="tb-note" className="w-full text-[13px] leading-4 font-semibold">Nota (pilihan)</label>
          <input id="tb-note" value={note} onChange={e => setNote(e.target.value)} placeholder="Contoh: Gaji November" className="w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border border-line2 text-[15px]" />
        </div>
      </Sheet>
    </div>
  );
}

/** progress ring: SVG circles only, label stays in HTML */
function Ring({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 18;
  return (
    <svg viewBox="0 0 44 44" className="w-11 h-11 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-pucuk-100)" strokeWidth="5" />
      <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-hijau)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
    </svg>
  );
}
