import { useState, type ReactNode } from 'react';
import { Bell, CalendarHeart, ChevronRight, Clapperboard, Globe, Heart, LogIn, LogOut, Pencil, RotateCcw } from 'lucide-react';
import { useStore, type AppState } from '../../store';
import { nav, swap } from '../../router';
import { REELS, vendorById } from '../../data/mock';
import { Button, Divider, Img, Pill, Sheet, TopBar, cx } from '../../components/ui';
import { clearReviews } from '../vendor/reviews';

const NOTIF: { k: keyof AppState['notif']; label: string }[] = [{ k: 'whatsapp', label: 'WhatsApp' }, { k: 'sms', label: 'SMS' }, { k: 'email', label: 'Emel' }, { k: 'push', label: 'Push' }];
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

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

const fieldCls = (err: string) => cx('w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-white border outline-none focus:border-hijau', err ? 'border-bahaya' : 'border-line2');
function Field({ label, err, children }: { label: string; err: string; children: ReactNode }) {
  const id = 'err-' + (label === 'Nama' ? 'nama' : 'emel');
  return (
    // error sits outside the <label> so it isn't read as part of the field name; linked via aria-describedby
    <div className="w-full flex flex-col gap-1.5">
      <label className="w-full flex flex-col gap-1.5">
        <span className="w-full text-[13px] font-semibold">{label}</span>
        {children}
      </label>
      {err && <span id={id} role="alert" className="w-full text-sm text-bahaya">{err}</span>}
    </div>
  );
}

/** C-6.0 Account: profile, saved vendors, language, notifications, demo reset, log out */
export default function AccountScreen() {
  const { s, set, reset, toast } = useStore();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(s.userName);
  const [email, setEmail] = useState(s.email);
  const [tried, setTried] = useState(false);
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
  const liked = REELS.filter(r => s.liked.includes(r.id));
  const nameErr = tried && !name.trim() ? 'Sila isi nama anda' : '';
  const emailErr = tried && email.trim() !== '' && !validEmail(email) ? 'Emel tidak sah (cth. nama@contoh.my)' : '';
  const openEdit = () => { setName(s.userName); setEmail(s.email); setTried(false); setEdit(true); };
  const saveProfile = () => {
    setTried(true);
    if (!name.trim() || (email.trim() !== '' && !validEmail(email))) return;
    set(() => ({ userName: name.trim(), email: email.trim() }));
    setEdit(false); toast('Profil dikemas kini');
  };
  const logout = () => { set(() => ({ authed: false })); toast('Anda telah log keluar'); swap('/'); };
  const doReset = () => { reset(); clearReviews(); setConfirm(false); toast('Data demo ditetapkan semula'); swap('/'); };

  return (
    <div className="w-full flex flex-col">
      <TopBar title="Akaun" fallback="/" />
      <div className="w-full flex flex-col gap-4 p-5">
        <div className="w-full flex flex-row items-center gap-4 p-5 rounded-2xl bg-pucuk-50">
          <span className="w-14 h-14 shrink-0 rounded-full bg-hijau text-white text-xl font-bold flex items-center justify-center">{(s.userName.trim()[0] ?? '?').toUpperCase()}</span>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className="w-full text-lg font-semibold">{s.userName}</span>
            <span className="w-full text-sm text-body num">{s.phone}</span>
            <span className="w-full text-sm text-body">{s.email || 'Tiada emel'}</span>
          </div>
          <button aria-label="Ubah profil" onClick={openEdit} className="w-11 h-11 shrink-0 rounded-full bg-white text-hijau flex items-center justify-center"><Pencil className="w-5 h-5 shrink-0" /></button>
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
          <Row icon={<Clapperboard className="w-5 h-5 shrink-0" />} label={`Video disukai · ${liked.length}`} />
          {liked.length === 0
            ? <p className="w-full text-sm text-muted">Tekan ikon hati atau ketik dua kali pada video Inspirasi untuk simpan di sini.</p>
            : <div className="w-full flex flex-row flex-wrap gap-2">
                {liked.map(r => (
                  <button key={r.id} onClick={() => nav(`/inspirasi?v=${r.id}`)} aria-label={`Tonton: ${r.title}`} className="w-[88px] shrink-0 flex flex-col gap-1 text-left">
                    <img src={r.poster} alt="" className="w-[88px] h-[132px] rounded-xl object-cover" />
                    <span className="w-full text-xs font-semibold">{r.title}</span>
                  </button>
                ))}
              </div>}
          <Divider />
          <Row icon={<Globe className="w-5 h-5 shrink-0" />} label="Bahasa" right={<span className="w-fit flex flex-row items-center gap-2"><Pill>BM</Pill><Pill tone="muted">EN · akan datang</Pill></span>} />
        </div>

        <div className="w-full flex flex-col gap-3 p-5 rounded-2xl bg-white border border-line">
          <Row icon={<Bell className="w-5 h-5 shrink-0" />} label="Notifikasi" />
          {NOTIF.map(({ k, label }) => (
            <div key={k} className="w-full flex flex-row items-center gap-3">
              <span id={`n-${k}`} className="flex-1 min-w-0 text-sm">{label}</span>
              <button role="switch" aria-checked={s.notif[k]} aria-labelledby={`n-${k}`} onClick={() => set(p => ({ notif: { ...p.notif, [k]: !p.notif[k] } }))}
                className={cx('relative w-12 h-7 shrink-0 rounded-full', s.notif[k] ? 'bg-hijau' : 'bg-line2')}>
                <span className={cx('absolute top-1 w-5 h-5 rounded-full bg-white shadow-float', s.notif[k] ? 'left-6' : 'left-1')} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={() => setConfirm(true)}><RotateCcw className="w-4 h-4 shrink-0" />Tetapan semula demo</Button>
        <Button variant="danger" onClick={logout}><LogOut className="w-4 h-4 shrink-0" />Log keluar</Button>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Ubah profil"
        footer={<><Button variant="secondary" block onClick={() => setEdit(false)}>Batal</Button><Button block onClick={saveProfile}>Simpan</Button></>}>
        <Field label="Nama" err={nameErr}><input value={name} onChange={e => setName(e.target.value)} aria-invalid={!!nameErr || undefined} aria-describedby={nameErr ? 'err-nama' : undefined} className={fieldCls(nameErr)} /></Field>
        <Field label="Emel" err={emailErr}><input type="email" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!emailErr || undefined} aria-describedby={emailErr ? 'err-emel' : undefined} className={fieldCls(emailErr)} /></Field>
        <div className="w-full flex flex-col gap-1.5">
          <span className="w-full text-[13px] font-semibold">Telefon</span>
          <span className="w-full px-3.5 py-3.5 leading-5 rounded-[10px] bg-kertas border border-line text-muted num">{s.phone}</span>
          <span className="w-full text-xs text-muted">Nombor telefon ditukar melalui log masuk OTP.</span>
        </div>
      </Sheet>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Tetapkan semula demo?"
        footer={<><Button variant="secondary" block onClick={() => setConfirm(false)}>Batal</Button><Button variant="danger" block onClick={doReset}>Tetapkan semula</Button></>}>
        <p className="w-full text-sm text-body">Semua tempahan, RSVP, simpanan Tabung dan ulasan yang anda buat akan dipadam dan data contoh asal dipulihkan.</p>
      </Sheet>
    </div>
  );
}
