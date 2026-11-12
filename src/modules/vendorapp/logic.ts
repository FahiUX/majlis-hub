import { addDays, TODAY } from '../../store';
import { effective } from '../booking/money';
import type { Booking, BookingStatus, Instalment } from '../../data/types';

/** demo clock: TODAY at 8pm, so the 48h reply countdown is deterministic (B-1066 shows red <6h).
 *  ponytail: fixed time-of-day; use Date.now() once TODAY is real. */
export const NOW = new Date(TODAY + 'T20:00:00').getTime();

/** hours left to reply: 48h from createdAt (a date, read as midnight). effective() expires it a day later, so 0h shows as "Kurang 1 jam" until then */
export const hoursLeft = (b: Pick<Booking, 'createdAt'>, now = NOW) =>
  Math.max(0, Math.floor((new Date(addDays(b.createdAt, 2) + 'T00:00:00').getTime() - now) / 36e5));
export const replyLabel = (h: number) => (h < 1 ? 'Kurang 1 jam' : h < 24 ? `${h} jam lagi` : `${Math.floor(h / 24)} hari ${h % 24} jam`);

/** urgency: unanswered requests (least time first), then unpaid deposits (nearest deadline), then upcoming events, then the rest */
export function byUrgency<T extends Booking>(list: T[]): T[] {
  const key = (b: T): [number, number | string] => {
    const st = effective(b);
    if (st === 'requested') return [0, hoursLeft(b)];
    if (st === 'deposit_due') return [1, b.depositDeadline ?? b.date];
    if (['accepted', 'confirmed'].includes(st) && b.date >= TODAY) return [2, b.date];
    if (st === 'confirmed') return [3, b.date];
    return [4, b.date];
  };
  return [...list].sort((a, b) => {
    const [ga, va] = key(a), [gb, vb] = key(b);
    return ga - gb || (va < vb ? -1 : va > vb ? 1 : 0);
  });
}

/** statuses that hold a slot on the date */
export const HOLD: BookingStatus[] = ['accepted', 'deposit_due', 'confirmed', 'completed', 'reviewed'];
export const usedOn = (list: Booking[], date: string, except?: string) => list.filter(b => b.date === date && b.id !== except && HOLD.includes(effective(b))).length;
export const wouldExceed = (list: Booking[], b: Booking, capacity: number) => usedOn(list, b.date, b.id) + 1 > capacity;

export type DayState = 'blocked' | 'full' | 'booked' | 'pending' | 'free';
export function dayState(list: Booking[], date: string, blocked: string[], capacity: number): { state: DayState; used: number; pending: number } {
  const used = usedOn(list, date);
  const pending = list.filter(b => b.date === date && effective(b) === 'requested').length;
  const state: DayState = blocked.includes(date) ? 'blocked' : used >= capacity ? 'full' : used > 0 ? 'booked' : pending ? 'pending' : 'free';
  return { state, used, pending };
}

/** deposit status column (V-9.0) */
export const depositStatus = (b: Booking): 'Dibayar' | 'Belum bayar' | 'Luput' | null => {
  const st = effective(b);
  if (st === 'lapsed') return 'Luput';
  if (b.payments[0]?.paidAt) return 'Dibayar';
  if (st === 'deposit_due') return 'Belum bayar';
  return null;
};

