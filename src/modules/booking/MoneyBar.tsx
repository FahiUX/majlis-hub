import { Hourglass, TriangleAlert } from 'lucide-react';
import { rm, cx } from '../../components/ui';
import type { Booking } from '../../data/types';
import { money } from './money';

/** budget bar shared by Planner and Tempahan saya, so both read the same numbers */
export default function MoneyBar({ bookings, budget }: { bookings: Booking[]; budget?: number }) {
  const m = money(bookings);
  const base = budget ?? Math.max(1, m.committed);
  const over = budget !== undefined && m.committed > budget;
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full flex flex-row items-center gap-2 text-sm">
        <span className="flex-1 min-w-0 font-semibold num">Disahkan {rm(m.committed)} · Dibayar {rm(m.paid)}</span>
        {budget !== undefined && <span className="w-fit shrink-0 text-muted num">daripada {rm(budget)}</span>}
      </div>
      <div className="relative w-full h-2 rounded-full bg-white border border-line overflow-hidden" role="progressbar" aria-label="Bajet disahkan"
        aria-valuenow={Math.round((m.committed / base) * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className={cx('absolute inset-y-0 left-0 rounded-full', over ? 'bg-amaran/40' : 'bg-pucuk-200')} style={{ width: `${Math.min(100, (m.committed / base) * 100)}%` }} />
        <div className={cx('absolute inset-y-0 left-0 rounded-full', over ? 'bg-amaran' : 'bg-hijau')} style={{ width: `${Math.min(100, (m.paid / base) * 100)}%` }} />
      </div>
      <div className="w-full flex flex-row flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-hijau" />Dibayar</span>
        <span className="w-fit flex flex-row items-center gap-1.5"><span className="w-2.5 h-2.5 shrink-0 rounded-full bg-pucuk-200" />Disahkan, belum bayar {rm(m.unpaid)}</span>
      </div>
      {m.pending > 0 && (
        <p className="w-full flex flex-row items-center gap-1.5 text-sm text-body">
          <Hourglass className="w-4 h-4 shrink-0 text-muted" /><span className="flex-1 min-w-0">Menunggu jawapan vendor {rm(m.pending)} (belum dikira dalam bajet)</span>
        </p>
      )}
      {over && budget !== undefined && (
        <p className="w-full flex flex-row items-center gap-1.5 text-sm text-amaran"><TriangleAlert className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Melebihi bajet {rm(m.committed - budget)}. Anda masih boleh teruskan.</span></p>
      )}
    </div>
  );
}
