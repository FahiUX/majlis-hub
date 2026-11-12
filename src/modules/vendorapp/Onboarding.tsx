import { useEffect, useRef, useState } from 'react';
import { Check, CircleCheckBig, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { swap } from '../../router';
import { useStore, TODAY } from '../../store';
import { CATS, TOWNS } from '../../data/mock';
import type { Application, CategoryId } from '../../data/types';
import { Button, Chip, EmptyState, TopBar, cx } from '../../components/ui';
import { Card, Field, Toggle, inputCls } from './kit';
import { docError, icOk, ssmOk } from './logic';

type Kind = Application['docs'][number]['kind'];
const DOC_LABEL: Record<Kind, string> = { ssm: 'Sijil SSM', 'ic-depan': 'IC (depan)', 'ic-belakang': 'IC (belakang)', halal: 'Sijil halal' };
interface Doc { name: string; preview?: string; pct: number }
const STEPS = ['Perniagaan', 'Kawasan', 'Dokumen', 'Profil & pakej'];
const COVERS = ['makeup', 'couple', 'bride-assistant', 'inai', 'pelamin', 'photographer', 'venue', 'kompang'].map(n => `img/gen/${n}.jpg`);

function DocSlot({ kind, doc, onFile }: { kind: Kind; doc?: Doc; onFile: (f: File) => void }) {
  const [over, setOver] = useState(false);
  return (
    <label onDragOver={e => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border border-dashed cursor-pointer focus-within:border-hijau', over ? 'border-hijau bg-pucuk-50' : 'border-line2 bg-white')}>
      {doc?.preview ? <img src={doc.preview} alt={`Pratonton ${DOC_LABEL[kind]}`} className="w-12 h-12 shrink-0 rounded-lg object-cover" />
        : <span className="w-12 h-12 shrink-0 rounded-lg bg-pucuk-100 text-hijau flex items-center justify-center">{doc ? <FileText className="w-5 h-5 shrink-0" /> : <Upload className="w-5 h-5 shrink-0" />}</span>}
      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="w-full text-sm font-semibold">{DOC_LABEL[kind]}</span>
        <span className="w-full text-xs text-muted">{doc ? doc.name : 'Ketik atau seret fail · PDF/JPG/PNG, maks 5 MB'}</span>
        {doc && doc.pct < 100 && <span className="w-full h-1.5 rounded-full bg-pucuk-100 overflow-hidden"><span className="block h-full bg-hijau" style={{ width: `${doc.pct}%` }} /></span>}
      </span>
      {doc && (doc.pct < 100 ? <span className="w-fit text-xs font-semibold num">{doc.pct}%</span> : <Check aria-label="Dimuat naik" className="w-5 h-5 shrink-0 text-hijau" />)}
      <input type="file" accept="application/pdf,image/jpeg,image/png" aria-label={`Muat naik ${DOC_LABEL[kind]}`} className="sr-only" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onFile(f); }} />
    </label>
  );
}

