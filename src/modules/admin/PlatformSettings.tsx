import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { useStore } from '../../store';
import { CATS, VENDORS, catById } from '../../data/mock';
import { Img, Pill, cx } from '../../components/ui';
import { Btn, Card, INPUT, PageHead, T, Table } from './kit';
import { logEntry } from './logic';
import { CHECKS } from './Verify';

/** package field templates per category (demo: component state only) */
const TEMPLATES: Record<string, string[]> = {
  photo: ['Jam liputan', 'Bilangan foto suntingan', 'Video highlight (minit)'],
  decor: ['Saiz pelamin (kaki)', 'Bunga segar / tiruan'],
  makeup: ['Bilangan sesi solekan', 'Persalinan'],
  band: ['Bilangan set', 'Sistem bunyi'],
  mc: ['Jam majlis', 'Bahasa'],
  bride: ['Jam bertugas'],
  kompang: ['Bilangan pemain', 'Hadrah (minit)'],
  inai: ['Bahagian (tangan / kaki)', 'Corak'],
};
const TEAM = [
  { name: 'Admin Farid', role: 'Pentadbir utama', email: 'farid@majlishub.my' },
  { name: 'Admin Siti', role: 'Moderator kandungan', email: 'siti@majlishub.my' },
  { name: 'Admin Haziq', role: 'Sokongan vendor', email: 'haziq@majlishub.my' },
];
const MAX_FEATURED = 6;

