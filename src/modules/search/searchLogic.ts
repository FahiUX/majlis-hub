import { CATS, TOWNS, VENDORS, catById, fromPrice, kmFrom } from '../../data/mock';
import type { CategoryId, Vendor } from '../../data/types';

export const RADII = [10, 30, 70, 150];
export const STATES = ['Selangor', 'WP Kuala Lumpur', 'Negeri Sembilan'];
export const PRICE_STEP = 100;
export const PRICE_MAX = Math.ceil(Math.max(...VENDORS.map(fromPrice)) / 500) * 500;

export interface Filters {
  cat: CategoryId | null;
  q: string;
  km: number;
  state: string | null;
  /** town inside the chosen state (Ikut negeri mode) */
  town: string | null;
  /** only vendors free on the event date */
  free: boolean;
  /** guests; 0 = off. Hides vendors whose capacity is smaller */
  pax: number;
  halal: boolean;
  /** came from the planner: show the "Ikut majlis anda" row */
  fromMajlis: boolean;
  min: number;
  max: number;
  sort: 'near' | 'top' | 'price';
  r4: boolean;
  verified: boolean;
}

/** URL <-> filters, so every search state is a shareable link */
export const readFilters = (q: URLSearchParams): Filters => ({
  cat: (CATS.some(c => c.id === q.get('cat')) ? q.get('cat') : null) as CategoryId | null,
  q: q.get('q') ?? '',
  km: Number(q.get('km')) || 70,
  state: q.get('st'),
  town: q.get('town'),
  free: q.get('free') === '1',
  pax: Number(q.get('pax')) || 0,
  halal: q.get('halal') === '1',
  fromMajlis: q.get('from') === 'majlis',
  min: Number(q.get('min')) || 0,
  max: Number(q.get('max')) || PRICE_MAX,
  sort: (['near', 'top', 'price'].includes(q.get('sort') ?? '') ? q.get('sort') : 'near') as Filters['sort'],
  r4: q.get('r4') === '1',
  verified: q.get('all') !== '1',
});

export const writeFilters = (f: Filters) => {
  const p = new URLSearchParams();
  if (f.cat) p.set('cat', f.cat);
  if (f.q) p.set('q', f.q);
  if (f.km !== 70) p.set('km', String(f.km));
  if (f.state) p.set('st', f.state);
  if (f.state && f.town) p.set('town', f.town);
  if (f.free) p.set('free', '1');
  if (f.pax) p.set('pax', String(f.pax));
  if (f.halal) p.set('halal', '1');
  if (f.fromMajlis) p.set('from', 'majlis');
  if (f.min > 0) p.set('min', String(f.min));
  if (f.max < PRICE_MAX) p.set('max', String(f.max));
  if (f.sort !== 'near') p.set('sort', f.sort);
  if (f.r4) p.set('r4', '1');
  if (!f.verified) p.set('all', '1');
  const s = p.toString();
  return '/cari' + (s ? '?' + s : '');
};

const norm = (t: string) => t.toLowerCase().trim();

/** text match on name, area, state and BM/EN category keywords */
export const matchesText = (v: Vendor, q: string) => {
  const t = norm(q);
  if (!t) return true;
  const c = catById(v.cat);
  return [v.name, v.area, v.state, c.name, ...c.keywords].some(x => norm(x).includes(t) || t.includes(norm(x)));
};

/** halal only applies to categories with products on skin (spec C-1.2) */
export const HALAL_CATS: CategoryId[] = ['makeup', 'inai'];
/** towns in a state that have vendors, for the District/Town select */
export const townsIn = (state: string) => TOWNS.filter(t => VENDORS.some(v => v.state === state && v.area === t));
/** the town distances are measured from: the chosen town, else the event town, else Shah Alam */
export const originOf = (f: Filters, place?: string) => f.town ?? TOWNS.find(t => place?.includes(t)) ?? 'Shah Alam';

export interface Ctx { place?: string; date?: string }