/** V-1.0 – V-1.3 onboarding stepper. Draft lives in component state; files are not persisted. */
export default function Onboarding() {
  const { set } = useStore();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);
  // step 1
  const [business, setBusiness] = useState('');
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [freelancer, setFreelancer] = useState(false);
  const [ssm, setSsm] = useState('');
  const [ic, setIc] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  // step 2
  const [area, setArea] = useState('Bangi');
  const [radius, setRadius] = useState(40);
  const [nationwide, setNationwide] = useState(false);
  // step 3
  const [docs, setDocs] = useState<Partial<Record<Kind, Doc>>>({});
  const [docErr, setDocErr] = useState<Partial<Record<Kind, string>>>({});
  const [expiry, setExpiry] = useState('');
  // step 4
  const [about, setAbout] = useState('');
  const [covers, setCovers] = useState<string[]>([]);
  const [pkgs, setPkgs] = useState([{ name: '', price: '' }]);

  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach(t => window.clearInterval(t)); Object.values(docs).forEach(d => d?.preview && URL.revokeObjectURL(d.preview)); }, []);

  const halal = cats.includes('makeup') || cats.includes('inai');
  const kinds: Kind[] = [...(freelancer ? [] : ['ssm' as Kind]), 'ic-depan', 'ic-belakang', ...(halal ? ['halal' as Kind] : [])];
  const icFmt = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 12); return [d.slice(0, 6), d.slice(6, 8), d.slice(8)].filter(Boolean).join('-'); };

  const errs1 = {
    business: !business.trim() ? 'Isi nama perniagaan' : '',
    cats: !cats.length ? 'Pilih sekurang-kurangnya satu kategori' : '',
    id: freelancer ? (!icOk(ic) ? 'Format IC: 900101-14-5678' : '') : (!ssmOk(ssm) ? 'Nombor SSM mesti 12 digit, contoh 202301045512' : ''),
    contact: !contact.trim() ? 'Isi nama orang dihubungi' : '',
    phone: phone.replace(/\D/g, '').length < 9 ? 'Nombor telefon tidak sah' : '',
  };
  const okPkgs = pkgs.filter(p => p.name.trim() && Number(p.price) > 0);
  const stepOk = [
    () => Object.values(errs1).every(e => !e),
    () => nationwide || radius > 0,
    () => kinds.every(k => docs[k]?.pct === 100) && (!halal || !!expiry),
    () => okPkgs.length > 0,
  ][step];

  const upload = (kind: Kind, f: File) => {
    const e = docError(f);
    setDocErr(d => ({ ...d, [kind]: e }));
    if (e) return;
    setDocs(d => ({ ...d, [kind]: { name: f.name, preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined, pct: 0 } }));
    const t = window.setInterval(() => setDocs(d => {
      const cur = d[kind]; if (!cur) return d;
      const pct = Math.min(100, cur.pct + 20);
      if (pct === 100) window.clearInterval(t);
      return { ...d, [kind]: { ...cur, pct } };
    }), 120);
    timers.current.push(t);
  };

  const next = () => {
    setTried(true);
    if (!stepOk()) return;
    setTried(false);
    if (step < 3) return setStep(step + 1);
    const app: Application = {
      id: `AP-${Date.now() % 100000}`, business: business.trim(), cats, freelancer, ssm: freelancer ? '' : ssm, ic: freelancer ? ic : '', contact: contact.trim(), phone: phone.trim(),
      area, radiusKm: nationwide ? 0 : radius, nationwide,
      // files are not persisted: the admin viewer gets a placeholder image per document
      docs: kinds.map(k => ({ kind: k, file: covers[0] ?? 'img/gen/planning.jpg', ...(k === 'halal' ? { expiry } : {}) })),
      about: about.trim(), packages: okPkgs.map(p => ({ name: p.name.trim(), price: Number(p.price) })),
      status: 'submitted', submittedAt: TODAY,
    };
    set(p => ({ applications: [...p.applications, app] }));
    setDone(true);
  };

  if (done) return (
    <div className="w-full flex flex-col">
      <TopBar title="Pendaftaran dihantar" fallback="/v" />
      <EmptyState icon={<CircleCheckBig className="w-6 h-6" />} title="Kami akan sahkan dalam 2 hari bekerja"
        body={`Permohonan ${business} sudah masuk ke barisan semakan. Kami hubungi ${phone} jika ada dokumen yang perlu dibetulkan.`}
        action={<Button onClick={() => swap('/v')}>Ke papan pemuka</Button>} />
    </div>
  );

  const err = (e: string) => (tried ? e : '');
  return (
    <div className="w-full flex-1 flex flex-col">
      <TopBar title="Daftar vendor" fallback="/v/lagi" />
      <div className="w-full flex-1 flex flex-col gap-4 p-5">
        <ol aria-label="Langkah pendaftaran" className="w-full flex flex-row items-start gap-1">
          {STEPS.map((l, i) => (
            <li key={l} aria-current={i === step ? 'step' : undefined} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 text-center">
              <span className={cx('w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold', i < step ? 'bg-hijau text-white' : i === step ? 'border-[1.5px] border-hijau text-hijau bg-white' : 'border-[1.5px] border-line2 text-muted bg-white')}>{i < step ? <Check className="w-4 h-4 shrink-0" /> : i + 1}</span>
              <span className={cx('w-full text-xs font-semibold', i <= step ? 'text-ink' : 'text-muted')}>{l}</span>
            </li>
          ))}
        </ol>
        {step === 0 && (
          <Card>
            <Field label="Nama perniagaan" err={err(errs1.business)}><input value={business} onChange={e => setBusiness(e.target.value)} className={inputCls(err(errs1.business))} /></Field>
            <div className="w-full flex flex-col gap-1.5">
              <span className="w-full text-[13px] font-semibold">Kategori</span>
              <div className="w-full flex flex-row flex-wrap gap-2">{CATS.map(c => <Chip key={c.id} on={cats.includes(c.id)} onClick={() => setCats(cats.includes(c.id) ? cats.filter(x => x !== c.id) : [...cats, c.id])}>{c.name}</Chip>)}</div>
              {err(errs1.cats) && <span role="alert" className="w-full text-sm text-bahaya">{errs1.cats}</span>}
            </div>
            <Toggle on={freelancer} onChange={setFreelancer} label="Saya freelancer (tiada SSM)" />
            {freelancer
              ? <Field label="Nombor IC" err={err(errs1.id)} hint="Format 900101-14-5678"><input value={ic} inputMode="numeric" onChange={e => setIc(icFmt(e.target.value))} placeholder="900101-14-5678" className={inputCls(err(errs1.id))} /></Field>
              : <Field label="Nombor SSM" err={err(errs1.id)} hint="12 digit"><input value={ssm} inputMode="numeric" maxLength={12} onChange={e => setSsm(e.target.value.replace(/\D/g, ''))} placeholder="202301045512" className={inputCls(err(errs1.id))} /></Field>}
            <Field label="Orang untuk dihubungi" err={err(errs1.contact)}><input value={contact} onChange={e => setContact(e.target.value)} className={inputCls(err(errs1.contact))} /></Field>
            <Field label="Telefon" err={err(errs1.phone)}><input value={phone} type="tel" onChange={e => setPhone(e.target.value)} placeholder="012-345 6789" className={inputCls(err(errs1.phone))} /></Field>
          </Card>
        )}
        {step === 1 && (
          <Card>
            <Field label="Lokasi pangkalan"><select value={area} onChange={e => setArea(e.target.value)} className={inputCls()}>{TOWNS.map(t => <option key={t}>{t}</option>)}</select></Field>
            <Toggle on={nationwide} onChange={setNationwide} label="Seluruh Malaysia" />
            {!nationwide && (
              <label className="w-full flex flex-col gap-1.5">
                <span className="w-full text-[13px] font-semibold">Jejari servis · {radius} km dari {area}</span>
                <input type="range" min={5} max={200} step={5} value={radius} onChange={e => setRadius(Number(e.target.value))} className="w-full accent-hijau" />
              </label>
            )}
            <p className="w-full text-sm text-muted">{nationwide ? 'Anda muncul dalam carian di seluruh Malaysia.' : `Pelanggan dalam ${radius} km dari ${area} akan nampak anda.`}</p>
          </Card>
        )}
        {step === 2 && (
          <Card>
            <p className="w-full text-sm text-muted">Dokumen hanya dilihat oleh pasukan pengesahan Majlis Hub.</p>
            {kinds.map(k => (
              <div key={k} className="w-full flex flex-col gap-1.5">
                <DocSlot kind={k} doc={docs[k]} onFile={f => upload(k, f)} />
                {docErr[k] && <span role="alert" className="w-full text-sm text-bahaya">{DOC_LABEL[k]}: {docErr[k]}</span>}
                {tried && !docs[k] && !docErr[k] && <span role="alert" className="w-full text-sm text-bahaya">{DOC_LABEL[k]} diperlukan</span>}
              </div>
            ))}
            {halal && <Field label="Tarikh luput sijil halal" err={err(!expiry ? 'Isi tarikh luput' : '')}><input type="date" min={TODAY} value={expiry} onChange={e => setExpiry(e.target.value)} className={inputCls(err(!expiry ? 'x' : ''))} /></Field>}
          </Card>
        )}
        {step === 3 && (
          <>
            <Card>
              <Field label="Tentang perniagaan"><textarea value={about} onChange={e => setAbout(e.target.value)} rows={3} className={cx(inputCls(), 'resize-none')} /></Field>
              <span className="w-full text-[13px] font-semibold">Gambar muka depan</span>
              <div className="w-full flex flex-row flex-wrap gap-2">
                {COVERS.map(src => {
                  const on = covers.includes(src);
                  return (
                    <button key={src} aria-pressed={on} aria-label={`Gambar ${src.split('/').pop()}`} onClick={() => setCovers(on ? covers.filter(x => x !== src) : [...covers, src])}
                      className={cx('w-[calc(25%-6px)] aspect-square shrink-0 rounded-xl overflow-hidden', on ? 'ring-2 ring-hijau' : 'opacity-70')}>
                      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </Card>
            <Card>
              <h2 className="w-full text-base font-semibold">Pakej</h2>
              {pkgs.map((p, i) => (
                <div key={i} className="w-full flex flex-row items-end gap-2">
                  <Field label="Nama pakej"><input value={p.name} onChange={e => setPkgs(pkgs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={inputCls()} /></Field>
                  <label className="w-[104px] shrink-0 flex flex-col gap-1.5"><span className="w-full text-[13px] font-semibold">RM</span><input value={p.price} inputMode="numeric" onChange={e => setPkgs(pkgs.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, '') } : x)))} className={inputCls()} /></label>
                  {pkgs.length > 1 && <button aria-label={`Buang pakej ${i + 1}`} onClick={() => setPkgs(pkgs.filter((_, j) => j !== i))} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-bahaya hover:bg-bahaya-50"><Trash2 className="w-5 h-5 shrink-0" /></button>}
                </div>
              ))}
              <Button variant="secondary" onClick={() => setPkgs([...pkgs, { name: '', price: '' }])}><Plus className="w-4 h-4 shrink-0" />Tambah pakej</Button>
              {tried && !okPkgs.length && <span role="alert" className="w-full text-sm text-bahaya">Tambah sekurang-kurangnya 1 pakej dengan harga RM sebelum hantar.</span>}
            </Card>
          </>
        )}
      </div>
      <div className="sticky bottom-0 w-full flex flex-row gap-3 p-4 bg-white border-t border-line">
        {step > 0 && <Button variant="secondary" block onClick={() => { setTried(false); setStep(step - 1); }}>Kembali</Button>}
        <Button block onClick={next}>{step < 3 ? 'Seterusnya' : 'Hantar untuk pengesahan'}</Button>
      </div>
    </div>
  );
}
