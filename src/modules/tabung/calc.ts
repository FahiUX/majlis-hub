import { vendorById } from '../../data/mock';
import type { Booking, TabungEntry } from '../../data/types';
import { TODAY, daysBetween } from '../../store';
import { effective as liveStatus, tabungBalance } from '../booking/money';

// status-by-date lives in booking/money.ts so every screen agrees
export { effective as liveStatus, DEAD } from '../booking/money';

export interface Due { bookingId: string; vendorName: string; label: string; amount: number; due: string; covered: number }

/**
 * Savings plan (spec C-8.0). Money is never held: this only plans.
 * saved = tabung balance (entries minus instalments paid since saving started); owed = sum(unpaid payments);
 * monthly = ceil((owed - saved) / months to last due).
 * Savings cover instalments in due order (waterfall) for the per-instalment rings.
 */
export function plan(bookings: Booking[], tabung: TabungEntry[]) {
  const active = bookings.filter(b => liveStatus(b) === 'confirmed' || liveStatus(b) === 'deposit_due');
  const dues: Due[] = active
    .flatMap(b => b.payments.filter(p => !p.paidAt).map(p => ({ bookingId: b.id, vendorName: vendorById(b.vendorId)?.name ?? '', label: p.label, amount: p.amount, due: p.due, covered: 0 })))
    .sort((a, b) => a.due.localeCompare(b.due));
  const bal = tabungBalance(tabung, bookings);
  const saved = bal.balance;
  const owed = dues.reduce((t, d) => t + d.amount, 0);
  let pool = saved;
  for (const d of dues) { d.covered = Math.min(d.amount, pool); pool -= d.covered; }
  const remaining = Math.max(0, owed - saved);
  const last = dues.length ? dues[dues.length - 1].due : TODAY;
  const months = Math.max(1, Math.ceil(daysBetween(TODAY, last) / 30));
  const monthly = Math.ceil(remaining / months / 10) * 10;
  // straight line from when the plan started (earliest active booking) to the last due date
  const start = active.reduce((m, b) => (b.createdAt < m ? b.createdAt : m), TODAY);
  const span = Math.max(1, daysBetween(start, last));
  // progress counts instalments already paid from the tabung, so paying never looks like falling behind
  const neededNow = Math.round((owed + bal.spent) * Math.min(1, daysBetween(start, TODAY) / span));
  const short = Math.max(0, neededNow - bal.total);
  const overdue = dues.filter(d => d.due < TODAY);
  return { dues, saved, total: bal.total, spentFromTabung: bal.spent, owed, remaining, months, monthly, short, active, overdue };
}

// self-check: npx tsx src/modules/tabung/calc.ts
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('calc.ts')) {
  const b: Booking = { id: 'x', vendorId: 7, packageId: '7-0', date: '2027-02-14', total: 3000, note: '', status: 'confirmed', createdAt: TODAY,
    payments: [{ label: 'A', amount: 1000, due: '2026-12-11' }, { label: 'B', amount: 2000, due: '2027-02-09' }] };
  const r = plan([b], [{ id: 't', amount: 1500, note: '', at: TODAY }]);
  console.assert(r.owed === 3000 && r.remaining === 1500, 'owed/remaining');
  console.assert(r.dues[0].covered === 1000 && r.dues[1].covered === 500, 'waterfall');
  console.assert(r.months === 3 && r.monthly === 500, `monthly ${r.months} ${r.monthly}`);
  const lapsed: Booking = { ...b, id: 'l', status: 'deposit_due', depositDeadline: '2026-11-05' };
  const expired: Booking = { ...b, id: 'e', status: 'requested', createdAt: '2026-11-07', payments: [] };
  console.assert(liveStatus(lapsed) === 'lapsed' && liveStatus(expired) === 'expired' && liveStatus(b) === 'confirmed', 'liveStatus');
  console.assert(plan([b, lapsed], []).owed === 3000, 'lapsed excluded from Tabung');
  const late: Booking = { ...b, payments: [{ label: 'A', amount: 1000, due: '2026-11-01' }] };
  console.assert(plan([late], []).overdue.length === 1, 'overdue');
  const paidNow: Booking = { ...b, payments: [{ label: 'A', amount: 1000, due: '2026-12-11', paidAt: TODAY }, { label: 'B', amount: 2000, due: '2027-02-09' }] };
  const after = plan([paidNow], [{ id: 't', amount: 1500, note: '', at: '2026-11-01' }]);
  console.assert(after.total === 1500 && after.saved === 500 && after.owed === 2000, `paying drops the tabung balance ${after.saved}`);
  const unpaid = plan([{ ...paidNow, payments: paidNow.payments.map(p => ({ ...p, paidAt: undefined })) }], [{ id: 't', amount: 1500, note: '', at: '2026-11-01' }]);
  console.assert(after.short === unpaid.short, `paying keeps shortfall ${after.short} vs ${unpaid.short}`);
  console.log('calc ok');
}
