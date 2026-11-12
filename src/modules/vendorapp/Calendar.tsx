import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, CircleCheck, Clock, Lock, Minus, Plus, Users } from 'lucide-react';
import { nav } from '../../router';
import { useStore, TODAY } from '../../store';
import { effective } from '../booking/money';
import { Button, Sheet, StatusChip, TopBar, cx, fmtDate } from '../../components/ui';
import { Card, patchBooking, sendMsg, useRows } from './kit';
import { dayState, type DayState } from './logic';

const MONTHS = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'];
const WD = ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'];
const pad = (n: number) => String(n).padStart(2, '0');

const LOOK: Record<DayState, { cls: string; icon?: ReactNode; label: string }> = {
  free: { cls: 'bg-white border border-line text-ink', label: 'Kosong' },
  pending: { cls: 'bg-amaran-50 border border-amaran text-amaran', icon: <Clock className="w-3.5 h-3.5 shrink-0" />, label: 'Permintaan menunggu' },
  booked: { cls: 'bg-pucuk-100 border border-hijau text-hijau', icon: <Users className="w-3.5 h-3.5 shrink-0" />, label: 'Ada tempahan (slot masih ada)' },
  full: { cls: 'bg-hijau border border-hijau text-white', icon: <CircleCheck className="w-3.5 h-3.5 shrink-0" />, label: 'Penuh' },
  blocked: { cls: 'bg-line border border-line2 text-muted line-through', icon: <Lock className="w-3.5 h-3.5 shrink-0" />, label: 'Ditutup' },
};

