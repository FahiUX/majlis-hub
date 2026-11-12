import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CalendarHeart, Eye, EyeOff, Loader2, Store } from 'lucide-react';
import { useStore } from '../../store';
import { swap, useRoute } from '../../router';
import { Button, TopBar, cx } from '../../components/ui';

/** +60 mobile: 1X then 7–8 digits (leading 0 optional) */
const clean = (p: string) => p.replace(/[\s-]/g, '').replace(/^0/, '');
const validPhone = (p: string) => /^1\d{8,9}$/.test(clean(p));
/** display format saved to the account: +60 1X-XXX XXXX, or +60 1X-XXXX XXXX for 10-digit 011/015 numbers */
export const fmtPhone = (p: string) => { const d = clean(p); const k = d.length === 10 ? 6 : 5; return `+60 ${d.slice(0, 2)}-${d.slice(2, k)} ${d.slice(k)}`; };
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
/** the demo account's number: typing it shows the "already registered" path (G-2.0 edge) */
const KNOWN = '127784021';
/** ponytail: fake network wait so the button spinner state is visible; real auth replaces it */
const WAIT = 700;

/**
 * Leave login without a trace in history (QA B4): step back to the page that opened it,
 * then swap to `next` if it differs (e.g. ?book=1). Opened from a shared link: just swap.
 */
const finish = (to: string) => {
  if (((history.state as { d?: number } | null)?.d ?? 0) > 0) {
    window.addEventListener('hashchange', () => { if (location.hash.slice(1) !== to) swap(to); }, { once: true });
    history.back();
  } else swap(to);
};

