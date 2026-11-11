import { TODAY, addDays } from '../../store';
import type { Booking, TabungEntry } from '../../data/types';

/**
 * One source for booking status-by-date and money, so Planner, Tabung, booking list/detail
 * and vendor calendar always show the same numbers (PM audit consistency #3, #9).
 */

/** time-based states: unpaid deposit past its 30-day deadline = lapsed; no vendor reply within 48h = expired */
export const effective = (b: Booking): Booking['status'] =>
  b.status === 'deposit_due' && b.depositDeadline && b.depositDeadline < TODAY ? 'lapsed'
    : b.status === 'requested' && addDays(b.createdAt, 2) < TODAY ? 'expired'
      : b.status;

/** not booked: never counts toward spend, checklist or Tabung */
export const DEAD: Booking['status'][] = ['declined', 'expired', 'lapsed', 'cancelled'];
/** vendor said yes: the money is committed even before the deposit is paid */
export const COMMITTED: Booking['status'][] = ['deposit_due', 'confirmed', 'completed', 'reviewed'];
/** still holding a slot in a category (used for the "already have a vendor" warning) */
export const OPEN: Booking['status'][] = ['requested', 'accepted', 'deposit_due', 'confirmed'];

const paidOf = (b: Booking) => b.payments.reduce((t, p) => t + (p.paidAt ? p.amount : 0), 0);

/** committed = accepted-and-on totals; paid = payments made; pending = requests waiting for a vendor reply */
export function money(bookings: Booking[]) {
  let committed = 0, paid = 0, pending = 0;
  for (const b of bookings) {
    const st = effective(b);
    if (COMMITTED.includes(st)) { committed += b.total; paid += paidOf(b); }
    else if (st === 'requested' || st === 'accepted') pending += b.total;
  }
  return { committed, paid, pending, unpaid: committed - paid };
}

/** Tabung is a tracker: what was put aside, minus instalments paid since saving started */
export function tabungBalance(tabung: TabungEntry[], bookings: Booking[]) {
  const total = tabung.reduce((t, e) => t + e.amount, 0);
  const start = tabung.reduce((m, e) => (e.at < m ? e.at : m), '9999');
  const spent = bookings.flatMap(b => b.payments).reduce((t, p) => t + (p.paidAt && p.paidAt >= start ? p.amount : 0), 0);
  return { total, spent, balance: Math.max(0, total - spent) };
}

// self-check: npx tsx src/modules/booking/money.ts
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('money.ts')) {
  const base: Booking = { id: 'a', vendorId: 7, packageId: '7-0', date: '2027-02-14', total: 1000, note: '', status: 'confirmed', createdAt: TODAY,
    payments: [{ label: 'D', amount: 300, due: TODAY, paidAt: '2026-11-01' }, { label: 'B', amount: 700, due: '2027-02-07' }] };
  const req: Booking = { ...base, id: 'r', status: 'requested', total: 500, payments: [] };
  const lapsed: Booking = { ...base, id: 'l', status: 'deposit_due', depositDeadline: '2026-11-01', payments: [] };
  const m = money([base, req, lapsed]);
  console.assert(m.committed === 1000 && m.paid === 300 && m.pending === 500 && m.unpaid === 700, `money ${JSON.stringify(m)}`);
  const t = tabungBalance([{ id: '1', amount: 800, note: '', at: '2026-10-28' }], [base]);
  console.assert(t.total === 800 && t.spent === 300 && t.balance === 500, `tabung ${JSON.stringify(t)}`);
  const before = tabungBalance([{ id: '1', amount: 800, note: '', at: '2026-11-05' }], [base]);
  console.assert(before.spent === 0, 'payment before saving started does not touch the tabung');
  console.log('money ok');
}
