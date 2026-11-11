import { useEffect, useState } from 'react';
import { AlertCircle, CircleCheckBig } from 'lucide-react';
import { addDays, useStore, TODAY } from '../../store';
import { nav } from '../../router';
import type { Booking, Vendor } from '../../data/types';
import { Button, Chip, Sheet, cx, fmtDate, rm } from '../../components/ui';

const CLOSED = ['declined', 'expired', 'lapsed', 'cancelled'];

/** 3 nearest free dates around a taken one */
const nearFree = (v: Vendor, d: string) => {
  const out: string[] = [];
  for (let i = 1; out.length < 3 && i < 30; i++) for (const n of [i, -i]) {
    const c = addDays(d, n);
    if (c > TODAY && !v.busy.includes(c) && out.length < 3) out.push(c);
  }
  return out.sort();
};

export default function BookSheet({ v, open, initialPkg, onClose }: { v: Vendor; open: boolean; initialPkg?: string; onClose: () => void }) {
  const { s, set } = useStore();
  const [pkgId, setPkg] = useState(initialPkg ?? v.packages[0].id);
  const [date, setDate] = useState(s.event?.date ?? '2027-02-14');
  const [note, setNote] = useState('');
  const [done, setDone] = useState<string | null>(null);
  useEffect(() => { if (open) { setPkg(initialPkg ?? v.packages[0].id); setDone(null); } }, [open, initialPkg, v]);

  const pkg = v.packages.find(p => p.id === pkgId)!;
  const taken = v.busy.includes(date);
  const past = date <= TODAY;
  const dup = s.bookings.some(b => b.vendorId === v.id && b.date === date && !CLOSED.includes(b.status));
  const err = past ? 'Tarikh sudah lepas. Pilih tarikh akan datang.' : taken ? `${v.name} sudah ditempah pada ${fmtDate(date)}.` : dup ? 'Anda sudah hantar permintaan kepada vendor ini untuk tarikh yang sama.' : null;

  const submit = () => {
    if (err) return;
    const id = 'B-' + Math.floor(1000 + Math.random() * 9000);
    const b: Booking = { id, vendorId: v.id, packageId: pkg.id, date, total: pkg.price, note, status: 'requested', createdAt: TODAY, payments: [] };
    set(p => ({ bookings: [b, ...p.bookings] }));
    setDone(id);
  };

  if (done) return (
    <Sheet open={open} onClose={onClose} title="Permintaan dihantar"
      footer={<><Button variant="secondary" block onClick={onClose}>Tutup</Button><Button block onClick={() => nav(`/tempahan/${done}`)}>Lihat tempahan</Button></>}>
      <div className="w-full flex flex-col items-center gap-3 text-center">
        <span className="w-14 h-14 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><CircleCheckBig className="w-7 h-7 shrink-0" /></span>
        <p className="w-full text-base font-semibold">{v.name} biasanya balas dalam {v.reply}</p>
        <p className="w-full text-sm text-body">Bila vendor terima, anda ada 30 hari untuk bayar deposit dan kunci tarikh {fmtDate(date)}.</p>
      </div>
    </Sheet>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Hantar permintaan tempahan"
      footer={<>
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="w-full text-xs text-muted">Anggaran jumlah</span>
          <span className="w-full text-lg font-bold num">{rm(pkg.price)}</span>
        </div>
        <Button onClick={submit} disabled={!!err}>Hantar permintaan</Button>
      </>}>
      <div role="radiogroup" aria-labelledby="pkg-l" className="w-full flex flex-col gap-2">
        <span id="pkg-l" className="w-full text-[13px] font-semibold">Pakej</span>
        {v.packages.map(p => (
          <label key={p.id} className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border cursor-pointer', p.id === pkgId ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
            <input type="radio" name="pkg" checked={p.id === pkgId} onChange={() => setPkg(p.id)} className="w-5 h-5 shrink-0 accent-hijau" />
            <span className="flex-1 min-w-0 text-sm font-semibold">{p.name}</span>
            <span className="w-fit text-sm font-bold num">{rm(p.price)}</span>
          </label>
        ))}
      </div>
      <label className="w-full flex flex-col gap-2">
        <span className="w-full text-[13px] font-semibold">Tarikh majlis</span>
        <input type="date" value={date} min={addDays(TODAY, 1)} onChange={e => setDate(e.target.value)}
          className={cx('w-full px-3.5 py-3.5 leading-5 bg-white border rounded-[10px] text-[15px]', err ? 'border-bahaya' : 'border-line2')} aria-invalid={!!err} />
      </label>
      {err && (
        <div role="alert" className="w-full flex flex-col gap-3 p-4 rounded-xl bg-bahaya-50">
          <div className="w-full flex flex-row items-center gap-2 text-sm font-semibold text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">{err}</span></div>
          {taken && !past && (
            <>
              <span className="w-full text-sm text-body">Tarikh terdekat yang masih kosong:</span>
              <div className="w-full flex flex-row flex-wrap gap-2">{nearFree(v, date).map(d => <Chip key={d} onClick={() => setDate(d)}>{fmtDate(d, true)}</Chip>)}</div>
            </>
          )}
        </div>
      )}
      <label className="w-full flex flex-col gap-2">
        <span className="w-full text-[13px] font-semibold">Nota untuk vendor (pilihan)</span>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Contoh: akad pukul 9 pagi, tema hijau krim"
          className="w-full px-3.5 py-3 bg-white border border-line2 rounded-[10px] text-[15px] resize-none" />
      </label>
    </Sheet>
  );
}
