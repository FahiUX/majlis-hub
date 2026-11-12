import { useState } from 'react';
import { Check, FileUp, Hourglass, Info, PencilLine, Plus } from 'lucide-react';
import { nav } from '../../router';
import { useStore } from '../../store';
import { CATS, vendorById } from '../../data/mock';
import { ME_VENDOR } from '../../data/wave2';
import type { CategoryId, Package } from '../../data/types';
import { effective } from '../booking/money';
import { Button, Chip, Divider, Pill, Sheet, TopBar, cx, fmtDate, rm } from '../../components/ui';
import { Card, Field, inputCls, useRows } from './kit';
import { DEFAULT_DAYS, depositStatus, docError, makePlan } from './logic';
import { DepositPill } from './Bookings';

const IMAGES = ['makeup', 'couple', 'bride-assistant', 'inai', 'pelamin', 'photographer', 'venue', 'planning', 'catering', 'kompang', 'mc', 'band'].map(n => `img/gen/${n}.jpg`);

function PendingNote({ text }: { text: string }) {
  return (
    <div role="status" className="w-full flex flex-row items-start gap-3 p-4 rounded-2xl bg-amaran-50">
      <Hourglass className="w-5 h-5 shrink-0 text-amaran" />
      <span className="flex-1 min-w-0 flex flex-col gap-0.5"><span className="w-full text-sm font-semibold text-amaran">Menunggu semakan semula</span><span className="w-full text-sm text-body">{text}. Listing lama kekal aktif semasa semakan.</span></span>
    </div>
  );
}