/** results carry `km` measured from the origin, so cards show the right distance */
export function search(f: Filters, ctx: Ctx = {}): Vendor[] {
  const from = originOf(f, ctx.place);
  const r = VENDORS.map(v => ({ ...v, km: kmFrom(v, from) })).filter(v =>
    (!f.cat || v.cat === f.cat) &&
    matchesText(v, f.q) &&
    (f.state ? v.state === f.state && (!f.town || v.area === f.town) : v.km <= f.km) &&
    fromPrice(v) >= f.min && fromPrice(v) <= f.max &&
    (!f.r4 || v.rating >= 4) &&
    (!f.free || !ctx.date || !v.busy.includes(ctx.date)) &&
    (!f.pax || v.capacity >= f.pax) &&
    (!f.halal || !HALAL_CATS.includes(v.cat) || !!v.halal),
    // f.verified: every live vendor is verified (spec V-1.3), so turning it off returns the same list
  );
  const by = { near: (a: Vendor, b: Vendor) => a.km - b.km, top: (a: Vendor, b: Vendor) => b.rating - a.rating || b.reviews - a.reviews, price: (a: Vendor, b: Vendor) => fromPrice(a) - fromPrice(b) }[f.sort];
  return r.sort(by);
}

export interface Suggestion { kind: 'cat' | 'vendor' | 'area'; label: string; sub: string; value: string }

export function suggest(q: string): Suggestion[] {
  const t = norm(q);
  if (!t) return [];
  const cats = CATS.filter(c => [c.name, ...c.keywords].some(k => norm(k).includes(t))).map(c => ({ kind: 'cat' as const, label: c.name, sub: 'Kategori', value: c.id }));
  const vendors = VENDORS.filter(v => norm(v.name).includes(t)).slice(0, 4).map(v => ({ kind: 'vendor' as const, label: v.name, sub: `${catById(v.cat).name} · ${v.area}`, value: String(v.id) }));
  const areas = [...new Set(VENDORS.map(v => v.area))].filter(a => norm(a).includes(t)).slice(0, 3).map(a => ({ kind: 'area' as const, label: a, sub: 'Kawasan', value: a }));
  return [...cats, ...vendors, ...areas];
}

/** 10 equal price buckets for the histogram above the budget slider */
export const histogram = (cat: CategoryId | null) => {
  const n = 10, w = PRICE_MAX / n;
  const b = Array<number>(n).fill(0);
  VENDORS.filter(v => !cat || v.cat === cat).forEach(v => { b[Math.min(n - 1, Math.floor(fromPrice(v) / w))]++; });
  return b.map((count, i) => ({ count, from: i * w, to: (i + 1) * w }));
};

/** ponytail: self-check of the filter rules; run with `npx tsx -e "import('./src/modules/search/searchLogic.ts').then(m=>console.log(m.selfCheck()))"` */
export function selfCheck() {
  const base = readFilters(new URLSearchParams());
  console.assert(search({ ...base, cat: 'mc' }).every(v => v.cat === 'mc'), 'cat filter');
  console.assert(search({ ...base, km: 10 }).every(v => v.km <= 10), 'radius filter');
  console.assert(search({ ...base, q: 'jurugambar' }).every(v => v.cat === 'photo'), 'BM keyword');
  console.assert(search({ ...base, q: 'photographer' }).length > 0, 'EN keyword');
  console.assert(search({ ...base, min: 1000, max: 2000 }).every(v => fromPrice(v) >= 1000 && fromPrice(v) <= 2000), 'price range');
  console.assert(search({ ...base, r4: true }).every(v => v.rating >= 4), 'rating 4+');
  console.assert(readFilters(new URLSearchParams(writeFilters({ ...base, cat: 'band', km: 30 }).split('?')[1])).km === 30, 'url roundtrip');
  console.assert(search({ ...base, free: true }, { date: '2027-02-14' }).every(v => !v.busy.includes('2027-02-14')), 'free on date');
  console.assert(search({ ...base, pax: 1000 }).every(v => v.capacity >= 1000), 'pax capacity');
  console.assert(search({ ...base, cat: 'makeup', halal: true }).every(v => v.halal), 'halal');
  console.assert(search({ ...base, state: 'Selangor', town: 'Bangi' }).every(v => v.area === 'Bangi'), 'town');
  console.assert(search({ ...base, km: 150 }, { place: 'Bangi, Selangor' }).find(v => v.id === 11)!.km < search({ ...base, km: 150 }).find(v => v.id === 11)!.km, 'km from event town');
  const rt = readFilters(new URLSearchParams(writeFilters({ ...base, free: true, pax: 500, halal: true, fromMajlis: true, state: 'Selangor', town: 'Klang' }).split('?')[1]));
  console.assert(rt.free && rt.pax === 500 && rt.halal && rt.fromMajlis && rt.town === 'Klang', 'url roundtrip new filters');
  return 'ok';
}