/** A-6.0 platform settings */
export default function PlatformSettings() {
  const { s, set, toast } = useStore();
  const [cats, setCats] = useState(() => CATS.map(c => ({ id: c.id as string, name: c.name, split: c.split })));
  const [newCat, setNewCat] = useState({ name: '', split: '' });
  const [tpl, setTpl] = useState(TEMPLATES);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [featured, setFeatured] = useState(s.featured);
  const sum = cats.reduce((t, c) => t + c.split, 0);

  const saved = (what: string) => { set(p => ({ audit: [...p.audit, logEntry('Kemas kini tetapan', what)] })); toast('Disimpan (demo)'); };
  const addCat = () => {
    if (!newCat.name.trim()) return;
    setCats(c => [...c, { id: `baru-${c.length}`, name: newCat.name.trim(), split: Number(newCat.split) || 0 }]);
    setTpl(t => ({ ...t, [`baru-${cats.length}`]: [] }));
    setNewCat({ name: '', split: '' });
  };
  const addField = (id: string) => {
    const v = draft[id]?.trim();
    if (!v) return;
    setTpl(t => ({ ...t, [id]: [...(t[id] ?? []), v] }));
    setDraft(d => ({ ...d, [id]: '' }));
  };

  return (
    <>
      <PageHead title="Tetapan platform" sub="Kategori, templat pakej, vendor pilihan, senarai semak dan pasukan admin." />

      <Card title="Kategori & pecahan bajet lalai" right={<Btn onClick={() => saved('Kategori')}><Save className="w-4 h-4 shrink-0" />Simpan</Btn>}>
        <div className="w-full flex flex-col gap-2">
          {cats.map((c, i) => (
            <div key={c.id} className="w-full flex flex-row items-center gap-3">
              <input aria-label={`Nama kategori ${i + 1}`} value={c.name} onChange={e => setCats(cs => cs.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} className={cx('flex-1 min-w-0', INPUT)} />
              <label className={cx('w-[120px] shrink-0 flex flex-row items-center gap-1', INPUT)}>
                <input type="number" min={0} max={100} aria-label={`Peratus bajet ${c.name}`} value={c.split}
                  onChange={e => setCats(cs => cs.map(x => x.id === c.id ? { ...x, split: Number(e.target.value) } : x))} className="flex-1 min-w-0 bg-transparent outline-none num" />
                <span className="w-fit shrink-0 text-muted">%</span>
              </label>
            </div>
          ))}
          <div className="w-full flex flex-row items-center gap-3">
            <input aria-label="Nama kategori baharu" placeholder="Kategori baharu" value={newCat.name} onChange={e => setNewCat(n => ({ ...n, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addCat()} className={cx('flex-1 min-w-0', INPUT)} />
            <input type="number" aria-label="Peratus bajet kategori baharu" placeholder="%" value={newCat.split} onChange={e => setNewCat(n => ({ ...n, split: e.target.value }))} className={cx('w-[120px] shrink-0', INPUT)} />
            <Btn v="secondary" onClick={addCat} disabled={!newCat.name.trim()}><Plus className="w-4 h-4 shrink-0" />Tambah</Btn>
          </div>
        </div>
        <p className={cx('w-full text-sm', sum === 100 ? 'text-muted' : 'text-amaran')} aria-live="polite">Jumlah pecahan: {sum}%{sum !== 100 && ' · sepatutnya 100%'}</p>
      </Card>

      <Card title="Templat medan pakej mengikut kategori" right={<Btn onClick={() => saved('Templat pakej')}><Save className="w-4 h-4 shrink-0" />Simpan</Btn>}>
        <p className="w-full text-sm text-body">Medan tambahan yang vendor isi untuk setiap pakej dalam kategori ini.</p>
        <div className="w-full flex flex-col gap-3">
          {cats.map(c => (
            <div key={c.id} className="w-full flex flex-row items-start gap-4">
              <span className="w-[160px] shrink-0 h-[38px] flex items-center text-sm font-semibold">{c.name}</span>
              <div className="flex-1 min-w-0 flex flex-row flex-wrap items-center gap-2">
                {(tpl[c.id] ?? []).map(f => (
                  <span key={f} className="w-fit inline-flex flex-row items-center gap-1 px-2.5 py-1 leading-4 rounded-full bg-pucuk-100 text-hijau text-xs font-semibold whitespace-nowrap">
                    {f}
                    <button aria-label={`Buang medan ${f} daripada ${c.name}`} onClick={() => setTpl(t => ({ ...t, [c.id]: t[c.id].filter(x => x !== f) }))} className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-200"><X className="w-3 h-3 shrink-0" /></button>
                  </span>
                ))}
                <input aria-label={`Medan baharu untuk ${c.name}`} placeholder="Tambah medan, tekan Enter" value={draft[c.id] ?? ''}
                  onChange={e => setDraft(d => ({ ...d, [c.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addField(c.id)}
                  className={cx('w-[220px] shrink-0', INPUT)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Vendor pilihan di Home" right={<>
        <Pill tone={featured.length >= MAX_FEATURED ? 'amaran' : 'muted'}>{featured.length}/{MAX_FEATURED} dipilih</Pill>
        <Btn onClick={() => { set(p => ({ featured, audit: [...p.audit, logEntry('Tetapkan vendor pilihan', featured.map(id => VENDORS.find(v => v.id === id)?.name ?? id).join(', '))] })); toast('Vendor pilihan dikemas kini'); }}
          disabled={featured.join() === s.featured.join()}><Save className="w-4 h-4 shrink-0" />Simpan</Btn>
      </>}>
        <p className="w-full text-sm text-body">Pilih sehingga {MAX_FEATURED} vendor aktif untuk bahagian "Pilihan Majlis Hub" di Home.</p>
        <div className="w-full grid grid-cols-3 gap-3">
          {VENDORS.map(v => {
            const on = featured.includes(v.id);
            const full = !on && featured.length >= MAX_FEATURED;
            return (
              <label key={v.id} className={cx('w-full flex flex-row items-center gap-3 p-3 rounded-xl border', on ? 'border-hijau bg-pucuk-50' : 'border-line', full ? 'opacity-50' : 'cursor-pointer')}>
                <input type="checkbox" className="w-4 h-4 shrink-0 accent-hijau" checked={on} disabled={full}
                  onChange={() => setFeatured(f => on ? f.filter(x => x !== v.id) : [...f, v.id])} />
                <Img src={v.img} cat={v.cat} alt="" className="w-9 h-9 shrink-0 rounded-lg" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="w-full text-sm font-semibold">{v.name}</span>
                  <span className="w-full text-xs text-muted">{catById(v.cat).name} · {v.rating.toFixed(1)}</span>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      <div className="w-full flex flex-row items-stretch gap-5">
        <Card title="Senarai semak pengesahan" className="flex-1 min-w-0">
          <p className="w-full text-xs text-muted">Baca sahaja. Digunakan pada setiap semakan permohonan.</p>
          <ol className="w-full flex flex-col gap-2 list-decimal list-inside text-sm">{CHECKS.map(c => <li key={c.id} className="w-full">{c.label}</li>)}</ol>
        </Card>
        <Card title="Pasukan admin" className="flex-1 min-w-0">
          <Table label="Pasukan admin" rows={TEAM} k={m => m.name} h="h-[52px]" cols={[
            { h: 'Nama', w: 'flex-1 min-w-0', c: m => <T strong sub={m.email}>{m.name}</T> },
            { h: 'Peranan', w: 'w-[170px] shrink-0', c: m => <T>{m.role}</T> },
          ]} />
        </Card>
      </div>
    </>
  );
}
