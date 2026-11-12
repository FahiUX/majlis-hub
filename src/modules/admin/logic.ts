import { TODAY, addDays } from '../../store';
import { effective } from '../booking/money';
import type { AuditEntry, Booking, BookingStatus } from '../../data/types';

/** admin console logic: SLA, suspend warning, cancellation flag, CSV, booking timeline, audit entries */

export const ADMIN = 'Admin Farid';
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
export const logEntry = (action: string, target: string, reason?: string, d = new Date()): AuditEntry =>
  ({ id: `L-${d.getTime().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: `${TODAY} ${hhmm(d)}`, who: ADMIN, action, target, ...(reason ? { reason } : {}) });

/** Mon–Fri days after `from`, up to and including `to` */
export function workingDays(from: string, to: string) {
  let n = 0;
  for (let d = addDays(from, 1); d <= to; d = addDays(d, 1)) { const w = new Date(d + 'T00:00:00Z').getUTCDay(); if (w !== 0 && w !== 6) n++; }
  return n;
}
/** SLA: more than 2 working days in the queue = late (A-2.0) */
export const slaLate = (submittedAt: string, today = TODAY) => workingDays(submittedAt, today) > 2;

/** upcoming bookings a suspension would hit: accepted / deposit due / confirmed, event today or later (A-3.0) */
const UPCOMING: BookingStatus[] = ['accepted', 'deposit_due', 'confirmed'];
export const upcomingCount = (vendorId: number, bookings: Booking[]) =>
  bookings.filter(b => b.vendorId === vendorId && b.date >= TODAY && UPCOMING.includes(effective(b))).length;

/** vendors with 2 or more cancelled/declined bookings (A-4.0 flag) */
export function cancelFlags(bookings: Booking[]) {
  const n = new Map<number, number>();
  for (const b of bookings) { const st = effective(b); if (st === 'cancelled' || st === 'declined') n.set(b.vendorId, (n.get(b.vendorId) ?? 0) + 1); }
  return [...n].filter(([, c]) => c >= 2).map(([id]) => id);
}

/** RFC 4180 quoting; formula-looking text gets a leading ' so spreadsheets don't run it */
export const csv = (rows: (string | number | undefined)[][]) =>
  rows.map(r => r.map(c => {
    let s = c === undefined ? '' : String(c);
    if (typeof c === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\r\n');

export function downloadCsv(name: string, rows: (string | number | undefined)[][]) {
  const url = URL.createObjectURL(new Blob(['﻿' + csv(rows)], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** per-booking audit timeline derived from the booking's own dates (no event log in the front-end demo) */
export function timeline(b: Booking): { at?: string; text: string }[] {
  const st = effective(b);
  const t: { at?: string; text: string }[] = [{ at: b.createdAt, text: 'Permintaan tempahan dihantar' }];
  if (b.depositDeadline) t.push({ at: addDays(b.depositDeadline, -30), text: 'Vendor terima · deposit perlu dibayar dalam 30 hari' });
  for (const p of b.payments) if (p.paidAt) t.push({ at: p.paidAt, text: `${p.label} dibayar` });
  const firstPaid = b.payments.find(p => p.paidAt)?.paidAt;
  if (firstPaid && ['confirmed', 'completed', 'reviewed'].includes(st)) t.push({ at: firstPaid, text: 'Disahkan · tarikh dikunci' });
  if (st === 'expired') t.push({ at: addDays(b.createdAt, 2), text: 'Tamat tempoh · tiada balasan vendor dalam 48 jam' });
  if (st === 'lapsed') t.push({ at: b.depositDeadline, text: 'Luput · deposit tidak dibayar sebelum tarikh akhir' });
  if (st === 'completed' || st === 'reviewed') t.push({ at: b.date, text: 'Majlis selesai' });
  if (st === 'reviewed') t.push({ text: 'Pelanggan menulis ulasan' });
  if (st === 'declined') t.push({ text: `Ditolak vendor${b.cancelReason ? ': ' + b.cancelReason : ''}` });
  if (st === 'cancelled') t.push({ text: `Dibatalkan${b.cancelReason ? ': ' + b.cancelReason : ''}` });
  // dated events in order, undated outcomes last
  return t.sort((x, y) => (x.at ?? '9999').localeCompare(y.at ?? '9999'));
}

/** every booking on the platform: the demo customer's own plus other customers' with the demo vendor */
export const allBookings = (s: { bookings: Booking[]; vendorBookings: (Booking & { customer: string })[]; userName: string }) =>
  [...s.bookings.map(b => ({ ...b, customer: s.userName })), ...s.vendorBookings];

/** application town -> state (A-2.0 state filter); ponytail: town list only, add a state field to Application when real data lands */
export const stateOf = (area: string) => ({ 'Kuala Lumpur': 'WP Kuala Lumpur', Seremban: 'Negeri Sembilan', Putrajaya: 'WP Putrajaya' } as Record<string, string>)[area] ?? 'Selangor';

/** self-check: `npx tsx src/modules/admin/logic.ts` */
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('logic.ts')) {
  // TODAY 2026-11-11 is a Wednesday
  console.assert(workingDays('2026-11-06', '2026-11-11') === 3 && slaLate('2026-11-06'), 'Fri -> Wed = 3 working days, late');
  console.assert(workingDays('2026-11-09', '2026-11-11') === 2 && !slaLate('2026-11-09'), 'Mon -> Wed = 2, on time');
  console.assert(workingDays('2026-11-13', '2026-11-16') === 1, 'weekend skipped');
  const base: Booking = { id: 'x', vendorId: 5, packageId: '5-0', date: '2027-01-01', total: 100, note: '', status: 'confirmed', createdAt: '2026-10-01', depositDeadline: '2026-10-31', payments: [{ label: 'Deposit', amount: 30, due: '2026-10-31', paidAt: '2026-10-05' }] };
  const bs: Booking[] = [base, { ...base, id: 'a', status: 'deposit_due', depositDeadline: '2026-11-20' }, { ...base, id: 'b', status: 'deposit_due', depositDeadline: '2026-11-01' },
    { ...base, id: 'c', date: '2026-11-01' }, { ...base, id: 'd', status: 'requested', createdAt: TODAY }, { ...base, id: 'e', vendorId: 6 }];
  console.assert(upcomingCount(5, bs) === 2, `upcoming ${upcomingCount(5, bs)}`);
  console.assert(cancelFlags([{ ...base, status: 'cancelled' }, { ...base, status: 'declined' }, { ...base, vendorId: 6, status: 'cancelled' }]).join() === '5', 'flag');
  console.assert(csv([['a,b', 'say "hi"', 3], ['=SUM(A1)', undefined, 'x\ny']]) === '"a,b","say ""hi""",3\r\n\'=SUM(A1),,"x\ny"', `csv ${csv([['a,b', 'say "hi"', 3], ['=SUM(A1)', undefined, 'x\ny']])}`);
  const tl = timeline(base).map(e => e.text);
  console.assert(tl[0].startsWith('Permintaan') && tl.includes('Disahkan · tarikh dikunci'), `timeline ${tl}`);
  const tlc = timeline({ ...base, status: 'cancelled', cancelReason: 'Tangguh', payments: [] });
  console.assert(tlc[tlc.length - 1].text === 'Dibatalkan: Tangguh' && !tlc[tlc.length - 1].at, 'undated outcome last');
  console.assert(logEntry('Lulus', 'X', undefined, new Date(2026, 10, 11, 9, 5)).at === `${TODAY} 09:05`, 'stamp');
  console.log('ok');
}
