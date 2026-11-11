import { useState } from 'react';
import { Flag, Heart, Link, LogIn, MessageCircle, Send } from 'lucide-react';
import { Button, Sheet, cx } from '../../components/ui';
import { useStore } from '../../store';
import { nav } from '../../router';
import type { Reel } from '../../data/types';

export type ReelComment = Reel['comments'][number];

export function CommentsSheet({ reel, comments, onClose, onSend }: { reel: Reel | null; comments: ReelComment[]; onClose: () => void; onSend: (text: string) => void }) {
  const { s } = useStore();
  const [text, setText] = useState('');
  const send = () => { if (!text.trim()) return; onSend(text.trim()); setText(''); };
  return (
    <Sheet open={!!reel} onClose={onClose} title={`${comments.length} komen`}>
      {comments.length === 0 ? (
        <div className="w-full flex flex-col items-center gap-2 py-8 text-center">
          <span className="w-12 h-12 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><MessageCircle className="w-6 h-6 shrink-0" /></span>
          <p className="w-full text-base font-semibold">Jadi yang pertama komen</p>
          <p className="w-full text-sm text-muted">Tanya harga, tarikh atau kongsi pendapat anda.</p>
        </div>
      ) : comments.map((c, i) => (
        <div key={i} className={cx('w-full flex flex-row items-start gap-3', c.vendor && 'p-3 rounded-xl bg-pucuk-50')}>
          <span className="w-9 h-9 shrink-0 rounded-full bg-pucuk-100 text-hijau text-sm font-bold flex items-center justify-center">{c.name[0]}</span>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="w-full flex flex-row flex-wrap items-center gap-2 text-[13px]">
              <b className="w-fit font-semibold">{c.name}</b>
              {c.vendor && <span className="w-fit px-2 py-0.5 rounded-full bg-hijau text-white text-[11px] font-semibold">Vendor</span>}
              <span className="w-fit text-muted">{c.time}</span>
            </span>
            <p className="w-full text-sm text-body">{c.text}</p>
          </div>
          <span className="w-fit shrink-0 flex flex-col items-center gap-0.5 text-xs text-muted"><Heart className="w-4 h-4 shrink-0" />{c.likes}</span>
        </div>
      ))}
      {s.authed ? (
        <div className="w-full flex flex-row items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Tulis komen…" aria-label="Tulis komen"
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-full border border-line2 text-[15px] focus:outline-none focus:border-hijau" />
          <button aria-label="Hantar komen" disabled={!text.trim()} onClick={send} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center disabled:bg-pucuk-200"><Send className="w-5 h-5 shrink-0" /></button>
        </div>
      ) : (
        <div className="w-full flex flex-row"><Button block onClick={() => nav('/masuk?next=/inspirasi')}><LogIn className="w-5 h-5 shrink-0" />Log masuk untuk komen</Button></div>
      )}
    </Sheet>
  );
}

export function ShareSheet({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  const { toast } = useStore();
  const link = location.origin + location.pathname + '#/inspirasi';
  const copy = async () => { try { await navigator.clipboard.writeText(link); } catch { /* clipboard blocked: link still shown in toast */ } toast('Pautan disalin'); onClose(); };
  const native = async () => { if (navigator.share) { try { await navigator.share({ title: reel?.title, url: link }); } catch { /* user cancelled */ } } else copy(); onClose(); };
  const row = 'w-full flex flex-row items-center gap-3 px-4 py-3.5 leading-5 rounded-xl border border-line bg-white text-[15px] font-semibold';
  return (
    <Sheet open={!!reel} onClose={onClose} title="Kongsi video">
      <a className={row} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${reel?.title ?? ''} ${link}`)}`} onClick={onClose}>
        <MessageCircle className="w-5 h-5 shrink-0 text-hijau" /><span className="flex-1 min-w-0">WhatsApp</span>
      </a>
      <button className={row} onClick={copy}><Link className="w-5 h-5 shrink-0 text-hijau" /><span className="flex-1 min-w-0 text-left">Salin pautan</span></button>
      <a className={row} target="_blank" rel="noreferrer" href={`https://t.me/share/url?url=${encodeURIComponent(link)}`} onClick={onClose}>
        <Send className="w-5 h-5 shrink-0 text-hijau" /><span className="flex-1 min-w-0">Telegram</span>
      </a>
      <button className={row} onClick={native}><Send className="w-5 h-5 shrink-0 text-muted" /><span className="flex-1 min-w-0 text-left">Lagi…</span></button>
    </Sheet>
  );
}

const REASONS = ['Mengelirukan', 'Bukan hasil kerja vendor sebenar', 'Kandungan tidak sesuai', 'Lain-lain'];
export function ReportSheet({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  const { toast } = useStore();
  const [why, setWhy] = useState<string | null>(null);
  const close = () => { setWhy(null); onClose(); };
  return (
    <Sheet open={!!reel} onClose={close} title="Laporkan video"
      footer={<Button block disabled={!why} onClick={() => { toast('Laporan dihantar. Pasukan kami akan semak.'); close(); }}><Flag className="w-5 h-5 shrink-0" />Hantar laporan</Button>}>
      <p className="w-full text-sm text-body">Kenapa anda laporkan video ini?</p>
      <div role="radiogroup" aria-label="Sebab laporan" className="w-full flex flex-col gap-2">
        {REASONS.map(r => (
          <button key={r} role="radio" aria-checked={why === r} onClick={() => setWhy(r)}
            className={cx('w-full px-4 py-3.5 leading-5 rounded-xl border-2 text-left text-[15px] font-medium', why === r ? 'border-hijau bg-pucuk-50' : 'border-line bg-white')}>{r}</button>
        ))}
      </div>
    </Sheet>
  );
}
