import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button, Chip, Divider, Sheet, cx, rm } from '../../components/ui';
import { PRICE_MAX, PRICE_STEP, RADII, STATES, histogram, search, type Filters } from './searchLogic';

const THUMB = 'absolute inset-0 w-full h-11 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-hijau [&::-webkit-slider-thumb]:shadow-float [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-hijau';

/** two-handle budget slider: two native range inputs on one track, snapping to RM 100 */
export function BudgetSlider({ min, max, cat, onChange }: { min: number; max: number; cat: Filters['cat']; onChange: (min: number, max: number) => void }) {
  const bars = histogram(cat);
  const top = Math.max(1, ...bars.map(b => b.count));
  const pct = (n: number) => (n / PRICE_MAX) * 100;
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="w-full flex flex-row items-center gap-2">
        <span className="flex-1 min-w-0 text-sm text-muted">Bajet (harga bermula)</span>
        <span className="w-fit shrink-0 text-[15px] font-bold num">{rm(min)} – {max >= PRICE_MAX ? rm(PRICE_MAX) + '+' : rm(max)}</span>
      </div>
      <div className="w-full flex flex-row items-end gap-1 h-12" aria-hidden="true">
        {bars.map(b => (
          <span key={b.from} className={cx('flex-1 min-w-0 rounded-t-[3px]', b.to > min && b.from < max ? 'bg-hijau/70' : 'bg-line')} style={{ height: `${Math.max(6, (b.count / top) * 48)}px` }} />
        ))}
      </div>
      <div className="relative w-full h-11 shrink-0">
        <span className="absolute left-0 right-0 top-[20px] h-1 rounded-full bg-line" />
        <span className="absolute top-[20px] h-1 rounded-full bg-hijau" style={{ left: pct(min) + '%', right: 100 - pct(max) + '%' }} />
        <input type="range" aria-label="Bajet minimum" min={0} max={PRICE_MAX} step={PRICE_STEP} value={min} className={THUMB}
          onChange={e => onChange(Math.min(Number(e.target.value), max - PRICE_STEP), max)} />
        <input type="range" aria-label="Bajet maksimum" min={0} max={PRICE_MAX} step={PRICE_STEP} value={max} className={THUMB}
          onChange={e => onChange(min, Math.max(Number(e.target.value), min + PRICE_STEP))} />
      </div>
      <div className="w-full flex flex-row items-center justify-between text-xs text-muted num">
        <span className="w-fit">RM 0</span><span className="w-fit">{rm(PRICE_MAX)}+</span>
      </div>
    </div>
  );
}

export default function FilterSheet({ open, f, onClose, onApply }: { open: boolean; f: Filters; onClose: () => void; onApply: (f: Filters) => void }) {
  const [d, setD] = useState(f);
  const [mode, setMode] = useState<'radius' | 'state'>(f.state ? 'state' : 'radius');
  // re-seed the draft each time the sheet opens
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) { setLastOpen(open); if (open) { setD(f); setMode(f.state ? 'state' : 'radius'); } }
  const count = search(d).length;
  return (
    <Sheet open={open} onClose={onClose} title="Tapis & susun"
      footer={<>
        <Button variant="secondary" onClick={() => setD({ ...d, km: 70, state: null, min: 0, max: PRICE_MAX, sort: 'near', r4: false, verified: true })}>Set semula</Button>
        <Button block onClick={() => onApply(d)} disabled={count === 0}>{count === 0 ? 'Tiada padanan' : `Tunjuk ${count} vendor`}</Button>
      </>}>
      <BudgetSlider min={d.min} max={d.max} cat={d.cat} onChange={(min, max) => setD({ ...d, min, max })} />
      <Divider />
      <div className="w-full flex flex-col gap-3">
        <div className="w-full flex flex-row items-center gap-2">
          <span className="flex-1 min-w-0 text-sm font-semibold">Lokasi</span>
          <div className="w-fit shrink-0 flex flex-row p-0.5 rounded-full bg-kertas border border-line" role="group" aria-label="Mod lokasi">
            {(['radius', 'state'] as const).map(m => (
              <button key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setD({ ...d, state: m === 'radius' ? null : d.state ?? STATES[0] }); }}
                className={cx('px-3 py-1.5 rounded-full text-xs font-bold', mode === m ? 'bg-white text-ink shadow-float' : 'text-muted')}>{m === 'radius' ? 'Jarak' : 'Ikut negeri'}</button>
            ))}
          </div>
        </div>
        <div className="w-full flex flex-row flex-wrap gap-2">
          {mode === 'radius'
            ? RADII.map(k => <Chip key={k} on={d.km === k} onClick={() => setD({ ...d, km: k })}>{k} km</Chip>)
            : STATES.map(st => <Chip key={st} on={d.state === st} onClick={() => setD({ ...d, state: st })}>{st}</Chip>)}
        </div>
        <p className="w-full text-xs text-muted">{mode === 'radius' ? 'Diukur dari lokasi majlis anda, Shah Alam.' : 'Vendor yang berpangkalan di negeri ini.'}</p>
      </div>
      <Divider />
      <div className="w-full flex flex-col gap-3">
        <span className="w-full text-sm font-semibold">Susun ikut</span>
        <div className="w-full flex flex-row flex-wrap gap-2">
          {([['near', 'Paling dekat'], ['top', 'Rating tertinggi'], ['price', 'Harga rendah → tinggi']] as const).map(([k, l]) => (
            <Chip key={k} on={d.sort === k} onClick={() => setD({ ...d, sort: k })}>{l}</Chip>
          ))}
        </div>
      </div>
      <Divider />
      <div className="w-full flex flex-row flex-wrap gap-2">
        <Chip on={d.r4} onClick={() => setD({ ...d, r4: !d.r4 })}><Star className="w-3.5 h-3.5 shrink-0 fill-current" />4.8 ke atas</Chip>
        <Chip on={d.verified} onClick={() => setD({ ...d, verified: !d.verified })}>Disahkan sahaja</Chip>
      </div>
    </Sheet>
  );
}
