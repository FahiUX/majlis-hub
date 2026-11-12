import { useEffect, useState, type ReactNode } from 'react';
import { CalendarDays, CalendarRange, CircleAlert, CircleCheckBig, ClipboardList, Clapperboard, Clock, CreditCard, Hourglass, Inbox, LayoutDashboard, LogOut, Menu, MessageCircle, Star, Store, UserPlus } from 'lucide-react';
import type { Route } from '../../router';
import { nav } from '../../router';
import { useStore, addDays, TODAY } from '../../store';
import { vendorById } from '../../data/mock';
import { ME_VENDOR } from '../../data/wave2';
import type { ListingStatus } from '../../data/types';
import { effective } from '../booking/money';
import { useMyReviews, withMine } from '../vendor/reviews';
import { Button, Chip, Divider, Pill, TopBar, cx, fmtDate } from '../../components/ui';
import { useRows } from './kit';
import { byUrgency, hoursLeft, replyLabel } from './logic';
import { BookingDetail, BookingList } from './Bookings';
import Calendar from './Calendar';
import { Payments, Profile } from './Listing';
import Reviews from './Reviews';
import { Upload, Videos } from './Videos';
import { Inbox as InboxScreen, Thread } from './Inbox';
import Onboarding from './Onboarding';

const TABS = [
  { to: '/v', key: undefined, label: 'Utama', Icon: LayoutDashboard },
  { to: '/v/tempahan', key: 'tempahan', label: 'Tempahan', Icon: ClipboardList },
  { to: '/v/kalendar', key: 'kalendar', label: 'Kalendar', Icon: CalendarDays },
  { to: '/v/video', key: 'video', label: 'Video', Icon: Clapperboard },
  { to: '/v/lagi', key: 'lagi', label: 'Lagi', Icon: Menu },
];
const UNDER_LAGI = ['lagi', 'profil', 'bayaran', 'ulasan', 'mesej'];

