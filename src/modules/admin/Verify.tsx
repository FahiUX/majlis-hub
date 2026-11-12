import { useState } from 'react';
import { AlertTriangle, BadgeCheck, CircleCheckBig, Clock, FileWarning, ImageOff, ZoomIn, ZoomOut } from 'lucide-react';
import { nav, swap } from '../../router';
import { TODAY, daysBetween, useStore } from '../../store';
import { CATS, catById } from '../../data/mock';
import { EmptyState, Pill, cx, fmtDate, rm } from '../../components/ui';
import type { Application } from '../../data/types';
import { Banner, Btn, Card, Dl, IconBtn, PageHead, Reason, Select, T, Table } from './kit';
import { logEntry, slaLate, stateOf, workingDays } from './logic';

/** verification checklist (A-2.1), also listed read-only in Platform Settings */
export const CHECKS = [
  { id: 'ssm', label: 'SSM sepadan dengan nama perniagaan' },
  { id: 'ic', label: 'IC sepadan dengan nama kenalan' },
  { id: 'halal', label: 'Sijil halal sah dan belum tamat tempoh' },
  { id: 'photos', label: 'Foto dan dokumen tulen' },
] as const;

const DOC: Record<Application['docs'][number]['kind'], string> = { ssm: 'Sijil SSM', 'ic-depan': 'IC (depan)', 'ic-belakang': 'IC (belakang)', halal: 'Sijil halal' };
const cats = (a: Application) => a.cats.map(c => catById(c).name).join(', ');

function Sla({ at }: { at: string }) {
  const n = workingDays(at, TODAY);
  return slaLate(at)
    ? <Pill tone="bahaya"><AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />Lewat SLA · {n} hari bekerja</Pill>
    : <Pill tone="hijau"><Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />{n} hari bekerja</Pill>;
}

/** A-2.0 verification queue: submitted, oldest first */
export function VerifyQueue() {
  const { s } = useStore();
  const [cat, setCat] = useState('');
  const [st, setSt] = useState('');
  const all = s.applications.filter(a => a.status === 'submitted').sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const rows = all.filter(a => (!cat || a.cats.includes(cat as never)) && (!st || stateOf(a.area) === st));
  const states = [...new Set(all.map(a => stateOf(a.area)))];
  return (
    <>
      <PageHead title="Pengesahan vendor" sub="Permohonan yang dihantar, paling lama dahulu. SLA: semak dalam 2 hari bekerja." />
      <div className="w-full flex flex-row items-center gap-3">
        <span className="flex-1 min-w-0 text-sm text-muted">{rows.length} permohonan</span>
        <Select label="Kategori" value={cat} onChange={setCat} options={[['', 'Semua kategori'], ...CATS.map(c => [c.id, c.name] as [string, string])]} />
        <Select label="Negeri" value={st} onChange={setSt} options={[['', 'Semua negeri'], ...states.map(x => [x, x] as [string, string])]} />
      </div>
      {rows.length === 0 ? (
        <Card><EmptyState icon={<CircleCheckBig className="w-6 h-6 shrink-0" />} title="Semua sudah disemak" body={all.length ? 'Tiada permohonan untuk penapis ini.' : 'Tiada permohonan menunggu pengesahan.'} /></Card>
      ) : (
        <Table label="Barisan pengesahan" rows={rows} k={a => a.id} cols={[
          { h: 'Perniagaan', w: 'flex-1 min-w-0', c: a => <T strong sub={`${a.id} · ${a.contact}`}>{a.business}</T> },
          { h: 'Kategori', w: 'w-[170px] shrink-0', c: a => <T sub={a.freelancer ? 'Freelancer' : 'Syarikat'}>{cats(a)}</T> },
          { h: 'Kawasan', w: 'w-[150px] shrink-0', c: a => <T sub={stateOf(a.area)}>{a.area}</T> },
          { h: 'Dihantar', w: 'w-[120px] shrink-0', c: a => <T>{fmtDate(a.submittedAt)}</T> },
          { h: 'SLA', w: 'w-[200px] shrink-0', c: a => <Sla at={a.submittedAt} /> },
          { h: 'Tindakan', w: 'w-[110px] shrink-0', c: a => <Btn v="secondary" onClick={() => nav(`/admin/pengesahan/${a.id}`)} aria-label={`Semak ${a.business}`}>Semak</Btn> },
        ]} />
      )}
    </>
  );
}