/* ---------- V-5.0 profile & packages ---------- */
export function Profile() {
  const { s, set, toast } = useStore();
  const v = vendorById(ME_VENDOR)!;
  const [name, setName] = useState(v.name);
  const [cats, setCats] = useState<CategoryId[]>([v.cat]);
  const [about, setAbout] = useState(s.listing.about);
  const [gallery, setGallery] = useState(() => [...new Set(s.listing.gallery ?? v.gallery)]);
  const [edit, setEdit] = useState<Package | null>(null);
  const [docErr, setDocErr] = useState('');
  const reverify = (what: string) => { set(p => ({ listing: { ...p.listing, pendingReverify: what } })); toast('Dihantar untuk semakan. Listing lama kekal aktif.'); };
  const verifiedChanged = name.trim() !== v.name || cats.join() !== v.cat;

  const savePkg = (pk: Package) => {
    set(p => ({ listing: { ...p.listing, packages: p.listing.packages.some(x => x.id === pk.id) ? p.listing.packages.map(x => (x.id === pk.id ? pk : x)) : [...p.listing.packages, pk] } }));
    toast(`Pakej "${pk.name}" disimpan dan terus aktif`);
    setEdit(null);
  };
  const newPkg = (): Package => ({ id: `${ME_VENDOR}-${Date.now() % 100000}`, name: '', price: 0, includes: [], depositPct: 30, plan: makePlan(30, DEFAULT_DAYS[2]) });

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Profil & Pakej" fallback="/v/lagi" />
      <div className="w-full flex flex-col gap-4 p-5">
        {s.listing.pendingReverify && <PendingNote text={s.listing.pendingReverify} />}

        <Card>
          <h2 className="w-full text-base font-semibold">Maklumat disahkan</h2>
          <p className="w-full text-sm text-muted">Perubahan nama, kategori atau dokumen perlu disemak semula oleh pasukan kami.</p>
          <Field label="Nama perniagaan" err={!name.trim() ? 'Nama tidak boleh kosong' : ''}><input value={name} onChange={e => setName(e.target.value)} className={inputCls(!name.trim())} /></Field>
          <div className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">Kategori</span>
            <div className="w-full flex flex-row flex-wrap gap-2">
              {CATS.map(c => <Chip key={c.id} on={cats.includes(c.id)} onClick={() => setCats(cats.includes(c.id) ? cats.filter(x => x !== c.id) : [...cats, c.id])}>{c.name}</Chip>)}
            </div>
          </div>
          <Button variant="secondary" disabled={!verifiedChanged || !name.trim() || !cats.length} className="disabled:opacity-40"
            onClick={() => reverify([name.trim() !== v.name && `Nama: ${name.trim()}`, cats.join() !== v.cat && `Kategori: ${cats.map(c => CATS.find(x => x.id === c)!.name).join(', ')}`].filter(Boolean).join(' · '))}>
            Hantar untuk semakan
          </Button>
          <Divider />
          <label className="w-full flex flex-row items-center gap-3 min-h-11 cursor-pointer">
            <FileUp className="w-5 h-5 shrink-0 text-hijau" />
            <span className="flex-1 min-w-0 flex flex-col"><span className="w-full text-[15px] font-semibold">Muat naik dokumen baru</span><span className="w-full text-xs text-muted">SSM, IC atau sijil halal · PDF/JPG/PNG, maks 5 MB</span></span>
            <input type="file" accept="application/pdf,image/jpeg,image/png" className="sr-only" onChange={e => {
              const f = e.target.files?.[0]; e.target.value = '';
              if (!f) return;
              const err = docError(f); setDocErr(err);
              if (!err) reverify(`Dokumen baru: ${f.name}`);
            }} />
          </label>
          {docErr && <span role="alert" className="w-full text-sm text-bahaya">{docErr}</span>}
        </Card>

        <Card>
          <h2 className="w-full text-base font-semibold">Tentang kami</h2>
          <textarea value={about} onChange={e => setAbout(e.target.value)} rows={4} aria-label="Tentang kami" maxLength={600} className={cx(inputCls(), 'resize-none')} />
          <Button variant="secondary" disabled={about === s.listing.about} className="disabled:opacity-40" onClick={() => { set(p => ({ listing: { ...p.listing, about: about.trim() } })); toast('Disimpan. Terus aktif di profil anda.'); }}>Simpan</Button>
        </Card>

        <Card>
          <h2 className="w-full text-base font-semibold">Galeri · {gallery.length}</h2>
          <p className="w-full text-sm text-muted">Pilih gambar untuk dipaparkan. Perubahan terus aktif.</p>
          <div className="w-full flex flex-row flex-wrap gap-2">
            {IMAGES.map(src => {
              const on = gallery.includes(src);
              return (
                <button key={src} aria-pressed={on} aria-label={`Gambar ${src.split('/').pop()}`} onClick={() => setGallery(on ? gallery.filter(x => x !== src) : [...gallery, src])}
                  className={cx('relative w-[calc(25%-6px)] aspect-square shrink-0 rounded-xl overflow-hidden', on ? 'ring-2 ring-hijau' : 'opacity-70')}>
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                  {on && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-hijau text-white flex items-center justify-center"><Check className="w-3.5 h-3.5 shrink-0" /></span>}
                </button>
              );
            })}
          </div>
          <Button variant="secondary" disabled={!gallery.length} className="disabled:opacity-40" onClick={() => { set(p => ({ listing: { ...p.listing, gallery } })); toast('Galeri disimpan'); }}>Simpan galeri</Button>
        </Card>

        <Card>
          <h2 className="w-full text-base font-semibold">Pakej · {s.listing.packages.length}</h2>
          {s.listing.packages.map((pk, i) => (
            <div key={pk.id} className="w-full flex flex-col gap-3">
              {i > 0 && <Divider />}
              <div className="w-full flex flex-row items-start gap-3">
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="w-full text-[15px] font-semibold">{pk.name}</span>
                  <span className="w-full text-sm font-bold num">{rm(pk.price)}</span>
                  <span className="w-full text-xs text-muted">{pk.includes.join(' · ')}</span>
                </span>
                <button aria-label={`Ubah ${pk.name}`} onClick={() => setEdit(pk)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-50"><PencilLine className="w-5 h-5 shrink-0" /></button>
              </div>
            </div>
          ))}
          <Button variant="secondary" onClick={() => setEdit(newPkg())}><Plus className="w-4 h-4 shrink-0" />Tambah pakej</Button>
        </Card>
      </div>
      {edit && <PkgSheet pkg={edit} isNew={!s.listing.packages.some(x => x.id === edit.id)} onClose={() => setEdit(null)} onSave={savePkg} />}
    </div>
  );
}

function PkgSheet({ pkg, isNew, onClose, onSave }: { pkg: Package; isNew: boolean; onClose: () => void; onSave: (p: Package) => void }) {
  const [name, setName] = useState(pkg.name);
  const [price, setPrice] = useState(pkg.price ? String(pkg.price) : '');
  const [inc, setInc] = useState(pkg.includes.join('\n'));
  const [tried, setTried] = useState(false);
  const nameErr = tried && !name.trim() ? 'Isi nama pakej' : '';
  const priceErr = tried && !(Number(price) > 0) ? 'Isi harga dalam RM' : '';
  const save = () => {
    setTried(true);
    if (!name.trim() || !(Number(price) > 0)) return;
    onSave({ ...pkg, name: name.trim(), price: Math.round(Number(price)), includes: inc.split('\n').map(x => x.trim()).filter(Boolean) });
  };
  return (
    <Sheet open onClose={onClose} title={isNew ? 'Tambah pakej' : 'Ubah pakej'} footer={<><Button variant="secondary" block onClick={onClose}>Batal</Button><Button block onClick={save}>Simpan</Button></>}>
      <Field label="Nama pakej" err={nameErr}><input value={name} onChange={e => setName(e.target.value)} className={inputCls(nameErr)} /></Field>
      <Field label="Harga (RM)" err={priceErr}><input value={price} onChange={e => setPrice(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className={inputCls(priceErr)} /></Field>
      <Field label="Termasuk" hint="Satu perkara setiap baris"><textarea value={inc} onChange={e => setInc(e.target.value)} rows={4} className={cx(inputCls(), 'resize-none')} /></Field>
    </Sheet>
  );
}

/* ---------- V-9.0 deposit & instalment rules ---------- */
function PlanCard({ pkg }: { pkg: Package }) {
  const { set, toast } = useStore();
  const [dep, setDep] = useState(pkg.depositPct);
  const [days, setDays] = useState(pkg.plan.slice(1).map(i => i.daysBefore ?? 7));
  const plan = makePlan(dep, days);
  const changed = JSON.stringify(plan) !== JSON.stringify(pkg.plan);
  const daysErr = days.some((d, i) => !(d >= 1) || (i > 0 && d >= days[i - 1])) ? 'Hari mesti menurun, contoh 60 kemudian 7' : '';
  return (
    <Card>
      <span className="w-full flex flex-row items-center gap-2"><span className="flex-1 min-w-0 text-[15px] font-semibold">{pkg.name}</span><span className="w-fit text-sm font-bold num">{rm(pkg.price)}</span></span>
      <Field label="Deposit (%)" hint="Lazimnya 30%">
        <input type="number" min={10} max={90} step={5} value={dep} onChange={e => setDep(Math.min(90, Math.max(10, Number(e.target.value) || 10)))} className={inputCls()} />
      </Field>
      <div className="w-full flex flex-col gap-1.5">
        <span className="w-full text-[13px] font-semibold">Bilangan ansuran selepas deposit</span>
        <div className="w-full flex flex-row gap-2">{[1, 2, 3, 4].map(n => <Chip key={n} on={days.length === n} onClick={() => setDays(DEFAULT_DAYS[n])}>{n}</Chip>)}</div>
      </div>
      {plan.map((p, i) => (
        <div key={i} className="w-full flex flex-row items-center gap-3 text-sm">
          <span className="flex-1 min-w-0 flex flex-col"><span className="w-full font-semibold">{p.label} · {p.pct}%</span><span className="w-full text-xs text-muted num">{rm((pkg.price * p.pct) / 100)}</span></span>
          {p.daysBefore === null ? <span className="w-fit text-xs text-muted">30 hari selepas diterima</span> : (
            <label className="w-fit flex flex-row items-center gap-2 text-xs text-muted">
              <input type="number" min={1} aria-label={`${p.label}: hari sebelum majlis`} value={days[i - 1]} onChange={e => setDays(days.map((d, j) => (j === i - 1 ? Number(e.target.value) : d)))} className="w-[72px] px-3.5 py-2.5 rounded-[10px] bg-white border border-line2 text-sm num" />
              hari sebelum
            </label>
          )}
        </div>
      ))}
      {daysErr && <span role="alert" className="w-full text-sm text-bahaya">{daysErr}</span>}
      <Button variant="secondary" disabled={!changed || !!daysErr} className="disabled:opacity-40" onClick={() => {
        set(p => ({ listing: { ...p.listing, packages: p.listing.packages.map(x => (x.id === pkg.id ? { ...x, depositPct: dep, plan } : x)) } }));
        toast(`Peraturan bayaran "${pkg.name}" disimpan`);
      }}>Simpan peraturan</Button>
    </Card>
  );
}

export function Payments() {
  const { s, set, toast } = useStore();
  const rows = useRows().filter(b => b.payments.length > 0 || effective(b) === 'deposit_due').sort((a, b) => a.date.localeCompare(b.date));
  const base = vendorById(ME_VENDOR)!.cancelPolicy;
  const [policy, setPolicy] = useState(s.listing.cancelPolicy ?? base);
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Bayaran" fallback="/v/lagi" />
      <div className="w-full flex flex-col gap-4 p-5">
        <div className="w-full flex flex-row items-start gap-3 p-4 rounded-2xl bg-pucuk-50">
          <Info className="w-5 h-5 shrink-0 text-hijau" />
          <span className="flex-1 min-w-0 text-sm text-body">Perubahan hanya untuk tempahan baru. Tempahan yang sudah diterima atau Disahkan kekal dengan jadual asal.</span>
        </div>
        {s.listing.packages.map(pk => <PlanCard key={pk.id + JSON.stringify(pk.plan)} pkg={pk} />)}
        <Card>
          <h2 className="w-full text-base font-semibold">Polisi pembatalan</h2>
          <textarea value={policy} onChange={e => setPolicy(e.target.value)} rows={4} aria-label="Polisi pembatalan" className={cx(inputCls(), 'resize-none')} />
          <Button variant="secondary" disabled={policy === (s.listing.cancelPolicy ?? base) || !policy.trim()} className="disabled:opacity-40" onClick={() => { set(p => ({ listing: { ...p.listing, cancelPolicy: policy.trim() } })); toast('Polisi pembatalan disimpan'); }}>Simpan polisi</Button>
        </Card>
        <Card>
          <h2 className="w-full text-base font-semibold">Status deposit setiap tempahan</h2>
          {rows.length === 0 && <p className="w-full text-sm text-muted">Belum ada tempahan dengan deposit.</p>}
          {rows.map((b, i) => (
            <div key={b.id} className="w-full flex flex-col gap-3">
              {i > 0 && <Divider />}
              <button onClick={() => nav(`/v/tempahan/${b.id}`)} className="w-full flex flex-row items-center gap-3 min-h-11 text-left">
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="w-full text-sm font-semibold">{b.customer}</span>
                  <span className="w-full text-xs text-muted num">{b.id} · {fmtDate(b.date)} · {rm(b.payments[0]?.amount ?? 0)}</span>
                </span>
                {depositStatus(b) ? <DepositPill b={b} /> : <Pill tone="muted">-</Pill>}
              </button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
