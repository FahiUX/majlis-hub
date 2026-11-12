import { useState } from 'react';
import { AlertCircle, Ellipsis, Flag, Heart, Link, LogIn, MessageCircle, Send } from 'lucide-react';
import { Button, Sheet, cx, rm } from '../../components/ui';
import { fromPrice, vendorById } from '../../data/mock';
import { useStore } from '../../store';
import { nav } from '../../router';
import type { Reel } from '../../data/types';

export type ReelComment = Reel['comments'][number] & { failed?: boolean };

/** a vendor's own comment quotes the live "from" price, so it never disagrees with the CTA */
const vendorPrice = (text: string, reel: Reel | null) => {
  const v = reel && vendorById(reel.vendorId);
  return v ? text.replace(/RM\s?[\d,]+/, rm(fromPrice(v))) : text;
};

/** ponytail: tiny BM/EN word list; a real moderation service replaces this with the backend */
const BAD = ['bodoh', 'babi', 'sial', 'celaka', 'bangang', 'pukimak', 'fuck', 'shit', 'bitch', 'bastard'];
export const hasBadWord = (t: string) => BAD.some(w => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`, 'i').test(t));

const LKEY = 'majlishub.commentLikes';
const CREASONS = ['Kesat atau menghina', 'Spam atau iklan', 'Maklumat palsu', 'Lain-lain'];

export function CommentsSheet({ reel, comments, loading, onClose, onSend, onRetry }: {
  reel: Reel | null; comments: ReelComment[]; loading?: boolean; onClose: () => void; onSend: (text: string) => void; onRetry: (c: ReelComment) => void;
}) {
  const { s, toast } = useStore();
  const [text, setText] = useState('');
  const [blocked, setBlocked] = useState(false);
  // comment likes survive reload; keyed by reel + author + text, not list position (PM #33)
  const [liked, setLikedRaw] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(LKEY) ?? '[]') as string[]; } catch { return []; } });
  const setLiked = (f: (l: string[]) => string[]) => setLikedRaw(l => { const n = f(l); try { localStorage.setItem(LKEY, JSON.stringify(n)); } catch { /* private mode */ } return n; });
  const [report, setReport] = useState<number | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const send = () => {
    if (!text.trim()) return;
    if (hasBadWord(text)) { setBlocked(true); return; }
    onSend(text.trim()); setText('');
  };
  const closeReport = () => { setReport(null); setWhy(null); };
  return (
    <>
      <Sheet open={!!reel} onClose={onClose} title={loading ? 'Komen' : `${comments.length} komen`}>
        {loading ? (
          <div className="w-full flex flex-col gap-4" aria-busy="true" aria-label="Memuatkan komen">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-full flex flex-row items-start gap-3">
                <span className="w-9 h-9 shrink-0 rounded-full skeleton" />
                <span className="flex-1 min-w-0 flex flex-col gap-2"><span className="w-1/3 h-3 rounded-full skeleton" /><span className="w-full h-3 rounded-full skeleton" /></span>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="w-full flex flex-col items-center gap-2 py-8 text-center">
            <span className="w-12 h-12 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><MessageCircle className="w-6 h-6 shrink-0" /></span>
            <p className="w-full text-base font-semibold">Jadi yang pertama komen</p>
            <p className="w-full text-sm text-muted">Tanya harga, tarikh atau kongsi pendapat anda.</p>
          </div>
        ) : comments.map((c, i) => {
          const k = `${reel?.id}|${c.name}|${c.text}`;
          const on = liked.includes(k);
          return (
            <div key={i} className={cx('w-full flex flex-row items-start gap-3', c.vendor && 'p-3 rounded-xl bg-pucuk-50')}>
              <span className="w-9 h-9 shrink-0 rounded-full bg-pucuk-100 text-hijau text-sm font-bold flex items-center justify-center">{c.name[0]}</span>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <span className="w-full flex flex-row flex-wrap items-center gap-2 text-[13px]">
                  <b className="w-fit font-semibold">{c.name}</b>
                  {c.vendor && <span className="w-fit px-2 py-0.5 rounded-full bg-hijau text-white text-[11px] font-semibold">Vendor</span>}
                  <span className="w-fit text-muted">{c.failed ? 'gagal dihantar' : c.time}</span>
                </span>
                <p className={cx('w-full text-sm', c.failed ? 'text-muted' : 'text-body')}>{c.vendor ? vendorPrice(c.text, reel) : c.text}</p>
                {c.failed && (
                  <button onClick={() => onRetry(c)} className="w-fit flex flex-row items-center gap-1.5 py-1 text-sm font-semibold text-bahaya">
                    <AlertCircle className="w-4 h-4 shrink-0" />Gagal dihantar · Cuba lagi
                  </button>
                )}
              </div>
              {!c.failed && (
                <div className="w-fit shrink-0 flex flex-col items-center">
                  <button aria-label={on ? 'Batal suka komen' : 'Suka komen'} aria-pressed={on} onClick={() => (s.authed ? setLiked(l => (on ? l.filter(x => x !== k) : [...l, k])) : nav('/masuk?next=' + encodeURIComponent('/inspirasi?v=' + (reel?.id ?? ''))))}
                    className="w-11 h-11 shrink-0 flex flex-col items-center justify-center gap-0.5 text-xs text-muted">
                    <Heart className={cx('w-4 h-4 shrink-0', on && 'fill-emas text-emas')} /><span className="num">{c.likes + (on ? 1 : 0)}</span>
                  </button>
                  {!c.vendor && <button aria-label={`Laporkan komen ${c.name}`} onClick={() => setReport(i)} className="w-11 h-11 shrink-0 flex items-center justify-center text-muted"><Ellipsis className="w-4 h-4 shrink-0" /></button>}
                </div>
              )}
            </div>
          );
        })}
        {s.authed ? (
          <div className="w-full flex flex-col gap-2">
            {blocked && (
              <p id="cmt-err" role="alert" className="w-full flex flex-row items-start gap-2 px-3.5 py-2.5 rounded-xl bg-bahaya-50 text-sm text-bahaya">
                <AlertCircle className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Komen ini ada perkataan kesat, jadi tidak dihantar. Sila tulis semula dengan sopan.</span>
              </p>
            )}
            <div className="w-full flex flex-row items-center gap-2">
              <input value={text} onChange={e => { setText(e.target.value); setBlocked(false); }} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Tulis komen…" aria-label="Tulis komen"
                aria-invalid={blocked || undefined} aria-describedby={blocked ? 'cmt-err' : undefined}
                className={cx('flex-1 min-w-0 px-3.5 py-2.5 rounded-full border text-[15px] focus:outline-none focus:border-hijau', blocked ? 'border-bahaya' : 'border-line2')} />
              <button aria-label="Hantar komen" disabled={!text.trim()} onClick={send} className="w-11 h-11 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center disabled:bg-pucuk-200"><Send className="w-5 h-5 shrink-0" /></button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-row"><Button block onClick={() => nav('/masuk?next=' + encodeURIComponent('/inspirasi?v=' + (reel?.id ?? '')))}><LogIn className="w-5 h-5 shrink-0" />Log masuk untuk komen</Button></div>
        )}
      </Sheet>
      <Sheet open={report !== null} onClose={closeReport} title="Laporkan komen"
        footer={<Button block disabled={!why} onClick={() => { toast('Komen dilaporkan. Pasukan kami akan semak.'); closeReport(); }}><Flag className="w-5 h-5 shrink-0" />Hantar laporan</Button>}>
        <div role="radiogroup" aria-label="Sebab laporan komen" className="w-full flex flex-col gap-2">
          {CREASONS.map(r => (
            <button key={r} role="radio" aria-checked={why === r} onClick={() => setWhy(r)}
              className={cx('w-full px-4 py-3.5 leading-5 rounded-xl border-2 text-left text-[15px] font-medium', why === r ? 'border-hijau bg-pucuk-50' : 'border-line bg-white')}>{r}</button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

export function ShareSheet({ reel, onClose }: { reel: Reel | null; onClose: () => void }) {
  const { toast } = useStore();
  const link = location.origin + location.pathname + '#/inspirasi?v=' + (reel?.id ?? '');
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
