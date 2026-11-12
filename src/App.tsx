import { Fragment, useEffect, useRef } from 'react';
import { CircleCheckBig, Lock, Clapperboard, Home, MessageCircle, Search, CalendarHeart } from 'lucide-react';
import { StoreProvider, useStore } from './store';
import { nav, useRoute, type Route } from './router';
import { Button, EmptyState, cx } from './components/ui';
import HomeScreen from './modules/home/HomeScreen';
import SearchScreen from './modules/search/SearchScreen';
import CompareScreen from './modules/search/CompareScreen';
import CompareShare from './modules/search/CompareShare';
import VendorScreen from './modules/vendor/VendorScreen';
import BookingList from './modules/booking/BookingList';
import BookingDetail from './modules/booking/BookingDetail';
import PlannerScreen from './modules/planner/PlannerScreen';
import WizardScreen from './modules/planner/WizardScreen';
import TabungScreen from './modules/tabung/TabungScreen';
import KadEditor from './modules/kad/KadEditor';
import KadRsvpList from './modules/kad/KadRsvpList';
import KadGuest from './modules/kad/KadGuest';
import InspirasiScreen from './modules/inspirasi/InspirasiScreen';
import MessagesScreen from './modules/chat/MessagesScreen';
import ChatScreen from './modules/chat/ChatScreen';
import LoginScreen from './modules/auth/LoginScreen';
import AccountScreen from './modules/auth/AccountScreen';
import NotificationsScreen from './modules/home/NotificationsScreen';
import VendorApp from './modules/vendorapp/VendorApp';
import AdminApp from './modules/admin/AdminApp';

/** pages with the customer's own data; guests get a login prompt instead (RBAC, PM audit B1) */
const PRIVATE = ['tempahan', 'majlis', 'tabung', 'kad', 'mesej', 'notifikasi'];

function LoginGate({ r }: { r: Route }) {
  const next = encodeURIComponent(r.path + (r.q.toString() ? '?' + r.q.toString() : ''));
  return (
    <div className="w-full flex-1 flex flex-col justify-center">
      <EmptyState icon={<Lock className="w-6 h-6 shrink-0" />} title="Log masuk untuk teruskan"
        body="Halaman ini menyimpan maklumat majlis anda. Log masuk dengan nombor telefon untuk melihatnya."
        action={<Button onClick={() => nav('/masuk?next=' + next)}>Log masuk</Button>} />
    </div>
  );
}

/** route table: first path part -> screen. Screens read their own params from the route. */
function screenFor(r: Route, authed: boolean) {
  const [a, b] = r.parts;
  if (!authed && a && PRIVATE.includes(a)) return <LoginGate r={r} />;
  switch (a) {
    case undefined: return <HomeScreen />;
    case 'cari': return <SearchScreen />;
    case 'banding': return b === 'kongsi' ? <CompareShare /> : <CompareScreen />;
    case 'vendor': return <VendorScreen id={Number(b)} />;
    case 'tempahan': return b ? <BookingDetail id={b} /> : <BookingList />;
    case 'majlis': return b === 'baru' ? <WizardScreen /> : <PlannerScreen />;
    case 'tabung': return <TabungScreen />;
    case 'kad': return b === 'rsvp' ? <KadRsvpList /> : <KadEditor />;
    case 'jemputan': return <KadGuest />;
    case 'inspirasi': return <InspirasiScreen />;
    case 'mesej': return b ? <ChatScreen id={Number(b)} /> : <MessagesScreen />;
    case 'masuk': return <LoginScreen />;
    case 'akaun': return <AccountScreen />;
    case 'notifikasi': return <NotificationsScreen />;
    case 'v': return <VendorApp r={r} />;
    default: return <HomeScreen />;
  }
}

const TABS: { to: string; match: (string | undefined)[]; label: string; Icon: typeof Home }[] = [
  { to: '/', match: [undefined, 'home'], label: 'Utama', Icon: Home },
  { to: '/cari', match: ['cari', 'banding', 'vendor'], label: 'Cari', Icon: Search },
  { to: '/inspirasi', match: ['inspirasi'], label: 'Inspirasi', Icon: Clapperboard },
  { to: '/majlis', match: ['majlis', 'tabung', 'kad', 'tempahan'], label: 'Majlis Saya', Icon: CalendarHeart },
  { to: '/mesej', match: ['mesej'], label: 'Mesej', Icon: MessageCircle },
];
/** full-screen flows hide the tab bar */
const NO_NAV = ['jemputan', 'masuk', 'banding', 'v'];
const hideNav = (r: Route) => NO_NAV.includes(r.parts[0]) || (r.parts[0] === 'majlis' && r.parts[1] === 'baru') || (r.parts[0] === 'mesej' && !!r.parts[1]) || (r.parts[0] === 'vendor') || (r.parts[0] === 'kad');

function BottomNav({ r }: { r: Route }) {
  const { s } = useStore();
  const dark = r.parts[0] === 'inspirasi';
  const unread = Object.keys(s.chats).length > 0;
  return (
    <nav aria-label="Navigasi utama" className={cx('w-full flex flex-row items-stretch shrink-0 border-t', dark ? 'bg-black border-white/10' : 'bg-white border-line')}>
      {TABS.map(({ to, match, label, Icon }) => {
        const on = match.includes(r.parts[0]);
        return (
          <button key={to} onClick={() => nav(to)} aria-current={on ? 'page' : undefined}
            className={cx('flex-1 min-w-0 flex flex-col items-center gap-1 py-2 text-[11px] font-semibold', on ? (dark ? 'text-white' : 'text-hijau') : (dark ? 'text-white/60' : 'text-muted'))}>
            <span className="relative w-6 h-6 shrink-0">
              <Icon className="w-6 h-6 shrink-0" strokeWidth={on ? 2.25 : 1.75} />
              {label === 'Mesej' && unread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-bahaya" />}
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export function Toast({ desk }: { desk?: boolean }) {
  const { toastMsg } = useStore();
  if (!toastMsg) return null;
  return (
    <div role="status" className={cx('absolute z-[60]', desk ? 'right-10 bottom-10 w-[360px]' : 'left-4 right-4 bottom-24') + ' flex flex-row items-center gap-2 px-4 py-3 rounded-2xl bg-ink text-white text-sm font-medium shadow-float'}>
      <CircleCheckBig className="w-4 h-4 shrink-0 text-pucuk-200" />
      <span className="flex-1 min-w-0">{toastMsg}</span>
    </div>
  );
}

function Shell() {
  const r = useRoute();
  const { s } = useStore();
  const main = useRef<HTMLElement>(null);
  useEffect(() => { main.current?.scrollTo(0, 0); }, [r.path]);
  // Wave 2 admin console is a desktop web app (1440 baseline), not the phone frame
  if (r.parts[0] === 'admin') return <div className="relative w-full h-dvh flex flex-col bg-kertas"><Fragment key={r.path}><AdminApp r={r} /></Fragment><Toast desk /></div>;
  return (
    // phone-sized app; on desktop it sits centred like a device so stakeholders see the mobile layout
    <div className="w-full h-dvh flex flex-row justify-center bg-[#E9E6DF]">
      <div className="relative w-full sm:w-[430px] h-full flex flex-col bg-kertas overflow-hidden sm:shadow-float">
        <main ref={main} className="w-full flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden"><Fragment key={r.path}>{screenFor(r, s.authed)}</Fragment></main>
        {!hideNav(r) && <BottomNav r={r} />}
        <Toast />
      </div>
    </div>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
