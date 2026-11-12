import { useEffect, useRef, useState } from 'react';
import { CircleCheckBig, Clapperboard, Eye, Heart, Hourglass, Loader2, Lock, MessageCircle, MousePointerClick, PencilLine, Pin, Send, Trash2, Upload as UploadIcon } from 'lucide-react';
import { nav, swap } from '../../router';
import { useStore } from '../../store';
import { CATS, vendorById } from '../../data/mock';
import { ME_VENDOR } from '../../data/wave2';
import type { CategoryId, VendorVideo } from '../../data/types';
import { Button, EmptyState, Pill, Sheet, TopBar, cx } from '../../components/ui';
import { Field, inputCls } from './kit';
import { flagged, videoError } from './logic';

const n = (x: number) => (x >= 1000 ? (x / 1000).toFixed(1).replace('.0', '') + 'K' : String(x));
const STATUS: Record<VendorVideo['status'], [string, 'hijau' | 'amaran' | 'bahaya' | 'muted']> = {
  live: ['Live', 'hijau'], review: ['Dalam semakan', 'amaran'], removed: ['Dibuang', 'bahaya'], processing: ['Memproses', 'muted'],
};

function Locked() {
  return (
    <EmptyState icon={<Lock className="w-6 h-6" />} title="Lengkapkan pengesahan dahulu"
      body="Hanya vendor yang disahkan boleh muat naik video ke Inspirasi." action={<Button onClick={() => nav('/v')}>Lihat status pengesahan</Button>} />
  );
}

