import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Hourglass, Scale, Share2, Vote } from 'lucide-react';
import { useStore } from '../../store';
import { nav, useRoute } from '../../router';
import { Button, EmptyState, Img, Pill, Sheet, TopBar, cx } from '../../components/ui';
import { catById, vendorById } from '../../data/mock';
import type { Vendor } from '../../data/types';
import { bestIds, rowsFor, verdicts } from './compareRows';

export const shareLink = (ids: number[]) => `${location.origin}${location.pathname}#/banding/kongsi?ids=${ids.join(',')}`;

export default function CompareScreen() {
  const { q } = useRoute();
  const { s, set, toast } = useStore();
  const ids = q.get('ids') ? q.get('ids')!.split(',').map(Number) : s.compare;
  const vs = ids.map(vendorById).filter(v => v !== undefined);
  const [share, setShare] = useState(false);
  const [photo, setPhoto] = useState<{ v: Vendor; i: number } | null>(null);

  if (vs.length < 2) {
    return (
      <div className="w-full flex flex-col">
        <TopBar title="Bandingkan" fallback="/cari" />
        <EmptyState icon={<Scale className="w-6 h-6" />} title="Tambah 1 lagi untuk banding" body="Tandakan 2 hingga 3 vendor dari kategori yang sama di halaman carian."
          action={<Button onClick={() => nav('/cari' + (vs[0] ? '?cat=' + vs[0].cat : ''))}>Cari vendor</Button>} />
      </div>
    );
  }

  const rows = rowsFor(s.event, s.bookings, (v, i) => setPhoto({ v, i }));
  const verdict = verdicts(vs, s.event);
  const votersFor = (id: number) => Object.entries(s.votes).filter(([, v]) => v === id).map(([n]) => n);
  const link = shareLink(vs.map(v => v.id));

  return (
    <div className="w-full flex flex-col">
      <TopBar title={`Banding ${catById(vs[0].cat).name}`} fallback="/cari"
        right={<button onClick={() => { set(() => ({ compare: [] })); nav('/cari?cat=' + vs[0].cat); }} className="w-fit shrink-0 px-3 py-2.5 text-sm font-semibold text-hijau">Kosongkan</button>} />

      <div className="w-full flex flex-col gap-4 p-4">
        {/* column-based table: label column + one column per vendor, rows share fixed heights */}
        <div className="w-full flex flex-row items-stretch rounded-2xl border border-line bg-white overflow-hidden">
          <div className="w-[92px] shrink-0 flex flex-col bg-kertas">
            <div className="w-full h-[260px] shrink-0" />
            {rows.map(r => <div key={r.label} className={cx('w-full shrink-0 flex flex-row items-center px-2.5 border-t border-line text-xs font-semibold text-muted', r.h)}>{r.label}</div>)}
          </div>
          {vs.map(v => {
            const voters = votersFor(v.id);
            return (
              <div key={v.id} className="flex-1 min-w-0 flex flex-col">
                <div className="w-full h-[260px] shrink-0 flex flex-col gap-2 p-2">
                  <button onClick={() => nav('/vendor/' + v.id)} className="w-full flex flex-col gap-2 text-left">
                    <Img src={v.img} cat={v.cat} alt={v.name} className="w-full h-[72px] rounded-xl" />
                    <span className="w-full text-[13px] leading-4 font-semibold">{v.name}</span>
                  </button>
                  <div className="w-full flex flex-row flex-wrap gap-1">
                    {verdict[v.id].map(t => <Pill key={t} tone={t === 'Rating tertinggi' ? 'emas' : 'hijau'} className="!px-2 !py-0.5 !whitespace-normal">{t}</Pill>)}
                  </div>
                  {voters.length > 0 ? (
                    <div className="w-full flex flex-row flex-wrap gap-1">
                      {voters.map(n => <span key={n} className="w-fit shrink-0 flex flex-row items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-hijau text-white text-xs leading-4 font-semibold whitespace-nowrap">{n}<Check className="w-3 h-3 shrink-0" /></span>)}
                    </div>
                  ) : (
                    <span className="w-full flex flex-row items-center gap-1 text-xs text-muted"><Hourglass className="w-3.5 h-3.5 shrink-0" />Tunggu undian</span>
                  )}
                </div>
                {rows.map(r => {
                  const best = bestIds(vs, r.score).includes(v.id);
                  return (
                    <div key={r.label} className={cx('w-full shrink-0 flex flex-row items-center px-2 border-t border-line text-[13px] overflow-hidden', r.h, best ? 'bg-pucuk-50 text-hijau font-semibold' : 'text-ink')}>
                      {r.cell(v)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className="w-full text-xs text-muted">Hijau = terbaik dalam baris itu. "Dalam bajet anda" ikut pecahan bajet majlis anda.</p>
      </div>

      <div className="sticky bottom-0 z-20 w-full flex flex-row gap-3 p-4 bg-white shadow-float">
        <Button variant="secondary" onClick={() => nav('/vendor/' + vs[0].id)}>Lihat vendor</Button>
        <Button block onClick={() => setShare(true)}><Share2 className="w-4 h-4 shrink-0" />Kongsi dengan pasangan</Button>
      </div>

      <Sheet open={!!photo} onClose={() => setPhoto(null)} title={photo ? `${photo.v.name} · ${photo.i + 1}/${photo.v.gallery.length}` : 'Portfolio'}>
        {photo && (
          <>
            <Img src={photo.v.gallery[photo.i]} cat={photo.v.cat} alt={`Portfolio ${photo.v.name} ${photo.i + 1}`} className="w-full aspect-[3/4] rounded-xl" />
            <div className="w-full flex flex-row items-center gap-3">
              <Button variant="secondary" aria-label="Foto sebelum" disabled={photo.i === 0} onClick={() => setPhoto({ ...photo, i: photo.i - 1 })}><ChevronLeft className="w-5 h-5 shrink-0" /></Button>
              <span className="flex-1 min-w-0 text-center text-sm text-muted num">{photo.i + 1} daripada {photo.v.gallery.length}</span>
              <Button variant="secondary" aria-label="Foto seterusnya" disabled={photo.i === photo.v.gallery.length - 1} onClick={() => setPhoto({ ...photo, i: photo.i + 1 })}><ChevronRight className="w-5 h-5 shrink-0" /></Button>
            </div>
          </>
        )}
      </Sheet>

      <Sheet open={share} onClose={() => setShare(false)} title="Kongsi untuk undian">
        <p className="w-full text-sm text-body">Pasangan atau keluarga buka pautan ini (tanpa log masuk) dan undi pilihan mereka. Undian akan muncul pada setiap lajur.</p>
        <a href={`https://wa.me/?text=${encodeURIComponent('Tolong undi vendor pilihan kita untuk majlis: ' + link)}`} target="_blank" rel="noreferrer"
          className="w-full flex flex-row items-center justify-center gap-2 px-5 py-3.5 leading-5 rounded-[10px] bg-hijau text-white text-[15px] font-semibold">Kongsi di WhatsApp</a>
        <div className="w-full flex flex-row"><Button variant="secondary" block onClick={() => { navigator.clipboard?.writeText(link).catch(() => undefined); toast('Pautan disalin'); }}><Copy className="w-4 h-4 shrink-0" />Salin pautan</Button></div>
        <div className="w-full flex flex-row"><Button variant="ghost" block onClick={() => { setShare(false); nav('/banding/kongsi?ids=' + vs.map(v => v.id).join(',')); }}><Vote className="w-4 h-4 shrink-0" />Buka halaman undian<ExternalLink className="w-4 h-4 shrink-0" /></Button></div>
      </Sheet>
    </div>
  );
}
