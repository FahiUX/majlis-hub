import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Clock, MapPin, RotateCcw, Search, SearchX, SlidersHorizontal, Store, Tag, X } from 'lucide-react';
import { useStore } from '../../store';
import { nav, swap, useRoute } from '../../router';
import { Button, Chip, EmptyState, cx, fmtDate, rm } from '../../components/ui';
import { CATS, catById, vendorById } from '../../data/mock';
import VendorCard from './VendorCard';
import FilterSheet from './FilterSheet';
import CompareTray from './CompareTray';
import { PRICE_MAX, RADII, originOf, readFilters, search, suggest, writeFilters, type Filters } from './searchLogic';

function Skeleton() {
  return (
    <div className="w-full flex flex-col gap-6" aria-label="Memuatkan">
      {[0, 1].map(i => (
        <div key={i} className="w-full flex flex-col gap-3">
          <div className="w-full aspect-[4/3] rounded-xl skeleton" />
          <div className="w-[60%] h-4 rounded-full skeleton" />
          <div className="w-[40%] h-3 rounded-full skeleton" />
        </div>
      ))}
    </div>
  );
}

export default function SearchScreen() {
  const { q } = useRoute();
  const { s, set, toast } = useStore();
  const ev = s.event;
  const f = readFilters(q);
  const ctx = { place: ev?.place, date: ev?.date };
  const origin = originOf(f, ev?.place);
  const go = (patch: Partial<Filters>) => swap(writeFilters({ ...f, ...patch }));
  const [text, setText] = useState(f.q);
  const [focused, setFocused] = useState(q.get('focus') === '1');
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const wantFocus = q.get('focus') === '1';
  const qs = q.toString();
  // a new search URL (chip, link, back) leaves suggestion mode unless it asks for focus
  useEffect(() => { if (wantFocus) { setFocused(true); input.current?.focus(); } else { setFocused(false); setText(f.q); } }, [qs, wantFocus]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t); }, [f.cat]);

  const results = search(f, ctx);
  const sugg = suggest(text);
  const submit = (value: string) => {
    const v = value.trim();
    setFocused(false); input.current?.blur();
    if (v) set(p => ({ recent: [v, ...p.recent.filter(r => r !== v)].slice(0, 5) }));
    go({ q: v });
  };
  const pickCat = (id: Filters['cat']) => { setText(''); setFocused(false); go({ cat: id, q: '' }); };

  const active: { label: string; clear: Partial<Filters> }[] = [
    ...(f.state ? [{ label: f.town ?? f.state, clear: { state: null, town: null } }] : f.km !== 70 ? [{ label: `${f.km} km`, clear: { km: 70 } }] : []),
    ...(f.free && ev && !f.fromMajlis ? [{ label: `Kosong ${fmtDate(ev.date)}`, clear: { free: false } }] : []),
    ...(f.pax && !f.fromMajlis ? [{ label: `${f.pax} tetamu`, clear: { pax: 0 } }] : []),
    ...(f.halal ? [{ label: 'Halal', clear: { halal: false } }] : []),
    ...(f.min > 0 || f.max < PRICE_MAX ? [{ label: `${rm(f.min)} – ${rm(f.max)}`, clear: { min: 0, max: PRICE_MAX } }] : []),
    ...(f.r4 ? [{ label: 'Rating 4 ke atas', clear: { r4: false } }] : []),
    ...(f.sort !== 'near' ? [{ label: f.sort === 'top' ? 'Rating tertinggi' : 'Harga terendah', clear: { sort: 'near' as const } }] : []),
    ...(f.q ? [{ label: `"${f.q}"`, clear: { q: '' } }] : []),
  ];
  // planner link (?from=majlis): fill in the event's date and guests once, then the URL holds them
  useEffect(() => {
    if (f.fromMajlis && ev && !q.has('free') && !q.has('pax')) swap(writeFilters({ ...f, free: true, pax: ev.pax }));
  }, [f.fromMajlis]); // eslint-disable-line react-hooks/exhaustive-deps
  const chips = useRef<HTMLDivElement>(null);
  useEffect(() => { chips.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, [f.cat]);
  const nextKm = RADII.find(k => k > f.km);
  const isError = q.get('demo') === 'error';

  // finish the save a guest started before logging in (?save=<id> comes back from /masuk)
  const pendingSave = Number(q.get('save'));
  useEffect(() => {
    if (!pendingSave || !s.authed) return;
    set(p => (p.saved.includes(pendingSave) ? {} : { saved: [...p.saved, pendingSave] })); // idempotent: effects can run twice
    toast('Disimpan ke senarai pendek');
    const rest = new URLSearchParams(q); rest.delete('save');
    swap('/cari' + (rest.toString() ? '?' + rest.toString() : ''));
  }, [pendingSave, s.authed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full flex-1 flex flex-col">
      <h1 className="sr-only">Cari vendor</h1>
      <div className="sticky top-0 z-20 w-full flex flex-col gap-3 px-4 py-3 bg-kertas/95 backdrop-blur">
        <form role="search" onSubmit={e => { e.preventDefault(); submit(text); }} className="w-full flex flex-row items-center gap-2">
          <label className="flex-1 min-w-0 flex flex-row items-center gap-2 px-3.5 py-2.5 rounded-full bg-white border border-line2 focus-within:border-hijau focus-within:ring-4 focus-within:ring-pucuk-200/60">
            <Search className="w-5 h-5 shrink-0 text-muted" />
            <input ref={input} value={text} onChange={e => setText(e.target.value)} onFocus={() => setFocused(true)} enterKeyHint="search"
              placeholder="Cari vendor, kategori, kawasan" aria-label="Cari vendor" className="flex-1 min-w-0 bg-transparent outline-none text-[15px] leading-6 placeholder:text-muted" />
            {text && <button type="button" aria-label="Kosongkan carian" onClick={() => { setText(''); input.current?.focus(); }} className="w-6 h-6 shrink-0 flex items-center justify-center"><X className="w-4 h-4 shrink-0 text-muted" /></button>}
          </label>
          {focused
            ? <button type="button" onClick={() => { setFocused(false); setText(f.q); }} className="w-fit shrink-0 px-2 py-2.5 text-sm font-semibold text-hijau">Batal</button>
            : <button type="button" aria-label="Tapis dan susun" onClick={() => setSheet(true)} className="relative w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5 shrink-0" />
                {active.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ink text-white text-[11px] font-bold flex items-center justify-center num">{active.length}</span>}
              </button>}
        </form>
        {!focused && (
          <div ref={chips} className="w-full flex flex-row gap-2 overflow-x-auto" role="group" aria-label="Kategori">
            <Chip on={!f.cat} onClick={() => pickCat(null)}>Semua</Chip>
            {CATS.map(c => <Chip key={c.id} on={f.cat === c.id} onClick={() => pickCat(c.id)}>{c.name}</Chip>)}
          </div>
        )}
      </div>

      {focused ? (
        <div className="w-full flex-1 flex flex-col gap-1 p-4">
          {text ? (
            sugg.length ? sugg.map(sg => (
              <button key={sg.kind + sg.value} onClick={() => sg.kind === 'cat' ? pickCat(sg.value as Filters['cat']) : sg.kind === 'vendor' ? nav('/vendor/' + sg.value) : (setText(sg.value), submit(sg.value))}
                className="w-full flex flex-row items-center gap-3 py-2.5 text-left">
                <span className="w-10 h-10 shrink-0 rounded-full bg-pucuk-50 text-hijau flex items-center justify-center">
                  {sg.kind === 'cat' ? <Tag className="w-5 h-5 shrink-0" /> : sg.kind === 'vendor' ? <Store className="w-5 h-5 shrink-0" /> : <MapPin className="w-5 h-5 shrink-0" />}
                </span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="w-full text-[15px] font-medium">{sg.label}</span>
                  <span className="w-full text-xs text-muted">{sg.sub}</span>
                </span>
              </button>
            )) : <EmptyState icon={<SearchX className="w-6 h-6" />} title="Tiada padanan" body="Cuba kategori lain atau semak ejaan. Kami faham BM dan English, contoh 'jurugambar' atau 'photographer'." />
          ) : (
            <>
              {s.recent.length > 0 && <p className="w-full text-xs font-semibold uppercase tracking-wider text-muted">Carian terkini</p>}
              {s.recent.map(r => (
                <button key={r} onClick={() => { setText(r); submit(r); }} className="w-full flex flex-row items-center gap-3 py-2.5 text-left">
                  <Clock className="w-5 h-5 shrink-0 text-muted" /><span className="flex-1 min-w-0 text-[15px]">{r}</span>
                </button>
              ))}
              <p className="w-full text-xs font-semibold uppercase tracking-wider text-muted">Kategori popular</p>
              <div className="w-full flex flex-row flex-wrap gap-2">
                {CATS.map(c => <Chip key={c.id} onClick={() => pickCat(c.id)}>{c.name}</Chip>)}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col gap-4 p-4">
          {f.fromMajlis && ev && (
            <div className="w-full flex flex-row items-center gap-2 p-3 rounded-xl bg-pucuk-50">
              <span className="flex-1 min-w-0 text-sm text-body"><b className="text-ink">Ikut majlis anda:</b> {fmtDate(ev.date)} · {ev.pax} tetamu · {origin}</span>
              <button aria-label="Buang tapisan majlis" onClick={() => go({ fromMajlis: false, free: false, pax: 0 })} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-100"><X className="w-4 h-4 shrink-0" /></button>
            </div>
          )}
          {active.length > 0 && (
            <div className="w-full flex flex-row flex-wrap gap-2">
              {active.map(a => (
                <Chip key={a.label} on onClick={() => { if ('q' in a.clear) setText(''); go(a.clear); }} aria-label={`Buang penapis ${a.label}`}>
                  {a.label}<X className="w-3.5 h-3.5 shrink-0" />
                </Chip>
              ))}
            </div>
          )}
          {!isError && <p className="w-full text-sm text-muted" aria-live="polite">
            <b className="text-ink num">{results.length} vendor</b> {f.cat ? catById(f.cat).name : 'semua kategori'} · {f.state ? (f.town ?? f.state) : `dalam ${f.km} km dari ${origin}`} · disahkan
          </p>}
          {isError ? (
            <EmptyState icon={<AlertCircle className="w-6 h-6" />} title="Tak dapat muatkan vendor" body="Sambungan terputus. Semak internet anda dan cuba lagi."
              action={<Button variant="secondary" onClick={() => swap(writeFilters(f))}><RotateCcw className="w-4 h-4 shrink-0" />Cuba lagi</Button>} />
          ) : loading ? <Skeleton /> : results.length === 0 ? (
            <EmptyState icon={<SearchX className="w-6 h-6" />}
              title={f.state ? `Tiada vendor di ${f.state}` : `Tiada vendor dalam ${f.km} km`}
              body={f.min > 0 || f.max < PRICE_MAX ? 'Cuba longgarkan julat bajet anda.' : 'Cuba luaskan kawasan carian.'}
              action={!f.state && nextKm ? <Button onClick={() => go({ km: nextKm })}>Luaskan ke {nextKm} km</Button>
                : <Button variant="secondary" onClick={() => { setText(''); swap('/cari' + (f.cat ? '?cat=' + f.cat : '')); }}>Buang semua penapis</Button>} />
          ) : results.map(v => <VendorCard key={v.id} v={v} />)}
        </div>
      )}

      <div className={cx('sticky bottom-0 z-20 w-full', s.compare.length && !focused && (!f.cat || vendorById(s.compare[0])?.cat === f.cat) ? 'flex' : 'hidden')}><CompareTray /></div>
      <FilterSheet open={sheet} f={f} onClose={() => setSheet(false)} onApply={d => { setSheet(false); go(d); }} />
    </div>
  );
}
