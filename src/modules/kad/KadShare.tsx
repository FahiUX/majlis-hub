import { useRef } from 'react';
import { Link, MessageCircle } from 'lucide-react';
import { Sheet } from '../../components/ui';
import { useStore } from '../../store';

export const kadLink = () => location.origin + location.pathname + '#/jemputan';

export function KadShare({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, toast } = useStore();
  const input = useRef<HTMLInputElement>(null);
  const link = kadLink();
  const text = `Jemputan ke majlis ${s.invitation.bride} & ${s.invitation.groom}. Sila RSVP di sini: ${link}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast('Pautan disalin'); onClose(); }
    catch { input.current?.select(); toast('Tekan lama untuk salin pautan'); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Kongsi kad">
      <p className="w-full text-sm text-body">Tetamu buka pautan ini tanpa perlu log masuk, kemudian isi RSVP.</p>
      <input ref={input} readOnly value={link} aria-label="Pautan kad" className="w-full px-3.5 py-2.5 rounded-[10px] border border-line2 bg-kertas text-sm truncate" />
      <div className="w-full flex flex-col gap-3">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
          className="w-full flex flex-row items-center justify-center gap-2 px-5 py-3.5 leading-5 rounded-[10px] bg-hijau text-white text-[15px] font-semibold">
          <MessageCircle className="w-5 h-5 shrink-0" />Kongsi di WhatsApp
        </a>
        <button onClick={copy} className="w-full flex flex-row items-center justify-center gap-2 px-5 py-3.5 leading-5 rounded-[10px] border border-line2 bg-white text-[15px] font-semibold">
          <Link className="w-5 h-5 shrink-0" />Salin pautan
        </button>
      </div>
    </Sheet>
  );
}
