import { Ban, FileText, Play, VideoOff } from 'lucide-react';
import type { ChatMsg } from '../../data/types';
import { cx } from '../../components/ui';

export const MAX_VIDEO_MB = 50;
export const MAX_DOC_MB = 20;
export const MAX_FILES = 10;
export const DOC_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip';

/** a picked file ready to send. Photos become small data URLs (they survive reload in localStorage).
 * ponytail: videos and documents are blob URLs, session only. Real upload needs a backend + storage bucket. */
export interface Pending { kind: 'photo' | 'video' | 'file'; url: string; name: string; size: number; caption?: string }

/** blob URLs created this session; any other blob: URL in saved chats died with the old tab */
const live = new Set<string>();
export const alive = (url: string) => !url.startsWith('blob:') || live.has(url);
const blob = (f: File) => { const u = URL.createObjectURL(f); live.add(u); return u; };

export async function prepare(f: File, asDoc = false): Promise<Pending | string> {
  if (asDoc || !/^(image|video)\//.test(f.type)) {
    if (f.size > MAX_DOC_MB * 1024 * 1024) return `${f.name}: fail melebihi ${MAX_DOC_MB} MB`;
    return { kind: 'file', url: blob(f), name: f.name, size: f.size };
  }
  if (f.type.startsWith('video/')) {
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) return `${f.name}: video melebihi ${MAX_VIDEO_MB} MB`;
    return { kind: 'video', url: blob(f), name: f.name, size: f.size };
  }
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 1080 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return { kind: 'photo', url: c.toDataURL('image/jpeg', 0.75), name: f.name, size: f.size };
  } catch { return `${f.name}: gambar tidak dapat dibuka`; }
}

/* ---------- time ---------- */
const pad = (n: number) => String(n).padStart(2, '0');
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
/** id + time + at for a new message */
export const stamp = () => { const d = new Date(); return { id: Math.random().toString(36).slice(2, 10), time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, at: localIso(d) }; };

const HARI = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const BULAN = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
/** WhatsApp-style day separator: Hari ini / Semalam / Isnin, 9 Nov 2026 */
export function dayLabel(at: string, today = new Date()) {
  const d = new Date(at.slice(0, 10) + 'T00:00:00');
  const diff = Math.round((new Date(localIso(today).slice(0, 10) + 'T00:00:00').getTime() - d.getTime()) / 864e5);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Semalam';
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}
/** "Isnin, 9 Nov 2026 · 15:21" for the full-screen viewer */
export const whenLabel = (m: ChatMsg) => (m.at ? `${dayLabel(m.at)} · ${m.time}` : m.time);

export const fmtSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
/** keep the extension visible: 'Sebut-harga-pelamin-akad-dan-sand…ing.pdf' */
const short = (n: string) => (n.length > 30 ? `${n.slice(0, 20)}…${n.slice(-9)}` : n);
const ext = (name: string) => (name.split('.').pop() ?? '').toUpperCase().slice(0, 4);

/** one-line summary: inbox previews, reply quotes, copy */
export const preview = (m: ChatMsg) => {
  if (m.deleted) return 'Mesej ini telah dipadam';
  const kind = m.video ? 'Video' : m.photo ? 'Gambar' : m.file ? `Dokumen: ${m.file.name}` : '';
  return kind ? (m.text ? `${kind} · ${m.text}` : m.file ? kind : `Menghantar ${kind.toLowerCase()}`) : m.text ?? '';
};

/** split a thread into display rows: consecutive caption-less photos/videos with the same album become one grid (WhatsApp sends captioned ones separately) */
export type Row = { i: number; m: ChatMsg } | { album: { i: number; m: ChatMsg }[] };
export function rows(msgs: ChatMsg[]): Row[] {
  const out: Row[] = [];
  msgs.forEach((m, i) => {
    const prev = out[out.length - 1];
    const groupable = m.album && !m.text && !m.deleted && (m.photo || m.video);
    if (groupable && prev && 'album' in prev && prev.album[0].m.album === m.album) prev.album.push({ i, m });
    else if (groupable && msgs[i + 1]?.album === m.album && !msgs[i + 1].text) out.push({ album: [{ i, m }] });
    else out.push({ i, m });
  });
  return out;
}

/* ---------- bubbles ---------- */
const tone = (mine: boolean, faded?: boolean) => (mine ? (faded ? 'bg-hijau/60 text-white' : 'bg-hijau text-white') : 'bg-white border border-line text-ink');