/** V-4.0 availability: month view, tap to block/unblock, daily capacity */
export default function Calendar() {
  const { s, set, toast } = useStore();
  const rows = useRows();
  const [ym, setYm] = useState(TODAY.slice(0, 7));
  const [pick, setPick] = useState<string | null>(null);
  const [y, m] = ym.split('-').map(Number);
  const shift = (d: number) => { const t = new Date(Date.UTC(y, m - 1 + d, 1)); setYm(`${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`); };
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const cap = s.listing.capacity;

  const day = pick ? dayState(rows, pick, s.listing.blocked, cap) : null;
  const onDay = pick ? rows.filter(b => b.date === pick && !['declined', 'expired', 'cancelled', 'lapsed'].includes(effective(b))) : [];
  const pending = onDay.filter(b => effective(b) === 'requested');
  const setBlocked = (date: string, on: boolean) => set(p => ({ listing: { ...p.listing, blocked: on ? [...p.listing.blocked, date] : p.listing.blocked.filter(d => d !== date) } }));
  const block = (declineToo: boolean) => {
    if (!pick) return;
    if (declineToo) pending.forEach(b => { set(patchBooking(b.id, () => ({ status: 'declined', cancelReason: 'Penuh pada tarikh ini' }))); set(sendMsg(b, `Maaf, ${fmtDate(pick)} sudah penuh.`)); });
    setBlocked(pick, true);
    toast(declineToo ? `${fmtDate(pick)} ditutup, ${pending.length} permintaan ditolak` : `${fmtDate(pick)} ditutup`);
    setPick(null);
  };

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Kalendar" fallback="/v" />
      <div className="w-full flex flex-col gap-4 p-5">
        <Card>
          <div className="w-full flex flex-row items-center gap-3">
            <span className="flex-1 min-w-0 flex flex-col">
              <span className="w-full text-[15px] font-semibold">Kapasiti harian</span>
              <span className="w-full text-xs text-muted">Bilangan majlis yang boleh diambil sehari</span>
            </span>
            <button aria-label="Kurangkan kapasiti" disabled={cap <= 1} onClick={() => set(p => ({ listing: { ...p.listing, capacity: p.listing.capacity - 1 } }))} className="w-11 h-11 shrink-0 rounded-full border border-line2 flex items-center justify-center disabled:opacity-40"><Minus className="w-5 h-5 shrink-0" /></button>
            <span aria-live="polite" className="w-8 shrink-0 text-center text-lg font-bold num">{cap}</span>
            <button aria-label="Tambah kapasiti" disabled={cap >= 5} onClick={() => set(p => ({ listing: { ...p.listing, capacity: p.listing.capacity + 1 } }))} className="w-11 h-11 shrink-0 rounded-full border border-line2 flex items-center justify-center disabled:opacity-40"><Plus className="w-5 h-5 shrink-0" /></button>
          </div>
        </Card>

        <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
          <div className="w-full flex flex-row items-center gap-2">
            <button aria-label="Bulan sebelum" onClick={() => shift(-1)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-50"><ChevronLeft className="w-5 h-5 shrink-0" /></button>
            <h2 className="flex-1 min-w-0 text-center text-base font-semibold">{MONTHS[m - 1]} {y}</h2>
            <button aria-label="Bulan seterusnya" onClick={() => shift(1)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-50"><ChevronRight className="w-5 h-5 shrink-0" /></button>
          </div>
          <div className="w-full flex flex-row gap-1">{WD.map(d => <span key={d} className="flex-1 min-w-0 text-center text-xs font-semibold text-muted">{d}</span>)}</div>
          {weeks.map((w, i) => (
            <div key={i} className="w-full flex flex-row gap-1">
              {w.map((d, j) => {
                if (!d) return <span key={j} className="flex-1 min-w-0 h-14" />;
                const { state, used } = dayState(rows, d, s.listing.blocked, cap);
                const past = d < TODAY;
                const L = LOOK[state];
                return (
                  <button key={d} disabled={past} onClick={() => setPick(d)} aria-label={`${fmtDate(d, true)}: ${L.label}${used ? `, ${used}/${cap} slot` : ''}`}
                    className={cx('flex-1 min-w-0 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-semibold num', L.cls, past && 'opacity-40', d === TODAY && 'ring-2 ring-ink')}>
                    <span className="w-full text-center">{Number(d.slice(8))}</span>
                    {state === 'booked' ? <span className="text-[10px] leading-3">{used}/{cap}</span> : L.icon}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-2">
          <span className="w-full text-sm font-semibold">Petunjuk</span>
          <div className="w-full flex flex-row flex-wrap gap-3">
            {(Object.keys(LOOK) as DayState[]).map(k => (
              <span key={k} className="w-fit flex flex-row items-center gap-1.5 text-xs text-body">
                <span className={cx('w-6 h-6 shrink-0 rounded-md flex items-center justify-center no-underline', LOOK[k].cls.replace('line-through', ''))}>{LOOK[k].icon}</span>{LOOK[k].label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!pick} onClose={() => setPick(null)} title={pick ? fmtDate(pick, true) : ''}
        footer={pick && day ? (day.state === 'blocked'
          ? <Button block onClick={() => { setBlocked(pick, false); toast(`${fmtDate(pick)} dibuka semula`); setPick(null); }}>Buka tarikh</Button>
          : pending.length
            ? <><Button variant="secondary" block onClick={() => block(false)}>Tutup sahaja</Button><Button variant="danger" block onClick={() => block(true)}>Tolak & tutup</Button></>
            : <Button variant="secondary" block onClick={() => block(false)}><Lock className="w-4 h-4 shrink-0" />Tutup tarikh</Button>) : undefined}>
        {day && (
          <>
            <p className="w-full text-sm text-body">{LOOK[day.state].label} · {day.used}/{cap} slot digunakan</p>
            {pending.length > 0 && day.state !== 'blocked' && (
              <div role="alert" className="w-full p-4 rounded-xl bg-amaran-50 text-sm text-amaran"><b>{pending.length} permintaan menunggu</b> <span className="text-body">pada tarikh ini. Jika anda tutup tarikh, tolak permintaan supaya pelanggan boleh cari vendor lain.</span></div>
            )}
            {onDay.map(b => (
              <button key={b.id} onClick={() => nav(`/v/tempahan/${b.id}`)} className="w-full flex flex-row items-center gap-3 p-3 rounded-xl border border-line text-left">
                <span className="flex-1 min-w-0 flex flex-col"><span className="w-full text-sm font-semibold">{b.customer}</span><span className="w-full text-xs text-muted">{b.id} · {b.place}</span></span>
                <StatusChip s={effective(b)} />
              </button>
            ))}
          </>
        )}
      </Sheet>
    </div>
  );
}
