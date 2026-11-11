import { vendorById } from '../../data/mock';
import type { Booking, TabungEntry } from '../../data/types';
import { TODAY, daysBetween } from '../../store';

export interface Due { bookingId: string; vendorName: string; label: string; amount: number; due: string; covered: number }

/**
 * Savings plan (spec C-8.0). Money is never held: this only plans.
 * saved = sum(tabung); owed = sum(unpaid payments); monthly = ceil((owed - saved) / months to last due).
 * Savings cover instalments in due order (waterfall) for the per-instalment rings.
 */
export function plan(bookings: Booking[], tabung: TabungEntry[]) {
  const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'deposit_due');
  const dues: Due[] = active
    .flatMap(b => b.payments.filter(p => !p.paidAt).map(p => ({ bookingId: b.id, vendorName: vendorById(b.vendorId)?.name ?? '', label: p.label, amount: p.amount, due: p.due, covered: 0 })))
    .sort((a, b) => a.due.localeCompare(b.due));
  const saved = tabung.reduce((t, e) => t + e.amount, 0);
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
  const neededNow = Math.round(owed * Math.min(1, daysBetween(start, TODAY) / span));
  const short = Math.max(0, neededNow - saved);
  return { dues, saved, owed, remaining, months, monthly, short, active };
}

// self-check: npx tsx src/modules/tabung/calc.ts
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('calc.ts')) {
  const b: Booking = { id: 'x', vendorId: 7, packageId: '7-0', date: '2027-02-14', total: 3000, note: '', status: 'confirmed', createdAt: TODAY,
    payments: [{ label: 'A', amount: 1000, due: '2026-12-11' }, { label: 'B', amount: 2000, due: '2027-02-09' }] };
  const r = plan([b], [{ id: 't', amount: 1500, note: '', at: TODAY }]);
  console.assert(r.owed === 3000 && r.remaining === 1500, 'owed/remaining');
  console.assert(r.dues[0].covered === 1000 && r.dues[1].covered === 500, 'waterfall');
  console.assert(r.months === 3 && r.monthly === 500, `monthly ${r.months} ${r.monthly}`);
  console.log('calc ok');
}
