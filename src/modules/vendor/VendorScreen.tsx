import { useState } from 'react';
import { ChevronLeft, Clock, Heart, MapPin, RotateCcw, SearchX, Share2, ShieldCheck, Check, WifiOff } from 'lucide-react';
import { useStore, toggle } from '../../store';
import { back, nav, swap, useRoute } from '../../router';
import { catById, fromPrice, vendorById } from '../../data/mock';
import { Button, EmptyState, Img, Pill, Sheet, Stars, TopBar, VerifiedBadge, cx, rm } from '../../components/ui';
import { AboutTab, PackagesTab, PortfolioTab, ReviewsTab } from './VendorTabs';
import BookSheet from './BookSheet';

const TABS = [['pakej', 'Pakej'], ['ulasan', 'Ulasan'], ['portfolio', 'Portfolio'], ['tentang', 'Tentang']] as const;

export default function VendorScreen({ id }: { id?: number | string }) {
  const { s, set, toast } = useStore();
  const r = useRoute();
  const v = vendorById(Number(id));
  const [verify, setVerify] = useState(false);
  const [book, setBook] = useState(r.q.get('book') === '1');
  const [pkgId, setPkgId] = useState<string | undefined>();

  const demo = r.q.get('demo');
  if (demo === 'loading') return <VendorSkeleton />;
  if (demo === 'error') return (
    <div className="w-full flex flex-col">
      <TopBar title="Profil vendor" fallback="/cari" />
      <EmptyState icon={<WifiOff className="w-6 h-6" />} title="Tidak dapat memuatkan profil" body="Semak sambungan internet anda dan cuba lagi."
        action={<Button onClick={() => swap(`/vendor/${id}`)}><RotateCcw className="w-4 h-4 shrink-0" />Cuba lagi</Button>} />
    </div>
  );
  if (!v) return <EmptyState icon={<SearchX className="w-6 h-6" />} title="Vendor tidak dijumpai" body="Vendor ini mungkin tidak lagi aktif." action={<Button onClick={() => nav('/cari')}>Cari vendor lain</Button>} />;

  const tab = r.q.get('tab') ?? 'pakej';
  const saved = s.saved.includes(v.id);
  const onSave = () => {
    if (!s.authed) return nav(`/masuk?next=${encodeURIComponent(`/vendor/${v.id}`)}`);
    set(p => ({ saved: toggle(p.saved, v.id) }));
    toast(saved ? 'Dibuang dari senarai simpanan' : 'Disimpan ke senarai anda');
  };
  const onShare = () => { navigator.clipboard?.writeText(location.href).catch(() => undefined); toast('Pautan disalin. Kongsi di WhatsApp.'); };
  const openBook = (pid?: string) => {
    if (!s.authed) return nav(`/masuk?next=${encodeURIComponent(`/vendor/${v.id}?book=1`)}`);
    setPkgId(pid); setBook(true);
  };

  return (
    <div className="w-full flex flex-col">
      {/* gallery: swipe row + ONE overlay for the actions */}
      <div className="relative w-full aspect-[4/3] shrink-0">
        <div className="absolute inset-0 flex flex-row overflow-x-auto snap-x snap-mandatory">
          {v.gallery.map((g, i) => <Img key={i} src={g} cat={v.cat} alt={`${v.name}, gambar ${i + 1}`} className="w-full h-full shrink-0 snap-center" />)}
        </div>
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
          <div className="w-full flex flex-row items-center justify-between">
            <button aria-label="Kembali" onClick={() => back('/cari')} className="pointer-events-auto w-11 h-11 shrink-0 rounded-full bg-white/95 shadow-float flex items-center justify-center"><ChevronLeft className="w-6 h-6 shrink-0" /></button>
            <div className="w-fit flex flex-row items-center gap-2">
              <button aria-label="Kongsi" onClick={onShare} className="pointer-events-auto w-11 h-11 shrink-0 rounded-full bg-white/95 shadow-float flex items-center justify-center"><Share2 className="w-5 h-5 shrink-0" /></button>
              <button aria-label={saved ? 'Buang simpanan' : 'Simpan'} aria-pressed={saved} onClick={onSave} className="pointer-events-auto w-11 h-11 shrink-0 rounded-full bg-white/95 shadow-float flex items-center justify-center"><Heart className={cx('w-5 h-5 shrink-0', saved ? 'fill-bahaya text-bahaya' : '')} /></button>
            </div>
          </div>
          <div className="w-full flex flex-row items-center justify-between">
            <Pill tone="white">{catById(v.cat).name}</Pill>
            <Pill tone="white">{v.gallery.length} foto · leret</Pill>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 p-5">
        <div className="w-full flex flex-col gap-2">
          <h1 className="w-full text-2xl leading-[30px] font-bold">{v.name}</h1>
          <button onClick={() => setVerify(true)} className="w-fit" aria-label="Apa yang kami semak">
            <VerifiedBadge v={v} />
          </button>
        </div>
        <div className="w-full flex flex-row items-center gap-4">
          <span className="w-fit font-display text-5xl leading-[52px] font-semibold num">{v.rating.toFixed(1)}</span>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <Stars n={v.rating} size={16} />
            <span className="w-full text-sm text-body">{v.reviews} ulasan sebenar</span>
          </div>
        </div>
        <div className="w-full flex flex-row flex-wrap items-center gap-4 text-sm text-body">
          <span className="w-fit flex flex-row items-center gap-1.5"><MapPin className="w-4 h-4 shrink-0" />{v.area} · {v.km} km</span>
          <span className="w-fit flex flex-row items-center gap-1.5"><Clock className="w-4 h-4 shrink-0" />Biasanya balas dalam {v.reply}</span>
        </div>
      </div>

      <div role="tablist" aria-label="Maklumat vendor" className="sticky top-0 z-10 w-full flex flex-row bg-kertas border-b border-line">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => swap(`/vendor/${v.id}?tab=${k}`)}
            className={cx('relative flex-1 min-w-0 flex flex-col items-center py-3.5 leading-5 text-sm font-semibold', tab === k ? 'text-hijau' : 'text-muted')}>
            {l}
            {tab === k && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-hijau" />}
          </button>
        ))}
      </div>

      <div className="w-full flex flex-col gap-5 p-5">
        {tab === 'pakej' && <PackagesTab v={v} onBook={openBook} />}
        {tab === 'ulasan' && <ReviewsTab v={v} />}
        {tab === 'portfolio' && <PortfolioTab v={v} />}
        {tab === 'tentang' && <AboutTab v={v} />}
      </div>

      <div className="sticky bottom-0 z-10 w-full flex flex-row items-center gap-3 p-4 bg-white shadow-float">
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="w-full text-xs text-muted">dari</span>
          <span className="w-full text-lg font-bold num">{rm(fromPrice(v))}</span>
        </div>
        <Button onClick={() => openBook()}>{s.authed ? 'Hantar permintaan' : 'Log masuk untuk tempah'}</Button>
      </div>

      <Sheet open={verify} onClose={() => setVerify(false)} title="Apa yang kami semak">
        <p className="w-full text-sm text-body">Pasukan Majlis Hub menyemak setiap vendor sebelum mereka boleh menerima tempahan.</p>
        {[
          v.freelancer ? 'Kad pengenalan sepadan dengan nama dan nombor telefon' : 'Pendaftaran SSM sepadan dengan nama perniagaan',
          'Gambar portfolio ialah hasil kerja sebenar',
          'Pakej dan harga dipaparkan dengan jelas',
          'Ulasan hanya daripada pelanggan yang selesai menempah',
        ].map(t => (
          <div key={t} className="w-full flex flex-row items-center gap-3">
            <span className="w-8 h-8 shrink-0 rounded-full bg-pucuk-100 text-hijau flex items-center justify-center"><Check className="w-4 h-4 shrink-0" /></span>
            <span className="flex-1 min-w-0 text-sm">{t}</span>
          </div>
        ))}
        <div className="w-full flex flex-row items-center gap-2 p-3 rounded-xl bg-pucuk-50 text-sm text-hijau">
          <ShieldCheck className="w-4 h-4 shrink-0" /><span className="flex-1 min-w-0">Disahkan sejak {v.since}</span>
        </div>
      </Sheet>
      <BookSheet v={v} open={book} initialPkg={pkgId} onClose={() => setBook(false)} />
    </div>
  );
}

/** C-2.0 Loading: same shapes as the real profile (?demo=loading) */
function VendorSkeleton() {
  return (
    <div className="w-full flex flex-col" aria-busy="true" aria-label="Memuatkan profil vendor">
      <div className="w-full aspect-[4/3] shrink-0 skeleton" />
      <div className="w-full flex flex-col gap-3 p-5">
        <div className="w-2/3 h-7 rounded-xl skeleton" />
        <div className="w-24 h-6 rounded-full skeleton" />
        <div className="w-full flex flex-row items-center gap-4"><div className="w-16 h-12 rounded-xl skeleton" /><div className="flex-1 min-w-0 h-5 rounded-xl skeleton" /></div>
        {[0, 1].map(i => <div key={i} className="w-full h-36 rounded-2xl skeleton" />)}
      </div>
    </div>
  );
}
