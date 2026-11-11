import { AlertTriangle, BellOff, CalendarClock, ChevronRight, Mail, Wallet } from 'lucide-react';
import { useStore } from '../../store';
import { nav } from '../../router';
import { EmptyState, Pill, TopBar, cx, fmtDate, rm } from '../../components/ui';
import { notices, type Notice } from './reminders';

const when = (d: number) => (d === 0 ? 'hari ini' : d === 1 ? 'esok' : `dalam ${d} hari`);

/** copy per reminder kind; deposits follow the 14/7/3/1-day reminder schedule */
function text(n: Notice): { title: string; body: string } {
  switch (n.kind) {
    case 'deposit': return { title: `Deposit ${n.vendor} perlu dibayar ${when(n.days)}`, body: `Bayar ${rm(n.amount ?? 0)} sebelum ${fmtDate(n.date!)} untuk kunci tarikh. Jika tidak, tempahan dibatalkan automatik.` };
    case 'overdue': return { title: `${n.label} ${n.vendor} lewat ${-n.days} hari`, body: `${rm(n.amount ?? 0)} sepatutnya dibayar pada ${fmtDate(n.date!)}. Tarikh anda masih dikunci, tapi vendor telah dimaklumkan.` };
    case 'instalment': return { title: `${n.label} ${n.vendor} ${when(n.days)}`, body: `${rm(n.amount ?? 0)} perlu dibayar pada ${fmtDate(n.date!)}. Semak Tabung anda.` };
    case 'rsvpClose': return { title: `RSVP kad kahwin ditutup ${when(n.days)}`, body: `Tetamu boleh jawab sehingga ${fmtDate(n.date!)}. Kongsi semula kad kepada yang belum jawab.` };
    case 'rsvpNew': return { title: `${n.count} jawapan RSVP baru`, body: 'Lihat siapa yang akan hadir dan ucapan mereka.' };
  }
}

const ICON = { deposit: Wallet, overdue: AlertTriangle, instalment: CalendarClock, rsvpClose: Mail, rsvpNew: Mail };

export default function NotificationsScreen() {
  const { s } = useStore();
  const list = notices(s.bookings, s.invitation, s.rsvps);
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Notifikasi" fallback="/" />
      <div className="w-full flex flex-col gap-3 p-4">
        {list.length === 0 ? (
          <EmptyState icon={<BellOff className="w-6 h-6 shrink-0" />} title="Tiada peringatan buat masa ini" body="Kami akan ingatkan anda 14, 7, 3 dan 1 hari sebelum setiap bayaran." />
        ) : (
          <>
            <p className="w-full text-sm text-muted">Peringatan dihantar 14, 7, 3 dan 1 hari sebelum setiap bayaran.</p>
            {list.map(n => {
              const Icon = ICON[n.kind];
              const red = n.kind === 'deposit' && n.days <= 3;
              const { title, body } = text(n);
              return (
                <button key={n.id} onClick={() => nav(n.to)}
                  className={cx('w-full flex flex-row items-start gap-3 p-4 rounded-2xl border text-left', red ? 'bg-bahaya-50 border-bahaya/30' : n.urgent ? 'bg-amaran-50 border-amaran/30' : 'bg-white border-line')}>
                  <span className={cx('w-10 h-10 shrink-0 rounded-full flex items-center justify-center', red ? 'bg-white text-bahaya' : n.urgent ? 'bg-white text-amaran' : 'bg-pucuk-100 text-hijau')}><Icon className="w-5 h-5 shrink-0" /></span>
                  <span className="flex-1 min-w-0 flex flex-col gap-1">
                    {(red || n.urgent) && <Pill tone={red ? 'bahaya' : 'amaran'} className="!bg-white">{red ? 'Segera' : 'Lewat'}</Pill>}
                    <span className="w-full text-[15px] font-semibold">{title}</span>
                    <span className="w-full text-sm text-body">{body}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 shrink-0 text-muted" />
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
