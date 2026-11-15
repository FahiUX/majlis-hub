import { Fragment, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, Camera, CheckCheck, Copy, CornerUpLeft, FileText, Images, Lock, MessageCircle, Paperclip, Phone, SearchX, Send, Trash2, X } from 'lucide-react';
import { useStore } from '../../store';
import { nav, useRoute } from '../../router';
import { phoneFor, vendorById } from '../../data/mock';
import { effective } from '../booking/BookingList';
import type { ChatMsg } from '../../data/types';
import { Button, Chip, EmptyState, Sheet, TopBar, cx, fmtDate } from '../../components/ui';
import { Album, Bubble, DOC_ACCEPT, MAX_DOC_MB, MAX_FILES, MAX_VIDEO_MB, Quote, dayLabel, prepare, preview, rows, stamp, type Pending } from './media';
import { Composer, type Item } from './Composer';
import { Gallery } from './Gallery';

const OPEN = ['accepted', 'deposit_due', 'confirmed', 'completed'];
/** sample photos, for demoing on a desktop with no camera roll */
const PHOTOS = ['img/gen/pelamin.jpg', 'img/gen/venue.jpg', 'img/gen/couple.jpg', 'img/gen/planning.jpg'];
const HOLD_MS = 450;

/** ?net=off simulates a failed send for QA */
export default function ChatScreen({ id }: { id?: number | string }) {
  const { s, set, toast } = useStore();
  const r = useRoute();
  // "Minta sebut harga" arrives with ?draft= prefilled (C-2.1)
  const [text, setText] = useState(r.q.get('draft') ?? '');
  const [pick, setPick] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [view, setView] = useState<number | null>(null);
  const [sel, setSel] = useState<number[]>([]);
  const [ask, setAsk] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMsg | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const seq = useRef(0);
  const hold = useRef<{ t?: number; fired?: boolean }>({});
  const gallery = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const docs = useRef<HTMLInputElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const v = vendorById(Number(id));
  const msgs = (v && s.chats[v.id]) || [];
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);
  useEffect(() => {
    if (!sel.length) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setSel([]);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [sel.length]);
  if (!v) return <EmptyState icon={<SearchX className="w-6 h-6" />} title="Perbualan tidak dijumpai" action={<Button onClick={() => nav('/mesej')}>Semua mesej</Button>} />;

  const quick = [`Tarikh ${fmtDate(s.event?.date ?? '2027-02-14')} masih kosong?`, 'Boleh hantar senarai pakej?', 'Ada diskaun untuk akad + sanding?'];
  const phoneOpen = s.bookings.some(b => b.vendorId === v.id && OPEN.includes(effective(b)));
  const off = r.q.get('net') === 'off';
  const write = (list: ChatMsg[]) => set(p => ({ chats: { ...p.chats, [v.id]: list } }));
  const quoteOf = (m: ChatMsg): ChatMsg['reply'] => ({ id: m.id, me: m.me, text: preview(m) });

  /* ---------- sending ---------- */
  const send = (t: string) => {
    if (!t.trim()) return;
    write([...msgs, { ...stamp(), me: true, text: t.trim(), reply: replyTo ? quoteOf(replyTo) : undefined, failed: off }]);
    setText(''); setReplyTo(null);
  };
  const add = (list: Pending[]) => setItems(p => [...p, ...list.map(x => ({ ...x, id: ++seq.current }))]);
  const pickFiles = async (files: FileList | null, asDoc = false) => {
    setPick(false);
    if (!files?.length) return;
    const list = [...files].slice(0, MAX_FILES - items.length);
    if (files.length > list.length) toast(`Maksimum ${MAX_FILES} fail setiap kali`);
    const out = await Promise.all(list.map(f => prepare(f, asDoc)));
    const bad = out.filter((x): x is string => typeof x === 'string');
    if (bad.length) toast(bad[0]);
    add(out.filter((x): x is Pending => typeof x !== 'string'));
  };
  const sendItems = () => {
    const album = stamp().id;
    const reply = replyTo ? quoteOf(replyTo) : undefined;
    write([...msgs, ...items.map((p, i) => ({
      ...stamp(), me: true, failed: off, album: p.kind === 'file' ? undefined : album, text: p.caption?.trim() || undefined, reply: i === 0 ? reply : undefined,
      ...(p.kind === 'file' ? { file: { name: p.name, size: p.size, url: p.url } } : { [p.kind]: p.url }),
    }))]);
    setItems([]); setReplyTo(null);
  };
  const discard = () => { items.forEach(p => p.kind !== 'photo' && URL.revokeObjectURL(p.url)); setItems([]); };
  const retry = (i: number) => write(msgs.map((m, j) => (j === i ? { ...m, failed: false } : m)));

  /* ---------- select: long-press or right-click a message, then tap others ---------- */
  const picked = sel.map(i => msgs[i]).filter(Boolean);
  const toggle = (idx: number[]) => setSel(cur => (idx.every(i => cur.includes(i)) ? cur.filter(i => !idx.includes(i)) : [...cur, ...idx.filter(i => !cur.includes(i))]));
  const press = (idx: number[]) => ({
    onPointerDown: () => { hold.current.fired = false; hold.current.t = window.setTimeout(() => { hold.current.fired = true; toggle(idx); navigator.vibrate?.(20); }, HOLD_MS); },
    onPointerUp: () => window.clearTimeout(hold.current.t),
    onPointerLeave: () => window.clearTimeout(hold.current.t),
    onPointerCancel: () => window.clearTimeout(hold.current.t),
    onPointerMove: (e: React.PointerEvent) => { if (Math.abs(e.movementY) > 4) window.clearTimeout(hold.current.t); },
    // Android fires contextmenu at the end of a long-press too: the timer already selected, so don't toggle back
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); if (!hold.current.fired) toggle(idx); },
    // after a long-press, or while selecting, a tap selects instead of opening the photo / link
    onClickCapture: (e: React.MouseEvent) => {
      if (hold.current.fired) { hold.current.fired = false; e.preventDefault(); e.stopPropagation(); return; }
      if (sel.length) { e.preventDefault(); e.stopPropagation(); toggle(idx); }
    },
  });
  const copy = async () => {
    const t = picked.filter(m => m.text && !m.deleted).map(m => m.text).join('\n');
    try { await navigator.clipboard.writeText(t); toast(picked.length > 1 ? `${picked.length} mesej disalin` : 'Mesej disalin'); } catch { toast('Tidak dapat menyalin'); }
    setSel([]);
  };
  const del = (everyone: boolean) => {
    write(everyone
      ? msgs.map((m, i) => (sel.includes(i) ? { id: m.id, me: m.me, time: m.time, at: m.at, deleted: true } : m))
      : msgs.filter((_, i) => !sel.includes(i)));
    toast(sel.length > 1 ? `${sel.length} mesej dipadam` : 'Mesej dipadam');
    setSel([]); setAsk(false);
  };
  const reply = (m: ChatMsg) => { setReplyTo(m); setSel([]); setView(null); input.current?.focus(); };
  const jump = (rid?: string) => {
    const el = rid && document.getElementById(`msg-${rid}`);
    if (!el) return toast('Mesej asal tidak dijumpai');
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFlash(rid!); window.setTimeout(() => setFlash(null), 1200);
  };

  const media = msgs.map((m, i) => ({ m, i })).filter(x => (x.m.photo || x.m.video) && !x.m.deleted);
  const open = (i: number) => setView(media.findIndex(x => x.i === i));
  const canCopy = picked.some(m => m.text && !m.deleted);
  const mineOnly = picked.length > 0 && picked.every(m => m.me && !m.deleted);

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* full-screen overlays keep focus: everything behind them is inert */}
      <div inert={items.length > 0 || view !== null} className="w-full flex-1 flex flex-col">
      {sel.length ? (
        <header className="sticky top-0 z-20 w-full flex flex-row items-center gap-1 px-2 py-2 bg-hijau text-white">
          <button aria-label="Batal pilih" onClick={() => setSel([])} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><ArrowLeft className="w-6 h-6 shrink-0" /></button>
          <h1 className="flex-1 min-w-0 text-[17px] leading-6 font-semibold">{sel.length} dipilih</h1>
          {picked.length === 1 && !picked[0].deleted && <button aria-label="Balas" onClick={() => reply(picked[0])} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><CornerUpLeft className="w-5 h-5 shrink-0" /></button>}
          {canCopy && <button aria-label="Salin" onClick={copy} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><Copy className="w-5 h-5 shrink-0" /></button>}
          <button aria-label="Padam" onClick={() => setAsk(true)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-white/10"><Trash2 className="w-5 h-5 shrink-0" /></button>
        </header>
      ) : (
        <TopBar title={v.name} fallback="/mesej" right={phoneOpen
          ? <a href={`tel:${phoneFor(v.id).replace(/[^0-9]/g, '')}`} aria-label={`Telefon ${v.name}`} className="w-11 h-11 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Phone className="w-5 h-5 shrink-0" /></a>
          : undefined} />
      )}
      <div className="w-full flex flex-row items-center gap-2 px-5 py-2.5 bg-pucuk-50 text-xs text-hijau">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 min-w-0">{phoneOpen ? `Tempahan diterima. Telefon: ${phoneFor(v.id)}` : 'Nombor telefon dikongsi selepas vendor terima tempahan.'}</span>
      </div>
      {/* rows carry their own side padding so the selection tint runs edge to edge */}
      <div className="w-full flex-1 flex flex-col gap-1 py-5 select-none">
        {msgs.length === 0 && <EmptyState icon={<MessageCircle className="w-6 h-6" />} title={`Mulakan perbualan dengan ${v.name}`} body="Ucap salam dan tanya tentang tarikh atau pakej." />}
        {rows(msgs).map((row, k, all) => {
          const list = 'album' in row ? row.album : [row];
          const head = list[0], last = list[list.length - 1];
          const idx = list.map(x => x.i);
          const prevAt = k > 0 ? (() => { const p = all[k - 1]; const pl = 'album' in p ? p.album : [p]; return pl[pl.length - 1].m.at; })() : undefined;
          const day = head.m.at && head.m.at.slice(0, 10) !== prevAt?.slice(0, 10) ? dayLabel(head.m.at) : null;
          const on = idx.every(i => sel.includes(i));
          const mine = head.m.me;
          return (
            <Fragment key={head.m.id ?? head.i}>
              {day && <span className="w-fit self-center px-3 py-1 rounded-full bg-white border border-line text-xs font-medium text-muted">{day}</span>}
              <div id={head.m.id ? `msg-${head.m.id}` : undefined} {...press(idx)} aria-selected={sel.length ? on : undefined}
                className={cx('w-full flex flex-col gap-1 px-5 py-1 transition-colors', mine ? 'items-end' : 'items-start', on && 'bg-hijau/20', flash && flash === head.m.id && 'bg-emas/25')}>
                {/* 320px column caps long text at ~80% of the row, like WhatsApp */}
                <div className={cx('w-[320px] flex flex-col', mine ? 'items-end' : 'items-start')}>
                  {'album' in row
                    ? <Album items={row.album} mine={mine} onOpen={open} />
                    : <Bubble m={head.m} mine={mine} faded={head.m.failed} who={v.name} onPhoto={() => open(head.i)} onQuote={() => jump(head.m.reply?.id)} />}
                </div>
                {last.m.failed
                  ? <button onClick={() => retry(last.i)} className="w-fit h-11 flex flex-row items-center gap-1 text-xs font-semibold text-bahaya"><AlertCircle className="w-3.5 h-3.5 shrink-0" />Gagal dihantar. Ketik untuk cuba lagi</button>
                  : <span className="w-fit flex flex-row items-center gap-1 text-xs text-muted">{last.m.time}{mine && !last.m.deleted && <CheckCheck className="w-3.5 h-3.5 shrink-0 text-hijau" />}</span>}
              </div>
            </Fragment>
          );
        })}
        {/* scroll margin = the sticky composer's height, so the newest bubble isn't hidden under it */}
        <div ref={end} className="scroll-mb-44" />
      </div>
      <div className="sticky bottom-0 w-full flex flex-col gap-3 p-4 bg-white shadow-float">
        {replyTo
          ? <div className="w-full flex flex-row items-center gap-2">
              <span className="flex-1 min-w-0"><Quote q={quoteOf(replyTo)!} mine={false} who={v.name} onClick={() => jump(replyTo.id)} /></span>
              <button aria-label="Batal balas" onClick={() => setReplyTo(null)} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-kertas"><X className="w-5 h-5 shrink-0" /></button>
            </div>
          : <div className="w-full flex flex-row gap-2 overflow-x-auto">{quick.map(q => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}</div>}
        <form onSubmit={e => { e.preventDefault(); send(text); }} className="w-full flex flex-row items-center gap-2">
          <button type="button" aria-label="Lampirkan fail" onClick={() => setPick(true)} className="w-11 h-11 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Paperclip className="w-5 h-5 shrink-0" /></button>
          <input ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="Tulis mesej…" aria-label="Mesej"
            className="flex-1 min-w-0 px-3.5 py-3 bg-kertas border border-line2 rounded-full text-[15px]" />
          <button type="submit" aria-label="Hantar" disabled={!text.trim()} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center disabled:bg-pucuk-200"><Send className="w-5 h-5 shrink-0" /></button>
        </form>
      </div>
      </div>

      <input ref={gallery} type="file" accept="image/*,video/*" multiple hidden onChange={e => { pickFiles(e.target.files); e.target.value = ''; }} />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={e => { pickFiles(e.target.files); e.target.value = ''; }} />
      <input ref={docs} type="file" accept={DOC_ACCEPT} multiple hidden onChange={e => { pickFiles(e.target.files, true); e.target.value = ''; }} />
      <Sheet open={pick} onClose={() => setPick(false)} title="Lampirkan">
        <div className="w-full flex flex-row gap-2">
          {([[Images, 'Galeri', gallery], [Camera, 'Kamera', camera], [FileText, 'Dokumen', docs]] as const).map(([Icon, label, ref]) => (
            <button key={label} onClick={() => ref.current?.click()} className="flex-1 min-w-0 flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-kertas">
              <span className="w-14 h-14 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Icon className="w-6 h-6 shrink-0" /></span>
              <span className="w-full text-sm font-medium text-center">{label}</span>
            </button>
          ))}
        </div>
        <p className="w-full text-xs text-muted">Sehingga {MAX_FILES} fail. Video maksimum {MAX_VIDEO_MB} MB, dokumen {MAX_DOC_MB} MB (PDF, Word, Excel, PowerPoint).</p>
        <p className="w-full text-sm font-semibold">Atau pilih gambar contoh</p>
        <div className="w-full flex flex-row gap-2">
          {PHOTOS.map(ph => (
            <button key={ph} onClick={() => { add([{ kind: 'photo', url: ph, name: ph.split('/').pop()!, size: 0 }]); setPick(false); }} aria-label={`Pilih ${ph.split('/').pop()}`} className="flex-1 min-w-0 aspect-square rounded-xl overflow-hidden">
              <img src={ph} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={ask} onClose={() => setAsk(false)} title={sel.length > 1 ? `Padam ${sel.length} mesej?` : 'Padam mesej?'}>
        {mineOnly && <Button variant="danger" onClick={() => del(true)} className="w-full">Padam untuk semua</Button>}
        <Button variant="secondary" onClick={() => del(false)} className="w-full">Padam untuk saya</Button>
        <Button variant="ghost" onClick={() => setAsk(false)} className="w-full">Batal</Button>
      </Sheet>
      {items.length > 0 && <Composer items={items} to={v.name} onChange={setItems} onAdd={() => gallery.current?.click()} onSend={sendItems} onClose={discard} />}
      {view !== null && view >= 0 && <Gallery items={media.map(x => x.m)} start={view} who={v.name} onClose={() => setView(null)} onReply={reply} />}
    </div>
  );
}