export const toCsv = (rows: (string | number)[][]) =>
  rows.map(r => r.map(c => { const v = String(c); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(',')).join('\n');

/* ---------- validation ---------- */
export const ssmOk = (v: string) => /^\d{12}$/.test(v);
export const icOk = (v: string) => /^\d{6}-\d{2}-\d{4}$/.test(v);
export const MB = 1024 * 1024;
export const docError = (f: { type: string; size: number }) =>
  !['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) ? 'Format mesti PDF, JPG atau PNG'
    : f.size > 5 * MB ? 'Fail melebihi 5 MB' : '';
export const videoError = (f: { type: string; size: number }, seconds?: number) =>
  !['video/mp4', 'video/quicktime'].includes(f.type) ? 'Format mesti MP4 atau MOV'
    : f.size > 100 * MB ? 'Video melebihi 100 MB'
      : seconds !== undefined && seconds > 60 ? `Video ${Math.round(seconds)} saat. Maksimum 60 saat` : '';

/** auto-check before a video goes live (A-7.0 auto-flag rules) */
export const BANNED = ['dm wasap', 'wasap', 'judi', 'scam', 'bogel', 'murah gila'];
export const flagged = (text: string) => BANNED.find(w => text.toLowerCase().includes(w));

/* ---------- payment plan (V-9.0) ---------- */
const LABELS = ['Bayaran kedua', 'Bayaran ketiga', 'Bayaran keempat'];
export const DEFAULT_DAYS: Record<number, number[]> = { 1: [7], 2: [60, 7], 3: [90, 30, 7], 4: [120, 90, 30, 7] };
/** deposit + n instalments (1–4) sharing the rest evenly; the last one takes the rounding */
export function makePlan(depositPct: number, days: number[]): Instalment[] {
  const n = days.length, rest = 100 - depositPct, each = Math.floor(rest / n);
  return [
    { label: 'Deposit', pct: depositPct, daysBefore: null },
    ...days.map((d, i) => ({ label: i === n - 1 ? 'Baki akhir' : LABELS[i], pct: i === n - 1 ? rest - each * (n - 1) : each, daysBefore: d })),
  ];
}

// self-check: npx tsx src/modules/vendorapp/logic.ts
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('logic.ts')) {
  const mk = (id: string, o: Partial<Booking>): Booking => ({ id, vendorId: 11, packageId: '11-0', date: '2027-01-09', total: 1000, note: '', status: 'requested', createdAt: TODAY, payments: [], ...o });
  const a = mk('a', { createdAt: addDays(TODAY, -1) }), b = mk('b', {}), c = mk('c', { status: 'confirmed', date: '2027-01-09' }), d = mk('d', { status: 'deposit_due', depositDeadline: '2026-11-20' });
  console.assert(hoursLeft(a) === 4 && hoursLeft(b) === 28, `hours ${hoursLeft(a)} ${hoursLeft(b)}`);
  console.assert(hoursLeft(mk('x', { createdAt: addDays(TODAY, -2) })) === 0, 'past 48h but not yet expired by effective()');
  console.assert(byUrgency([c, d, b, a]).map(x => x.id).join() === 'a,b,d,c', 'urgency');
  console.assert(usedOn([a, c, d], '2027-01-09') === 2 && wouldExceed([c, d], a, 2) && !wouldExceed([c], a, 2), 'capacity');
  console.assert(dayState([c], '2027-01-09', [], 1).state === 'full' && dayState([a], '2027-01-09', [], 1).state === 'pending' && dayState([a], '2027-01-09', ['2027-01-09'], 1).state === 'blocked', 'day state');
  console.assert(toCsv([['a,b', 'x"y', 3]]) === '"a,b","x""y",3', 'csv');
  console.assert(ssmOk('202301045512') && !ssmOk('12345') && icOk('920314-10-5527') && !icOk('920314105527'), 'ids');
  console.assert(docError({ type: 'image/gif', size: 1 }) && docError({ type: 'image/png', size: 6 * MB }) && !docError({ type: 'application/pdf', size: MB }), 'doc');
  console.assert(videoError({ type: 'video/webm', size: 1 }) && videoError({ type: 'video/mp4', size: 1 }, 61) && !videoError({ type: 'video/quicktime', size: MB }, 59), 'video');
  console.assert(flagged('DM Wasap untuk harga') === 'dm wasap' && !flagged('Solekan akad'), 'banned');
  const p = makePlan(30, [90, 30, 7]);
  console.assert(p.length === 4 && p.reduce((t, x) => t + x.pct, 0) === 100 && p[3].label === 'Baki akhir' && p[3].pct === 24, `plan ${JSON.stringify(p)}`);
  console.assert(depositStatus(d) === 'Belum bayar' && depositStatus(mk('l', { status: 'deposit_due', depositDeadline: '2026-11-01' })) === 'Luput', 'deposit');
  console.log('ok');
}
