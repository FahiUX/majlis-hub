import { useState } from 'react';
import { Check, CircleCheckBig, Vote } from 'lucide-react';
import { useStore } from '../../store';
import { nav, useRoute } from '../../router';
import { Button, EmptyState, Img, Pill, Stars, VerifiedBadge, cx, rm } from '../../components/ui';
import { catById, fromPrice, vendorById } from '../../data/mock';
import { verdicts } from './compareRows';

/** no-login vote page opened from the shared WhatsApp link (spec C-1.5) */
export default function CompareShare() {
  const { q } = useRoute();
  const { s, set } = useStore();
  const vs = (q.get('ids') ?? '').split(',').map(Number).map(vendorById).filter(v => v !== undefined);
  const [name, setName] = useState('');
  const [err, setErr] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  if (vs.length < 2) return <EmptyState icon={<Vote className="w-6 h-6" />} title="Pautan undian tidak sah" body="Minta pengantin kongsi semula pautan perbandingan." action={<Button onClick={() => nav('/')}>Ke Majlis Hub</Button>} />;

  const verdict = verdicts(vs, s.event);
  const count = (id: number) => Object.values(s.votes).filter(v => v === id).length;
  const vote = (id: number) => {
    const n = name.trim();
    if (!n) { setErr(true); return; }
    set(p => ({ votes: { ...p.votes, [n]: id } })); // same name voting again: last vote wins
    setDone(id);
  };

  return (
    <div className="w-full flex flex-col">
      <header className="w-full flex flex-col gap-2 p-5 bg-pucuk-50">
        <span className="w-fit flex flex-row items-center gap-2 text-sm font-bold text-hijau">
          <span className="w-7 h-7 shrink-0 rounded-lg bg-hijau text-white font-display flex items-center justify-center">M</span>Majlis Hub
        </span>
        <h1 className="w-full font-display text-[26px] leading-8 font-semibold">{s.userName} minta pendapat anda</h1>
        <p className="w-full text-sm text-body">Pilih {catById(vs[0].cat).name} untuk {s.event?.name ?? 'majlis'}. Tak perlu log masuk.</p>
      </header>

      <div className="w-full flex flex-col gap-4 p-4">
        {done ? (
          <div className="w-full flex flex-col items-center gap-2 p-5 rounded-2xl bg-white border border-line text-center">
            <CircleCheckBig className="w-10 h-10 shrink-0 text-hijau" />
            <p className="w-full text-base font-semibold">Terima kasih, {name.trim()}!</p>
            <p className="w-full text-sm text-body">Undian anda untuk {vendorById(done)?.name} sudah dihantar kepada {s.userName}.</p>
            <Button variant="ghost" onClick={() => setDone(null)}>Tukar undian</Button>
          </div>
        ) : (
          <label className="w-full flex flex-col gap-1.5">
            <span className="w-full text-[13px] font-semibold">Nama anda</span>
            <input value={name} onChange={e => { setName(e.target.value); setErr(false); }} placeholder="cth. Hakim" aria-invalid={err}
              className={cx('w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border outline-none focus:border-hijau focus:ring-4 focus:ring-pucuk-200/60', err ? 'border-bahaya' : 'border-line2')} />
            {err && <span className="w-full text-xs text-bahaya">Tulis nama anda dulu supaya {s.userName} tahu siapa yang undi.</span>}
          </label>
        )}

        {vs.map(v => (
          <article key={v.id} className={cx('w-full flex flex-col gap-3 p-3 rounded-2xl bg-white border', done === v.id ? 'border-2 border-hijau' : 'border-line')}>
            <Img src={v.img} cat={v.cat} alt={v.name} className="w-full aspect-[4/3] rounded-xl" />
            <div className="w-full flex flex-row items-center gap-2">
              <span className="flex-1 min-w-0 text-base font-semibold">{v.name}</span>
              <VerifiedBadge v={v} />
            </div>
            <div className="w-full flex flex-row items-center gap-2 text-sm">
              <Stars n={v.rating} size={12} /><span className="flex-1 min-w-0 num">{v.rating.toFixed(1)} · {v.reviews} ulasan · dari <b>{rm(fromPrice(v))}</b></span>
            </div>
            {verdict[v.id].length > 0 && <div className="w-full flex flex-row flex-wrap gap-1.5">{verdict[v.id].map(t => <Pill key={t} tone={t === 'Dalam bajet anda' ? 'hijau' : 'emas'}>{t}</Pill>)}</div>}
            <div className="w-full flex flex-row items-center gap-3">
              <span className="flex-1 min-w-0 text-sm text-muted num">{count(v.id)} undian</span>
              <Button variant={done === v.id ? 'secondary' : 'primary'} onClick={() => vote(v.id)}>{done === v.id ? <><Check className="w-4 h-4 shrink-0" />Diundi</> : 'Undi ini'}</Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
