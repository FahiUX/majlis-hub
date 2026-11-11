import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CircleCheckBig, CreditCard, Landmark, Loader2, TriangleAlert, Wallet } from 'lucide-react';
import { useStore, TODAY, daysBetween } from '../../store';
import { refundToday } from './money';
import { useRoute } from '../../router';
import type { Booking } from '../../data/types';
import { Button, Sheet, cx, fmtDate, rm } from '../../components/ui';

const METHODS = [
  { id: 'fpx', label: 'FPX perbankan online', sub: 'Maybank2u, CIMB Clicks, Bank Islam…', Icon: Landmark },
  { id: 'kad', label: 'Kad debit / kredit', sub: 'Visa, Mastercard', Icon: CreditCard },
  { id: 'ewallet', label: 'e-Dompet', sub: "Touch 'n Go, GrabPay, Boost", Icon: Wallet },
];

/** Simulated payment (Phase 5 has no gateway). ?fail=1 forces the error state for QA. */
export function PaySheet({ b, open, onClose, idx = 0 }: { b: Booking; open: boolean; onClose: () => void; idx?: number }) {
  const { set, toast } = useStore();
  const r = useRoute();
  const [method, setMethod] = useState('fpx');
  const [phase, setPhase] = useState<'pick' | 'busy' | 'fail' | 'ok'>('pick');
  // cancel the simulated payment if the sheet closes mid-way, so nothing is charged after "close" (QA W10)
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => { if (open) setPhase('pick'); else window.clearTimeout(timer.current); }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const pay = b.payments[idx];
  if (!pay) return null;

  const go = () => {
    setPhase('busy');
    timer.current = window.setTimeout(() => {
      if (r.q.get('fail') === '1') return setPhase('fail');
      set(p => ({
        bookings: p.bookings.map(x => x.id !== b.id ? x : {
          ...x, status: idx === 0 ? 'confirmed' : x.status,
          payments: x.payments.map((y, i) => (i === idx ? { ...y, paidAt: TODAY } : y)),
        }),
      }));
      setPhase('ok');
      toast(idx === 0 ? 'Deposit dibayar. Tarikh anda dikunci.' : `${pay.label} dibayar`);
    }, 1200);
  };

  if (phase === 'ok') return (
    <Sheet open={open} onClose={onClose} title="Pembayaran berjaya" footer={<Button block onClick={onClose}>Selesai</Button>}>
      <div className="w-full flex flex-col items-center gap-3 text-center">
        <span className="w-14 h-14 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><CircleCheckBig className="w-7 h-7 shrink-0" /></span>
        <p className="w-full text-base font-semibold">{idx === 0 ? `Tarikh ${fmtDate(b.date)} kini dikunci untuk anda` : `${pay.label} diterima`}</p>
      </div>
      <div className="w-full flex flex-col gap-2 p-4 rounded-xl bg-kertas text-sm">
        {[['No. resit', `R-${b.id.slice(2)}-${idx + 1}`], ['Jumlah', rm(pay.amount)], ['Tarikh', fmtDate(TODAY)], ['Kaedah', METHODS.find(m => m.id === method)!.label]].map(([k, v]) => (
          <div key={k} className="w-full flex flex-row items-center gap-3"><span className="flex-1 min-w-0 text-muted">{k}</span><span className="w-fit font-semibold num">{v}</span></div>
        ))}
      </div>
    </Sheet>
  );

  return (
    <Sheet open={open} onClose={onClose} title={`Bayar ${pay.label.toLowerCase()}`}
      footer={<Button block onClick={go} disabled={phase === 'busy'}>{phase === 'busy' ? <><Loader2 className="w-4 h-4 shrink-0 animate-spin" />Memproses…</> : `Bayar ${rm(pay.amount)}`}</Button>}>
      <p className="w-full text-sm text-body">Ini simulasi. Tiada wang sebenar ditolak.</p>
      {phase === 'fail' && (
        <div role="alert" className="w-full flex flex-row items-center gap-2 p-4 rounded-xl bg-bahaya-50 text-sm font-semibold text-bahaya">
          <AlertCircle className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Pembayaran gagal. Tiada caj dibuat. Kiraan hari masih berjalan, sila cuba lagi.</span>
        </div>
      )}
      <div role="radiogroup" aria-label="Kaedah bayaran" className="w-full flex flex-col gap-2">
        {METHODS.map(({ id, label, sub, Icon }) => (
          <label key={id} className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border cursor-pointer', method === id ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
            <input type="radio" name="method" checked={method === id} onChange={() => setMethod(id)} className="w-5 h-5 shrink-0 accent-hijau" />
            <Icon className="w-5 h-5 shrink-0 text-hijau" />
            <span className="flex-1 min-w-0 flex flex-col"><span className="w-full text-sm font-semibold">{label}</span><span className="w-full text-xs text-muted">{sub}</span></span>
          </label>
        ))}
      </div>
    </Sheet>
  );
}

