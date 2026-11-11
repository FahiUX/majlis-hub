import { addDays, TODAY } from '../../store';
import type { Package, Payment } from '../../data/types';

const minIso = (a: string, b: string) => (a < b ? a : b);
const maxIso = (a: string, b: string) => (a > b ? a : b);

/** 30 days to pay the deposit, but never later than the day before the event (or today, if the event is tomorrow) */
export const depositDeadline = (eventDate: string) => maxIso(TODAY, minIso(addDays(TODAY, 30), addDays(eventDate, -1)));

/** Payment schedule from a package plan: deposit at the deadline, the rest N days before the event,
 *  clamped between the deposit deadline and the event date so a late booking never gets a past or post-event due date. */
export function buildPayments(pkg: Package, total: number, eventDate: string, deadline = depositDeadline(eventDate)): Payment[] {
  return pkg.plan.map(i => ({
    label: i.label,
    amount: Math.round((total * i.pct) / 100),
    due: i.daysBefore === null ? deadline : minIso(eventDate, maxIso(deadline, addDays(eventDate, -i.daysBefore))),
  }));
}

/** self-check: `npx tsx src/modules/booking/plan.ts` */
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('plan.ts')) {
  const pkg: Package = { id: 'x', name: 'x', price: 1000, includes: [], depositPct: 30, plan: [{ label: 'Deposit', pct: 30, daysBefore: null }, { label: 'Kedua', pct: 40, daysBefore: 60 }, { label: 'Baki', pct: 30, daysBefore: 7 }] };
  const late = buildPayments(pkg, 1000, addDays(TODAY, 4));
  console.assert(late.every(p => p.due >= TODAY && p.due <= addDays(TODAY, 4)), 'late booking dues within today..event');
  console.assert(late[0].due === addDays(TODAY, 3), 'deposit due day before a near event');
  const far = buildPayments(pkg, 1000, addDays(TODAY, 200));
  console.assert(far[0].due === addDays(TODAY, 30) && far[2].due === addDays(TODAY, 193), 'normal schedule unchanged');
  console.log('plan ok');
}