function Thumb({ m, onOpen, className, more }: { m: ChatMsg; onOpen?: () => void; className?: string; more?: number }) {
  const ok = alive(m.video ?? m.photo ?? '');
  return (
    <button type="button" onClick={onOpen} aria-label={m.video ? 'Buka video' : 'Lihat gambar penuh'} className={cx('relative overflow-hidden bg-black', className)}>
      {m.video
        ? (ok ? <video src={m.video} muted playsInline preload="metadata" className="w-full h-full object-cover" /> : <span className="w-full h-full bg-pucuk-50 text-muted flex flex-col items-center justify-center gap-1 text-xs"><VideoOff className="w-5 h-5 shrink-0" />Video tidak lagi tersedia</span>)
        : <img src={m.photo} alt="" className="w-full h-full object-cover" />}
      {m.video && ok && <span className="absolute inset-0 flex items-center justify-center"><span className="w-12 h-12 rounded-full bg-black/55 text-white flex items-center justify-center"><Play className="w-6 h-6 shrink-0" fill="currentColor" /></span></span>}
      {!!more && <span className="absolute inset-0 bg-black/50 text-white text-2xl font-semibold flex items-center justify-center">+{more}</span>}
    </button>
  );
}

function FileCard({ f, mine }: { f: NonNullable<ChatMsg['file']>; mine: boolean }) {
  const ok = alive(f.url);
  const body = (
    <>
      <span className={cx('w-11 h-11 shrink-0 rounded-xl flex items-center justify-center', mine ? 'bg-white/15' : 'bg-pucuk-100 text-hijau')}><FileText className="w-5 h-5 shrink-0" /></span>
      <span className="flex-1 min-w-0 flex flex-col">
        <span title={f.name} className="w-full text-[15px] font-semibold break-words">{short(f.name)}</span>
        <span className={cx('w-full text-xs', mine ? 'text-white/80' : 'text-muted')}>{ok ? `${ext(f.name)} · ${fmtSize(f.size)}` : 'Fail tidak lagi tersedia'}</span>
      </span>
    </>
  );
  const cls = cx('w-full flex flex-row items-center gap-3 p-2 rounded-xl text-left', mine ? 'bg-black/10' : 'bg-kertas');
  return ok ? <a href={f.url} download={f.name} target="_blank" rel="noreferrer" aria-label={`Buka ${f.name}`} className={cls}>{body}</a> : <div className={cls}>{body}</div>;
}

export function Quote({ q, mine, who, onClick }: { q: NonNullable<ChatMsg['reply']>; mine: boolean; who: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cx('w-full flex flex-col gap-0.5 px-3 py-2 rounded-lg border-l-4 text-left', mine ? 'bg-black/15 border-white/70' : 'bg-pucuk-50 border-hijau')}>
      <span className={cx('w-full text-xs font-semibold', mine ? 'text-white' : 'text-hijau')}>{q.me ? 'Anda' : who}</span>
      <span className={cx('w-full text-sm line-clamp-2', mine ? 'text-white/85' : 'text-body')}>{q.text}</span>
    </button>
  );
}

/** one message. `who` = the other party's name, for reply quotes. Shared by the customer chat and the vendor inbox */
export function Bubble({ m, mine, faded, who = '', onPhoto, onQuote }: { m: ChatMsg; mine: boolean; faded?: boolean; who?: string; onPhoto?: () => void; onQuote?: () => void }) {
  if (m.deleted) return <p className={cx('w-fit flex flex-row items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[15px] italic', mine ? 'bg-hijau/70 text-white' : 'bg-white border border-line text-muted')}><Ban className="w-4 h-4 shrink-0" />{mine ? 'Anda telah memadam mesej ini' : 'Mesej ini telah dipadam'}</p>;
  const media = m.photo || m.video;
  return (
    <div className={cx('flex flex-col gap-1 rounded-2xl', media || m.file ? 'w-[240px] p-1' : 'w-fit px-4 py-2.5', tone(mine, faded))}>
      {m.reply && <Quote q={m.reply} mine={mine} who={who} onClick={onQuote} />}
      {media && <Thumb m={m} onOpen={onPhoto} className="w-full aspect-[4/3] rounded-xl" />}
      {m.file && <FileCard f={m.file} mine={mine} />}
      {m.text && <p className={cx('w-full text-[15px] leading-[22px] whitespace-pre-wrap break-words', (media || m.file) && 'px-3 py-1.5')}>{m.text}</p>}
    </div>
  );
}

/** 2 = side by side, 3 = one wide + two, 4+ = 2×2 with "+N" on the last tile */
export function Album({ items, mine, onOpen }: { items: { i: number; m: ChatMsg }[]; mine: boolean; onOpen: (i: number) => void }) {
  const shown = items.slice(0, 4);
  const grid = shown.length === 3 ? [[shown[0]], shown.slice(1)] : shown.length === 2 ? [shown] : [shown.slice(0, 2), shown.slice(2)];
  return (
    <div className={cx('w-[240px] flex flex-col gap-1 p-1 rounded-2xl', tone(mine))}>
      {grid.map((row, r) => (
        <div key={r} className="w-full flex flex-row gap-1">
          {row.map((x, c) => <Thumb key={x.i} m={x.m} onOpen={() => onOpen(x.i)} more={r === 1 && c === 1 ? Math.max(0, items.length - 4) : 0}
            className={cx('flex-1 min-w-0 rounded-xl', shown.length === 2 ? 'aspect-[3/4]' : row.length === 1 ? 'aspect-[2/1]' : 'aspect-square')} />)}
        </div>
      ))}
    </div>
  );
}
