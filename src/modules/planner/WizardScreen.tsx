import { useState, type ReactNode } from 'react';
import { Briefcase, Cake, ChevronLeft, Heart, Minus, Plus, Sparkles, TriangleAlert, UtensilsCrossed } from 'lucide-react';
import { CATS } from '../../data/mock';
import { TODAY, addDays, useStore } from '../../store';
import { back, swap, useRoute } from '../../router';
import { Button, cx } from '../../components/ui';
import { SuggestStep, type Draft } from './SuggestStep';

const TYPES = [
  { id: 'Perkahwinan', Icon: Heart, hint: 'Akad nikah, sanding, resepsi' },
  { id: 'Kenduri', Icon: UtensilsCrossed, hint: 'Doa selamat, aqiqah, kesyukuran' },
  { id: 'Korporat', Icon: Briefcase, hint: 'Makan malam syarikat, pelancaran' },
  { id: 'Hari jadi', Icon: Cake, hint: 'Parti keluarga dan kawan' },
  { id: 'Lain-lain', Icon: Sparkles, hint: 'Apa sahaja majlis' },
];

export default function WizardScreen() {
  const r = useRoute();
  const { s } = useStore();
  const step = Math.min(4, Math.max(1, Number(r.q.get('step')) || 1));
  const go = (n: number) => swap('/majlis/baru?step=' + n);
  const [d, setD] = useState<Draft>(() => ({
    type: 'Perkahwinan', date: s.event?.date ?? '', twoDays: false, day2: '', place: s.event?.place ?? '', pax: s.event?.pax ?? 300,
    budget: s.event?.budget ?? 25000, cats: CATS.map(c => c.id), weights: Object.fromEntries(CATS.map(c => [c.id, c.split])), picks: {},
  }));
  const set = (p: Partial<Draft>) => setD(o => ({ ...o, ...p }));

  const dateErr = d.date && d.date <= TODAY ? 'Tarikh ini sudah lepas. Pilih tarikh selepas hari ini.' : '';
  const day2Err = d.twoDays && d.day2 && d.day2 <= d.date ? 'Hari kedua mesti selepas hari pertama.' : '';
  const ok = step === 1 ? !!d.type : step === 2 ? !!d.date && !dateErr && !day2Err && (!d.twoDays || !!d.day2) : step === 3 ? d.place.trim().length > 1 && d.pax > 0 : true;

  return (
    <div className="w-full flex-1 flex flex-col">
      <header className="sticky top-0 z-20 w-full flex flex-col gap-2 px-2 py-2 bg-kertas/95 backdrop-blur">
        <div className="w-full flex flex-row items-center gap-2">
          <button aria-label="Kembali" onClick={() => (step > 1 ? go(step - 1) : back('/majlis'))} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center hover:bg-pucuk-50">
            <ChevronLeft className="w-6 h-6 shrink-0" />
          </button>
          <h1 className="flex-1 min-w-0 text-[17px] leading-6 font-semibold">Majlis baru</h1>
          <span className="w-fit shrink-0 px-3 text-sm text-muted num">Langkah {step}/4</span>
        </div>
        <div className="w-full flex flex-row gap-1.5 px-3" aria-hidden="true">
          {[1, 2, 3, 4].map(n => <span key={n} className={cx('flex-1 min-w-0 h-1 rounded-full', n <= step ? 'bg-hijau' : 'bg-line')} />)}
        </div>
      </header>

      <div className="w-full flex-1 flex flex-col gap-5 p-5">
        {step === 1 && (
          <Q title="Majlis apa yang anda rancang?">
            <div role="radiogroup" aria-label="Jenis majlis" className="w-full flex flex-col gap-3">
              {TYPES.map(({ id, Icon, hint }) => (
                <button key={id} role="radio" aria-checked={d.type === id} onClick={() => set({ type: id })}
                  className={cx('w-full flex flex-row items-center gap-3 p-4 rounded-2xl text-left', d.type === id ? 'border-2 border-hijau bg-pucuk-50' : 'border border-line bg-white')}>
                  <span className="w-11 h-11 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Icon className="w-5 h-5 shrink-0" /></span>
                  <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="w-full text-[15px] font-semibold">{id}</span>
                    <span className="w-full text-sm text-muted">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </Q>
        )}

        {step === 2 && (
          <Q title="Bila tarikhnya?">
            <Field label="Tarikh majlis" error={dateErr}>
              <input type="date" min={addDays(TODAY, 1)} value={d.date} onChange={e => set({ date: e.target.value })} aria-invalid={!!dateErr}
                className={cx('w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border text-[15px]', dateErr ? 'border-bahaya' : 'border-line2')} />
            </Field>
            <label className="w-full flex flex-row items-center gap-3 p-4 rounded-2xl bg-white border border-line">
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="w-full text-[15px] font-semibold">Majlis 2 hari</span>
                <span className="w-full text-sm text-muted">Contoh: akad hari pertama, sanding hari kedua</span>
              </span>
              <input type="checkbox" className="w-5 h-5 shrink-0 accent-hijau" checked={d.twoDays} onChange={e => set({ twoDays: e.target.checked, day2: e.target.checked && d.date ? addDays(d.date, 1) : '' })} />
            </label>
            {d.twoDays && (
              <Field label="Tarikh hari kedua" error={day2Err}>
                <input type="date" min={d.date || addDays(TODAY, 2)} value={d.day2} onChange={e => set({ day2: e.target.value })}
                  className="w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border border-line2 text-[15px]" />
              </Field>
            )}
          </Q>
        )}

        {step === 3 && (
          <Q title="Di mana, dan berapa ramai tetamu?">
            <Field label="Lokasi majlis">
              <input value={d.place} onChange={e => set({ place: e.target.value })} placeholder="Contoh: Dewan Seri Kenanga, Shah Alam"
                className="w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border border-line2 text-[15px]" />
            </Field>
            <Field label="Bilangan tetamu">
              <div className="w-full flex flex-row items-center gap-3">
                <button aria-label="Kurang 50 tetamu" onClick={() => set({ pax: Math.max(50, d.pax - 50) })} className="w-12 h-12 shrink-0 rounded-full border border-line2 bg-white flex items-center justify-center"><Minus className="w-5 h-5 shrink-0" /></button>
                <input type="number" inputMode="numeric" aria-label="Bilangan tetamu" value={d.pax} onChange={e => set({ pax: Math.max(0, Number(e.target.value)) })}
                  className="flex-1 min-w-0 px-3.5 py-3 leading-5 rounded-[10px] bg-white border border-line2 text-center text-xl font-bold num" />
                <button aria-label="Tambah 50 tetamu" onClick={() => set({ pax: Math.min(3000, d.pax + 50) })} className="w-12 h-12 shrink-0 rounded-full border border-line2 bg-white flex items-center justify-center"><Plus className="w-5 h-5 shrink-0" /></button>
              </div>
            </Field>
          </Q>
        )}

        {step === 4 && <SuggestStep d={d} set={set} />}
      </div>

      {step < 4 && (
        <div className="sticky bottom-0 w-full flex flex-row p-4 bg-white shadow-float">
          <Button block disabled={!ok} onClick={() => go(step + 1)}>Seterusnya</Button>
        </div>
      )}
    </div>
  );
}

function Q({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="w-full flex flex-col gap-4">
      <h2 className="w-full font-display text-[26px] leading-8 font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <span className="w-full text-[13px] leading-4 font-semibold">{label}</span>
      {children}
      {error && <p role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><TriangleAlert className="w-4 h-4 shrink-0" />{error}</p>}
    </div>
  );
}
