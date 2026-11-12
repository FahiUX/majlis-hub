import { useEffect, useState } from 'react';
import { AlertTriangle, CalendarCheck, ClipboardCheck, MessageSquareWarning, RotateCw, Store, type LucideIcon } from 'lucide-react';
import { nav, swap } from '../../router';
import { TODAY, addDays, useStore } from '../../store';
import { CATS, vendorById } from '../../data/mock';
import { Chip, EmptyState, Pill } from '../../components/ui';
import { Btn, Card, PageHead } from './kit';
import { allBookings, cancelFlags, slaLate } from './logic';

const AREAS = ['Semua', 'Selangor', 'WP Kuala Lumpur', 'Negeri Sembilan'];

function Kpi({ Icon, label, value, sub, to }: { Icon: LucideIcon; label: string; value: number; sub: string; to: string }) {
  return (
    <button onClick={() => nav(to)} className="flex-1 min-w-0 flex flex-col items-stretch gap-3 p-6 bg-white border border-line rounded-2xl text-left hover:border-line2">
      <span className="w-10 h-10 shrink-0 rounded-[10px] bg-pucuk-100 text-hijau flex items-center justify-center"><Icon className="w-5 h-5 shrink-0" aria-hidden /></span>
      <span className="w-full text-sm text-body">{label}</span>
      <span className="w-full text-[28px] leading-8 font-semibold num">{value}</span>
      <span className="w-full text-xs text-muted">{sub}</span>
    </button>
  );
}

/** A-1.0 platform dashboard */
export default function Dashboard({ fail }: { fail: boolean }) {
  const { s } = useStore();
  const [phase, setPhase] = useState<'load' | 'ok' | 'err'>('load');
  const [area, setArea] = useState('Semua');
  useEffect(() => {
    if (phase !== 'load') return;
    const t = setTimeout(() => setPhase(fail ? 'err' : 'ok'), 400);
    return () => clearTimeout(t);
  }, [phase, fail]);

  const head = <PageHead title="Papan pemuka" sub={`Ringkasan platform setakat hari ini`} />;
  if (phase === 'load') return (
    <>
      {head}
      <div className="w-full flex flex-row gap-5" aria-busy="true" aria-label="Memuatkan">
        {[0, 1, 2, 3].map(i => <div key={i} className="flex-1 min-w-0 h-[168px] rounded-2xl skeleton" />)}
      </div>
      <div className="w-full flex flex-row gap-5">
        <div className="flex-1 min-w-0 h-[360px] rounded-2xl skeleton" />
        <div className="w-[340px] shrink-0 h-[360px] rounded-2xl skeleton" />
      </div>
    </>
  );
  if (phase === 'err') return (
    <>
      {head}
      <Card>
        <EmptyState icon={<AlertTriangle className="w-6 h-6 shrink-0" />} title="Gagal memuatkan data papan pemuka" body="Semak sambungan anda dan cuba lagi."
          action={<Btn onClick={() => { setPhase('load'); swap('/admin'); }}><RotateCw className="w-4 h-4 shrink-0" />Cuba lagi</Btn>} />
      </Card>
    </>
  );

  const pending = s.applications.filter(a => a.status === 'submitted');
  const late = pending.filter(a => slaLate(a.submittedAt)).length;
  const weekAgo = addDays(TODAY, -7);
  const newVendors = s.audit.filter(e => e.action === 'Lulus' && e.at.slice(0, 10) >= weekAgo).length;
  const bookings = allBookings(s);
  const month = bookings.filter(b => b.createdAt.slice(0, 7) === TODAY.slice(0, 7)).length;
  const rr = s.reviewReports.filter(x => x.status === 'open').length;
  const cr = s.contentReports.filter(x => x.status === 'open').length;
  const flagged = cancelFlags(bookings).length;

  const counts = CATS.map(c => ({
    c, n: bookings.filter(b => { const v = vendorById(b.vendorId); return v?.cat === c.id && (area === 'Semua' || v.state === area); }).length,
  })).sort((a, b) => b.n - a.n);
  const max = Math.max(1, ...counts.map(x => x.n));

  const todo: [string, number, string][] = [
    ['Permohonan lewat SLA', late, '/admin/pengesahan'],
    ['Ulasan dilaporkan', rr, '/admin/ulasan'],
    ['Kandungan dilaporkan', cr, '/admin/kandungan'],
    ['Vendor dibenderakan (≥2 batal)', flagged, '/admin/tempahan'],
  ];

  return (
    <>
      {head}
      <div className="w-full flex flex-row items-stretch gap-5">
        <Kpi Icon={ClipboardCheck} label="Menunggu pengesahan" value={pending.length} sub={late ? `${late} lewat SLA (lebih 2 hari bekerja)` : 'Semua dalam SLA'} to="/admin/pengesahan" />
        <Kpi Icon={Store} label="Vendor baharu minggu ini" value={newVendors} sub="Diluluskan dalam 7 hari lepas" to="/admin/log" />
        <Kpi Icon={CalendarCheck} label="Tempahan bulan ini" value={month} sub="Permintaan baharu, November 2026" to="/admin/tempahan" />
        <Kpi Icon={MessageSquareWarning} label="Ulasan dilaporkan" value={rr} sub={`+ ${cr} laporan kandungan terbuka`} to="/admin/ulasan" />
      </div>
      <div className="w-full flex flex-row items-stretch gap-5">
        <Card title="Kategori teratas mengikut kawasan" className="flex-1 min-w-0">
          <div role="group" aria-label="Kawasan" className="w-full flex flex-row flex-wrap gap-2">
            {AREAS.map(a => <Chip key={a} on={area === a} onClick={() => setArea(a)}>{a}</Chip>)}
          </div>
          <ul className="w-full flex flex-col gap-3" aria-label="Bilangan tempahan mengikut kategori">
            {counts.map(({ c, n }) => (
              <li key={c.id} className="w-full flex flex-row items-center gap-4 text-sm">
                <span className="w-[150px] shrink-0">{c.name}</span>
                <span className="flex-1 min-w-0 h-2.5 rounded-full bg-line overflow-hidden">
                  <span className="block h-full rounded-full bg-hijau" style={{ width: `${(n / max) * 100}%` }} />
                </span>
                <span className="w-[80px] shrink-0 text-right text-muted num">{n} tempahan</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Perlu tindakan" className="w-[340px] shrink-0">
          <ul className="w-full flex flex-col gap-1">
            {todo.map(([t, n, to]) => (
              <li key={t} className="w-full">
                <button onClick={() => nav(to)} className="w-full flex flex-row items-center gap-3 px-3 py-2.5 leading-5 rounded-[10px] text-sm text-left hover:bg-kertas">
                  <span className="flex-1 min-w-0">{t}</span>
                  {n > 0 ? <Pill tone="bahaya"><AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />{n}</Pill> : <Pill tone="hijau">0</Pill>}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
