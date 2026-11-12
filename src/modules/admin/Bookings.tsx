import { useState } from 'react';
import { Flag, SearchX } from 'lucide-react';
import { useStore } from '../../store';
import { vendorById } from '../../data/mock';
import { Chip, EmptyState, Pill, StatusChip, cx, fmtDate, rm, statusLabel } from '../../components/ui';
import { effective } from '../booking/money';
import type { BookingStatus } from '../../data/types';
import { Banner, Btn, Card, Dl, Drawer, PageHead, SearchBox, T, Table } from './kit';
import { allBookings, cancelFlags, timeline } from './logic';

type Row = ReturnType<typeof allBookings>[number] & { st: BookingStatus; vendor: string };

/** A-4.0 read-only booking monitor */
export default function Bookings() {
  const { s } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<BookingStatus | ''>('');
  const [open, setOpen] = useState<Row | null>(null);
  const all: Row[] = allBookings(s).map(b => ({ ...b, st: effective(b), vendor: vendorById(b.vendorId)?.name ?? `Vendor ${b.vendorId}` }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const flagged = cancelFlags(all);
  const present = [...new Set(all.map(b => b.st))];
  const ql = q.toLowerCase();
  const rows = all.filter(b => (!f || b.st === f) && (!q || [b.id, b.customer, b.vendor].some(x => x.toLowerCase().includes(ql))));

  return (
    <>
      <PageHead title="Tempahan" sub="Pemantauan sahaja. Admin tidak mengubah tempahan." />
      {flagged.length > 0
        ? <Banner tone="bahaya" icon={<Flag className="w-4 h-4 shrink-0" />}>
            <span className="w-full font-semibold">Vendor dibenderakan: banyak pembatalan</span>
            <span className="w-full">{flagged.map(id => `${vendorById(id)?.name} (${all.filter(b => b.vendorId === id && (b.st === 'cancelled' || b.st === 'declined')).length})`).join(', ')} mempunyai 2 atau lebih tempahan dibatalkan/ditolak.</span>
          </Banner>
        : <p className="w-full text-sm text-muted">Tiada vendor dengan 2 atau lebih tempahan dibatalkan/ditolak.</p>}
      <div className="w-full flex flex-col gap-3">
        <SearchBox label="Cari ID, pelanggan atau vendor" value={q} onChange={setQ} />
        <div role="group" aria-label="Status" className="w-full flex flex-row flex-wrap gap-2">
          <Chip on={!f} onClick={() => setF('')}>Semua ({all.length})</Chip>
          {present.map(st => <Chip key={st} on={f === st} onClick={() => setF(st)}>{statusLabel(st)} ({all.filter(b => b.st === st).length})</Chip>)}
        </div>
      </div>
      {rows.length === 0 ? <Card><EmptyState icon={<SearchX className="w-6 h-6 shrink-0" />} title="Tiada tempahan sepadan" /></Card> : (
        <Table label="Semua tempahan" rows={rows} k={b => b.id} cols={[
          { h: 'ID', w: 'w-[90px] shrink-0', c: b => <T strong>{b.id}</T> },
          { h: 'Pelanggan', w: 'w-[150px] shrink-0', c: b => <T>{b.customer}</T> },
          { h: 'Vendor', w: 'flex-1 min-w-0', c: b => <>{flagged.includes(b.vendorId) && <Flag className="w-4 h-4 shrink-0 text-bahaya" aria-label="Dibenderakan" />}<T>{b.vendor}</T></> },
          { h: 'Tarikh majlis', w: 'w-[120px] shrink-0', c: b => <T>{fmtDate(b.date)}</T> },
          { h: 'Jumlah', w: 'w-[100px] shrink-0', c: b => <T>{rm(b.total)}</T> },
          { h: 'Status', w: 'w-[230px] shrink-0', c: b => <StatusChip s={b.st} /> },
          { h: 'Butiran', w: 'w-[100px] shrink-0', c: b => <Btn v="secondary" onClick={() => setOpen(b)} aria-label={`Butiran ${b.id}`}>Lihat</Btn> },
        ]} />
      )}
      {open && (
        <Drawer title={`Tempahan ${open.id}`} onClose={() => setOpen(null)}>
          <div className="w-full flex flex-row items-center gap-2"><StatusChip s={open.st} />{flagged.includes(open.vendorId) && <Pill tone="bahaya"><Flag className="w-3.5 h-3.5 shrink-0" aria-hidden />Vendor dibenderakan</Pill>}</div>
          <Dl rows={[
            ['Pelanggan', open.customer],
            ['Vendor', open.vendor],
            ['Pakej', vendorById(open.vendorId)?.packages.find(p => p.id === open.packageId)?.name ?? open.packageId],
            ['Tarikh majlis', fmtDate(open.date, true)],
            ['Jumlah', rm(open.total)],
            ['Dibayar', rm(open.payments.reduce((t, p) => t + (p.paidAt ? p.amount : 0), 0))],
            ['Nota', open.note || '—'],
          ]} />
          <div className="w-full h-px bg-line shrink-0" />
          <h3 className="w-full text-sm font-semibold">Garis masa audit</h3>
          <ol className="w-full flex flex-col gap-4">
            {timeline(open).map((e, i, arr) => (
              <li key={i} className="w-full flex flex-row items-start gap-3">
                <span className={cx('w-2.5 h-2.5 shrink-0 rounded-full', i === arr.length - 1 ? 'bg-hijau' : 'bg-line2')} aria-hidden />
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="w-full text-sm">{e.text}</span>
                  <span className="w-full text-xs text-muted">{e.at ? fmtDate(e.at) : 'Tarikh tidak direkod'}</span>
                </div>
              </li>
            ))}
          </ol>
        </Drawer>
      )}
    </>
  );
}
