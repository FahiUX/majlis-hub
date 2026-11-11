import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CalendarHeart, Store } from 'lucide-react';
import { useStore } from '../../store';
import { nav, useRoute } from '../../router';
import { Button, TopBar, cx } from '../../components/ui';

/** +60 mobile: 1X then 7–8 digits (leading 0 optional) */
const clean = (p: string) => p.replace(/[\s-]/g, '').replace(/^0/, '');
const validPhone = (p: string) => /^1\d{8,9}$/.test(clean(p));

export default function LoginScreen() {
  const { set, toast } = useStore();
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

  useEffect(() => {
    if (step !== 'otp') return;
    setCd(60); boxes.current[0]?.focus();
    const t = window.setInterval(() => setCd(c => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [step]);

  const phoneErr = touched && !validPhone(phone);
  const sendCode = () => { setTouched(true); if (validPhone(phone)) nav(`/masuk?step=otp&next=${encodeURIComponent(next)}`); };

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
    if (c === '000000') { setOtpErr(true); return; }
    set(() => ({ authed: true }));
    toast(role === 'vendor' ? 'Log masuk berjaya. Papan pemuka vendor akan datang dalam Wave 2.' : 'Selamat datang ke Majlis Hub');
    nav(next);
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
          <label className="w-full flex flex-col gap-2">
            <span className="w-full text-[13px] font-semibold">Nombor telefon</span>
            <span className={cx('w-full flex flex-row items-center gap-2 px-3.5 py-3.5 leading-5 bg-white border rounded-[10px] focus-within:border-hijau focus-within:ring-4 focus-within:ring-pucuk-200/60', phoneErr ? 'border-bahaya' : 'border-line2')}>
              <span className="w-fit text-[15px] font-semibold text-body">+60</span>
              <input inputMode="tel" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => setTouched(true)}
                placeholder="12-345 6789" aria-invalid={phoneErr} className="flex-1 min-w-0 text-[15px] outline-none bg-transparent" />
            </span>
            {phoneErr && <span role="alert" className="w-full flex flex-row items-center gap-1.5 text-sm text-bahaya"><AlertCircle className="w-4 h-4 shrink-0" />Nombor tidak sah. Contoh: 12-345 6789</span>}
          </label>
          <Button block onClick={sendCode}>Hantar kod</Button>
          <p className="w-full text-xs text-muted text-center">Dengan meneruskan, anda bersetuju dengan Terma Penggunaan dan Dasar Privasi Majlis Hub.</p>
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
          <Button block onClick={verify} disabled={code.join('').length < 6}>Sahkan</Button>
          <button disabled={cd > 0} onClick={() => { setCd(60); toast('Kod baharu dihantar'); }} className="w-fit self-center text-sm font-semibold text-hijau disabled:text-muted">
            {cd > 0 ? `Hantar semula dalam ${cd}s` : 'Hantar semula kod'}
          </button>
          <p className="w-full text-xs text-muted text-center">Demo: sebarang 6 digit boleh digunakan. Kod 000000 menunjukkan ralat.</p>
        </div>
      )}
    </div>
  );
}
