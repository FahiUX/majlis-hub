import { useEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Eye, Plus, Send, Trash2, Users } from 'lucide-react';
import { Button, Divider, TopBar, cx } from '../../components/ui';
import { useStore } from '../../store';
import { nav } from '../../router';
import type { Invitation } from '../../data/types';
import { KadCard, TEMPLATES } from './KadCard';
import { KadShare } from './KadShare';

const REQUIRED: (keyof Invitation)[] = ['bride', 'groom', 'date', 'venue'];

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="w-full flex flex-col gap-1.5">
      <span className="w-full text-[13px] font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="w-full text-xs font-medium text-bahaya">{error}</span>}
    </label>
  );
}
const inputCls = (err?: boolean) => cx('w-full px-3.5 py-3 leading-5 rounded-[10px] border bg-white text-[15px] focus:outline-none focus:border-hijau focus:ring-4 focus:ring-pucuk-200/60', err ? 'border-bahaya' : 'border-line2');
const Input = ({ err, ...p }: InputHTMLAttributes<HTMLInputElement> & { err?: boolean }) => <input {...p} aria-invalid={err || undefined} className={inputCls(err)} />;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full flex flex-col gap-4 p-5 rounded-2xl bg-white border border-line">
      <h2 className="w-full text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function KadEditor() {
  const { s, set } = useStore();
  const inv = s.invitation;
  const [tried, setTried] = useState(false);
  const [share, setShare] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const up = (p: Partial<Invitation>) => set(st => ({ invitation: { ...st.invitation, ...p } }));

  // pre-fill empty fields from the My Majlis event
  useEffect(() => {
    if (s.event && (!inv.date || !inv.venue)) up({ date: inv.date || s.event.date, venue: inv.venue || s.event.place });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const missing = REQUIRED.filter(k => !String(inv[k]).trim());
  const err = (k: keyof Invitation) => (tried && missing.includes(k) ? 'Wajib diisi' : undefined);
  const onShare = () => { setTried(true); if (missing.length === 0) setShare(true); };
  const setRow = (i: number, p: Partial<Invitation['aturcara'][number]>) => up({ aturcara: inv.aturcara.map((a, j) => (j === i ? { ...a, ...p } : a)) });

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Kad Kahwin Digital" fallback="/majlis" right={
        <button onClick={() => nav('/kad/rsvp')} className="inline-flex flex-row items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-hijau hover:bg-pucuk-50 w-fit shrink-0">
          <Users className="w-4 h-4 shrink-0" />RSVP ({s.rsvps.length})
        </button>
      } />
      <div className="w-full flex flex-col gap-5 p-4">
        <div className="w-full flex flex-col gap-3">
          <h2 className="w-full text-base font-semibold">Pilih templat</h2>
          <div role="radiogroup" aria-label="Templat kad" className="w-full flex flex-row gap-2 overflow-x-auto">
            {TEMPLATES.map(t => {
              const on = inv.template === t.id;
              return (
                <button key={t.id} role="radio" aria-checked={on} onClick={() => up({ template: t.id })}
                  className={cx('flex flex-col items-center gap-2 p-2 rounded-xl border-2 w-[96px] shrink-0', on ? 'border-hijau bg-pucuk-50' : 'border-line bg-white')}>
                  <span className={cx('relative w-full h-[72px] shrink-0 rounded-lg flex items-center justify-center', { songket: 'bg-malam', krim: 'bg-kertas border border-emas/40', moden: 'bg-white border border-line', emas: 'bg-emas-50' }[t.id])}>
                    {on && <span className="w-6 h-6 shrink-0 rounded-full bg-hijau text-white flex items-center justify-center"><Check className="w-4 h-4 shrink-0" /></span>}
                  </span>
                  <span className="w-full text-xs font-semibold text-center">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={preview} className="w-full flex flex-col gap-3 scroll-mt-16">
          <h2 className="w-full text-base font-semibold">Pratonton</h2>
          <KadCard inv={inv} />
        </div>

        {tried && missing.length > 0 && (
          <p role="alert" className="w-full px-4 py-3 rounded-xl bg-bahaya-50 text-sm font-medium text-bahaya">Lengkapkan {missing.length} maklumat wajib sebelum berkongsi.</p>
        )}

        <Section title="Pasangan">
          <Field label="Nama pengantin perempuan" error={err('bride')}><Input value={inv.bride} err={!!err('bride')} onChange={e => up({ bride: e.target.value })} /></Field>
          <Field label="Nama pengantin lelaki" error={err('groom')}><Input value={inv.groom} err={!!err('groom')} onChange={e => up({ groom: e.target.value })} /></Field>
        </Section>
        <Section title="Ibu bapa">
          <Field label="Nama ibu bapa (penjemput)"><Input value={inv.parents} onChange={e => up({ parents: e.target.value })} /></Field>
        </Section>
        <Section title="Tarikh & masa">
          <Field label="Tarikh majlis" error={err('date')}><Input type="date" value={inv.date} err={!!err('date')} onChange={e => up({ date: e.target.value })} /></Field>
          <Field label="Masa"><Input value={inv.time} onChange={e => up({ time: e.target.value })} /></Field>
        </Section>
        <Section title="Tempat">
          <Field label="Alamat tempat majlis" error={err('venue')}><Input value={inv.venue} err={!!err('venue')} onChange={e => up({ venue: e.target.value })} /></Field>
          <Field label="Pautan peta (Google Maps / Waze)"><Input type="url" value={inv.mapUrl} onChange={e => up({ mapUrl: e.target.value })} /></Field>
        </Section>
        <Section title="Ayat / doa pembuka">
          <textarea aria-label="Ayat atau doa pembuka" rows={3} value={inv.ayat} onChange={e => up({ ayat: e.target.value })} className={inputCls()} />
        </Section>
        <Section title="Aturcara">
          {inv.aturcara.map((a, i) => (
            <div key={i} className="w-full flex flex-row items-center gap-2">
              <input aria-label={`Masa aturcara ${i + 1}`} value={a.time} onChange={e => setRow(i, { time: e.target.value })} className={cx(inputCls(), 'w-[104px] shrink-0')} />
              <input aria-label={`Acara ${i + 1}`} value={a.item} onChange={e => setRow(i, { item: e.target.value })} className={cx(inputCls(), 'flex-1 min-w-0')} />
              <button aria-label={`Buang acara ${i + 1}`} onClick={() => up({ aturcara: inv.aturcara.filter((_, j) => j !== i) })} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-muted hover:bg-bahaya-50 hover:text-bahaya">
                <Trash2 className="w-5 h-5 shrink-0" />
              </button>
            </div>
          ))}
          <Divider />
          <Button variant="ghost" onClick={() => up({ aturcara: [...inv.aturcara, { time: '', item: '' }] })}><Plus className="w-4 h-4 shrink-0" />Tambah acara</Button>
        </Section>
        <Section title="RSVP">
          <Field label="Tutup RSVP pada"><Input type="date" value={inv.rsvpClose} onChange={e => up({ rsvpClose: e.target.value })} /></Field>
        </Section>
      </div>

      <div className="sticky bottom-0 z-10 w-full flex flex-row gap-3 p-4 bg-white shadow-float">
        <Button variant="secondary" onClick={() => preview.current?.scrollIntoView({ behavior: 'smooth' })}><Eye className="w-5 h-5 shrink-0" />Pratonton</Button>
        <Button block onClick={onShare}><Send className="w-5 h-5 shrink-0" />Kongsi kad</Button>
      </div>
      <KadShare open={share} onClose={() => setShare(false)} />
    </div>
  );
}
