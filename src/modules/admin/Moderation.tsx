import { useState } from 'react';
import { AlertTriangle, CircleCheckBig, EyeOff, Flag, MessageSquare, Play, ShieldAlert, Video } from 'lucide-react';
import { useStore } from '../../store';
import { vendorById } from '../../data/mock';
import { EmptyState, Pill, Stars, fmtDate } from '../../components/ui';
import type { ContentReport, ReviewReport } from '../../data/types';
import { Banner, Btn, Card, Dl, Drawer, PageHead, Reason, T, Table, Tabs } from './kit';
import { logEntry } from './logic';
import { ME_VENDOR } from '../../data/wave2';

const vName = (id: number) => vendorById(id)?.name ?? `Vendor ${id}`;

const RR_OUT: Record<ReviewReport['status'], [string, 'hijau' | 'muted' | 'amaran']> = { open: ['Terbuka', 'amaran'], kept: ['Dikekalkan', 'hijau'], hidden: ['Disembunyikan', 'muted'] };

/** A-5.0 reported reviews */
export function ReviewQueue() {
  const { s, set, toast } = useStore();
  const [tab, setTab] = useState('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [hiding, setHiding] = useState(false);
  const [reason, setReason] = useState('');
  const rows = s.reviewReports.filter(r => (tab === 'open') === (r.status === 'open'));
  const cur = s.reviewReports.find(r => r.id === openId);
  const close = () => { setOpenId(null); setHiding(false); setReason(''); };

  const decide = (r: ReviewReport, status: 'kept' | 'hidden', why?: string) => {
    set(p => ({
      reviewReports: p.reviewReports.map(x => x.id === r.id ? { ...x, status, note: why } : x),
      hiddenReviews: status === 'hidden' ? [...p.hiddenReviews, `${r.vendorId}|${r.review.name}|${r.review.date}`] : p.hiddenReviews,
      audit: [...p.audit, logEntry(status === 'hidden' ? 'Sembunyi ulasan' : 'Kekalkan ulasan', `${vName(r.vendorId)} · ulasan ${r.review.name}`, why)],
    }));
    toast(status === 'hidden' ? 'Ulasan disembunyikan · disimpan dalam rekod' : 'Ulasan dikekalkan');
    close();
  };

  return (
    <>
      <PageHead title="Ulasan dilaporkan" sub="Ulasan yang disembunyikan kekal dalam rekod untuk ketelusan." />
      <Tabs tabs={[['open', `Terbuka (${s.reviewReports.filter(r => r.status === 'open').length})`], ['done', 'Selesai']]} on={tab} set={setTab} />
      {rows.length === 0 ? <Card><EmptyState icon={<CircleCheckBig className="w-6 h-6 shrink-0" />} title="Tiada laporan" body={tab === 'open' ? 'Semua laporan ulasan sudah disemak.' : 'Belum ada laporan yang diselesaikan.'} /></Card> : (
        <Table label="Laporan ulasan" rows={rows} k={r => r.id} h="h-[64px]" cols={[
          { h: 'Vendor', w: 'w-[190px] shrink-0', c: r => <T strong sub={r.id}>{vName(r.vendorId)}</T> },
          { h: 'Ulasan', w: 'flex-1 min-w-0', c: r => <T sub={`${r.review.name} · ${r.review.rating}/5 · ${r.review.date}`}>{r.review.text}</T> },
          { h: 'Sebab laporan', w: 'w-[190px] shrink-0', c: r => <T sub={`oleh ${r.reporter}`}>{r.reason}</T> },
          { h: 'Status', w: 'w-[130px] shrink-0', c: r => <Pill tone={RR_OUT[r.status][1]}>{RR_OUT[r.status][0]}</Pill> },
          { h: 'Tindakan', w: 'w-[100px] shrink-0', c: r => <Btn v="secondary" onClick={() => setOpenId(r.id)} aria-label={`Semak laporan ${r.id}`}>Semak</Btn> },
        ]} />
      )}
      {cur && (
        <Drawer title={`Laporan ${cur.id}`} onClose={close} footer={cur.status !== 'open' ? undefined : hiding ? <>
          <Btn v="secondary" block onClick={() => setHiding(false)}>Batal</Btn>
          <Btn v="dangerSolid" block disabled={!reason.trim()} onClick={() => decide(cur, 'hidden', reason.trim())}>Sahkan sembunyi</Btn>
        </> : <>
          <Btn v="secondary" block onClick={() => decide(cur, 'kept')}>Kekalkan</Btn>
          <Btn v="danger" block onClick={() => setHiding(true)}><EyeOff className="w-4 h-4 shrink-0" />Sembunyikan</Btn>
        </>}>
          <Dl rows={[['Vendor', vName(cur.vendorId)], ['Dilaporkan oleh', cur.reporter], ['Tarikh lapor', fmtDate(cur.at)], ['Sebab', cur.reason]]} />
          <figure className="w-full flex flex-col gap-2 p-4 rounded-xl bg-kertas border border-line">
            <div className="w-full flex flex-row items-center gap-2">
              <span className="flex-1 min-w-0 text-sm font-semibold">{cur.review.name}</span>
              <Stars n={cur.review.rating} />
            </div>
            <blockquote className="w-full text-sm text-body">{cur.review.text}</blockquote>
            <figcaption className="w-full text-xs text-muted">{cur.review.date}</figcaption>
          </figure>
          {cur.status !== 'open' && <Banner tone="info" icon={<CircleCheckBig className="w-4 h-4 shrink-0" />}>
            <span className="w-full font-semibold">{RR_OUT[cur.status][0]}</span>
            {cur.note && <span className="w-full">Sebab: {cur.note}</span>}
            {cur.status === 'hidden' && <span className="w-full">Ulasan disembunyikan daripada awam tetapi kekal dalam rekod.</span>}
          </Banner>}
          {cur.status === 'open' && hiding && <Reason label="Sebab menyembunyikan (wajib)" value={reason} onChange={setReason} hint="Direkodkan dalam log audit. Ulasan kekal dalam rekod." />}
        </Drawer>
      )}
    </>
  );
}

/** auto-flag rules (A-7.0), read-only */
const BANNED = ['DM wasap', 'whatsapp saya', 'murah lagi kat', 'penipu', 'scam', 'pinjaman segera'];
const REPEAT = 3;
const CR_OUT: Record<ContentReport['status'], [string, 'hijau' | 'muted' | 'amaran' | 'bahaya']> = { open: ['Terbuka', 'amaran'], approved: ['Diluluskan', 'hijau'], removed: ['Dibuang', 'bahaya'], warned: ['Amaran diberi', 'amaran'] };
const total = (r: ContentReport) => Object.values(r.reasons).reduce((a, b) => a + b, 0);

/** A-7.0 video & comment moderation */
export function ContentQueue() {
  const { s, set, toast } = useStore();
  const [tab, setTab] = useState('open');
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<'' | 'removed' | 'warned'>('');
  const [reason, setReason] = useState('');
  const rows = s.contentReports.filter(r => (tab === 'open') === (r.status === 'open'));
  const cur = s.contentReports.find(r => r.id === openId);
  const close = () => { setOpenId(null); setMode(''); setReason(''); };

  const decide = (r: ContentReport, status: 'approved' | 'removed' | 'warned', why?: string) => {
    const action = { approved: 'Lulus kandungan', removed: 'Buang kandungan', warned: 'Amaran vendor' }[status];
    set(p => ({
      contentReports: p.contentReports.map(x => x.id === r.id ? { ...x, status, note: why } : x),
      // the demo vendor's own video: mirror the decision so the vendor app shows it
      videos: r.kind === 'video' && r.vendorId === ME_VENDOR && status !== 'warned'
        ? p.videos.map(v => v.title === r.title ? (status === 'removed' ? { ...v, status: 'removed' as const, reason: why } : { ...v, status: 'live' as const, reason: undefined }) : v)
        : p.videos,
      audit: [...p.audit, logEntry(action, `${vName(r.vendorId)} · ${r.title}`, why)],
    }));
    toast(status === 'approved' ? 'Kandungan diluluskan' : status === 'removed' ? 'Kandungan dibuang · vendor dimaklumkan' : 'Amaran dihantar kepada vendor');
    close();
  };

  return (
    <>
      <PageHead title="Kandungan dilaporkan" sub="Video dan komen yang dilaporkan pengguna atau dibenderakan secara automatik." />
      <div className="w-full flex flex-col gap-4">
          <Tabs tabs={[['open', `Terbuka (${s.contentReports.filter(r => r.status === 'open').length})`], ['done', 'Selesai']]} on={tab} set={setTab} />
          {rows.length === 0 ? <Card><EmptyState icon={<CircleCheckBig className="w-6 h-6 shrink-0" />} title="Tiada laporan" body={tab === 'open' ? 'Semua kandungan sudah disemak.' : 'Belum ada laporan yang diselesaikan.'} /></Card> : (
            <Table label="Laporan kandungan" rows={rows} k={r => r.id} h="h-[64px]" cols={[
              { h: 'Kandungan', w: 'flex-1 min-w-0', c: r => <>
                <span className="w-8 h-8 shrink-0 rounded-lg bg-pucuk-50 text-hijau flex items-center justify-center" aria-label={r.kind === 'video' ? 'Video' : 'Komen'}>{r.kind === 'video' ? <Video className="w-4 h-4 shrink-0" /> : <MessageSquare className="w-4 h-4 shrink-0" />}</span>
                <T strong sub={vName(r.vendorId)}>{r.kind === 'comment' && r.text ? r.text : r.title}</T></> },
              { h: 'Laporan', w: 'w-[90px] shrink-0', c: r => <T sub="laporan">{total(r)}</T> },
              { h: 'Auto-bendera', w: 'w-[240px] shrink-0', c: r => r.autoFlag ? <T sub={fmtDate(r.at)}>{r.autoFlag}</T> : <T>—</T> },
              { h: 'Status', w: 'w-[130px] shrink-0', c: r => <Pill tone={CR_OUT[r.status][1]}>{CR_OUT[r.status][0]}</Pill> },
              { h: 'Tindakan', w: 'w-[120px] shrink-0', c: r => <Btn v="secondary" onClick={() => setOpenId(r.id)} aria-label={`Pratonton ${r.id}`}>Pratonton</Btn> },
            ]} />
          )}
        <Card title="Peraturan auto-bendera" right={<span className="w-fit shrink-0 text-xs text-muted">Baca sahaja · diurus pasukan teknikal</span>}>
          <div className="w-full flex flex-row items-start gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <span className="w-full text-sm font-semibold">Perkataan dilarang</span>
            <div className="w-full flex flex-row flex-wrap gap-1.5">{BANNED.map(w => <Pill key={w} tone="muted">{w}</Pill>)}</div>
          </div>
          <div className="w-[240px] shrink-0 flex flex-col gap-1">
            <span className="w-full text-sm font-semibold">Laporan berulang</span>
            <span className="w-full text-sm text-body">Dibenderakan apabila {REPEAT} laporan atau lebih.</span>
          </div>
          <div className="w-[240px] shrink-0 flex flex-col gap-1">
            <span className="w-full text-sm font-semibold">Video baharu</span>
            <span className="w-full text-sm text-body">Muzik atau wajah kanak-kanak dikesan: disemak sebelum disiarkan.</span>
          </div>
          </div>
        </Card>
      </div>
      {cur && (
        <Drawer title={cur.kind === 'video' ? 'Pratonton video' : 'Pratonton komen'} onClose={close} footer={cur.status !== 'open' ? undefined : mode ? <>
          <Btn v="secondary" block onClick={() => setMode('')}>Batal</Btn>
          <Btn v={mode === 'removed' ? 'dangerSolid' : 'primary'} block disabled={!reason.trim()} onClick={() => decide(cur, mode, reason.trim())}>{mode === 'removed' ? 'Sahkan buang' : 'Hantar amaran'}</Btn>
        </> : <>
          <Btn v="primary" block onClick={() => decide(cur, 'approved')}>Lulus</Btn>
          <Btn v="secondary" block onClick={() => setMode('warned')}><ShieldAlert className="w-4 h-4 shrink-0" />Amaran</Btn>
          <Btn v="danger" block onClick={() => setMode('removed')}>Buang</Btn>
        </>}>
          {cur.kind === 'video' ? (
            <div className="relative w-full h-[420px] shrink-0 rounded-xl overflow-hidden bg-ink">
              {cur.poster && <img src={cur.poster} alt={`Muka depan video: ${cur.title}`} className="w-full h-full object-cover opacity-80" />}
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden><span className="w-14 h-14 rounded-full bg-white/90 text-ink flex items-center justify-center"><Play className="w-6 h-6 shrink-0 fill-ink" /></span></span>
            </div>
          ) : (
            <blockquote className="w-full p-4 rounded-xl bg-kertas border border-line text-sm text-body">“{cur.text}”</blockquote>
          )}
          <Dl rows={[['Tajuk', cur.title], ['Vendor', vName(cur.vendorId)], ['Dilaporkan', fmtDate(cur.at)]]} />
          {cur.autoFlag && <Banner tone="amaran" icon={<Flag className="w-4 h-4 shrink-0" />}>Auto-bendera: {cur.autoFlag}</Banner>}
          <div className="w-full flex flex-col gap-2">
            <span className="w-full text-sm font-semibold">Sebab laporan</span>
            <ul className="w-full flex flex-col gap-1.5">
              {Object.entries(cur.reasons).map(([k, n]) => (
                <li key={k} className="w-full flex flex-row items-center gap-3 text-sm"><span className="flex-1 min-w-0">{k}</span><span className="w-fit shrink-0 font-semibold num">×{n}</span></li>
              ))}
            </ul>
          </div>
          {cur.status !== 'open' && <Banner tone="info" icon={<CircleCheckBig className="w-4 h-4 shrink-0" />}><span className="w-full font-semibold">{CR_OUT[cur.status][0]}</span>{cur.note && <span className="w-full">Sebab: {cur.note}</span>}</Banner>}
          {cur.status === 'open' && mode && <>
            {mode === 'removed' && <Banner tone="bahaya" icon={<AlertTriangle className="w-4 h-4 shrink-0" />}>Kandungan akan dibuang dan vendor dimaklumkan dengan sebab ini.</Banner>}
            <Reason label={mode === 'removed' ? 'Sebab membuang (wajib)' : 'Mesej amaran kepada vendor (wajib)'} value={reason} onChange={setReason} hint="Direkodkan dalam log audit." />
          </>}
        </Drawer>
      )}
    </>
  );
}
