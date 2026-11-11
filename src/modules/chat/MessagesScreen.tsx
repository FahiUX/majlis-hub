import { MessageCircle } from 'lucide-react';
import { useStore } from '../../store';
import { nav } from '../../router';
import { catById, vendorById } from '../../data/mock';
import { Button, Divider, EmptyState, Img } from '../../components/ui';

export default function MessagesScreen() {
  const { s } = useStore();
  const threads = Object.entries(s.chats).map(([id, msgs]) => ({ v: vendorById(Number(id)), last: msgs[msgs.length - 1] })).filter(t => t.v && t.last);
  return (
    <div className="w-full flex flex-col gap-5 p-5">
      <header className="w-full flex flex-col gap-1">
        <h1 className="w-full text-2xl font-bold">Mesej</h1>
        <p className="w-full text-sm text-muted">Nombor telefon vendor dikongsi selepas mereka terima tempahan anda.</p>
      </header>
      {threads.length === 0 ? (
        <EmptyState icon={<MessageCircle className="w-6 h-6" />} title="Belum ada mesej" body="Tanya vendor tentang pakej atau tarikh. Perbualan anda akan muncul di sini." action={<Button onClick={() => nav('/cari')}>Cari vendor</Button>} />
      ) : (
        <div className="w-full flex flex-col gap-3.5">
          {threads.map(({ v, last }, i) => v && last && (
            <div key={v.id} className="w-full flex flex-col gap-3.5">
              {i > 0 && <Divider />}
              <button onClick={() => nav(`/mesej/${v.id}`)} className="w-full flex flex-row items-center gap-3 text-left">
                <Img src={v.img} cat={v.cat} alt="" className="w-12 h-12 shrink-0 rounded-full" />
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="w-full flex flex-row items-center gap-2">
                    <span className="flex-1 min-w-0 text-[15px] font-semibold">{v.name}</span>
                    <span className="w-fit text-xs text-muted">{last.time}</span>
                  </div>
                  <span className="w-full text-sm text-body">{last.photo ? 'Menghantar gambar' : `${last.me ? 'Anda: ' : ''}${last.text}`}</span>
                  <span className="w-full text-xs text-muted">{catById(v.cat).name}</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
