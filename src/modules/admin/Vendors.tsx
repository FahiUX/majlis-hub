import { useState } from 'react';
import { AlertTriangle, Ban, CircleCheckBig, Download, Eye, SearchX, Star } from 'lucide-react';
import { nav } from '../../router';
import { useStore } from '../../store';
import { CATS, VENDORS, catById, vendorById } from '../../data/mock';
import { EmptyState, Img, Pill } from '../../components/ui';
import type { Vendor } from '../../data/types';
import { Banner, Btn, Card, Drawer, IconBtn, PageHead, Reason, SearchBox, Select, T, Table } from './kit';
import { allBookings, downloadCsv, logEntry, upcomingCount } from './logic';

/** id 32 is suspended in the seed data itself (before the audit log existed), so it can't be reinstated here */
const LEGACY = 32;

/** A-3.0 manage vendors */
export default function Vendors() {
  const { s, set, toast } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [st, setSt] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [target, setTarget] = useState<Vendor | null>(null);
  const [reason, setReason] = useState('');

  const ids = [...new Set([...VENDORS.map(v => v.id), ...s.suspended, LEGACY])];
  const all = ids.map(id => vendorById(id)!).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const bookings = allBookings(s);
  const rows = all.filter(v => (!q || v.name.toLowerCase().includes(q.toLowerCase()))
    && (!cat || v.cat === cat) && (!st || v.state === st)
    && (!status || (status === 'digantung') === !!v.suspended)
    && (!rating || (rating === 'low' ? v.rating < 4 : v.rating >= Number(rating))));
  const states = [...new Set(all.map(v => v.state))];
  const upcoming = target ? upcomingCount(target.id, bookings) : 0;

  const suspend = () => {
    const v = target!, why = reason.trim();
    set(p => ({ suspended: [...p.suspended, v.id], audit: [...p.audit, logEntry('Gantung', v.name, upcoming ? `${why} (${upcoming} pelanggan dimaklumkan)` : why)] }));
    toast(upcoming ? `${v.name} digantung · ${upcoming} pelanggan dimaklumkan` : `${v.name} digantung`);
    setTarget(null);
  };
  const reinstate = (v: Vendor) => {
    set(p => ({ suspended: p.suspended.filter(x => x !== v.id), audit: [...p.audit, logEntry('Pulihkan', v.name)] }));
    toast(`${v.name} dipulihkan`);
  };
  const exportCsv = () => downloadCsv(`vendor-${new Date().toISOString().slice(0, 10)}.csv`, [
    ['ID', 'Nama', 'Kategori', 'Kawasan', 'Negeri', 'Penilaian', 'Ulasan', 'Status', 'Tempahan akan datang'],
    ...rows.map(v => [v.id, v.name, catById(v.cat).name, v.area, v.state, v.rating, v.reviews, v.suspended ? 'Digantung' : 'Aktif', upcomingCount(v.id, bookings)]),
  ]);

  return (
    <>
      <PageHead title="Vendor" sub={`${all.length} vendor · ${all.filter(v => v.suspended).length} digantung`}
        right={<Btn v="secondary" onClick={exportCsv}><Download className="w-4 h-4 shrink-0" />Eksport CSV</Btn>} />
      <div className="w-full flex flex-row flex-wrap items-center justify-between gap-3">
        <SearchBox label="Cari nama vendor" value={q} onChange={setQ} />
        <div className="w-fit flex flex-row flex-wrap gap-2">
          <Select label="Kategori" value={cat} onChange={setCat} options={[['', 'Semua kategori'], ...CATS.map(c => [c.id, c.name] as [string, string])]} />
          <Select label="Negeri" value={st} onChange={setSt} options={[['', 'Semua negeri'], ...states.map(x => [x, x] as [string, string])]} />
          <Select label="Status" value={status} onChange={setStatus} options={[['', 'Semua status'], ['aktif', 'Aktif'], ['digantung', 'Digantung']]} />
          <Select label="Penilaian" value={rating} onChange={setRating} options={[['', 'Semua penilaian'], ['4.8', '4.8 ke atas'], ['4.5', '4.5 ke atas'], ['low', 'Bawah 4.0']]} />
        </div>
      </div>
      {rows.length === 0 ? <Card><EmptyState icon={<SearchX className="w-6 h-6 shrink-0" />} title="Tiada vendor sepadan" body="Cuba ubah carian atau penapis." /></Card> : (
        <Table label="Senarai vendor" rows={rows} k={v => String(v.id)} cols={[
          { h: 'Vendor', w: 'flex-1 min-w-0', c: v => <><Img src={v.img} cat={v.cat} alt="" className="w-9 h-9 shrink-0 rounded-lg" /><T strong sub={`ID ${v.id}${v.freelancer ? ' · Freelancer' : ''}`}>{v.name}</T></> },
          { h: 'Kategori', w: 'w-[140px] shrink-0', c: v => <T>{catById(v.cat).name}</T> },
          { h: 'Kawasan', w: 'w-[150px] shrink-0', c: v => <T sub={v.state}>{v.area}</T> },
          { h: 'Penilaian', w: 'w-[96px] shrink-0', c: v => <span className="w-fit flex flex-row items-center gap-1 num"><Star className="w-3.5 h-3.5 shrink-0 fill-ink" aria-hidden />{v.rating.toFixed(1)}</span> },
          { h: 'Status', w: 'w-[120px] shrink-0', c: v => v.suspended
            ? <Pill tone="bahaya"><Ban className="w-3.5 h-3.5 shrink-0" aria-hidden />Digantung</Pill>
            : <Pill tone="hijau"><CircleCheckBig className="w-3.5 h-3.5 shrink-0" aria-hidden />Aktif</Pill> },
          { h: 'Tindakan', w: 'w-[170px] shrink-0', c: v => <>
            <IconBtn label={`Lihat profil ${v.name}`} onClick={() => nav(`/vendor/${v.id}`)}><Eye className="w-4 h-4 shrink-0" /></IconBtn>
            {v.suspended
              ? <Btn v="secondary" onClick={() => reinstate(v)} disabled={v.id === LEGACY} title={v.id === LEGACY ? 'Digantung sebelum log audit wujud; hubungi pasukan teknikal' : undefined}>Pulihkan</Btn>
              : <Btn v="danger" onClick={() => { setTarget(v); setReason(''); }}>Gantung</Btn>}
          </> },
        ]} />
      )}
      {target && (
        <Drawer title={`Gantung ${target.name}`} onClose={() => setTarget(null)} footer={<>
          <Btn v="secondary" block onClick={() => setTarget(null)}>Batal</Btn>
          <Btn v="dangerSolid" block disabled={!reason.trim()} onClick={suspend}>Sahkan gantung</Btn>
        </>}>
          <p className="w-full text-sm text-body">Penyenaraian akan disembunyikan daripada carian, Inspirasi dan Home sehingga dipulihkan.</p>
          {upcoming > 0 && (
            <Banner tone="amaran" icon={<AlertTriangle className="w-4 h-4 shrink-0" />}>
              <span className="w-full font-semibold">{upcoming} tempahan akan datang (diterima, deposit atau disahkan)</span>
              <span className="w-full">Pelanggan akan dimaklumkan.</span>
            </Banner>
          )}
          <Reason label="Sebab penggantungan (wajib)" value={reason} onChange={setReason} hint="Direkodkan dalam log audit." />
        </Drawer>
      )}
    </>
  );
}
