import { useState, type ReactNode } from 'react';
import { Bell, CalendarHeart, ChevronRight, Globe, Heart, LogIn, LogOut, RotateCcw } from 'lucide-react';
import { useStore } from '../../store';
import { nav, swap } from '../../router';
import { vendorById } from '../../data/mock';
import { Button, Divider, Img, Pill, Sheet, TopBar, cx } from '../../components/ui';
import { clearReviews } from '../vendor/reviews';

const NOTIF = ['WhatsApp', 'SMS', 'Emel', 'Push'] as const;

function Row({ icon, label, onClick, right }: { icon: ReactNode; label: string; onClick?: () => void; right?: ReactNode }) {
  const inner = (
    <>
      <span className="w-10 h-10 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center">{icon}</span>
      <span className="flex-1 min-w-0 text-[15px] font-semibold">{label}</span>
      {right ?? (onClick && <ChevronRight className="w-5 h-5 shrink-0 text-muted" />)}
    </>
  );
  return onClick
    ? <button onClick={onClick} className="w-full flex flex-row items-center gap-3 text-left">{inner}</button>
    : <div className="w-full flex flex-row items-center gap-3">{inner}</div>;
}

/** C-6.0 Account: profile, saved vendors, language, notifications, demo reset, log out */
export default function AccountScreen() {
  const { s, set, reset, toast } = useStore();
  const [notif, setNotif] = useState<Record<string, boolean>>({ WhatsApp: true, SMS: false, Emel: true, Push: true });
  const [confirm, setConfirm] = useState(false);

  if (!s.authed) return (
    <div className="w-full flex flex-col">
      <TopBar title="Akaun" fallback="/" />
      <div className="w-full flex flex-col gap-3 p-5">
        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
          <p className="w-full text-base font-semibold">Log masuk untuk urus akaun</p>
          <p className="w-full text-sm text-body">Simpan vendor, hantar permintaan tempahan dan rancang majlis anda di satu tempat.</p>
          <Button block onClick={() => nav('/masuk?next=%2Fakaun')}><LogIn className="w-4 h-4 shrink-0" />Log masuk</Button>
        </div>
      </div>
    </div>
  );

  const saved = s.saved.map(vendorById).filter(v => v !== undefined);
  const logout = () => { set(() => ({ authed: false })); toast('Anda telah log keluar'); swap('/'); };
  const doReset = () => { reset(); clearReviews(); setConfirm(false); toast('Data demo ditetapkan semula'); swap('/'); };

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Akaun" fallback="/" />
      <div className="w-full flex flex-col gap-4 p-5">
        <div className="w-full flex flex-row items-center gap-4 p-5 rounded-2xl bg-pucuk-50">
          <span className="w-14 h-14 shrink-0 rounded-full bg-hijau text-white text-xl font-bold flex items-center justify-center">{s.userName[0]}</span>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="w-full text-lg font-semibold">{s.userName}</span>
            <span className="w-full text-sm text-body num">+60 12-345 6789</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
          <Row icon={<CalendarHeart className="w-5 h-5 shrink-0" />} label="Tempahan saya" onClick={() => nav('/tempahan')} />
          <Divider />
          <Row icon={<Heart className="w-5 h-5 shrink-0" />} label={`Disimpan · ${saved.length}`} />
          {saved.length === 0
            ? <p className="w-full text-sm text-muted">Tekan ikon hati pada vendor untuk simpan di sini.</p>
            : saved.map(v => (
              <button key={v.id} onClick={() => nav(`/vendor/${v.id}`)} className="w-full flex flex-row items-center gap-3 text-left">
                <Img src={v.img} cat={v.cat} alt="" className="w-12 h-12 shrink-0 rounded-xl" />
                <span className="flex-1 min-w-0 flex flex-col"><span className="w-full text-sm font-semibold">{v.name}</span><span className="w-full text-xs text-muted">{v.area} · {v.km} km</span></span>
                <ChevronRight className="w-5 h-5 shrink-0 text-muted" />
              </button>
            ))}
          <Divider />
          <Row icon={<Globe className="w-5 h-5 shrink-0" />} label="Bahasa" right={<span className="w-fit flex flex-row items-center gap-2"><Pill>BM</Pill><Pill tone="muted">EN · akan datang</Pill></span>} />
        </div>

        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
          <Row icon={<Bell className="w-5 h-5 shrink-0" />} label="Notifikasi" />
          {NOTIF.map(k => (
            <div key={k} className="w-full flex flex-row items-center gap-3">
              <span id={`n-${k}`} className="flex-1 min-w-0 text-sm">{k}</span>
              <button role="switch" aria-checked={notif[k]} aria-labelledby={`n-${k}`} onClick={() => setNotif(n => ({ ...n, [k]: !n[k] }))}
                className={cx('relative w-12 h-7 shrink-0 rounded-full', notif[k] ? 'bg-hijau' : 'bg-line2')}>
                <span className={cx('absolute top-1 w-5 h-5 rounded-full bg-white shadow-float', notif[k] ? 'left-6' : 'left-1')} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={() => setConfirm(true)}><RotateCcw className="w-4 h-4 shrink-0" />Tetapan semula demo</Button>
        <Button variant="danger" onClick={logout}><LogOut className="w-4 h-4 shrink-0" />Log keluar</Button>
      </div>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Tetapkan semula demo?"
        footer={<><Button variant="secondary" block onClick={() => setConfirm(false)}>Batal</Button><Button variant="danger" block onClick={doReset}>Tetapkan semula</Button></>}>
        <p className="w-full text-sm text-body">Semua tempahan, RSVP, simpanan Tabung dan ulasan yang anda buat akan dipadam dan data contoh asal dipulihkan.</p>
      </Sheet>
    </div>
  );
}