function VendorNav({ tab }: { tab: string | undefined }) {
  const active = tab && UNDER_LAGI.includes(tab) ? 'lagi' : tab;
  return (
    <nav aria-label="Navigasi vendor" className="sticky bottom-0 z-20 w-full flex flex-row items-stretch shrink-0 bg-white border-t border-line">
      {TABS.map(({ to, key, label, Icon }) => {
        const on = key === active;
        return (
          <button key={to} onClick={() => nav(to)} aria-current={on ? 'page' : undefined}
            className={cx('flex-1 min-w-0 flex flex-col items-center gap-1 py-2 text-[11px] font-semibold', on ? 'text-hijau' : 'text-muted')}>
            <Icon className="w-6 h-6 shrink-0" strokeWidth={on ? 2.25 : 1.75} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export default function VendorApp({ r }: { r: Route }) {
  const [, a, b] = r.parts;
  const full = (a === 'tempahan' && b) || a === 'daftar' || (a === 'mesej' && b) || (a === 'video' && b === 'baru');
  const screen = (() => {
    switch (a) {
      case 'tempahan': return b ? <BookingDetail id={b} action={r.q.get('aksi')} /> : <BookingList />;
      case 'kalendar': return <Calendar />;
      case 'video': return b === 'baru' ? <Upload /> : <Videos />;
      case 'lagi': return <More />;
      case 'profil': return <Profile />;
      case 'bayaran': return <Payments />;
      case 'ulasan': return <Reviews />;
      case 'mesej': return b ? <Thread id={b} /> : <InboxScreen />;
      case 'daftar': return <Onboarding />;
      default: return <Dashboard />;
    }
  })();
  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="w-full flex-1 flex flex-col">{screen}</div>
      {!full && <VendorNav tab={a} />}
    </div>
  );
}

/* ---------- Lagi menu ---------- */
function MenuRow({ icon, label, sub, to, onClick }: { icon: ReactNode; label: string; sub?: string; to?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick ?? (() => nav(to!))} className="w-full flex flex-row items-center gap-3 min-h-11 text-left">
      <span className="w-10 h-10 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center">{icon}</span>
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="w-full text-[15px] font-semibold">{label}</span>
        {sub && <span className="w-full text-xs text-muted">{sub}</span>}
      </span>
    </button>
  );
}

const STATUS_LABEL: Record<ListingStatus, string> = { draft: 'Draf', submitted: 'Dalam semakan', verified: 'Disahkan', rejected: 'Ditolak' };

function More() {
  const { s, set, toast } = useStore();
  const rows: [ReactNode, string, string, string][] = [
    [<Store className="w-5 h-5 shrink-0" />, 'Profil & Pakej', 'Galeri, tentang kami, pakej', '/v/profil'],
    [<CreditCard className="w-5 h-5 shrink-0" />, 'Bayaran', 'Deposit, ansuran, polisi batal', '/v/bayaran'],
    [<Star className="w-5 h-5 shrink-0" />, 'Ulasan', 'Balas dan laporkan ulasan', '/v/ulasan'],
    [<MessageCircle className="w-5 h-5 shrink-0" />, 'Mesej', 'Perbualan dengan pelanggan', '/v/mesej'],
    [<UserPlus className="w-5 h-5 shrink-0" />, 'Daftar vendor baru', 'Demo pendaftaran 4 langkah', '/v/daftar'],
  ];
  return (
    <div className="w-full flex flex-col">
      <TopBar title="Lagi" fallback="/v" />
      <div className="w-full flex flex-col gap-4 p-5">
        <div className="w-full flex flex-col gap-4 p-4 rounded-2xl bg-white border border-line">
          {rows.map(([icon, label, sub, to], i) => (
            <div key={to} className="w-full flex flex-col gap-4">
              {i > 0 && <Divider />}
              <MenuRow icon={icon} label={label} sub={sub} to={to} />
            </div>
          ))}
        </div>
        <div className="w-full flex flex-col gap-3 p-4 rounded-2xl border border-dashed border-line2">
          <span className="w-full text-xs font-semibold text-muted">Demo: status listing</span>
          <div className="w-full flex flex-row flex-wrap gap-2">
            {(Object.keys(STATUS_LABEL) as ListingStatus[]).map(st => (
              <Chip key={st} on={s.listing.status === st} onClick={() => {
                set(p => ({ listing: { ...p.listing, status: st, rejectReason: st === 'rejected' ? 'Nombor SSM tidak sepadan dengan nama syarikat' : undefined } }));
                toast(`Status listing: ${STATUS_LABEL[st]}`);
              }}>{STATUS_LABEL[st]}</Chip>
            ))}
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 p-4 rounded-2xl bg-white border border-line">
          <MenuRow icon={<LogOut className="w-5 h-5 shrink-0" />} label="Kembali ke aplikasi pelanggan" to="/akaun" />
        </div>
      </div>
    </div>
  );
}

/* ---------- V-2.0 Dashboard ---------- */
function Banner() {
  const { s } = useStore();
  const L = s.listing;
  const box = 'w-full flex flex-row items-start gap-3 p-4 rounded-2xl';
  return (
    <div className="w-full flex flex-col gap-3">
      {L.status === 'verified' && (
        <div className={cx(box, 'bg-pucuk-50')}><CircleCheckBig className="w-5 h-5 shrink-0 text-hijau" />
          <span className="flex-1 min-w-0 flex flex-col gap-0.5"><span className="w-full text-sm font-semibold">Listing disahkan</span><span className="w-full text-sm text-body">Profil anda muncul dalam carian pelanggan.</span></span></div>
      )}
      {L.status === 'submitted' && (
        <div className={cx(box, 'bg-amaran-50')}><Hourglass className="w-5 h-5 shrink-0 text-amaran" />
          <span className="flex-1 min-w-0 flex flex-col gap-0.5"><span className="w-full text-sm font-semibold text-amaran">Dalam semakan</span><span className="w-full text-sm text-body">Kami akan sahkan dalam 2 hari bekerja.</span></span></div>
      )}
      {L.status === 'rejected' && (
        <div role="alert" className={cx(box, 'flex-col bg-bahaya-50')}>
          <span className="w-full flex flex-row items-center gap-2 text-sm font-semibold text-bahaya"><CircleAlert className="w-5 h-5 shrink-0" />Permohonan ditolak</span>
          <span className="w-full text-sm text-body">Sebab: {L.rejectReason ?? 'tidak dinyatakan'}</span>
          <Button variant="danger" onClick={() => nav('/v/daftar')}>Betulkan & hantar semula</Button>
        </div>
      )}
      {L.status === 'draft' && (
        <div className={cx(box, 'bg-white border border-line')}><Clock className="w-5 h-5 shrink-0 text-muted" />
          <span className="flex-1 min-w-0 flex flex-col gap-0.5"><span className="w-full text-sm font-semibold">Listing belum dihantar</span><span className="w-full text-sm text-body">Lengkapkan senarai semak di bawah untuk mula terima tempahan.</span></span></div>
      )}
      {L.pendingReverify && (
        <div className={cx(box, 'bg-amaran-50')}><Hourglass className="w-5 h-5 shrink-0 text-amaran" />
          <span className="flex-1 min-w-0 flex flex-col gap-0.5"><span className="w-full text-sm font-semibold text-amaran">Perubahan menunggu semakan semula</span><span className="w-full text-sm text-body">{L.pendingReverify}. Listing lama kekal aktif semasa semakan.</span></span></div>
      )}
    </div>
  );
}

function Checklist() {
  const { s } = useStore();
  const items: [string, boolean, string][] = [
    ['Lengkapkan profil & galeri', !!s.listing.about, '/v/profil'],
    ['Tambah sekurang-kurangnya 1 pakej', s.listing.packages.length > 0, '/v/profil'],
    ['Hantar dokumen untuk pengesahan', s.listing.status !== 'draft', '/v/daftar'],
    ['Tetapkan kalendar & kapasiti', s.listing.blocked.length > 0, '/v/kalendar'],
    ['Muat naik video pertama', s.videos.length > 0, '/v/video'],
  ];
  return (
    <div className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white border border-line">
      <h2 className="w-full text-base font-semibold">Senarai semak vendor baru</h2>
      {items.map(([label, done, to]) => (
        <button key={label} onClick={() => nav(to)} className="w-full flex flex-row items-center gap-3 min-h-11 text-left">
          <span className={cx('w-6 h-6 shrink-0 rounded-full flex items-center justify-center', done ? 'bg-hijau text-white' : 'border-[1.5px] border-line2 bg-white')}>{done && <CircleCheckBig className="w-4 h-4 shrink-0" />}</span>
          <span className={cx('flex-1 min-w-0 text-sm', done ? 'text-muted line-through' : 'font-medium')}>{label}</span>
          <span className="w-fit text-xs font-semibold text-muted">{done ? 'Siap' : 'Belum'}</span>
        </button>
      ))}
    </div>
  );
}

function Dashboard() {
  const { s } = useStore();
  const rows = useRows();
  const v = vendorById(ME_VENDOR)!;
  const mine = useMyReviews(ME_VENDOR);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setLoading(false), 350); return () => window.clearTimeout(t); }, []);

  const st = rows.map(b => [b, effective(b)] as const);
  const newReq = st.filter(([, x]) => x === 'requested').length;
  const upcoming = st.filter(([b, x]) => ['accepted', 'deposit_due', 'confirmed'].includes(x) && b.date >= TODAY && b.date <= addDays(TODAY, 30)).length;
  const asked = st.filter(([, x]) => x !== 'cancelled');
  const answered = asked.filter(([, x]) => !['requested', 'expired'].includes(x)).length;
  const rate = asked.length ? Math.round((answered / asked.length) * 100) : 0;
  const { rating, reviews } = withMine(v, mine);
  const urgent = byUrgency(rows).filter(b => effective(b) === 'requested' || (effective(b) === 'deposit_due' && (b.depositDeadline ?? b.date) <= addDays(TODAY, 7))).slice(0, 5);
  const kpis: [string, string, ReactNode][] = [
    ['Permintaan baru', String(newReq), <Inbox className="w-5 h-5 shrink-0" />],
    ['Majlis 30 hari', String(upcoming), <CalendarRange className="w-5 h-5 shrink-0" />],
    ['Kadar balas', `${rate}%`, <MessageCircle className="w-5 h-5 shrink-0" />],
    ['Penilaian', reviews ? `${rating.toFixed(1)} (${reviews})` : 'Tiada', <Star className="w-5 h-5 shrink-0" />],
  ];

  return (
    <div className="w-full flex flex-col">
      <TopBar title={v.name} fallback="/akaun" />
      <div className="w-full flex flex-col gap-6 p-5">
        <Banner />
        {loading ? (
          <div aria-busy="true" aria-label="Memuatkan" className="w-full flex flex-col gap-3">
            {[0, 1].map(i => <div key={i} className="w-full flex flex-row gap-3">{[0, 1].map(j => <div key={j} className="flex-1 min-w-0 h-[92px] rounded-2xl bg-skeleton animate-pulse" />)}</div>)}
            <div className="w-full h-[120px] rounded-2xl bg-skeleton animate-pulse" />
          </div>
        ) : (
          <>
            <div className="w-full flex flex-col gap-3">
              {[kpis.slice(0, 2), kpis.slice(2)].map((pair, i) => (
                <div key={i} className="w-full flex flex-row items-stretch gap-3">
                  {pair.map(([label, val, icon]) => (
                    <div key={label} className="flex-1 min-w-0 flex flex-col gap-2 p-4 rounded-2xl bg-white border border-line">
                      <span className="w-full flex flex-row items-center gap-2 text-hijau">{icon}<span className="flex-1 min-w-0 text-xs font-semibold text-muted">{label}</span></span>
                      <span className="w-full text-2xl font-bold num">{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {rows.length === 0 ? <Checklist /> : (
              <section className="w-full flex flex-col gap-3">
                <h2 className="w-full text-base font-semibold">Perlu tindakan segera · {urgent.length}</h2>
                {urgent.length === 0 && <p className="w-full text-sm text-muted">Tiada tindakan segera. Bagus!</p>}
                {urgent.map(b => {
                  const req = effective(b) === 'requested';
                  const h = hoursLeft(b);
                  return (
                    <button key={b.id} onClick={() => nav(`/v/tempahan/${b.id}`)} className="w-full flex flex-col gap-2 p-4 rounded-2xl bg-white border border-line text-left">
                      <span className="w-full flex flex-row items-center gap-2">
                        <span className="flex-1 min-w-0 text-[15px] font-semibold">{b.customer}</span>
                        <Pill tone={req ? (h < 6 ? 'bahaya' : 'muted') : 'amaran'}>{req ? 'Perlu balas' : 'Deposit'}</Pill>
                      </span>
                      <span className="w-full text-sm text-muted">{fmtDate(b.date)} · {b.place}</span>
                      <span className={cx('w-full flex flex-row items-center gap-1.5 text-sm font-semibold', req && h < 6 ? 'text-bahaya' : 'text-amaran')}>
                        <Hourglass className="w-4 h-4 shrink-0" />
                        <span className="flex-1 min-w-0">{req ? `Balas dalam ${replyLabel(h)}` : `Deposit tamat ${fmtDate(b.depositDeadline ?? b.date)}`}</span>
                      </span>
                    </button>
                  );
                })}
                <Button variant="secondary" onClick={() => nav('/v/tempahan')}>Semua tempahan</Button>
              </section>
            )}
            {s.listing.status === 'draft' && rows.length > 0 && <Checklist />}
          </>
        )}
      </div>
    </div>
  );
}
