import { Scale, X } from 'lucide-react';
import { useStore, toggle } from '../../store';
import { nav } from '../../router';
import { Button, Img } from '../../components/ui';
import { vendorById } from '../../data/mock';

/** sticky tray once at least one vendor is ticked for comparison */
export default function CompareTray() {
  const { s, set } = useStore();
  const vs = s.compare.map(vendorById).filter(v => v !== undefined);
  return (
    <div className="w-full flex flex-row items-center gap-3 p-3 bg-white shadow-float">
      <div className="flex-1 min-w-0 flex flex-row items-center gap-2">
        {vs.map(v => (
          <span key={v.id} className="relative w-11 h-11 shrink-0">
            <Img src={v.img} cat={v.cat} alt={v.name} className="w-11 h-11 rounded-full" />
            <button aria-label={`Buang ${v.name}`} onClick={() => set(p => ({ compare: toggle(p.compare, v.id) }))}
              className="absolute -top-3 -right-3 w-11 h-11 flex items-center justify-center"><span className="w-5 h-5 shrink-0 rounded-full bg-ink text-white flex items-center justify-center"><X className="w-3 h-3 shrink-0" /></span></button>
          </span>
        ))}
        {vs.length < 3 && <span className="flex-1 min-w-0 text-xs text-muted">{vs.length < 2 ? 'Pilih 1 lagi untuk banding' : 'Boleh tambah 1 lagi'}</span>}
      </div>
      <Button disabled={vs.length < 2} onClick={() => nav('/banding')}><Scale className="w-4 h-4 shrink-0" />Bandingkan ({vs.length})</Button>
    </div>
  );
}