const REASONS = ['Tukar tarikh majlis', 'Jumpa vendor lain', 'Bajet tidak cukup', 'Majlis dibatalkan', 'Lain-lain'];

export function CancelSheet({ b, open, onClose }: { b: Booking; open: boolean; onClose: () => void }) {
  const { set, toast } = useStore();
  const [why, setWhy] = useState('');
  const [more, setMore] = useState('');
  const toEvent = daysBetween(TODAY, b.date);
  const soon = toEvent <= 7;
  const { deposit, refund } = refundToday(b);
  const confirm = () => {
    set(p => ({ bookings: p.bookings.map(x => (x.id === b.id ? { ...x, status: 'cancelled', cancelReason: why === 'Lain-lain' ? more || why : why } : x)) }));
    toast('Tempahan dibatalkan');
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Batalkan tempahan?"
      footer={<><Button variant="secondary" block onClick={onClose}>Simpan tempahan</Button><Button variant="danger" block disabled={!why} onClick={confirm}>Batalkan</Button></>}>
      {soon && (
        <div role="alert" className="w-full flex flex-row gap-2 p-4 rounded-xl bg-amaran-50 text-amaran">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          <span className="flex-1 min-w-0 text-sm"><b>Majlis tinggal {Math.max(0, toEvent)} hari.</b> <span className="text-body">Vendor mungkin sudah menolak tempahan lain untuk tarikh ini. Pertimbangkan untuk berbincang dahulu.</span></span>
        </div>
      )}
      {deposit > 0 && (
        <div className="w-full flex flex-col gap-1 p-4 rounded-xl bg-amaran-50">
          <span className="w-full text-sm font-semibold text-amaran">Deposit {rm(deposit)} sudah dibayar</span>
          <span className="w-full text-sm text-body">Polisi vendor: batal lebih 60 hari sebelum majlis, {rm(Math.round(deposit / 2))} dipulangkan. Kurang 60 hari, tiada pemulangan.</span>
          <span className="w-full text-sm font-semibold num">Jika batal hari ini: {rm(refund)} dipulangkan</span>
        </div>
      )}
      <div role="radiogroup" aria-label="Sebab pembatalan" className="w-full flex flex-col gap-2">
        {REASONS.map(rs => (
          <label key={rs} className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border cursor-pointer', why === rs ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
            <input type="radio" name="why" checked={why === rs} onChange={() => setWhy(rs)} className="w-5 h-5 shrink-0 accent-hijau" />
            <span className="flex-1 min-w-0 text-sm">{rs}</span>
          </label>
        ))}
      </div>
      {why === 'Lain-lain' && (
        <textarea value={more} onChange={e => setMore(e.target.value)} rows={3} aria-label="Sebab lain" placeholder="Ceritakan sebabnya"
          className="w-full px-3.5 py-3 bg-white border border-line2 rounded-[10px] text-[15px] resize-none" />
      )}
    </Sheet>
  );
}
