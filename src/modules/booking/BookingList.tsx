import { CalendarHeart, ChevronRight, Hourglass } from 'lucide-react';
import { useStore, daysBetween, addDays, TODAY } from '../../store';
import { nav } from '../../router';
import { vendorById } from '../../data/mock';
import type { Booking } from '../../data/types';
import { Button, EmptyState, Img, StatusChip, TopBar, cx, fmtDate, rm } from '../../components/ui';

/** time-based states: unpaid deposit past its 30-day deadline = lapsed; no vendor reply within 48h = expired */
export const effective = (b: Booking): Booking['status'] =>
  b.status === 'deposit_due' && b.depositDeadline && b.depositDeadline < TODAY ? 'lapsed'
    : b.status === 'requested' && addDays(b.createdAt, 2) < TODAY ? 'expired'
      : b.status;

export function DepositLine({ b }: { b: Booking }) {
  const left = daysBetween(TODAY, b.depositDeadline ?? TODAY);
  return (
    <span className={cx('w-full flex flex-row items-center gap-1.5 text-sm font-semibold', left <= 3 ? 'text-bahaya' : 'text-amaran')}>
      <Hourglass className="w-4 h-4 shrink-0" />
      <span className="flex-1 min-w-0">{left <= 0 ? 'Hari terakhir bayar deposit' : `${left} hari lagi untuk bayar deposit`}</span>
    </span>
  );
}

const GROUPS: [string, (b: Booking) => boolean][] = [
  ['Perlu tindakan', b => effective(b) === 'deposit_due'],
  ['Aktif', b => ['requested', 'accepted', 'confirmed'].includes(effective(b))],
  ['Lepas', b => !['deposit_due', 'requested', 'accepted', 'confirmed'].includes(effective(b))],
];

export default function BookingList() {
  const { s } = useStore();
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Tempahan saya" fallback="/majlis" />
      {s.bookings.length === 0 ? (
        <EmptyState icon={<CalendarHeart className="w-6 h-6" />} title="Belum ada tempahan" body="Cari vendor dan hantar permintaan. Semua tempahan anda akan muncul di sini." action={<Button onClick={() => nav('/cari')}>Cari vendor</Button>} />
      ) : (
        <div className="w-full flex flex-col gap-6 p-5">
          {GROUPS.map(([label, fn]) => {
            const list = s.bookings.filter(fn);
            if (!list.length) return null;
            return (
              <section key={label} className="w-full flex flex-col gap-3">
                <h2 className="w-full text-base font-semibold">{label} · {list.length}</h2>
                {list.map(b => {
                  const v = vendorById(b.vendorId);
                  if (!v) return null;
                  const pkg = v.packages.find(p => p.id === b.packageId);
                  return (
                    <button key={b.id} onClick={() => nav(`/tempahan/${b.id}`)} className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line text-left">
                      <div className="w-full flex flex-row items-center gap-3">
                        <Img src={v.img} cat={v.cat} alt="" className="w-14 h-14 shrink-0 rounded-xl" />
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <span className="w-full text-[15px] font-semibold">{v.name}</span>
                          <span className="w-full text-sm text-muted">{pkg?.name} · {fmtDate(b.date)}</span>
                          <span className="w-full text-sm font-semibold num">{rm(b.total)}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 shrink-0 text-muted" />
                      </div>
                      <StatusChip s={effective(b)} />
                      {effective(b) === 'deposit_due' && <DepositLine b={b} />}
                    </button>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
