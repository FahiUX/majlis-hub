import { useState } from 'react';
import { Plus, Trash2, TriangleAlert } from 'lucide-react';
import { useStore } from '../../store';
import { Button, Chip, Divider, cx } from '../../components/ui';

/** default ideas per event type (spec C-3.3: "Empty: default checklist per event type") */
const IDEAS: Record<string, string[]> = {
  Perkahwinan: ['Door gift', 'Kad kahwin', 'Hantaran', 'Baju pengantin', 'Cincin'],
  Kenduri: ['Door gift', 'Khemah', 'Doa selamat', 'Pinggan mangkuk'],
  Korporat: ['Cenderahati', 'Banner', 'Sistem PA', 'Tag nama'],
  'Hari jadi': ['Kek', 'Belon', 'Door gift'],
};

/** own checklist items (door gifts, kad...), stored in s.event.custom */
export function CustomChecklist() {
  const { s, set } = useStore();
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const e = s.event!;
  const items = e.custom ?? [];
  const save = (list: typeof items) => set(o => ({ event: o.event && { ...o.event, custom: list } }));
  const add = (t: string, n = '') => save([...items, { id: 'c' + Date.now(), text: t, note: n, done: false }]);
  const ideas = (IDEAS[e.type] ?? IDEAS.Perkahwinan).filter(i => !items.some(x => x.text.toLowerCase() === i.toLowerCase()));

  const submit = () => {
    if (!text.trim()) { setErr('Tulis nama item dahulu.'); return; }
    add(text.trim(), note.trim()); setText(''); setNote(''); setErr('');
  };

  return (
    <section className="w-full flex flex-col gap-3" aria-labelledby="item-sendiri">
      <h2 id="item-sendiri" className="w-full text-xl font-semibold">Item sendiri</h2>
      {items.length > 0 && (
        <div className="w-full flex flex-col rounded-2xl bg-white border border-line overflow-hidden">
          {items.map((it, i) => (
            <div key={it.id} className="w-full flex flex-col">
              {i > 0 && <Divider />}
              <div className="w-full flex flex-row items-center gap-3 p-4">
                <input id={'ci-' + it.id} type="checkbox" checked={it.done} className="w-5 h-5 shrink-0 accent-hijau"
                  onChange={() => save(items.map(x => (x.id === it.id ? { ...x, done: !x.done } : x)))} />
                <label htmlFor={'ci-' + it.id} className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className={cx('w-full text-[15px] font-semibold', it.done && 'line-through text-muted')}>{it.text}</span>
                  {it.note && <span className="w-full text-sm text-muted">{it.note}</span>}
                </label>
                <button aria-label={`Padam ${it.text}`} onClick={() => save(items.filter(x => x.id !== it.id))}
                  className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-muted hover:bg-kertas"><Trash2 className="w-5 h-5 shrink-0" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {ideas.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <p className="w-full text-sm text-muted">{items.length ? 'Cadangan lain' : 'Cadangan untuk ' + e.type.toLowerCase()}</p>
          <div className="w-full flex flex-row flex-wrap gap-2">
            {ideas.map(i => <Chip key={i} onClick={() => add(i)}><Plus className="w-4 h-4 shrink-0" />{i}</Chip>)}
          </div>
        </div>
      )}
      <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
        <label htmlFor="ci-text" className="w-full text-[13px] leading-4 font-semibold">Tambah item sendiri</label>
        <input id="ci-text" value={text} onChange={x => { setText(x.target.value); setErr(''); }} placeholder="Contoh: Bunga telur"
          aria-invalid={!!err} aria-describedby={err ? 'ci-err' : undefined} onKeyDown={x => x.key === 'Enter' && submit()}
          className={cx('w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border text-[15px]', err ? 'border-bahaya' : 'border-line2')} />
        {err && <p id="ci-err" role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><TriangleAlert className="w-4 h-4 shrink-0" />{err}</p>}
        <label htmlFor="ci-note" className="w-full text-[13px] leading-4 font-semibold">Nota (pilihan)</label>
        <input id="ci-note" value={note} onChange={x => setNote(x.target.value)} placeholder="Contoh: 500 biji, tempah sebelum Jan"
          className="w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border border-line2 text-[15px]" />
        <Button variant="secondary" onClick={submit} className="w-full"><Plus className="w-4 h-4 shrink-0" />Tambah item</Button>
      </div>
    </section>
  );
}
