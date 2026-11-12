import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ChevronLeft, Search, X } from 'lucide-react';
import { back } from '../../router';
import { cx } from '../../components/ui';

/** desktop admin primitives (ui.tsx Button/Sheet are sized for the phone app) */

type V = 'primary' | 'secondary' | 'danger' | 'dangerSolid' | 'ghost';
const BTN: Record<V, string> = {
  primary: 'bg-hijau border-hijau text-white hover:bg-pekat disabled:bg-pucuk-200 disabled:border-pucuk-200 disabled:cursor-not-allowed',
  secondary: 'bg-white border-line2 text-ink hover:bg-kertas disabled:text-muted disabled:cursor-not-allowed',
  danger: 'bg-white border-bahaya/40 text-bahaya hover:bg-bahaya-50 disabled:opacity-50 disabled:cursor-not-allowed',
  dangerSolid: 'bg-bahaya border-bahaya text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent border-transparent text-hijau hover:bg-pucuk-50',
};
export function Btn({ v = 'primary', block, className, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { v?: V; block?: boolean }) {
  return (
    <button type="button" {...p} className={cx('inline-flex flex-row items-center justify-center gap-2 px-5 py-2.5 leading-4 rounded-[10px] border text-[13px] font-semibold whitespace-nowrap', block ? 'flex-1 min-w-0' : 'w-fit shrink-0', BTN[v], className)}>
      {children}
    </button>
  );
}
export const IconBtn = ({ label, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) => (
  <button type="button" aria-label={label} title={label} {...p} className="w-9 h-9 shrink-0 rounded-[10px] border border-line2 bg-white flex items-center justify-center hover:bg-kertas disabled:opacity-40 disabled:cursor-not-allowed">{children}</button>
);

export const INPUT = 'px-3.5 py-2.5 leading-4 text-sm rounded-[10px] border border-line2 bg-white text-ink';

export function SearchBox({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <label className={cx('w-[320px] shrink-0 flex flex-row items-center gap-2', INPUT)}>
      <Search className="w-4 h-4 shrink-0 text-muted" aria-hidden />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={label} aria-label={label} className="flex-1 min-w-0 truncate bg-transparent outline-none" />
    </label>
  );
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select aria-label={label} value={value} onChange={e => onChange(e.target.value)} className={cx('w-fit shrink-0', INPUT)}>
      {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  );
}

export function Tabs({ tabs, on, set }: { tabs: [string, string][]; on: string; set: (k: string) => void }) {
  return (
    <div role="tablist" className="w-fit flex flex-row gap-1 p-1 rounded-[12px] bg-line/60">
      {tabs.map(([k, t]) => (
        <button key={k} role="tab" aria-selected={on === k} onClick={() => set(k)}
          className={cx('px-4 py-2 leading-4 rounded-[9px] text-[13px] font-semibold whitespace-nowrap', on === k ? 'bg-white text-ink shadow-float' : 'text-muted hover:text-ink')}>{t}</button>
      ))}
    </div>
  );
}

export function PageHead({ title, sub, right, backTo }: { title: string; sub?: string; right?: ReactNode; backTo?: string }) {
  return (
    <header className="w-full flex flex-row items-center gap-4">
      {backTo && <IconBtn label="Kembali" onClick={() => back(backTo)}><ChevronLeft className="w-5 h-5 shrink-0" /></IconBtn>}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <h1 className="w-full font-display text-[28px] leading-9 font-semibold">{title}</h1>
        {sub && <p className="w-full text-sm text-body">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export const Card = ({ title, right, children, className }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) => (
  <section aria-label={title} className={cx('flex flex-col gap-4 p-6 bg-white border border-line rounded-2xl', className ?? 'w-full')}>
    {title && (
      <div className="w-full flex flex-row items-center gap-3">
        <h2 className="flex-1 min-w-0 text-base font-semibold">{title}</h2>
        {right}
      </div>
    )}
    {children}
  </section>
);

/** row-based table with fixed-width columns; cells are fixed height so `truncate` is allowed there */
export interface Col<T> { h: string; w: string; c: (r: T) => ReactNode }
export function Table<T>({ label, cols, rows, k, h = 'h-[60px]' }: { label: string; cols: Col<T>[]; rows: T[]; k: (r: T) => string; h?: string }) {
  return (
    <div role="table" aria-label={label} className="w-full flex flex-col bg-white border border-line rounded-xl overflow-hidden">
      <div role="row" className="w-full flex flex-row bg-kertas border-b border-line">
        {cols.map(c => <div key={c.h} role="columnheader" className={cx(c.w, 'h-[40px] flex flex-row items-center px-4 text-xs font-semibold text-muted')}>{c.h}</div>)}
      </div>
      {rows.map(r => (
        <div key={k(r)} role="row" className="w-full flex flex-row border-b border-line last:border-b-0">
          {cols.map(c => <div key={c.h} role="cell" className={cx(c.w, h, 'flex flex-row items-center gap-2 px-4 text-sm')}>{c.c(r)}</div>)}
        </div>
      ))}
    </div>
  );
}
/** single-line text in a fixed-height table cell */
export const T = ({ children, sub, strong }: { children: ReactNode; sub?: ReactNode; strong?: boolean }) => (
  <div className="flex-1 min-w-0 flex flex-col">
    <span className={cx('w-full truncate', strong && 'font-semibold')}>{children}</span>
    {sub && <span className="w-full truncate text-xs text-muted">{sub}</span>}
  </div>
);

/** right-side drawer: Esc + scrim close, focus moves in and returns to the opener */
export function Drawer({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', k);
    return () => { window.removeEventListener('keydown', k); opener?.focus?.(); };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-row justify-end">
      <button aria-label="Tutup" tabIndex={-1} className="absolute inset-0 bg-ink/48 cursor-default" onClick={onClose} />
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="relative w-[480px] h-full flex flex-col bg-white shadow-float outline-none">
        <div className="w-full flex flex-row items-center gap-3 p-6">
          <h2 className="flex-1 min-w-0 text-lg font-semibold">{title}</h2>
          <IconBtn label="Tutup" onClick={onClose}><X className="w-4 h-4 shrink-0" /></IconBtn>
        </div>
        <div className="w-full h-px bg-line shrink-0" />
        <div className="w-full flex-1 min-h-0 flex flex-col gap-5 p-6 overflow-y-auto">{children}</div>
        {footer && <><div className="w-full h-px bg-line shrink-0" /><div className="w-full flex flex-row flex-wrap gap-3 p-6">{footer}</div></>}
      </div>
    </div>
  );
}

/** labelled textarea for a required reason */
export function Reason({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <label className="w-full flex flex-col gap-1.5">
      <span className="w-full text-sm font-semibold">{label}</span>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cx('w-full resize-none', INPUT, 'leading-5')} />
      {hint && <span className="w-full text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** label / value rows */
export const Dl = ({ rows }: { rows: [string, ReactNode][] }) => (
  <dl className="w-full flex flex-col gap-2.5">
    {rows.map(([k, v]) => (
      <div key={k} className="w-full flex flex-row items-start gap-3 text-sm">
        <dt className="w-[120px] shrink-0 text-muted">{k}</dt>
        <dd className="flex-1 min-w-0">{v}</dd>
      </div>
    ))}
  </dl>
);

export const Banner = ({ tone, icon, children }: { tone: 'amaran' | 'bahaya' | 'info'; icon: ReactNode; children: ReactNode }) => (
  <div role={tone === 'info' ? 'note' : 'alert'} className={cx('w-full flex flex-row items-start gap-3 p-4 rounded-xl text-sm',
    tone === 'amaran' ? 'bg-amaran-50 text-amaran' : tone === 'bahaya' ? 'bg-bahaya-50 text-bahaya' : 'bg-pucuk-50 text-hijau')}>
    <span className="w-5 h-5 shrink-0 flex items-center justify-center">{icon}</span>
    <div className="flex-1 min-w-0 flex flex-col gap-1">{children}</div>
  </div>
);
