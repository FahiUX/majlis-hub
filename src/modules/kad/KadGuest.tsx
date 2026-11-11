import { useState, type FormEvent } from 'react';
import { CalendarCheck, Clock, Lock, MapPin, Minus, PartyPopper, Plus } from 'lucide-react';
import { Button, cx, fmtDate } from '../../components/ui';
import { TODAY, useStore } from '../../store';
import { useRoute } from '../../router';
import { KadCard } from './KadCard';

/** Malaysian mobile: 01x-xxxxxxx (spaces/dashes/+60 allowed) */
const validPhone = (p: string) => /^(\+?60|0)1\d{8,9}$/.test(p.replace(/[\s-]/g, ''));

export default function KadGuest() {
  const { s, set } = useStore();
  const r = useRoute();
  const inv = s.invitation;
  const closed = r.q.get('closed') === '1' || TODAY > inv.rsvpClose;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState(true);
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState('');
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<null | { attending: boolean; count: number }>(null);

  const nameErr = tried && !name.trim() ? 'Sila isi nama anda' : '';
  const phoneErr = tried && phone.trim() && !validPhone(phone) ? 'Nombor telefon tidak sah (cth. 012-345 6789)' : '';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || (phone.trim() && !validPhone(phone))) return;
    const n = attending ? count : 0;
    set(st => ({ rsvps: [...st.rsvps, { id: 'r' + Date.now(), name: name.trim(), phone: phone.trim(), attending, count: n, message: message.trim(), at: TODAY }] }));
    setDone({ attending, count: n });
  };

  const field = (err?: string) => cx('w-full px-3.5 py-3 leading-5 rounded-[10px] border bg-white text-[15px] focus:outline-none focus:border-hijau focus:ring-4 focus:ring-pucuk-200/60', err ? 'border-bahaya' : 'border-line2');

  return (
    <div className="w-full flex flex-col gap-5 p-4">
      <KadCard inv={inv} />

      {done ? (
        <section role="status" className="w-full flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-line text-center">
          <span className="w-14 h-14 shrink-0 rounded-full bg-emas-50 text-emas-teks flex items-center justify-center"><PartyPopper className="w-7 h-7 shrink-0" /></span>
          <h2 className="w-full text-xl font-semibold">{done.attending ? 'Terima kasih! Jumpa di majlis' : 'Terima kasih atas jawapan anda'}</h2>
          <p className="w-full text-sm text-body">{done.attending ? `Kami catat ${done.count} orang hadir.` : 'Doa anda sudah cukup bermakna buat kami.'}</p>
          {done.attending && (
            <div className="w-full flex flex-col gap-2 p-4 rounded-xl bg-pucuk-50 text-left text-sm">
              <span className="w-full flex flex-row items-center gap-2"><CalendarCheck className="w-4 h-4 shrink-0 text-hijau" /><span className="flex-1 min-w-0 font-semibold num">{fmtDate(inv.date, true)}</span></span>
              <span className="w-full flex flex-row items-center gap-2"><Clock className="w-4 h-4 shrink-0 text-hijau" /><span className="flex-1 min-w-0">{inv.time}</span></span>
              <span className="w-full flex flex-row items-center gap-2"><MapPin className="w-4 h-4 shrink-0 text-hijau" /><span className="flex-1 min-w-0">{inv.venue}</span></span>
            </div>
          )}
        </section>
      ) : closed ? (
        <section className="w-full flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-line text-center">
          <span className="w-12 h-12 shrink-0 rounded-full bg-line text-muted flex items-center justify-center"><Lock className="w-6 h-6 shrink-0" /></span>
          <h2 className="w-full text-lg font-semibold">RSVP sudah ditutup</h2>
          <p className="w-full text-sm text-body">RSVP ditutup pada {fmtDate(inv.rsvpClose)}. Sila hubungi keluarga pengantin terus.</p>
        </section>
      ) : (
        <form onSubmit={submit} noValidate className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-white border border-line">
          <div className="w-full flex flex-col gap-1">
            <h2 className="w-full text-lg font-semibold">Sahkan kehadiran</h2>
            <p className="w-full text-sm text-muted">Sila jawab sebelum {fmtDate(inv.rsvpClose)}</p>
          </div>
          <label className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">Nama</span>
            <input value={name} onChange={e => setName(e.target.value)} aria-invalid={!!nameErr || undefined} className={field(nameErr)} />
            {nameErr && <span role="alert" className="w-full text-xs font-medium text-bahaya">{nameErr}</span>}
          </label>
          <label className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">No. telefon (pilihan)</span>
            <input type="tel" inputMode="tel" placeholder="012-345 6789" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={!!phoneErr || undefined} className={field(phoneErr)} />
            {phoneErr && <span role="alert" className="w-full text-xs font-medium text-bahaya">{phoneErr}</span>}
          </label>
          <div role="radiogroup" aria-label="Kehadiran" className="w-full flex flex-row gap-1 p-1 rounded-xl bg-kertas border border-line">
            {[true, false].map(v => (
              <button type="button" key={String(v)} role="radio" aria-checked={attending === v} onClick={() => setAttending(v)}
                className={cx('flex-1 min-w-0 px-3 py-2.5 rounded-[10px] text-sm font-semibold', attending === v ? 'bg-hijau text-white' : 'text-body')}>
                {v ? 'Hadir' : 'Tidak hadir'}
              </button>
            ))}
          </div>
          {attending && (
            <div className="w-full flex flex-row items-center gap-3">
              <span className="flex-1 min-w-0 text-[13px] font-semibold">Bilangan orang</span>
              <button type="button" aria-label="Kurangkan" disabled={count <= 1} onClick={() => setCount(c => c - 1)} className="w-11 h-11 shrink-0 rounded-full border border-line2 flex items-center justify-center disabled:opacity-40"><Minus className="w-4 h-4 shrink-0" /></button>
              <span aria-live="polite" className="w-8 shrink-0 text-center text-lg font-semibold num">{count}</span>
              <button type="button" aria-label="Tambah" disabled={count >= 10} onClick={() => setCount(c => c + 1)} className="w-11 h-11 shrink-0 rounded-full border border-line2 flex items-center justify-center disabled:opacity-40"><Plus className="w-4 h-4 shrink-0" /></button>
            </div>
          )}
          <label className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">Ucapan untuk pengantin (pilihan)</span>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className={field()} />
          </label>
          <div className="w-full flex flex-row"><Button block type="submit">Hantar RSVP</Button></div>
        </form>
      )}
    </div>
  );
}
