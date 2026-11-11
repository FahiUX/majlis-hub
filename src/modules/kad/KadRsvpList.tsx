import { useState } from 'react';
import { AlertCircle, Download, Inbox, MessageCircle, Search, Send } from 'lucide-react';
import { Button, Chip, Divider, EmptyState, Pill, TopBar, cx, fmtDate } from '../../components/ui';
import { useStore } from '../../store';
import { KadShare } from './KadShare';

type Filter = 'all' | 'yes' | 'no';
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

export default function KadRsvpList() {
  const { s, set } = useStore();
  const [q, setQ] = useState('');
  const [f, setF] = useState<Filter>('all');
  const [share, setShare] = useState(false);
  const yes = s.rsvps.filter(r => r.attending);
  const people = yes.reduce((n, r) => n + r.count, 0);
  const no = s.rsvps.length - yes.length;
  const pax = s.event?.pax ?? 0;
  const invited = s.invitation.invited;
  const pending = Math.max(0, invited - s.rsvps.length);
  const setInvited = (n: number) => set(p => ({ invitation: { ...p.invitation, invited: Math.max(0, Math.min(5000, n)) } }));
  const rows = s.rsvps
    .filter(r => (f === 'all' ? true : f === 'yes' ? r.attending : !r.attending))
    .filter(r => r.name.toLowerCase().includes(q.trim().toLowerCase()));
  const wishes = s.rsvps.filter(r => r.message);

  const exportCsv = () => {
    const lines = [['Nama', 'Telefon', 'Kehadiran', 'Bilangan', 'Ucapan', 'Tarikh'], ...s.rsvps.map(r => [r.name, r.phone, r.attending ? 'Hadir' : 'Tidak hadir', r.count, r.message, r.at])];
    const url = URL.createObjectURL(new Blob([lines.map(l => l.map(csvCell).join(',')).join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'rsvp-majlis.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (s.rsvps.length === 0) {
    return (
      <div className="w-full flex flex-col">
        <TopBar title="Senarai RSVP" fallback="/kad" />
        <EmptyState icon={<Inbox className="w-7 h-7 shrink-0" />} title="Belum ada jawapan. Kongsi kad anda" body="Tetamu yang buka pautan kad boleh RSVP tanpa log masuk."
          action={<Button onClick={() => setShare(true)}><Send className="w-5 h-5 shrink-0" />Kongsi kad</Button>} />
        <KadShare open={share} onClose={() => setShare(false)} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Senarai RSVP" fallback="/kad" right={
        <button aria-label="Muat turun CSV" onClick={exportCsv} className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-hijau hover:bg-pucuk-50"><Download className="w-5 h-5 shrink-0" /></button>
      } />
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="w-full flex flex-row items-stretch gap-3">
          {[['Hadir', people, 'orang'], ['Tidak hadir', no, 'jawapan'], ['Belum jawab', pending, 'kad']].map(([l, v, u]) => (
            <div key={l} className="flex-1 min-w-0 flex flex-col gap-1 p-3 rounded-2xl bg-white border border-line">
              <span className="w-full text-xs font-semibold text-muted">{l}</span>
              <span className="w-full text-2xl font-bold num">{v}</span>
              <span className="w-full text-xs text-muted">{u}</span>
            </div>
          ))}
        </div>

        <label className="w-full flex flex-row items-center gap-3 text-sm">
          <span className="flex-1 min-w-0 text-body">Kad dijemput <span className="text-muted">· {s.rsvps.length} sudah jawab</span></span>
          <input type="number" inputMode="numeric" min={0} value={invited} aria-label="Bilangan kad dijemput"
            onChange={e => setInvited(Number(e.target.value) || 0)}
            className="w-[88px] shrink-0 px-3.5 py-2.5 leading-5 rounded-[10px] border border-line2 bg-white text-right num" />
        </label>

        {pax > 0 && people > pax && (
          <p role="alert" className="w-full flex flex-row items-center gap-2 px-4 py-3 rounded-xl bg-amaran-50 text-sm font-medium text-amaran">
            <AlertCircle className="w-5 h-5 shrink-0" /><span className="flex-1 min-w-0">{people} hadir melebihi {pax} pax dalam Majlis Saya. Semak semula tempahan vendor.</span>
          </p>
        )}

        <label className="w-full flex flex-row items-center gap-2 px-3.5 py-2.5 rounded-full bg-white border border-line2">
          <Search className="w-4 h-4 shrink-0 text-muted" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama tetamu" aria-label="Cari nama tetamu" className="flex-1 min-w-0 bg-transparent text-[15px] focus:outline-none" />
        </label>
        <div role="group" aria-label="Tapis kehadiran" className="w-full flex flex-row flex-wrap gap-2">
          {([['all', 'Semua'], ['yes', 'Hadir'], ['no', 'Tidak hadir']] as [Filter, string][]).map(([k, l]) => <Chip key={k} on={f === k} onClick={() => setF(k)}>{l}</Chip>)}
        </div>

        <section aria-label="Senarai tetamu" className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
          {rows.length === 0 ? (
            <p className="w-full py-6 text-center text-sm text-muted">Tiada tetamu sepadan.</p>
          ) : rows.map((r, i) => (
            <div key={r.id} className="w-full flex flex-col gap-3">
              {i > 0 && <Divider />}
              <div className="w-full flex flex-row items-center gap-3">
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="w-full text-[15px] font-semibold">{r.name}</span>
                  <span className="w-full text-xs text-muted num">{r.phone || 'Tiada telefon'} · {fmtDate(r.at)}</span>
                </div>
                {r.attending ? <Pill>Hadir · {r.count}</Pill> : <Pill tone="muted">Tidak hadir</Pill>}
              </div>
            </div>
          ))}
        </section>

        <section className="w-full flex flex-col gap-3">
          <h2 className="w-full text-base font-semibold">Ucapan tetamu</h2>
          {wishes.length === 0 ? <p className="w-full text-sm text-muted">Belum ada ucapan.</p> : wishes.map(r => (
            <div key={r.id} className={cx('w-full flex flex-col gap-1 p-4 rounded-xl', r.attending ? 'bg-pucuk-50' : 'bg-white border border-line')}>
              <p className="w-full text-sm text-body">“{r.message}”</p>
              <span className="w-full flex flex-row items-center gap-1 text-xs font-semibold"><MessageCircle className="w-3.5 h-3.5 shrink-0" />{r.name}</span>
            </div>
          ))}
        </section>
        <Button variant="secondary" onClick={() => setShare(true)}><Send className="w-5 h-5 shrink-0" />Kongsi kad lagi</Button>
      </div>
      <KadShare open={share} onClose={() => setShare(false)} />
    </div>
  );
}