/** A-2.1 review one application: documents left, checklist + decision right */
export function VerifyReview({ id }: { id: string }) {
  const { s, set, toast } = useStore();
  const app = s.applications.find(a => a.id === id);
  const [doc, setDoc] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [failed, setFailed] = useState<number[]>([]);
  const [ticks, setTicks] = useState<string[]>([]);
  const [mode, setMode] = useState<'' | 'reject' | 'reupload'>('');
  const [reason, setReason] = useState('');
  if (!app) return <><PageHead title="Permohonan tidak dijumpai" backTo="/admin/pengesahan" /><Card><EmptyState icon={<FileWarning className="w-6 h-6 shrink-0" />} title="Permohonan tiada" body={`Tiada permohonan ${id}.`} /></Card></>;

  const halal = app.docs.find(d => d.kind === 'halal');
  const halalDays = halal?.expiry ? daysBetween(TODAY, halal.expiry) : null;
  const halalExpired = halalDays !== null && halalDays < 0;
  const halalSoon = halalDays !== null && halalDays >= 0 && halalDays <= 30;
  const na = (c: string) => (c === 'halal' && !halal) || (c === 'ssm' && !app.ssm);
  const isBroken = (i: number) => !!app.docs[i]?.broken || failed.includes(i);
  const anyBroken = app.docs.some((_, i) => isBroken(i));
  const applicable = CHECKS.filter(c => !na(c.id));
  const allTicked = applicable.every(c => ticks.includes(c.id));
  const open = app.status === 'submitted';

  const decide = (status: Application['status'], action: string, why?: string, msg?: string) => {
    set(p => ({
      applications: p.applications.map(a => a.id === app.id ? { ...a, status, rejectReason: status === 'verified' ? undefined : why } : a),
      audit: [...p.audit, logEntry(action, app.business, why)],
    }));
    toast(msg ?? action);
    swap('/admin/pengesahan');
  };
  const approve = () => decide('verified', 'Lulus', halalSoon ? `Peringatan: sijil halal tamat ${fmtDate(halal!.expiry!)}` : undefined,
    halalSoon ? `${app.business} diluluskan · peringatan sijil halal dihantar` : `${app.business} diluluskan`);
  const reupload = (why: string) => decide('draft', 'Minta muat naik semula', why, 'Permintaan muat naik semula dihantar kepada vendor');

  const d = app.docs[doc];
  return (
    <>
      <PageHead backTo="/admin/pengesahan" title={app.business} sub={`${app.id} · ${cats(app)} · dihantar ${fmtDate(app.submittedAt)}`}
        right={open ? <Sla at={app.submittedAt} /> : <Pill tone={app.status === 'verified' ? 'hijau' : 'muted'}>{app.status === 'verified' ? 'Diluluskan' : app.status === 'rejected' ? 'Ditolak' : 'Menunggu vendor'}</Pill>} />
      <div className="w-full flex flex-row items-start gap-6">
        <Card title="Dokumen" className="flex-1 min-w-0" right={
          <div className="w-fit flex flex-row items-center gap-2">
            <IconBtn label="Zum keluar" disabled={zoom <= 50 || isBroken(doc)} onClick={() => setZoom(z => z - 25)}><ZoomOut className="w-4 h-4 shrink-0" /></IconBtn>
            <span className="w-[48px] shrink-0 text-center text-sm num" aria-live="polite">{zoom}%</span>
            <IconBtn label="Zum masuk" disabled={zoom >= 250 || isBroken(doc)} onClick={() => setZoom(z => z + 25)}><ZoomIn className="w-4 h-4 shrink-0" /></IconBtn>
          </div>}>
          <div role="tablist" aria-label="Dokumen" className="w-full flex flex-row flex-wrap gap-3">
            {app.docs.map((x, i) => (
              <button key={i} role="tab" aria-selected={i === doc} onClick={() => { setDoc(i); setZoom(100); }}
                className={cx('w-[112px] shrink-0 flex flex-col gap-1.5 p-1.5 rounded-xl border-2 text-left', i === doc ? 'border-hijau' : 'border-transparent hover:border-line')}>
                {isBroken(i)
                  ? <span className="w-full h-[72px] rounded-lg bg-bahaya-50 text-bahaya flex items-center justify-center"><ImageOff className="w-5 h-5 shrink-0" aria-hidden /></span>
                  : <img src={x.file} alt="" className="w-full h-[72px] rounded-lg object-cover" onError={() => setFailed(f => [...f, i])} />}
                <span className="w-full text-xs font-semibold">{DOC[x.kind]}</span>
              </button>
            ))}
          </div>
          <div className="w-full h-[520px] rounded-xl bg-kertas border border-line overflow-auto">
            {isBroken(doc) ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center">
                <span className="w-14 h-14 shrink-0 rounded-full bg-bahaya-50 text-bahaya flex items-center justify-center"><ImageOff className="w-6 h-6 shrink-0" aria-hidden /></span>
                <p className="w-full text-base font-semibold">Dokumen gagal dimuat</p>
                <p className="w-[320px] text-sm text-body">{DOC[d.kind]} tidak dapat dibuka. Minta vendor memuat naik semula dokumen ini.</p>
                {open && <Btn onClick={() => reupload(`${DOC[d.kind]} gagal dimuat`)}>Minta muat naik semula</Btn>}
              </div>
            ) : (
              <img src={d.file} alt={`${DOC[d.kind]} ${app.business}`} style={{ width: `${zoom}%` }} className="block h-auto" onError={() => setFailed(f => [...f, doc])} />
            )}
          </div>
          {d.expiry && <p className={cx('w-full text-sm', halalExpired ? 'text-bahaya' : halalSoon ? 'text-amaran' : 'text-body')}>Tarikh tamat: {fmtDate(d.expiry)}{halalDays !== null && (halalExpired ? ' (sudah tamat)' : ` (${halalDays} hari lagi)`)}</p>}
        </Card>

        <div className="w-[400px] shrink-0 flex flex-col gap-5">
          <Card title="Senarai semak">
            <fieldset className="w-full flex flex-col gap-3" disabled={!open}>
              <legend className="sr-only">Senarai semak pengesahan</legend>
              {CHECKS.map(c => {
                const blocked = c.id === 'halal' && halalExpired;
                return (
                  <label key={c.id} className={cx('w-full flex flex-row items-start gap-3 text-sm', (na(c.id) || blocked) && 'text-muted')}>
                    <input type="checkbox" className="w-4 h-4 shrink-0 accent-hijau" disabled={na(c.id) || blocked} checked={ticks.includes(c.id)}
                      onChange={e => setTicks(t => e.target.checked ? [...t, c.id] : t.filter(x => x !== c.id))} />
                    <span className="flex-1 min-w-0">{c.label}{na(c.id) && ' · tidak berkaitan'}{blocked && ' · sijil sudah tamat'}</span>
                  </label>
                );
              })}
            </fieldset>
            {open && halalSoon && <Banner tone="amaran" icon={<AlertTriangle className="w-4 h-4 shrink-0" />}>Sijil halal tamat dalam {halalDays} hari ({fmtDate(halal!.expiry!)}). Lulus akan menghantar peringatan kepada vendor untuk memperbaharui.</Banner>}
            {open && anyBroken && <Banner tone="bahaya" icon={<ImageOff className="w-4 h-4 shrink-0" />}>Ada dokumen gagal dimuat. Minta muat naik semula sebelum lulus.</Banner>}
            {open && mode === '' && (
              <div className="w-full flex flex-col gap-3">
                <div className="w-full flex flex-row">
                  <Btn block onClick={approve} disabled={!allTicked || anyBroken || halalExpired}>
                    <BadgeCheck className="w-4 h-4 shrink-0" />{halalSoon ? 'Lulus dengan peringatan' : 'Lulus'}
                  </Btn>
                </div>
                {!allTicked && <p className="w-full text-xs text-muted">Tandakan semua semakan untuk lulus.</p>}
                <div className="w-full flex flex-row gap-3">
                  <Btn v="danger" block onClick={() => { setMode('reject'); setReason(''); }}>Tolak</Btn>
                  <Btn v="secondary" block onClick={() => { setMode('reupload'); setReason(''); }}>Minta muat naik semula</Btn>
                </div>
              </div>
            )}
            {open && mode !== '' && (
              <div className="w-full flex flex-col gap-3">
                <Reason label={mode === 'reject' ? 'Sebab penolakan (wajib)' : 'Dokumen yang perlu dimuat naik semula (wajib)'} value={reason} onChange={setReason} hint="Vendor akan nampak sebab ini." />
                <div className="w-full flex flex-row gap-3">
                  <Btn v="secondary" block onClick={() => setMode('')}>Batal</Btn>
                  <Btn v={mode === 'reject' ? 'dangerSolid' : 'primary'} block disabled={!reason.trim()}
                    onClick={() => mode === 'reject' ? decide('rejected', 'Tolak', reason.trim(), `${app.business} ditolak`) : reupload(reason.trim())}>
                    {mode === 'reject' ? 'Sahkan tolak' : 'Hantar permintaan'}
                  </Btn>
                </div>
              </div>
            )}
            {!open && app.rejectReason && <Banner tone="info" icon={<FileWarning className="w-4 h-4 shrink-0" />}>Sebab: {app.rejectReason}</Banner>}
          </Card>
          <Card title="Butiran pemohon">
            <Dl rows={[
              ['Jenis', app.freelancer ? 'Freelancer (individu)' : 'Syarikat berdaftar'],
              ['No. SSM', app.ssm || '—'],
              ['No. IC', app.ic || '—'],
              ['Kenalan', app.contact],
              ['Telefon', app.phone],
              ['Kawasan', `${app.area}, ${stateOf(app.area)}`],
              ['Liputan', app.nationwide ? 'Seluruh Malaysia' : `${app.radiusKm} km`],
              ['Tentang', app.about],
            ]} />
          </Card>
          <Card title="Pakej">
            <ul className="w-full flex flex-col gap-2">
              {app.packages.map(p => (
                <li key={p.name} className="w-full flex flex-row items-center gap-3 text-sm">
                  <span className="flex-1 min-w-0">{p.name}</span>
                  <span className="w-fit shrink-0 font-semibold num">{rm(p.price)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