export default function LoginScreen() {
  const { s: st, set, toast } = useStore();
  const r = useRoute();
  const next = r.q.get('next') ?? '/';
  const step = r.q.get('step') === 'otp' ? 'otp' : 'phone';
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [otpErr, setOtpErr] = useState(false);
  const [cd, setCd] = useState(60);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState(st.email);
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [eTried, setETried] = useState(false);
  const later = (fn: () => void) => { setBusy(true); window.setTimeout(() => { setBusy(false); fn(); }, WAIT); };
  // vendors land on their dashboard (Wave 2) unless login was opened from a specific page
  const done = () => { toast(role === 'vendor' ? 'Selamat datang ke papan pemuka vendor' : 'Selamat datang ke Majlis Hub'); finish(role === 'vendor' && next === '/' ? '/v' : next); };

  useEffect(() => {
    if (step !== 'otp') return;
    setCd(60); boxes.current[0]?.focus();
    const t = window.setInterval(() => setCd(c => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [step]);

  const phoneErr = touched && !validPhone(phone);
  const sendCode = () => { setTouched(true); if (validPhone(phone)) later(() => swap(`/masuk?step=otp&next=${encodeURIComponent(next)}`)); };
  const emailErr = eTried && !validEmail(email) ? 'Emel tidak sah (cth. nama@contoh.my)' : '';
  const pwErr = eTried && pw.length < 8 ? 'Kata laluan sekurang-kurangnya 8 aksara' : '';
  const emailLogin = () => {
    setETried(true);
    if (!validEmail(email) || pw.length < 8) return;
    later(() => { set(() => ({ authed: true, email: email.trim() })); done(); });
  };

  const type = (i: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length > 1) { // paste of the whole code
      const all = digits.slice(0, 6).split('');
      setCode([...all, ...Array(6 - all.length).fill('')]);
      boxes.current[Math.min(all.length, 5)]?.focus();
      return;
    }
    setOtpErr(false);
    setCode(c => c.map((x, j) => (j === i ? digits : x)));
    if (digits && i < 5) boxes.current[i + 1]?.focus();
  };
  const verify = () => {
    const c = code.join('');
    if (c.length < 6) return;
    later(() => {
      if (c === '000000') { setOtpErr(true); return; }
      set(p => ({ authed: true, phone: validPhone(phone) ? fmtPhone(phone) : p.phone }));
      done();
    });
  };

  return (
    <div className="w-full flex flex-col">
      <TopBar title={step === 'otp' ? 'Masukkan kod' : 'Log masuk'} fallback="/" />
      {step === 'phone' ? (
        <div className="w-full flex flex-col gap-5 p-5">
          <div className="w-full flex flex-col gap-1">
            <h1 className="w-full font-display text-[28px] leading-[34px] font-semibold">Selamat datang</h1>
            <p className="w-full text-[15px] text-body">Log masuk dengan nombor telefon. Kami hantar kod 6 digit melalui SMS.</p>
          </div>
          <div role="radiogroup" aria-label="Saya" className="w-full flex flex-row gap-3">
            {([['customer', 'Merancang majlis', CalendarHeart], ['vendor', 'Saya vendor', Store]] as const).map(([k, l, Icon]) => (
              <button key={k} role="radio" aria-checked={role === k} onClick={() => setRole(k)}
                className={cx('flex-1 min-w-0 flex flex-col items-start gap-2 p-4 rounded-2xl border text-left', role === k ? 'border-2 border-hijau bg-pucuk-50' : 'border-line bg-white')}>
                <Icon className="w-6 h-6 shrink-0 text-hijau" />
                <span className="w-full text-sm font-semibold">{l}</span>
              </button>
            ))}
          </div>
          {mode === 'phone' ? <>
          <label className="w-full flex flex-col gap-2">
            <span className="w-full text-[13px] font-semibold">Nombor telefon</span>
            <span className={cx('w-full flex flex-row items-center gap-2 px-3.5 py-3.5 leading-5 bg-white border rounded-[10px] focus-within:border-hijau focus-within:ring-4 focus-within:ring-pucuk-200/60', phoneErr ? 'border-bahaya' : 'border-line2')}>
              <span className="w-fit text-[15px] font-semibold text-body">+60</span>
              <input inputMode="tel" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(true)}
                placeholder="12-345 6789" aria-invalid={phoneErr} className="flex-1 min-w-0 text-[15px] outline-none bg-transparent" />
            </span>
            {phoneErr && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />Nombor tidak sah. Contoh: 12-345 6789</span>}
          </label>
          {validPhone(phone) && clean(phone) === KNOWN && <p className="w-full text-sm text-body">Nombor ini sudah berdaftar. Kami akan log masuk ke akaun anda.</p>}
          <Button block onClick={sendCode} disabled={busy} aria-busy={busy}>{busy && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}{busy ? 'Menghantar…' : 'Hantar kod'}</Button>
          </> : <>
          <label className="w-full flex flex-col gap-2">
            <span className="w-full text-[13px] font-semibold">Emel</span>
            <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!emailErr || undefined}
              className={cx('w-full px-3.5 py-3.5 leading-5 text-[15px] bg-white border rounded-[10px] outline-none focus:border-hijau', emailErr ? 'border-bahaya' : 'border-line2')} />
            {emailErr && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />{emailErr}</span>}
          </label>
          <label className="w-full flex flex-col gap-2">
            <span className="w-full text-[13px] font-semibold">Kata laluan</span>
            <span className={cx('w-full flex flex-row items-center gap-2 px-3.5 py-1.5 bg-white border rounded-[10px] focus-within:border-hijau', pwErr ? 'border-bahaya' : 'border-line2')}>
              <input type={showPw ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} aria-invalid={!!pwErr || undefined}
                className="flex-1 min-w-0 py-2 leading-5 text-[15px] outline-none bg-transparent" />
              <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Sembunyikan kata laluan' : 'Tunjuk kata laluan'} aria-pressed={showPw}
                className="w-9 h-9 shrink-0 flex items-center justify-center text-muted">{showPw ? <EyeOff className="w-5 h-5 shrink-0" /> : <Eye className="w-5 h-5 shrink-0" />}</button>
            </span>
            {pwErr && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />{pwErr}</span>}
          </label>
          <Button block onClick={emailLogin} disabled={busy} aria-busy={busy}>{busy && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}{busy ? 'Log masuk…' : 'Log masuk'}</Button>
          </>}
          <button onClick={() => setMode(m => (m === 'phone' ? 'email' : 'phone'))} className="w-fit self-center py-2 text-sm font-semibold text-hijau">{mode === 'phone' ? 'Guna emel dan kata laluan' : 'Guna nombor telefon'}</button>
          <p className="w-full text-xs text-muted text-center">Dengan meneruskan, anda bersetuju dengan Terma Penggunaan dan Dasar Privasi Majlis Hub. Demo: semua log masuk membuka akaun contoh Aina.</p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-5 p-5">
          <p className="w-full text-[15px] text-body">Kod dihantar ke +60 {clean(phone) || '123456789'}. Masukkan 6 digit.</p>
          <div className="w-full flex flex-row gap-2" role="group" aria-label="Kod 6 digit">
            {code.map((c, i) => (
              <input key={i} ref={el => { boxes.current[i] = el; }} value={c} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'} aria-label={`Digit ${i + 1}`}
                onChange={e => type(i, e.target.value)} onKeyDown={e => { if (e.key === 'Backspace' && !c && i > 0) boxes.current[i - 1]?.focus(); }}
                className={cx('flex-1 min-w-0 py-3.5 leading-6 text-center text-xl font-bold num bg-white border rounded-[10px] focus:border-hijau focus:ring-4 focus:ring-pucuk-200/60 outline-none', otpErr ? 'border-bahaya' : 'border-line2')} />
            ))}
          </div>
          {otpErr && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />Kod salah. Semak SMS dan cuba lagi.</span>}
          <Button block onClick={verify} disabled={busy || code.join('').length < 6} aria-busy={busy}>{busy && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}{busy ? 'Mengesahkan…' : 'Sahkan'}</Button>
          <button disabled={cd > 0} onClick={() => { setCd(60); toast('Kod baharu dihantar'); }} className="w-fit self-center text-sm font-semibold text-hijau disabled:text-muted">
            {cd > 0 ? `Hantar semula dalam ${cd}s` : 'Hantar semula kod'}
          </button>
          <p className="w-full text-xs text-muted text-center">Demo: sebarang 6 digit boleh digunakan. Kod 000000 menunjukkan ralat.</p>
        </div>
      )}
    </div>
  );
}
