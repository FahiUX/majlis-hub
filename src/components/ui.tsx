import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { BadgeCheck, ChevronLeft, ShieldCheck, Star, X } from 'lucide-react';
import { back } from '../router';
import { FALLBACK_IMG } from '../data/mock';
import type { BookingStatus, CategoryId, Vendor } from '../data/types';

/* ---------- format ---------- */
export const rm = (n: number) => 'RM ' + Math.round(n).toLocaleString('en-MY');
const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
const DAYS = ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
export const fmtDate = (iso: string, withDay = false) => {
  const d = new Date(iso + 'T00:00:00');
  return `${withDay ? DAYS[d.getDay()] + ', ' : ''}${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------- buttons (height from padding: py-3.5 leading-5 = 48px) ---------- */
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-hijau text-white hover:bg-pekat disabled:bg-pucuk-200 disabled:cursor-not-allowed',
  secondary: 'bg-white border border-line2 text-ink hover:bg-kertas',
  danger: 'bg-white border border-bahaya/40 text-bahaya',
  ghost: 'text-hijau hover:bg-pucuk-50',
};
export function Button({ variant = 'primary', block, className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; block?: boolean }) {
  return (
    <button {...p} className={cx('inline-flex flex-row items-center justify-center gap-2 px-5 py-3.5 leading-5 rounded-[10px] text-[15px] font-semibold whitespace-nowrap', BTN[variant], block ? 'flex-1 min-w-0' : 'w-fit shrink-0', className)}>
      {children}
    </button>
  );
}

/** filter chip: 36px visual, aria-pressed for state */
export function Chip({ on, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean }) {
  return (
    <button aria-pressed={on} {...p} className={cx('inline-flex flex-row items-center gap-1.5 px-3.5 py-2 leading-5 rounded-full border text-sm font-medium w-fit shrink-0 whitespace-nowrap', on ? 'bg-pucuk-100 border-hijau text-hijau' : 'bg-white border-line text-ink', className)}>
      {children}
    </button>
  );
}

export function Pill({ children, tone = 'hijau', className }: { children: ReactNode; tone?: 'hijau' | 'emas' | 'amaran' | 'muted' | 'bahaya' | 'white'; className?: string }) {
  const t = { hijau: 'bg-pucuk-100 text-hijau', emas: 'bg-emas-50 text-emas-teks', amaran: 'bg-amaran-50 text-amaran', muted: 'bg-line text-muted', bahaya: 'bg-bahaya-50 text-bahaya', white: 'bg-white/95 text-ink shadow-float' }[tone];
  return <span className={cx('inline-flex flex-row items-center gap-1 px-2.5 py-1 leading-4 rounded-full text-xs font-semibold w-fit shrink-0 whitespace-nowrap', t, className)}>{children}</span>;
}

export const VerifiedBadge = ({ v, onPhoto }: { v: Pick<Vendor, 'freelancer'>; onPhoto?: boolean }) => (
  <Pill tone={onPhoto ? 'white' : 'hijau'}>
    {v.freelancer ? <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-hijau" /> : <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-hijau" />}
    {v.freelancer ? 'Freelancer Disahkan' : 'Disahkan'}
  </Pill>
);

export const Stars = ({ n, size = 14 }: { n: number; size?: number }) => (
  <span className="inline-flex flex-row items-center gap-0.5 w-fit shrink-0" aria-label={`${n} daripada 5 bintang`}>
    {Array.from({ length: 5 }, (_, i) => <Star key={i} style={{ width: size, height: size }} className={cx('shrink-0 text-ink', i < Math.round(n) ? 'fill-ink' : 'fill-none')} />)}
  </span>
);

const STATUS: Record<BookingStatus, [string, string]> = {
  requested: ['Diminta', 'border border-ink text-ink bg-white'],
  accepted: ['Diterima', 'bg-hijau text-white'],
  deposit_due: ['Deposit belum bayar', 'bg-amaran-50 text-amaran border border-amaran/30'],
  confirmed: ['Disahkan · tarikh dikunci', 'bg-hijau text-white'],
  completed: ['Selesai', 'bg-pucuk-100 text-hijau'],
  reviewed: ['Diulas', 'bg-pucuk-100 text-hijau'],
  declined: ['Ditolak', 'bg-line text-muted'],
  expired: ['Tamat tempoh', 'border border-amaran text-amaran bg-white'],
  lapsed: ['Luput · deposit tak dibayar', 'bg-line text-muted'],
  cancelled: ['Dibatalkan', 'bg-line text-muted'],
};
export const statusLabel = (s: BookingStatus) => STATUS[s][0];
export const StatusChip = ({ s }: { s: BookingStatus }) => (
  <span className={cx('inline-flex flex-row items-center px-2.5 py-1.5 leading-4 rounded-full text-[13px] font-semibold w-fit shrink-0 whitespace-nowrap', STATUS[s][1])}>{STATUS[s][0]}</span>
);

/** image with category fallback (new category photos may not exist yet) */
export function Img({ src, cat, alt, className }: { src: string; cat: CategoryId; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" className={cx('object-cover', className)} onError={e => { const el = e.currentTarget; if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = FALLBACK_IMG[cat]; } }} />;
}

/* ---------- page chrome ---------- */
export function TopBar({ title, fallback = '/', right, transparent }: { title?: string; fallback?: string; right?: ReactNode; transparent?: boolean }) {
  return (
    <header className={cx('sticky top-0 z-20 w-full flex flex-row items-center gap-2 px-2 py-2', transparent ? '' : 'bg-kertas/95 backdrop-blur')}>
      <button aria-label="Kembali" onClick={() => back(fallback)} className={cx('w-11 h-11 shrink-0 rounded-full flex items-center justify-center', transparent ? 'bg-white/95 shadow-float' : 'hover:bg-pucuk-50')}>
        <ChevronLeft className="w-6 h-6 shrink-0" />
      </button>
      <h1 className="flex-1 min-w-0 text-[17px] leading-6 font-semibold">{title}</h1>
      {right}
    </header>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="w-full flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="w-14 h-14 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center">{icon}</span>
      <p className="w-full text-base font-semibold">{title}</p>
      {body && <p className="w-full text-sm text-body">{body}</p>}
      {action}
    </div>
  );
}

/* ---------- bottom sheet: scrim ink/48, 24px top corners, Esc + scrim close, focus moves in ---------- */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // keep the latest onClose without re-running the effect, or every parent re-render steals focus from inputs (QA B1)
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button aria-label="Tutup" className="absolute inset-0 bg-ink/48 cursor-default" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="relative w-full flex flex-col bg-white rounded-t-3xl overflow-hidden outline-none" style={{ maxHeight: '88%' }}>
        <div className="w-full flex flex-col gap-4 p-5 overflow-y-auto">
          <div className="w-full flex flex-row items-center gap-2">
            <h2 className="flex-1 min-w-0 text-lg font-semibold">{title}</h2>
            <button aria-label="Tutup" onClick={onClose} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-kertas"><X className="w-5 h-5 shrink-0" /></button>
          </div>
          {children}
        </div>
        {footer && <div className="w-full flex flex-row gap-3 p-4 bg-white shadow-float">{footer}</div>}
      </div>
    </div>
  );
}

export const Divider = () => <div className="w-full h-px bg-line shrink-0" />;
