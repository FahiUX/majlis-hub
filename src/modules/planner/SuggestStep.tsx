import { useState } from 'react';
import { Check, RotateCcw, SlidersHorizontal, Sparkles, Star, TriangleAlert, X } from 'lucide-react';
import { CATS, VENDORS, catById, fromPrice } from '../../data/mock';
import type { CategoryId, Package, Vendor } from '../../data/types';
import { useStore } from '../../store';
import { swap, useRoute } from '../../router';
import { Button, Chip, Img, Sheet, cx, fmtDate, rm } from '../../components/ui';
import { CatArt } from './CatArt';

export interface Draft {
  type: string; date: string; twoDays: boolean; day2: string; place: string; pax: number; budget: number;
  cats: CategoryId[]; weights: Record<string, number>; picks: Partial<Record<CategoryId, number>>;
}

/** budget split, suggestions and the greedy "budget fits N categories" check (spec C-3.0a) */
export function suggest(d: Draft) {
  const wsum = d.cats.reduce((t, c) => t + d.weights[c], 0) || 1;
  const rows = d.cats.map(cat => {
    const pct = (d.weights[cat] / wsum) * 100;
    const slot = (d.budget * pct) / 100;
    const cands = VENDORS.filter(v => v.cat === cat && v.km <= 70 && !v.busy.includes(d.date) && fromPrice(v) <= slot)
      .sort((a, b) => b.rating - a.rating || fromPrice(a) - fromPrice(b));
    const v = cands.find(x => x.id === d.picks[cat]) ?? cands[0];
    const pkg = v ? bestPkg(v, slot) : undefined;
    return { cat, pct, slot, cands, v, pkg };
  });
  const total = rows.reduce((t, r) => t + (r.pkg?.price ?? 0), 0);
  // cheapest available price per category, cheapest first, until the budget runs out
  const cheap = d.cats.map(cat => ({ cat, p: Math.min(...VENDORS.filter(v => v.cat === cat && !v.busy.includes(d.date)).map(fromPrice)) })).sort((a, b) => a.p - b.p);
  let left = d.budget; const fits: CategoryId[] = [];
  for (const c of cheap) if (c.p <= left) { left -= c.p; fits.push(c.cat); }
  return { rows, total, fits, missing: rows.filter(r => !r.v).map(r => r.cat) };
}
const bestPkg = (v: Vendor, slot: number): Package => v.packages.filter(p => p.price <= slot).sort((a, b) => b.price - a.price)[0] ?? v.packages[0];

