import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CHATS } from './data/mock';
import type { Booking, CategoryId, ChatMsg, Invitation, MajlisEvent, Rsvp, TabungEntry } from './data/types';

export const TODAY = '2026-11-11';

export interface AppState {
  authed: boolean;
  userName: string;
  phone: string;
  email: string;
  notif: { whatsapp: boolean; sms: boolean; email: boolean; push: boolean };
  event: MajlisEvent | null;
  bookings: Booking[];
  saved: number[];
  compare: number[];
  /** votes on the shared comparison: voter name -> vendor id */
  votes: Record<string, number>;
  liked: number[];
  savedReels: number[];
  followed: number[];
  invitation: Invitation;
  rsvps: Rsvp[];
  tabung: TabungEntry[];
  chats: Record<number, ChatMsg[]>;
  recent: string[];
}

const initial: AppState = {
  authed: true,
  userName: 'Aina',
  phone: '+60 12-778 4021',
  email: 'aina.rahman@contoh.my',
  notif: { whatsapp: true, sms: false, email: true, push: true },
  event: {
    name: 'Majlis Aina & Hakim', type: 'Perkahwinan', date: '2027-02-14', place: 'Shah Alam, Selangor', pax: 500, budget: 40000,
    split: {}, shortlist: {},
    cats: ['photo', 'decor', 'makeup', 'band', 'mc', 'bride', 'kompang', 'inai'],
  },
  bookings: [
    { id: 'B-1042', vendorId: 7, packageId: '7-1', date: '2027-02-14', total: 4800, note: 'Akad pagi, sanding petang.', status: 'confirmed', createdAt: '2026-10-02', depositDeadline: '2026-11-03',
      payments: [{ label: 'Deposit', amount: 1440, due: '2026-11-03', paidAt: '2026-10-20' }, { label: 'Bayaran kedua', amount: 1920, due: '2026-11-08' }, { label: 'Baki akhir', amount: 1440, due: '2027-02-07' }] },
    { id: 'B-1057', vendorId: 10, packageId: '10-1', date: '2027-02-14', total: 6500, note: '', status: 'deposit_due', createdAt: '2026-10-14', depositDeadline: '2026-11-13',
      payments: [{ label: 'Deposit', amount: 1950, due: '2026-11-13' }, { label: 'Bayaran kedua', amount: 2600, due: '2026-12-16' }, { label: 'Baki akhir', amount: 1950, due: '2027-02-07' }] },
    { id: 'B-1063', vendorId: 11, packageId: '11-1', date: '2027-02-14', total: 1800, note: 'Solekan akad pukul 6 pagi.', status: 'requested', createdAt: '2026-11-10', payments: [] },
    // past and closed bookings, so every status can be demoed (PM review 2026-11-11)
    { id: 'B-0988', vendorId: 29, packageId: '29-0', date: '2026-10-31', total: 450, note: 'Malam berinai di rumah, Shah Alam.', status: 'completed', createdAt: '2026-09-02', depositDeadline: '2026-10-02',
      payments: [{ label: 'Deposit', amount: 225, due: '2026-10-02', paidAt: '2026-09-05' }, { label: 'Baki akhir', amount: 225, due: '2026-10-24', paidAt: '2026-10-24' }] },
    { id: 'B-1049', vendorId: 23, packageId: '23-0', date: '2027-02-14', total: 900, note: '', status: 'requested', createdAt: '2026-11-07', payments: [] },
    { id: 'B-1051', vendorId: 18, packageId: '18-1', date: '2027-02-14', total: 2500, note: 'Lagu masuk pengantin: Selamat Pengantin Baru.', status: 'declined', createdAt: '2026-11-01', payments: [], cancelReason: 'Penuh pada tarikh ini' },
    { id: 'B-1038', vendorId: 26, packageId: '26-0', date: '2027-02-14', total: 800, note: '', status: 'deposit_due', createdAt: '2026-10-04', depositDeadline: '2026-11-05',
      payments: [{ label: 'Deposit', amount: 240, due: '2026-11-05' }, { label: 'Bayaran kedua', amount: 320, due: '2026-12-16' }, { label: 'Baki akhir', amount: 240, due: '2027-02-07' }] },
  ],
  saved: [21],
  compare: [],
  votes: {},
  liked: [],
  savedReels: [],
  followed: [],
  invitation: {
    template: 'songket', bride: 'Nurul Aina', groom: 'Muhammad Hakim', parents: 'Encik Rahman bin Ali & Puan Salmah binti Yusof',
    date: '2027-02-14', time: '11:00 pagi – 4:00 petang', venue: 'Dewan Seri Kenanga, Seksyen 7, Shah Alam', mapUrl: 'https://maps.google.com/?q=Shah+Alam',
    ayat: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri. (Ar-Rum: 21)',
    aturcara: [{ time: '11:00 pagi', item: 'Ketibaan tetamu' }, { time: '12:30 tgh', item: 'Ketibaan pengantin' }, { time: '1:00 ptg', item: 'Makan beradab' }, { time: '4:00 ptg', item: 'Majlis bersurai' }],
    rsvpClose: '2027-02-01',
    invited: 120,
  },
  rsvps: [
    { id: 'r1', name: 'Mak Long Zaitun', phone: '012-555 1201', attending: true, count: 6, message: 'Tahniah Aina, semoga bahagia hingga ke Jannah.', at: '2026-11-08' },
    { id: 'r2', name: 'Farid & Ilya', phone: '017-201 8890', attending: true, count: 2, message: 'Tak sabar nak datang!', at: '2026-11-08' },
    { id: 'r3', name: 'Cikgu Halim', phone: '019-330 4410', attending: false, count: 0, message: 'Maaf tak dapat hadir, ada kursus di Johor. Selamat pengantin baru.', at: '2026-11-09' },
    { id: 'r4', name: 'Geng Opis ABC', phone: '011-2233 4455', attending: true, count: 12, message: '', at: '2026-11-10' },
  ],
  tabung: [
    { id: 't1', amount: 1500, note: 'Gaji Oktober', at: '2026-10-28' },
    { id: 't2', amount: 800, note: 'Duit raya simpanan', at: '2026-11-05' },
  ],
  chats: CHATS,
  recent: ['pelamin moden', 'mak andam bangi'],
};

