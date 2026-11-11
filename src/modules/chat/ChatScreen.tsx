import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCheck, Lock, MessageCircle, Phone, SearchX, Send } from 'lucide-react';
import { useStore } from '../../store';
import { nav, useRoute } from '../../router';
import { phoneFor, vendorById } from '../../data/mock';
import { effective } from '../booking/BookingList';
import type { ChatMsg } from '../../data/types';
import { Button, Chip, EmptyState, TopBar, cx, fmtDate } from '../../components/ui';

const OPEN = ['accepted', 'deposit_due', 'confirmed', 'completed'];
const now = () => new Date().toTimeString().slice(0, 5);

/** ?net=off simulates a failed send for QA */
export default function ChatScreen({ id }: { id?: number | string }) {
  const { s, set } = useStore();
  const r = useRoute();
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  const v = vendorById(Number(id));
  const msgs = (v && s.chats[v.id]) || [];
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);
  if (!v) return <EmptyState icon={<SearchX className="w-6 h-6" />} title="Perbualan tidak dijumpai" action={<Button onClick={() => nav('/mesej')}>Semua mesej</Button>} />;

  const quick = [`Tarikh ${fmtDate(s.event?.date ?? '2027-02-14')} masih kosong?`, 'Boleh hantar senarai pakej?', 'Ada diskaun untuk akad + sanding?'];
  const phoneOpen = s.bookings.some(b => b.vendorId === v.id && OPEN.includes(effective(b)));
  const write = (list: ChatMsg[]) => set(p => ({ chats: { ...p.chats, [v.id]: list } }));
  const send = (t: string) => {
    if (!t.trim()) return;
    write([...msgs, { me: true, text: t.trim(), time: now(), failed: r.q.get('net') === 'off' }]);
    setText('');
  };
  const retry = (i: number) => write(msgs.map((m, j) => (j === i ? { ...m, failed: false } : m)));

  return (
    <div className="w-full flex-1 flex flex-col">
      <TopBar title={v.name} fallback="/mesej" right={phoneOpen
        ? <a href={`tel:${phoneFor(v.id).replace(/[^0-9]/g, '')}`} aria-label={`Telefon ${v.name}`} className="w-11 h-11 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Phone className="w-5 h-5 shrink-0" /></a>
        : undefined} />
      <div className="w-full flex flex-row items-center gap-2 px-5 py-2.5 bg-pucuk-50 text-xs text-hijau">
        <Lock className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 min-w-0">{phoneOpen ? `Tempahan diterima. Telefon: ${phoneFor(v.id)}` : 'Nombor telefon dikongsi selepas vendor terima tempahan.'}</span>
      </div>
      <div className="w-full flex-1 flex flex-col gap-3 p-5">
        {msgs.length === 0 && <EmptyState icon={<MessageCircle className="w-6 h-6" />} title={`Mulakan perbualan dengan ${v.name}`} body="Ucap salam dan tanya tentang tarikh atau pakej." />}
        {msgs.map((m, i) => (
          <div key={i} className={cx('w-full flex flex-col gap-1', m.me ? 'items-end' : 'items-start')}>
            {m.photo
              ? <img src={m.photo} alt="Gambar daripada vendor" className="w-[220px] aspect-[4/3] rounded-2xl object-cover" />
              : <p className={cx('w-fit px-4 py-2.5 rounded-2xl text-[15px] leading-[22px]', m.me ? (m.failed ? 'bg-hijau/60 text-white' : 'bg-hijau text-white') : 'bg-white border border-line')}>{m.text}</p>}
            {m.failed
              ? <button onClick={() => retry(i)} className="w-fit flex flex-row items-center gap-1 text-xs font-semibold text-bahaya"><AlertCircle className="w-3.5 h-3.5 shrink-0" />Gagal dihantar. Ketik untuk cuba lagi</button>
              : <span className="w-fit flex flex-row items-center gap-1 text-xs text-muted">{m.time}{m.me && <CheckCheck className="w-3.5 h-3.5 shrink-0 text-hijau" />}</span>}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 w-full flex flex-col gap-3 p-4 bg-white shadow-float">
        <div className="w-full flex flex-row gap-2 overflow-x-auto">{quick.map(q => <Chip key={q} onClick={() => send(q)}>{q}</Chip>)}</div>
        <form onSubmit={e => { e.preventDefault(); send(text); }} className="w-full flex flex-row items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Tulis mesej…" aria-label="Mesej"
            className="flex-1 min-w-0 px-3.5 py-3 bg-kertas border border-line2 rounded-full text-[15px]" />
          <button type="submit" aria-label="Hantar" disabled={!text.trim()} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center disabled:bg-pucuk-200"><Send className="w-5 h-5 shrink-0" /></button>
        </form>
      </div>
    </div>
  );
}
