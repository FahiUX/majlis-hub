import { ArrowLeft, CalendarCheck, ClipboardCheck, Flag, LayoutDashboard, MessageSquareWarning, ScrollText, Settings, ShieldCheck, Store, type LucideIcon } from 'lucide-react';
import { nav, type Route } from '../../router';
import { useStore } from '../../store';
import { cx, Divider } from '../../components/ui';
import Dashboard from './Dashboard';
import { VerifyQueue, VerifyReview } from './Verify';
import Vendors from './Vendors';
import Bookings from './Bookings';
import { ContentQueue, ReviewQueue } from './Moderation';
import PlatformSettings from './PlatformSettings';
import AuditLog from './AuditLog';

const NAV: { k?: string; label: string; Icon: LucideIcon }[] = [
  { label: 'Papan pemuka', Icon: LayoutDashboard },
  { k: 'pengesahan', label: 'Pengesahan', Icon: ClipboardCheck },
  { k: 'vendor', label: 'Vendor', Icon: Store },
  { k: 'tempahan', label: 'Tempahan', Icon: CalendarCheck },
  { k: 'ulasan', label: 'Ulasan dilaporkan', Icon: MessageSquareWarning },
  { k: 'kandungan', label: 'Kandungan', Icon: Flag },
  { k: 'tetapan', label: 'Tetapan platform', Icon: Settings },
  { k: 'log', label: 'Log audit', Icon: ScrollText },
];

function page(r: Route) {
  const [, a, id] = r.parts;
  switch (a) {
    case 'pengesahan': return id ? <VerifyReview id={id} /> : <VerifyQueue />;
    case 'vendor': return <Vendors />;
    case 'tempahan': return <Bookings />;
    case 'ulasan': return <ReviewQueue />;
    case 'kandungan': return <ContentQueue />;
    case 'tetapan': return <PlatformSettings />;
    case 'log': return <AuditLog />;
    default: return <Dashboard fail={r.q.has('gagal')} />;
  }
}

/** Wave 2 admin console: desktop web app, 1440 baseline */
export default function AdminApp({ r }: { r: Route }) {
  const { s } = useStore();
  const open: Record<string, number> = {
    pengesahan: s.applications.filter(a => a.status === 'submitted').length,
    ulasan: s.reviewReports.filter(x => x.status === 'open').length,
    kandungan: s.contentReports.filter(x => x.status === 'open').length,
  };
  return (
    <div className="w-full h-full flex flex-row">
      <aside className="w-[260px] shrink-0 h-full flex flex-col justify-between gap-6 p-6 bg-white border-r border-line overflow-y-auto">
        <div className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-row items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-[10px] bg-hijau text-white flex items-center justify-center"><ShieldCheck className="w-5 h-5 shrink-0" /></span>
            <span className="flex-1 min-w-0 font-display text-[17px] font-semibold">Majlis Hub · Admin</span>
          </div>
          <nav aria-label="Navigasi admin" className="w-full flex flex-col gap-1">
            {NAV.map(({ k, label, Icon }) => {
              const on = r.parts[1] === k;
              const n = k ? open[k] : 0;
              return (
                <button key={label} onClick={() => nav(k ? `/admin/${k}` : '/admin')} aria-current={on ? 'page' : undefined}
                  className={cx('w-full flex flex-row items-center gap-3 px-3 py-2.5 leading-5 rounded-[10px] text-sm font-semibold text-left', on ? 'bg-pucuk-100 text-hijau' : 'text-body hover:bg-kertas')}>
                  <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden />
                  <span className="flex-1 min-w-0 whitespace-nowrap">{label}</span>
                  {n > 0 && <span aria-label={`${n} terbuka`} className="w-fit shrink-0 px-2 py-0.5 leading-4 rounded-full bg-bahaya text-white text-xs font-bold">{n}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="w-full flex flex-col gap-4">
          <Divider />
          <div className="w-full flex flex-row items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center text-xs font-bold" aria-hidden>AF</span>
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="w-full text-sm font-semibold">Admin Farid</span>
              <span className="w-full text-xs text-muted">Pentadbir utama</span>
            </div>
          </div>
          <button onClick={() => nav('/akaun')} className="w-full flex flex-row items-center gap-2 px-3 py-2.5 leading-5 rounded-[10px] border border-line2 text-sm font-semibold hover:bg-kertas">
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
            <span className="flex-1 min-w-0 text-left">Kembali ke aplikasi</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
        <div className="w-full flex flex-col gap-8 p-10">{page(r)}</div>
      </main>
    </div>
  );
}
