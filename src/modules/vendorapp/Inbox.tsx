import { useState } from 'react';
import { MessageCircle, Plus, Send, Settings2, Trash2 } from 'lucide-react';
import { nav } from '../../router';
import { useStore, type AppState } from '../../store';
import { ME_VENDOR } from '../../data/wave2';
import type { ChatMsg } from '../../data/types';
import { effective } from '../booking/money';
import { Button, EmptyState, Sheet, StatusChip, TopBar, cx, fmtDate } from '../../components/ui';
import { inputCls, rowsOf, sendMsg, type VRow } from './kit';

/** threads as the vendor sees them: `own` = the vendor wrote it */
function threadsOf(s: AppState) {
  const rows = rowsOf(s);
  const out: { b: VRow; msgs: (ChatMsg & { own: boolean })[] }[] = [];
  const aina = rows.filter(b => b.mine).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (aina && s.chats[ME_VENDOR]?.length) out.push({ b: aina, msgs: s.chats[ME_VENDOR].map(m => ({ ...m, own: !m.me })) });
  for (const [id, msgs] of Object.entries(s.vendorChats)) {
    const b = rows.find(x => x.id === id);
    if (b && msgs.length) out.push({ b, msgs: msgs.map(m => ({ ...m, own: m.me })) });
  }
  return out;
}

/* ---------- V-7.0 inbox ---------- */
export function Inbox() {
  const { s } = useStore();
  const threads = threadsOf(s);
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Mesej" fallback="/v/lagi" />
      {threads.length === 0 ? (
        <EmptyState icon={<MessageCircle className="w-6 h-6" />} title="Belum ada mesej" body="Mesej daripada pelanggan tentang tempahan muncul di sini." />
      ) : (
        <div className="w-full flex flex-col gap-3 p-5">
          {threads.map(({ b, msgs }) => {
            const last = msgs[msgs.length - 1];
            return (
              <button key={b.id} onClick={() => nav(`/v/mesej/${b.id}`)} className="w-full flex flex-row items-center gap-3 p-4 rounded-2xl bg-white border border-line text-left">
                <span className="w-11 h-11 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center text-base font-bold">{b.customer[0]}</span>
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="w-full flex flex-row items-center gap-2"><span className="flex-1 min-w-0 text-[15px] font-semibold">{b.customer}</span><span className="w-fit text-xs text-muted">{last.time}</span></span>
                  <span className="w-full text-xs text-muted">{b.id} · {fmtDate(b.date)}</span>
                  <span className={cx('w-full text-sm', last.own ? 'text-muted' : 'text-ink font-medium')}>{last.own ? 'Anda: ' : ''}{last.text ?? 'Gambar'}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- thread with quick-reply templates ---------- */
export function Thread({ id }: { id: string }) {
  const { s, set, toast } = useStore();
  const t = threadsOf(s).find(x => x.b.id === id);
  const b = t?.b ?? rowsOf(s).find(x => x.id === id);
  const [text, setText] = useState('');
  const [edit, setEdit] = useState(false);
  const [tpl, setTpl] = useState(s.listing.templates);
  if (!b) return (
    <div className="w-full flex flex-col"><TopBar title="Mesej" fallback="/v/mesej" />
      <EmptyState icon={<MessageCircle className="w-6 h-6" />} title="Perbualan tidak dijumpai" action={<Button onClick={() => nav('/v/mesej')}>Semua mesej</Button>} />
    </div>
  );
  const send = (msg: string) => { if (!msg.trim()) return; set(sendMsg(b, msg.trim())); setText(''); };
  const saveTpl = () => { set(p => ({ listing: { ...p.listing, templates: tpl.map(x => x.trim()).filter(Boolean) } })); toast('Templat disimpan'); setEdit(false); };

  return (
    <div className="w-full flex-1 flex flex-col">
      <TopBar title={b.customer} fallback="/v/mesej" right={<button aria-label="Lihat tempahan" onClick={() => nav(`/v/tempahan/${b.id}`)} className="w-fit shrink-0 px-3 py-2.5 rounded-full text-sm font-semibold text-hijau hover:bg-pucuk-50">{b.id}</button>} />
      <div className="w-full flex-1 flex flex-col gap-3 p-5">
        <div className="w-full flex flex-row items-center gap-2 text-sm text-muted"><span className="flex-1 min-w-0">{fmtDate(b.date)} · {b.place}</span><StatusChip s={effective(b)} /></div>
        {(t?.msgs ?? []).map((m, i) => (
          <div key={i} className={cx('w-full flex flex-col gap-1', m.own ? 'items-end' : 'items-start')}>
            <p className={cx('w-fit px-4 py-2.5 rounded-2xl text-[15px] leading-[22px]', m.own ? 'bg-hijau text-white' : 'bg-white border border-line')}>{m.text}</p>
            <span className="w-fit text-xs text-muted">{m.time}</span>
          </div>
        ))}
      </div>
      <div className="sticky bottom-0 w-full flex flex-col gap-3 p-4 bg-white border-t border-line">
        <div className="w-full flex flex-row items-center gap-2 overflow-x-auto">
          <button aria-label="Urus templat" onClick={() => { setTpl(s.listing.templates); setEdit(true); }} className="w-11 h-11 shrink-0 rounded-full border border-line2 flex items-center justify-center"><Settings2 className="w-5 h-5 shrink-0" /></button>
          {s.listing.templates.map(x => (
            <button key={x} onClick={() => setText(x)} className="w-fit shrink-0 px-3.5 py-2.5 rounded-full border border-line bg-kertas text-sm whitespace-nowrap">{x.length > 34 ? x.slice(0, 34) + '…' : x}</button>
          ))}
        </div>
        <form onSubmit={e => { e.preventDefault(); send(text); }} className="w-full flex flex-row items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} aria-label="Tulis mesej" placeholder="Tulis mesej" className={cx(inputCls(), 'flex-1 min-w-0 w-auto rounded-full')} />
          <button type="submit" aria-label="Hantar" disabled={!text.trim()} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center disabled:bg-pucuk-200"><Send className="w-5 h-5 shrink-0" /></button>
        </form>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Templat balasan pantas" footer={<><Button variant="secondary" block onClick={() => setEdit(false)}>Batal</Button><Button block onClick={saveTpl}>Simpan</Button></>}>
        {tpl.map((x, i) => (
          <div key={i} className="w-full flex flex-row items-start gap-2">
            <textarea value={x} rows={2} aria-label={`Templat ${i + 1}`} onChange={e => setTpl(tpl.map((y, j) => (j === i ? e.target.value : y)))} className={cx(inputCls(), 'flex-1 min-w-0 resize-none')} />
            <button aria-label={`Padam templat ${i + 1}`} onClick={() => setTpl(tpl.filter((_, j) => j !== i))} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-bahaya hover:bg-bahaya-50"><Trash2 className="w-5 h-5 shrink-0" /></button>
          </div>
        ))}
        {tpl.length < 6 && <Button variant="secondary" onClick={() => setTpl([...tpl, ''])}><Plus className="w-4 h-4 shrink-0" />Tambah templat</Button>}
      </Sheet>
    </div>
  );
}