/* ---------- V-8.1 manage & insights ---------- */
export function Videos() {
  const { s, set, toast } = useStore();
  const verified = s.listing.status === 'verified';
  const [edit, setEdit] = useState<VendorVideo | null>(null);
  const [del, setDel] = useState<VendorVideo | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const save = () => {
    if (!edit || !title.trim()) return;
    set(p => ({ videos: p.videos.map(v => (v.id === edit.id ? { ...v, title: title.trim(), desc: desc.trim() } : v)) }));
    toast('Video dikemas kini'); setEdit(null);
  };
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Video saya" fallback="/v" />
      {!verified && s.videos.length === 0 ? <Locked /> : s.videos.length === 0 ? (
        <EmptyState icon={<Clapperboard className="w-6 h-6" />} title="Video pertama anda boleh tarik 3× lebih permintaan"
          body="Video pendek 60 saat tentang hasil kerja anda muncul di Inspirasi." action={<Button onClick={() => nav('/v/video/baru')}><UploadIcon className="w-4 h-4 shrink-0" />Muat naik video</Button>} />
      ) : (
        <div className="w-full flex flex-col gap-3 p-5">
          {verified ? <Button onClick={() => nav('/v/video/baru')}><UploadIcon className="w-4 h-4 shrink-0" />Muat naik video</Button> : (
            <div className="w-full flex flex-row items-center gap-2 p-4 rounded-2xl bg-amaran-50 text-sm text-amaran"><Lock className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Muat naik dikunci. Lengkapkan pengesahan dahulu.</span></div>
          )}
          {s.videos.map(v => (
            <article key={v.id} className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
              <div className="w-full flex flex-row items-start gap-3">
                <img src={v.poster} alt="" className="w-[72px] h-[128px] shrink-0 rounded-xl object-cover" />
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <span className="w-full text-[15px] font-semibold">{v.title}</span>
                  <span className="w-full text-xs text-muted">{[v.loc, v.tags].filter(Boolean).join(' · ')}</span>
                  <div className="w-full flex flex-row flex-wrap gap-1.5">
                    <Pill tone={STATUS[v.status][1]}>{v.status === 'review' && <Hourglass className="w-3.5 h-3.5 shrink-0" />}{v.status === 'live' && <CircleCheckBig className="w-3.5 h-3.5 shrink-0" />}{STATUS[v.status][0]}</Pill>
                    {v.pinned && <Pill tone="muted"><Pin className="w-3.5 h-3.5 shrink-0" />Disemat</Pill>}
                  </div>
                  {v.status === 'removed' && v.reason && <span className="w-full text-xs text-bahaya">Sebab: {v.reason}</span>}
                </div>
              </div>
              <div className="w-full flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-body num">
                {([[Eye, v.views, 'tontonan'], [Heart, v.likes, 'suka'], [MessageCircle, v.comments, 'komen'], [MousePointerClick, v.profileTaps, 'ke profil'], [Send, v.enquiries, 'pertanyaan']] as const).map(([I, x, l]) => (
                  <span key={l} className="w-fit flex flex-row items-center gap-1"><I className="w-3.5 h-3.5 shrink-0 text-muted" />{n(x)} {l}</span>
                ))}
              </div>
              <div className="w-full flex flex-row gap-2">
                <Button variant="secondary" block onClick={() => { setEdit(v); setTitle(v.title); setDesc(v.desc); }}><PencilLine className="w-4 h-4 shrink-0" />Ubah</Button>
                {v.status === 'live' && !v.pinned && <Button variant="secondary" block onClick={() => { set(p => ({ videos: p.videos.map(x => ({ ...x, pinned: x.id === v.id })) })); toast('Disemat ke profil'); }}><Pin className="w-4 h-4 shrink-0" />Semat</Button>}
                <button aria-label={`Padam ${v.title}`} onClick={() => setDel(v)} className="w-12 h-12 shrink-0 rounded-[10px] border border-bahaya/40 text-bahaya flex items-center justify-center"><Trash2 className="w-5 h-5 shrink-0" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Sheet open={!!edit} onClose={() => setEdit(null)} title="Ubah video" footer={<><Button variant="secondary" block onClick={() => setEdit(null)}>Batal</Button><Button block disabled={!title.trim()} onClick={save}>Simpan</Button></>}>
        <Field label={`Tajuk · ${title.length}/80`} err={!title.trim() ? 'Isi tajuk' : ''}><input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} className={inputCls(!title.trim())} /></Field>
        <Field label={`Penerangan · ${desc.length}/300`}><textarea value={desc} maxLength={300} rows={4} onChange={e => setDesc(e.target.value)} className={cx(inputCls(), 'resize-none')} /></Field>
      </Sheet>
      <Sheet open={!!del} onClose={() => setDel(null)} title="Padam video?" footer={<><Button variant="secondary" block onClick={() => setDel(null)}>Simpan video</Button><Button variant="danger" block onClick={() => { set(p => ({ videos: p.videos.filter(x => x.id !== del!.id) })); toast('Video dipadam'); setDel(null); }}>Padam</Button></>}>
        <p className="w-full text-sm text-body">"{del?.title}" akan dibuang dari Inspirasi dan profil anda. Statistik tidak boleh dipulihkan.</p>
      </Sheet>
    </div>
  );
}

/* ---------- V-8.0 upload ---------- */
type Phase = 'form' | 'upload' | 'processing' | 'done';

export function Upload() {
  const { s, set } = useStore();
  const v = vendorById(ME_VENDOR)!;
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [dur, setDur] = useState(0);
  const [err, setErr] = useState('');
  const [cover, setCover] = useState(0);
  const [title, setTitle] = useState('');
  const [loc, setLoc] = useState(v.area);
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<CategoryId>(v.cat);
  const [tags, setTags] = useState('');
  const [pkg, setPkg] = useState('');
  const [tried, setTried] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<VendorVideo['status']>('live');
  const vid = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => { window.clearInterval(timer.current); if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => { if (vid.current) vid.current.currentTime = cover; }, [cover]);

  if (s.listing.status !== 'verified') return <div className="w-full flex flex-col"><TopBar title="Muat naik video" fallback="/v/video" /><Locked /></div>;

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (url) URL.revokeObjectURL(url);
    setFile(null); setUrl(''); setDur(0);
    const e = videoError(f);
    if (e) return setErr(e);
    const u = URL.createObjectURL(f);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.onloadedmetadata = () => {
      const e2 = videoError(f, probe.duration);
      if (e2) { URL.revokeObjectURL(u); return setErr(e2); }
      setErr(''); setFile(f); setUrl(u); setDur(probe.duration); setCover(0);
    };
    probe.onerror = () => { URL.revokeObjectURL(u); setErr('Video tidak dapat dibaca. Cuba fail MP4 atau MOV lain.'); };
    probe.src = u;
  };

  const titleErr = tried && !title.trim() ? 'Isi tajuk video' : '';
  const submit = () => {
    setTried(true);
    if (!file || !title.trim()) return;
    setPhase('upload'); setPct(0);
    let p = 0;
    timer.current = window.setInterval(() => {
      p += 10; setPct(p);
      if (p < 100) return;
      window.clearInterval(timer.current);
      setPhase('processing');
      timer.current = window.setTimeout(() => {
        const status = flagged(`${title} ${desc} ${tags}`) ? 'review' : 'live';
        setResult(status);
        set(st => ({ videos: [{ id: Date.now() % 1e6, title: title.trim(), loc: loc.trim() || v.area, desc: desc.trim(), tags: tags.trim(), poster: 'img/gen/makeup.jpg', status, views: 0, likes: 0, comments: 0, profileTaps: 0, enquiries: 0, packageId: pkg || undefined }, ...st.videos] }));
        setPhase('done');
      }, 1200);
    }, 150);
  };

  if (phase !== 'form') return (
    <div className="w-full flex flex-col">
      <TopBar title="Muat naik video" fallback="/v/video" />
      <div className="w-full flex flex-col items-center gap-4 p-5 text-center">
        {phase === 'upload' && (
          <div role="status" className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
            <span className="w-full text-base font-semibold">Memuat naik… {pct}%</span>
            <div className="w-full h-2 rounded-full bg-pucuk-100 overflow-hidden"><div className="h-full bg-hijau" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        {phase === 'processing' && (
          <div role="status" className="w-full flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-line">
            <Loader2 className="w-7 h-7 shrink-0 animate-spin text-hijau" />
            <span className="w-full text-base font-semibold">Memproses & semakan automatik…</span>
          </div>
        )}
        {phase === 'done' && (
          <EmptyState icon={result === 'live' ? <CircleCheckBig className="w-6 h-6" /> : <Hourglass className="w-6 h-6" />}
            title={result === 'live' ? 'Video anda kini Live' : 'Video dalam semakan'}
            body={result === 'live' ? 'Video muncul di Inspirasi dan profil anda.' : 'Semakan automatik menjumpai perkataan yang perlu disemak. Admin akan semak dalam 1 hari bekerja.'}
            action={<Button onClick={() => swap('/v/video')}>Lihat video saya</Button>} />
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Muat naik video" fallback="/v/video" />
      <div className="w-full flex flex-col gap-4 p-5">
        <label className={cx('w-full flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer focus-within:border-hijau', err ? 'border-bahaya bg-bahaya-50' : 'border-line2 bg-white')}>
          <UploadIcon className="w-6 h-6 shrink-0 text-hijau" />
          <span className="w-full text-[15px] font-semibold">{file ? file.name : 'Pilih video'}</span>
          <span className="w-full text-xs text-muted">MP4 atau MOV · maks 60 saat · 100 MB · menegak 9:16 digalakkan</span>
          <input type="file" accept="video/mp4,video/quicktime" aria-label="Pilih fail video" className="sr-only" onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
        {err && <span role="alert" className="w-full text-sm font-semibold text-bahaya">{err}</span>}
        {tried && !file && !err && <span role="alert" className="w-full text-sm text-bahaya">Pilih video dahulu</span>}

        {url && (
          <div className="w-full flex flex-row items-start gap-4">
            <video ref={vid} src={url} muted playsInline preload="auto" aria-label="Pratonton kulit muka" className="w-[120px] aspect-[9/16] shrink-0 rounded-xl object-cover bg-ink" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <span className="w-full text-[13px] font-semibold">Kulit muka</span>
              <span className="w-full text-xs text-muted">Seret untuk pilih babak. Pratonton dipotong 9:16.</span>
              <input type="range" min={0} max={Math.max(0, dur - 0.1)} step={0.1} value={cover} onChange={e => setCover(Number(e.target.value))} aria-label="Pilih babak kulit muka" className="w-full accent-hijau" />
              <span className="w-full text-xs text-muted num">{cover.toFixed(1)}s / {dur.toFixed(1)}s</span>
            </div>
          </div>
        )}

        <Field label={`Tajuk · ${title.length}/80`} err={titleErr}><input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} className={inputCls(titleErr)} /></Field>
        <Field label="Lokasi"><input value={loc} onChange={e => setLoc(e.target.value)} className={inputCls()} /></Field>
        <Field label={`Penerangan · ${desc.length}/300`}><textarea value={desc} maxLength={300} rows={3} onChange={e => setDesc(e.target.value)} className={cx(inputCls(), 'resize-none')} /></Field>
        <Field label="Kategori"><select value={cat} onChange={e => setCat(e.target.value as CategoryId)} className={inputCls()}>{CATS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Hashtag" hint="Contoh: #solekanakad #pengantin"><input value={tags} onChange={e => setTags(e.target.value)} className={inputCls()} /></Field>
        <Field label="Pautan ke pakej (pilihan)"><select value={pkg} onChange={e => setPkg(e.target.value)} className={inputCls()}><option value="">Tiada</option>{s.listing.packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Button onClick={submit}>Terbitkan</Button>
      </div>
    </div>
  );
}