const KEY = 'majlishub.v3';
const load = (): AppState => {
  try { const s = localStorage.getItem(KEY); return s ? { ...initial, ...JSON.parse(s) } : initial; } catch { return initial; }
};

interface Ctx { s: AppState; set: (fn: (s: AppState) => Partial<AppState>) => void; reset: () => void; toast: (msg: string) => void; toastMsg: string | null }
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(load);
  const [toastMsg, setToast] = useState<string | null>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode: demo still works in memory */ } }, [s]);
  const set = useCallback((fn: (s: AppState) => Partial<AppState>) => setS(p => ({ ...p, ...fn(p) })), []);
  const reset = useCallback(() => setS(initial), []);
  const toast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout((toast as unknown as { t?: number }).t);
    (toast as unknown as { t?: number }).t = window.setTimeout(() => setToast(null), 2400);
  }, []);
  return <StoreCtx.Provider value={{ s, set, reset, toast, toastMsg }}>{children}</StoreCtx.Provider>;
}

export const useStore = () => {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore outside StoreProvider');
  return c;
};

/* ---------- shared helpers ---------- */
export const toggle = (list: number[], id: number) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
export const addDays = (iso: string, n: number) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const daysBetween = (from: string, to: string) => Math.round((new Date(to + 'T00:00:00').getTime() - new Date(from + 'T00:00:00').getTime()) / 864e5);
export const shortlistedCats = (e: MajlisEvent | null): CategoryId[] => (e ? (Object.keys(e.shortlist) as CategoryId[]) : []);
