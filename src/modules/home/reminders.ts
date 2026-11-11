import { TODAY, daysBetween } from '../../store';
import { vendorById } from '../../data/mock';
import { effective } from '../booking/money';
import type { Booking, Invitation, Rsvp } from '../../data/types';

/** reminder rows derived from bookings + RSVP, no stored state (C-4.4, C-8.1) */
export interface Notice {
  id: string;
  kind: 'deposit' | 'overdue' | 'instalment' | 'rsvpClose' | 'rsvpNew';
  /** deposit <= 3 days left or an overdue instalment */
  urgent: boolean;
  vendor?: string;
  label?: string;
  amount?: number;
  date?: string;
  /** days until `date` (negative = late) */
  days: number;
  count?: number;
  to: string;
}

export function notices(bookings: Booking[], inv: Invitation, rsvps: Rsvp[]): Notice[] {
  const out: Notice[] = [];
  for (const b of bookings) {
    const st = effective(b);
    const vendor = vendorById(b.vendorId)?.name;
    if (st === 'deposit_due' && b.depositDeadline) {
      const days = daysBetween(TODAY, b.depositDeadline);
      out.push({ id: b.id + '-dep', kind: 'deposit', urgent: days <= 3, vendor, amount: b.payments[0]?.amount, date: b.depositDeadline, days, to: '/tempahan/' + b.id });
    }
    if (st === 'confirmed') {
      b.payments.forEach((p, i) => {
        if (p.paidAt) return;
        const days = daysBetween(TODAY, p.due);
        if (days < 0) out.push({ id: `${b.id}-${i}`, kind: 'overdue', urgent: true, vendor, label: p.label, amount: p.amount, date: p.due, days, to: '/tempahan/' + b.id });
        else if (days <= 14) out.push({ id: `${b.id}-${i}`, kind: 'instalment', urgent: false, vendor, label: p.label, amount: p.amount, date: p.due, days, to: '/tempahan/' + b.id });
      });
    }
  }
  const closeIn = daysBetween(TODAY, inv.rsvpClose);
  if (closeIn >= 0 && closeIn <= 30) out.push({ id: 'rsvp-close', kind: 'rsvpClose', urgent: false, date: inv.rsvpClose, days: closeIn, to: '/kad/rsvp' });
  const fresh = rsvps.filter(r => daysBetween(r.at, TODAY) <= 3).length;
  if (fresh) out.push({ id: 'rsvp-new', kind: 'rsvpNew', urgent: false, count: fresh, days: 0, to: '/kad/rsvp' });
  // urgent first; an unpaid deposit cancels the booking, so it outranks a late instalment
  const rank = (n: Notice) => (n.urgent ? (n.kind === 'deposit' ? 0 : 1) : 2);
  return out.sort((a, b) => rank(a) - rank(b) || a.days - b.days);
}

// self-check: npx tsx src/modules/home/reminders.ts
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('reminders.ts')) {
  const inv = { rsvpClose: '2027-02-01' } as Invitation;
  const dep: Booking = { id: 'd', vendorId: 10, packageId: '10-0', date: '2027-02-14', total: 6500, note: '', status: 'deposit_due', createdAt: '2026-10-14', depositDeadline: '2026-11-13', payments: [{ label: 'Deposit', amount: 1950, due: '2026-11-13' }] };
  const late: Booking = { ...dep, id: 'c', status: 'confirmed', payments: [{ label: 'Deposit', amount: 1, due: '2026-10-01', paidAt: '2026-10-01' }, { label: 'Bayaran kedua', amount: 1920, due: '2026-11-08' }] };
  const n = notices([dep, late], inv, []);
  console.assert(n.length === 2 && n.every(x => x.urgent), 'urgent deposit + overdue');
  console.assert(n.find(x => x.kind === 'overdue')!.days === -3, 'late 3 days');
  console.assert(n.find(x => x.kind === 'deposit')!.days === 2, 'deposit in 2 days');
  console.log('reminders ok');
}
