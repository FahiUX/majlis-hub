import { useState } from 'react';
import { Flag, Lock, MessageSquareReply, PencilLine, Star } from 'lucide-react';
import { useStore, TODAY } from '../../store';
import { vendorById } from '../../data/mock';
import { ME_VENDOR } from '../../data/wave2';
import type { Review } from '../../data/types';
import { useMyReviews } from '../vendor/reviews';
import { Button, EmptyState, Pill, Sheet, Stars, TopBar, cx, fmtDate } from '../../components/ui';
import { inputCls } from './kit';

const REASONS = ['Tidak benar', 'Bahasa kesat', 'Maklumat peribadi', 'Bukan pelanggan saya', 'Lain-lain'];
const keyOf = (r: Review) => `${r.name}|${r.date}`;
/** reply editable for 24h after posting, then locked (V-6.0) */
const editable = (at?: string) => !!at && Date.now() - Date.parse(at) < 864e5;

/** V-6.0 reviews: one public reply per review, report to admin, no delete */
export default function Reviews() {
  const { s, set, toast } = useStore();
  const v = vendorById(ME_VENDOR)!;
  const mine = useMyReviews(ME_VENDOR);
  const list: Review[] = [...mine.map(r => ({ name: r.name, rating: r.rating, date: fmtDate(r.at.slice(0, 10)), text: r.text })), ...v.sampleReviews];
  const [reply, setReply] = useState<Review | null>(null);
  const [report, setReport] = useState<Review | null>(null);
  const [text, setText] = useState('');
  const [why, setWhy] = useState('');
  const [more, setMore] = useState('');
  const [tried, setTried] = useState(false);

  const postReply = () => {
    setTried(true);
    if (!reply || !text.trim()) return;
    const k = keyOf(reply);
    const at = s.listing.replies[k]?.at ?? new Date().toISOString();
    set(p => ({ listing: { ...p.listing, replies: { ...p.listing.replies, [k]: { text: text.trim(), at } } } }));
    toast('Balasan diterbitkan');
    setReply(null);
  };
  const sendReport = () => {
    setTried(true);
    if (!report || !why || (why === 'Lain-lain' && !more.trim())) return;
    const r = report;
    set(p => ({
      reviewReports: [...p.reviewReports, { id: `RR-${p.reviewReports.length + 1}-${Date.now() % 1000}`, vendorId: ME_VENDOR, review: r, reason: why === 'Lain-lain' ? more.trim() : why, reporter: v.name, at: TODAY, status: 'open' }],
      listing: { ...p.listing, reported: [...p.listing.reported, keyOf(r)] },
    }));
    toast('Laporan dihantar kepada admin');
    setReport(null);
  };

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Ulasan" fallback="/v/lagi" />
      {list.length === 0 ? (
        <EmptyState icon={<Star className="w-6 h-6" />} title="Belum ada ulasan" body="Ulasan muncul selepas pelanggan menandakan majlis selesai." />
      ) : (
        <div className="w-full flex flex-col gap-3 p-5">
          <p className="w-full text-sm text-muted">Anda boleh balas sekali bagi setiap ulasan. Balasan boleh diubah dalam 24 jam. Ulasan tidak boleh dipadam.</p>
          {list.map(r => {
            const k = keyOf(r);
            const mineReply = s.listing.replies[k];
            const replyText = mineReply?.text ?? r.reply;
            const canEdit = mineReply ? editable(mineReply.at) : !replyText;
            const reported = s.listing.reported.includes(k);
            return (
              <article key={k} className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
                <div className="w-full flex flex-row items-center gap-2">
                  <span className="flex-1 min-w-0 flex flex-col"><span className="w-full text-[15px] font-semibold">{r.name}</span><span className="w-full text-xs text-muted">{r.date}</span></span>
                  <Stars n={r.rating} />
                </div>
                <p className="w-full text-sm text-body">{r.text}</p>
                {replyText && (
                  <div className="w-full flex flex-col gap-1 p-3 rounded-xl bg-kertas">
                    <span className="w-full flex flex-row items-center gap-1.5 text-xs font-semibold text-hijau"><MessageSquareReply className="w-3.5 h-3.5 shrink-0" />Balasan anda{!canEdit && <Lock aria-label="Dikunci" className="w-3.5 h-3.5 shrink-0 text-muted" />}</span>
                    <p className="w-full text-sm text-body">{replyText}</p>
                  </div>
                )}
                {reported && <Pill tone="amaran"><Flag className="w-3.5 h-3.5 shrink-0" />Dilaporkan · dalam semakan admin</Pill>}
                <div className="w-full flex flex-row gap-2">
                  {canEdit && (
                    <Button variant="secondary" block onClick={() => { setReply(r); setText(replyText ?? ''); setTried(false); }}>
                      {replyText ? <><PencilLine className="w-4 h-4 shrink-0" />Ubah balasan</> : <><MessageSquareReply className="w-4 h-4 shrink-0" />Balas</>}
                    </Button>
                  )}
                  {!reported && <Button variant="ghost" block={!canEdit} onClick={() => { setReport(r); setWhy(''); setMore(''); setTried(false); }}><Flag className="w-4 h-4 shrink-0" />Laporkan</Button>}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Sheet open={!!reply} onClose={() => setReply(null)} title={reply && s.listing.replies[keyOf(reply)] ? 'Ubah balasan' : 'Balas ulasan'}
        footer={<><Button variant="secondary" block onClick={() => setReply(null)}>Batal</Button><Button block onClick={postReply}>Terbitkan</Button></>}>
        {reply && <p className="w-full text-sm text-body">"{reply.text}"</p>}
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={500} aria-label="Balasan" placeholder="Tulis balasan awam yang sopan" className={cx(inputCls(tried && !text.trim()), 'resize-none')} />
        <span className="w-full text-xs text-muted num">{text.length}/500 · Balasan awam, boleh diubah dalam 24 jam selepas diterbitkan.</span>
        {tried && !text.trim() && <span role="alert" className="w-full text-sm text-bahaya">Tulis balasan dahulu</span>}
      </Sheet>

      <Sheet open={!!report} onClose={() => setReport(null)} title="Laporkan ulasan"
        footer={<><Button variant="secondary" block onClick={() => setReport(null)}>Batal</Button><Button variant="danger" block onClick={sendReport}>Hantar laporan</Button></>}>
        <p className="w-full text-sm text-body">Admin akan semak. Ulasan kekal dipaparkan sehingga keputusan dibuat.</p>
        <div role="radiogroup" aria-label="Sebab laporan" className="w-full flex flex-col gap-2">
          {REASONS.map(rs => (
            <label key={rs} className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-xl border cursor-pointer', why === rs ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
              <input type="radio" name="rr" checked={why === rs} onChange={() => setWhy(rs)} className="w-5 h-5 shrink-0 accent-hijau" />
              <span className="flex-1 min-w-0 text-sm">{rs}</span>
            </label>
          ))}
        </div>
        {why === 'Lain-lain' && <textarea value={more} onChange={e => setMore(e.target.value)} rows={3} aria-label="Sebab lain" className={cx(inputCls(tried && !more.trim()), 'resize-none')} />}
        {tried && (!why || (why === 'Lain-lain' && !more.trim())) && <span role="alert" className="w-full text-sm text-bahaya">Pilih atau tulis sebab</span>}
      </Sheet>
    </div>
  );
}
