import type { ReactNode } from 'react';
import { useStore, type AppState } from '../../store';
import { ME_VENDOR } from '../../data/wave2';
import type { Booking, VendorBooking } from '../../data/types';
import { cx } from '../../components/ui';

/** every booking with the demo vendor: other customers' (vendorBookings) + Aina's own (bookings) */
export type VRow = VendorBooking & { mine: boolean };
export const rowsOf = (s: AppState): VRow[] => [
  ...s.vendorBookings.map(b => ({ ...b, mine: false })),
  ...s.bookings.filter(b => b.vendorId === ME_VENDOR).map(b => ({ ...b, customer: s.userName, phone: s.phone, pax: s.event?.pax ?? 0, place: s.event?.place ?? '', mine: true })),
];
export const useRows = () => rowsOf(useStore().s);

/** write a booking change back to whichever array it lives in (ids are unique across both) */
export const patchBooking = (id: string, fn: (b: Booking) => Partial<Booking>) => (p: AppState): Partial<AppState> => ({
  vendorBookings: p.vendorBookings.map(b => (b.id === id ? { ...b, ...fn(b) } : b)),
  bookings: p.bookings.map(b => (b.id === id ? { ...b, ...fn(b) } : b)),
});

export const inputCls = (err?: string | boolean) => cx('w-full px-3.5 py-3 leading-5 rounded-[10px] bg-white border text-[15px] outline-none focus:border-hijau', err ? 'border-bahaya' : 'border-line2');

export function Field({ label, err, hint, children }: { label: string; err?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="w-full flex flex-col gap-1.5">
        <span className="w-full text-[13px] font-semibold">{label}</span>
        {children}
      </label>
      {hint && !err && <span className="w-full text-xs text-muted">{hint}</span>}
      {err && <span role="alert" className="w-full text-sm text-bahaya">{err}</span>}
    </div>
  );
}

export const Card = ({ children, className }: { children: ReactNode; className?: string }) =>
  <div className={cx('w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line', className)}>{children}</div>;

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="w-full flex flex-row items-center gap-3 min-h-11 cursor-pointer">
      <span className="flex-1 min-w-0 text-[15px] font-medium">{label}</span>
      <input type="checkbox" role="switch" checked={on} onChange={e => onChange(e.target.checked)} className="w-5 h-5 shrink-0 accent-hijau" />
    </label>
  );
}

/** vendor sends a chat line. Aina's thread is s.chats[ME_VENDOR] where me = Aina, so the vendor writes me:false there */
export const sendMsg = (b: { id: string; mine: boolean }, text: string) => (p: AppState): Partial<AppState> => b.mine
  ? { chats: { ...p.chats, [ME_VENDOR]: [...(p.chats[ME_VENDOR] ?? []), { me: false, text, time: 'Baru' }] } }
  : { vendorChats: { ...p.vendorChats, [b.id]: [...(p.vendorChats[b.id] ?? []), { me: true, text, time: 'Baru' }] } };

/** the vendor's package for a booking (listing packages are what customers see via the overlay) */
export const pkgOf = (s: AppState, id: string) => s.listing.packages.find(p => p.id === id);
