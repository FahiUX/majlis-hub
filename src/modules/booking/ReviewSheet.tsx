import { useEffect, useState } from 'react';
import { AlertCircle, Check, Star } from 'lucide-react';
import { useStore, TODAY } from '../../store';
import type { Booking, Vendor } from '../../data/types';
import { Button, Img, Sheet, cx } from '../../components/ui';
import { saveReview, type UserReview } from '../vendor/reviews';

const MIN = 20;
const LABELS = ['Sangat teruk', 'Kurang memuaskan', 'Sederhana', 'Bagus', 'Cemerlang'];

/** C-5.0: only a Completed booking can be reviewed; editable for 7 days */
export default function ReviewSheet({ b, v, existing, open, onClose }: { b: Booking; v: Vendor; existing?: UserReview; open: boolean; onClose: () => void }) {
  const { s, set, toast } = useStore();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (!open) return;
    setRating(existing?.rating ?? 0); setText(existing?.text ?? ''); setPhotos(existing?.photos ?? []); setTried(false);
  }, [open, existing]);

  const short = text.trim().length < MIN;
  const submit = () => {
    setTried(true);
    if (!rating || short) return;
    saveReview({ bookingId: b.id, vendorId: v.id, name: s.userName, rating, text: text.trim(), photos, at: existing?.at ?? TODAY });
    set(p => ({ bookings: p.bookings.map(x => (x.id === b.id ? { ...x, status: 'reviewed' } : x)) }));
    toast(existing ? 'Ulasan dikemas kini' : 'Terima kasih! Ulasan anda kini dipaparkan');
    onClose();
  };
  const togglePhoto = (g: string) => setPhotos(p => (p.includes(g) ? p.filter(x => x !== g) : p.length < 5 ? [...p, g] : p));

  return (
    <Sheet open={open} onClose={onClose} title={existing ? 'Kemas kini ulasan' : `Ulas ${v.name}`}
      footer={<Button block onClick={submit}>{existing ? 'Simpan perubahan' : 'Hantar ulasan'}</Button>}>
      <div className="w-full flex flex-col gap-2">
        <span id="rate-l" className="w-full text-[13px] font-semibold">Penilaian anda</span>
        <div role="radiogroup" aria-labelledby="rate-l" className="w-full flex flex-row items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} bintang, ${LABELS[n - 1]}`} onClick={() => setRating(n)}
              className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-kertas">
              <Star className={cx('w-7 h-7 shrink-0 text-ink', n <= rating ? 'fill-ink' : 'fill-none')} />
            </button>
          ))}
          {rating > 0 && <span className="flex-1 min-w-0 text-sm font-semibold">{LABELS[rating - 1]}</span>}
        </div>
        {tried && !rating && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />Pilih bilangan bintang</span>}
      </div>
      <label className="w-full flex flex-col gap-2">
        <span className="w-full text-[13px] font-semibold">Ceritakan pengalaman anda</span>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} aria-invalid={tried && short} aria-describedby="rv-help"
          placeholder="Contoh: tepat masa, hasil cantik, mudah berurusan"
          className={cx('w-full px-3.5 py-3 bg-white border rounded-[10px] text-[15px] resize-none', tried && short ? 'border-bahaya' : 'border-line2')} />
      </label>
      <span id="rv-help" className={cx('w-full text-xs', tried && short ? 'text-bahaya' : 'text-muted')}>
        {tried && short ? `Tulis sekurang-kurangnya ${MIN} aksara (${text.trim().length}/${MIN})` : `Minimum ${MIN} aksara · ${text.trim().length}`}
      </span>
      <div className="w-full flex flex-col gap-2">
        <span className="w-full text-[13px] font-semibold">Tambah gambar (pilihan, maks. 5)</span>
        <div className="w-full flex flex-row flex-wrap gap-2">
          {[...new Set(v.gallery)].map((g, i) => {
            const on = photos.includes(g);
            return (
              <button key={g} aria-pressed={on} aria-label={`Gambar ${i + 1}`} onClick={() => togglePhoto(g)} className={cx('relative w-16 h-16 shrink-0 rounded-xl overflow-hidden', on ? 'ring-2 ring-hijau' : 'ring-1 ring-line')}>
                <Img src={g} cat={v.cat} alt="" className="w-full h-full" />
                {on && <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-hijau text-white flex items-center justify-center"><Check className="w-3.5 h-3.5 shrink-0" /></span>}
              </button>
            );
          })}
        </div>
        <span className="w-full text-xs text-muted">Demo: pilih daripada gambar majlis anda. Anda boleh ubah ulasan dalam 7 hari.</span>
      </div>
    </Sheet>
  );
}