export function SuggestStep({ d, set }: { d: Draft; set: (p: Partial<Draft>) => void }) {
  const { s, set: setS, toast } = useStore();
  const [swapCat, setSwapCat] = useState<CategoryId | null>(null);
  const [splitOpen, setSplitOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const demo = useRoute().q.get('demo');
  const { rows, total, fits, missing } = suggest(d);
  const over = total > d.budget;
  const swapRow = rows.find(r => r.cat === swapCat);

  const setPct = (cat: CategoryId, v: number) => {
    // keep the others' ratios; solve this category's weight so it lands on v%
    const others = d.cats.filter(c => c !== cat).reduce((t, c) => t + d.weights[c], 0);
    set({ weights: { ...d.weights, [cat]: others ? (v / (100 - v)) * others : 1 } });
  };
  const toggleCat = (c: CategoryId) => set({ cats: d.cats.includes(c) ? d.cats.filter(x => x !== c) : CATS.map(x => x.id).filter(x => x === c || d.cats.includes(x)) });

  // a different type or date is a new majlis: confirm before replacing the current one (QA W4)
  const replaces = !!s.event && (s.event.type !== d.type || s.event.date !== d.date);
  const finish = () => {
    const shortlist: Partial<Record<CategoryId, number>> = {};
    rows.forEach(r => { if (r.v) shortlist[r.cat] = r.v.id; });
    setS(() => ({
      event: {
        name: replaces || !s.event ? `Majlis ${d.type.toLowerCase()}` : s.event.name, type: d.type, date: d.date, place: d.place, pax: d.pax, budget: d.budget,
        split: Object.fromEntries(rows.map(r => [r.cat, Math.round(r.pct)])), shortlist, cats: d.cats,
        custom: replaces ? [] : s.event?.custom,
      },
    }));
    toast('Pakej disimpan dalam Majlis Saya');
    swap('/majlis');
  };

  return (
    <section className="w-full flex flex-col gap-5">
      <h2 className="w-full font-display text-[28px] leading-[34px] font-semibold">Bajet dan pakej dicadangkan</h2>

      <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
        <label htmlFor="bajet" className="w-full text-[13px] leading-4 font-semibold">Jumlah bajet</label>
        <div className="w-full flex flex-row items-center gap-2 px-3.5 py-3 rounded-[10px] border border-line2">
          <span className="w-fit shrink-0 font-semibold text-muted">RM</span>
          <input id="bajet" type="number" inputMode="numeric" value={d.budget} onChange={e => set({ budget: Math.max(0, Number(e.target.value)) })}
            className="flex-1 min-w-0 text-xl font-bold num outline-none" />
        </div>
        <input type="range" aria-label="Laras bajet" min={1000} max={100000} step={500} value={d.budget} onChange={e => set({ budget: Number(e.target.value) })} className="w-full accent-hijau" />
        <div className="w-full flex flex-row flex-wrap gap-2">
          {CATS.map(c => <Chip key={c.id} on={d.cats.includes(c.id)} onClick={() => toggleCat(c.id)}>{d.cats.includes(c.id) && <Check className="w-4 h-4 shrink-0" />}{c.name}</Chip>)}
        </div>
      </div>

      {missing.length > 0 && (
        <div role="alert" className="w-full flex flex-row gap-3 p-4 rounded-2xl bg-amaran-50 text-amaran">
          <TriangleAlert className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-1 text-sm">
            <p className="w-full font-semibold">Bajet ini cukup untuk {fits.length} kategori</p>
            <p className="w-full text-body">Tiada calon untuk {missing.map(c => catById(c).name).join(', ')} dalam slot bajet sekarang.{fits.length > 0 && fits.length < d.cats.length && ` Paling jimat: kekalkan ${fits.map(c => catById(c).name).join(', ')}.`} Atau laraskan pembahagian, atau naikkan bajet.</p>
            {fits.length > 0 && fits.length < d.cats.length && (
              <Button variant="secondary" className="px-3! py-2!" onClick={() => set({ cats: fits, weights: Object.fromEntries(CATS.map(c => [c.id, c.split])) })}>Kekalkan {fits.length} kategori ini</Button>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex flex-row items-center gap-2">
        <h3 className="flex-1 min-w-0 flex flex-row items-center gap-1.5 text-lg font-semibold"><Sparkles className="w-5 h-5 shrink-0 text-hijau" />Pakej dicadangkan</h3>
        <Button variant="ghost" className="px-3! py-2!" onClick={() => setSplitOpen(true)}><SlidersHorizontal className="w-4 h-4 shrink-0" />Pembahagian</Button>
      </div>

      {demo === 'loading' ? (
        <div className="w-full flex flex-col gap-3" aria-busy="true" aria-label="Memuatkan cadangan">
          {[0, 1, 2].map(i => <div key={i} className="w-full h-[132px] shrink-0 rounded-2xl skeleton" />)}
        </div>
      ) : demo === 'error' ? (
        <div role="alert" className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-bahaya-50 text-center">
          <p className="w-full text-base font-semibold text-bahaya">Gagal memuatkan cadangan</p>
          <p className="w-full text-sm text-body">Semak sambungan internet anda dan cuba lagi.</p>
          <Button variant="secondary" onClick={() => swap('/majlis/baru?step=4')}><RotateCcw className="w-4 h-4 shrink-0" />Cuba lagi</Button>
        </div>
      ) : (
      <div className="w-full flex flex-col gap-3">
        {rows.map(r => (
          <article key={r.cat} className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
            <div className="w-full flex flex-row items-center gap-3">
              <CatArt art={catById(r.cat).art} size={36} />
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="w-full text-[15px] font-semibold">{catById(r.cat).name}</span>
                <span className="w-full text-xs text-muted num">Bajet slot {rm(r.slot)} · {Math.round(r.pct)}%</span>
              </div>
              <button aria-label={`Buang ${catById(r.cat).name}`} onClick={() => toggleCat(r.cat)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-kertas"><X className="w-5 h-5 shrink-0" /></button>
            </div>
            {r.v && r.pkg ? (
              <div className="w-full flex flex-row items-center gap-3">
                <Img src={r.v.img} cat={r.cat} alt={r.v.name} className="w-16 h-16 shrink-0 rounded-xl" />
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="w-full text-sm font-semibold">{r.v.name}</span>
                  <span className="w-full flex flex-row items-center gap-1 text-xs text-muted"><Star className="w-3.5 h-3.5 shrink-0 fill-ink text-ink" /><span className="w-fit text-ink font-semibold">{r.v.rating}</span>· {r.v.area}</span>
                  <span className="w-full text-sm">{r.pkg.name} · <b className="num">{rm(r.pkg.price)}</b></span>
                </div>
                <Button variant="secondary" className="px-3! py-2!" disabled={r.cands.length < 2} onClick={() => setSwapCat(r.cat)}>Tukar</Button>
              </div>
            ) : (
              <p className="w-full text-sm text-amaran">Tiada calon dalam slot ini pada tarikh anda. Naikkan peratus kategori ini atau bajet.</p>
            )}
          </article>
        ))}
      </div>
      )}

      <div className="sticky bottom-0 w-full flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-float">
        <div className="w-full flex flex-row items-center gap-2 text-sm">
          <span className="flex-1 min-w-0 font-semibold">Jumlah {rm(total)}</span>
          <span className={cx('w-fit shrink-0 num', over ? 'text-amaran font-semibold' : 'text-muted')}>{over ? `Lebih ${rm(total - d.budget)}` : `Baki ${rm(d.budget - total)}`}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-line overflow-hidden"><div className={cx('h-full rounded-full', over ? 'bg-amaran' : 'bg-hijau')} style={{ width: `${Math.min(100, (total / (d.budget || 1)) * 100)}%` }} /></div>
        <Button disabled={!d.cats.length || demo === 'loading' || demo === 'error'} onClick={() => (replaces ? setConfirm(true) : finish())} className="w-full">Guna pakej ini</Button>
        <p className="w-full text-xs text-muted text-center">Vendor disenarai pendek, belum ditempah. Anda hantar permintaan tempahan kemudian.</p>
      </div>

      <Sheet open={!!swapRow} onClose={() => setSwapCat(null)} title={swapRow ? `Pilihan ${catById(swapRow.cat).name}` : ''}>
        {swapRow && <p className="w-full text-sm text-muted">Dalam slot {rm(swapRow.slot)} dan bebas pada tarikh anda.</p>}
        {swapRow?.cands.filter(v => v.id !== swapRow.v?.id).slice(0, 3).map(v => (
          <button key={v.id} onClick={() => { set({ picks: { ...d.picks, [swapRow.cat]: v.id } }); setSwapCat(null); }}
            className="w-full flex flex-row items-center gap-3 p-3 rounded-2xl border border-line text-left hover:border-hijau">
            <Img src={v.img} cat={v.cat} alt={v.name} className="w-14 h-14 shrink-0 rounded-xl" />
            <span className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="w-full text-sm font-semibold">{v.name}</span>
              <span className="w-full flex flex-row items-center gap-1 text-xs text-muted"><Star className="w-3 h-3 shrink-0 fill-ink text-ink" /><span className="w-fit text-ink font-semibold">{v.rating}</span>· {v.reviews} ulasan · {v.km} km</span>
              <span className="w-full text-sm">{bestPkg(v, swapRow.slot).name} · <b className="num">{rm(bestPkg(v, swapRow.slot).price)}</b></span>
            </span>
          </button>
        ))}
      </Sheet>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Ganti majlis sedia ada?"
        footer={<><Button variant="secondary" block onClick={() => setConfirm(false)}>Batal</Button><Button block onClick={() => { setConfirm(false); finish(); }}>Ya, ganti</Button></>}>
        {s.event && <p className="w-full text-sm text-body">Majlis Saya kini untuk <b>{s.event.name}</b> ({fmtDate(s.event.date)}). Pakej baru ini untuk {d.type.toLowerCase()} pada {fmtDate(d.date)} akan menggantikannya. Tempahan sedia ada kekal, tapi tarikhnya mungkin tidak sama.</p>}
      </Sheet>

      <Sheet open={splitOpen} onClose={() => setSplitOpen(false)} title="Laraskan pembahagian" footer={<Button block onClick={() => setSplitOpen(false)}>Siap</Button>}>
        <p className="w-full text-sm text-muted">Tarik untuk ubah peratus. Kategori lain menyesuaikan supaya jumlah kekal 100%.</p>
        {rows.map(r => (
          <div key={r.cat} className="w-full flex flex-col gap-1">
            <div className="w-full flex flex-row items-center gap-2 text-sm">
              <span className="flex-1 min-w-0 font-semibold">{catById(r.cat).name}</span>
              <span className="w-fit shrink-0 num text-muted">{Math.round(r.pct)}% · {rm(r.slot)}</span>
            </div>
            <input type="range" min={1} max={90} value={Math.round(r.pct)} aria-label={`Peratus ${catById(r.cat).name}`}
              onChange={e => setPct(r.cat, Number(e.target.value))} className="w-full accent-hijau" disabled={rows.length < 2} />
          </div>
        ))}
      </Sheet>
    </section>
  );
}
