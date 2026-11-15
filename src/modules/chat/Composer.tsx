import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Send, Trash2, X } from 'lucide-react';
import { cx } from '../../components/ui';
import { MAX_FILES, fmtSize, type Pending } from './media';

export type Item = Pending & { id: number };

/** WhatsApp-style send screen: big preview of the selected item, its own caption, thumbnail strip to switch / add / remove */
export function Composer({ items, to, onChange, onAdd, onSend, onClose }: {
  items: Item[]; to: string; onChange: (items: Item[]) => void; onAdd: () => void; onSend: () => void; onClose: () => void;
}) {
  const [sel, setSel] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const cur = items[Math.min(sel, items.length - 1)];
  useEffect(() => { closeBtn.current?.focus(); }, []);
  useEffect(() => { if (sel > items.length - 1) setSel(Math.max(0, items.length - 1)); }, [items.length, sel]);
  if (!cur) return null;
  const caption = (text: string) => onChange(items.map(x => (x.id === cur.id ? { ...x, caption: text } : x)));
  const remove = () => { if (cur.kind !== 'photo') URL.revokeObjectURL(cur.url); onChange(items.filter(x => x.id !== cur.id)); };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Hantar kepada ${to}`} onKeyDown={e => e.key === 'Escape' && onClose()} className="absolute inset-0 z-50 bg-black text-white flex flex-col">
      <div className="w-full flex flex-row items-center gap-2 p-2">
        <button ref={closeBtn} aria-label="Batal" onClick={onClose} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><X className="w-6 h-6 shrink-0" /></button>
        <span className="flex-1 min-w-0 text-[15px] font-semibold">Kepada {to}</span>
        <button aria-label={`Buang ${cur.name}`} onClick={remove} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><Trash2 className="w-5 h-5 shrink-0" /></button>
      </div>
      <div className="w-full flex-1 min-h-0 flex items-center justify-center p-4">
        {cur.kind === 'photo' && <img src={cur.url} alt={cur.name} className="w-full h-full object-contain" />}
        {cur.kind === 'video' && <video key={cur.url} src={cur.url} controls playsInline className="w-full h-full object-contain" aria-label={cur.name} />}
        {cur.kind === 'file' && (
          <span className="w-full flex flex-col items-center gap-3 text-center">
            <span className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center"><FileText className="w-10 h-10 shrink-0" /></span>
            <span className="w-full text-base font-semibold break-all">{cur.name}</span>
            <span className="w-full text-sm text-white/70">{fmtSize(cur.size)}</span>
          </span>
        )}
      </div>
      <div className="w-full flex flex-col gap-3 p-4">
        <div className="w-full flex flex-row items-center gap-2 overflow-x-auto">
          {items.map((x, i) => (
            <button key={x.id} aria-label={`Pilih ${x.name}`} aria-pressed={x.id === cur.id} onClick={() => setSel(i)}
              className={cx('w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 bg-white/10 flex items-center justify-center', x.id === cur.id ? 'border-white' : 'border-transparent opacity-70')}>
              {x.kind === 'photo' ? <img src={x.url} alt="" className="w-full h-full object-cover" />
                : x.kind === 'video' ? <video src={x.url} muted preload="metadata" className="w-full h-full object-cover" />
                : <FileText className="w-6 h-6 shrink-0" />}
            </button>
          ))}
          {items.length < MAX_FILES && <button aria-label="Tambah lagi" onClick={onAdd} className="w-14 h-14 shrink-0 rounded-lg border-2 border-dashed border-white/50 flex items-center justify-center"><Plus className="w-6 h-6 shrink-0" /></button>}
        </div>
        <form onSubmit={e => { e.preventDefault(); onSend(); }} className="w-full flex flex-row items-center gap-2">
          <input value={cur.caption ?? ''} onChange={e => caption(e.target.value)} placeholder="Tambah kapsyen…" aria-label={`Kapsyen untuk ${cur.name}`}
            className="flex-1 min-w-0 px-3.5 py-3 bg-white/10 border border-white/20 rounded-full text-[15px] text-white placeholder:text-white/60" />
          <button type="submit" aria-label={`Hantar ${items.length} fail`} className="relative w-11 h-11 shrink-0 rounded-full bg-hijau flex items-center justify-center">
            <Send className="w-5 h-5 shrink-0" />
            {items.length > 1 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-hijau text-xs font-bold flex items-center justify-center">{items.length}</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
