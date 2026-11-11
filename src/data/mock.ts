import type { Category, CategoryId, ChatMsg, Instalment, Package, Reel, Review, Vendor } from './types';

export const CATS: Category[] = [
  { id: 'photo', name: 'Foto & Video', art: 'cat-foto', split: 28, keywords: ['foto', 'video', 'jurugambar', 'photographer', 'videographer'] },
  { id: 'decor', name: 'Pelamin & Dekor', art: 'cat-pelamin', split: 25, keywords: ['pelamin', 'dekor', 'decor', 'bunga'] },
  { id: 'makeup', name: 'Mak Andam', art: 'cat-makeup', split: 14, keywords: ['mak andam', 'solekan', 'makeup', 'andaman'] },
  { id: 'band', name: 'Penyanyi / Band', art: 'cat-band', split: 10, keywords: ['band', 'penyanyi', 'singer', 'akustik', 'muzik'] },
  { id: 'mc', name: 'MC', art: 'cat-mc', split: 8, keywords: ['mc', 'juruacara', 'emcee', 'pengacara'] },
  { id: 'bride', name: 'Bride Assistant', art: 'cat-bride', split: 6, keywords: ['bride assistant', 'pengapit', 'assistant', 'pembantu'] },
  { id: 'kompang', name: 'Kompang & Hadrah', art: 'cat-kompang', split: 5, keywords: ['kompang', 'hadrah', 'paluan'] },
  { id: 'inai', name: 'Inai', art: 'cat-inai', split: 4, keywords: ['inai', 'henna', 'berinai'] },
];
export const catById = (id: CategoryId) => CATS.find(c => c.id === id)!;

/** shown until AGY's new category photos land */
export const FALLBACK_IMG: Record<CategoryId, string> = {
  photo: 'img/gen/photographer.jpg', decor: 'img/gen/pelamin.jpg', makeup: 'img/gen/makeup.jpg', band: 'img/gen/venue.jpg',
  mc: 'img/gen/mc.jpg', bride: 'img/gen/makeup.jpg', kompang: 'img/gen/couple.jpg', inai: 'img/gen/makeup.jpg',
};

const PLAN3: Instalment[] = [
  { label: 'Deposit', pct: 30, daysBefore: null },
  { label: 'Bayaran kedua', pct: 40, daysBefore: 60 },
  { label: 'Baki akhir', pct: 30, daysBefore: 7 },
];
const PLAN2: Instalment[] = [
  { label: 'Deposit', pct: 50, daysBefore: null },
  { label: 'Baki akhir', pct: 50, daysBefore: 7 },
];

const pkgs = (vid: number, base: number, items: [string, number, string[]][], plan = PLAN3): Package[] =>
  items.map(([name, mult, includes], i) => ({
    id: `${vid}-${i}`, name, price: Math.round((base * mult) / 50) * 50, includes,
    depositPct: plan[0].pct, plan,
  }));

/** review pool; each vendor gets its own 3 (no review is ever by the demo user) */
const REVIEW_POOL: Review[] = [
  { name: 'Hafiz R.', rating: 5, date: 'Okt 2026', text: 'Sangat profesional dan tepat masa. Semua yang dijanjikan dalam pakej memang diberi, tiada caj tersembunyi.', reply: 'Terima kasih Encik Hafiz, semoga berbahagia!' },
  { name: 'Siti Mariam', rating: 4, date: 'Sep 2026', text: 'Hasil cantik. Cuma lambat sikit sampai pada hari majlis sebab jalan sesak, tapi tetap sempat.', reply: 'Maaf atas kelewatan, kami dah tambah masa perjalanan untuk majlis seterusnya.' },
  { name: 'Liyana & Danial', rating: 5, date: 'Sep 2026', text: 'Mudah berurusan dari awal. Balas mesej cepat dan bagi cadangan yang masuk akal ikut bajet kami.' },
  { name: 'Puan Rosnah', rating: 5, date: 'Ogo 2026', text: 'Anak saya puas hati sangat. Mak-mak saudara pun tanya nombor untuk majlis anak mereka.' },
  { name: 'Azlan', rating: 4, date: 'Ogo 2026', text: 'Kerja kemas dan sopan. Harap boleh lebih awal hantar senarai keperluan pada pihak dewan.' },
  { name: 'Nadia Hanim', rating: 5, date: 'Jul 2026', text: 'Berbaloi setiap sen. Bila ada perubahan saat akhir pun mereka tenang dan bantu selesaikan.', reply: 'Terima kasih Nadia! Seronok bekerjasama dengan keluarga anda.' },
  { name: 'Khairul A.', rating: 3, date: 'Jul 2026', text: 'Okay secara keseluruhan, tapi komunikasi seminggu sebelum majlis agak perlahan.', reply: 'Terima kasih atas maklum balas. Kami kini ada pembantu khas untuk urusan minggu terakhir.' },
  { name: 'Farah & Imran', rating: 5, date: 'Jun 2026', text: 'Tetamu puji banyak kali. Kami akan cadangkan pada kawan-kawan yang nak kahwin tahun depan.' },
];
const reviewsFor = (i: number): Review[] => [0, 3, 5].map(k => REVIEW_POOL[(i + k) % REVIEW_POOL.length]);

const busy = ['2027-02-13', '2027-02-21', '2027-03-06'];

type Seed = [number, CategoryId, string, string, string, number, number, number, string, number, boolean?];
// id, cat, name, area, state, km, rating, reviews, reply, base price, freelancer
const SEEDS: Seed[] = [
  [7, 'photo', 'Lensa Kasih Studio', 'Shah Alam', 'Selangor', 6, 4.9, 143, '1 jam', 4800],
  [12, 'photo', 'Bingkai Abadi Films', 'Petaling Jaya', 'Selangor', 21, 4.8, 88, '2 jam', 3900],
  [13, 'photo', 'Cahaya Senja Photography', 'Seremban', 'Negeri Sembilan', 62, 4.7, 41, '3 jam', 2800, true],
  [10, 'decor', 'Teratak Pelamin', 'Puchong', 'Selangor', 19, 4.9, 102, '2 jam', 6500],
  [14, 'decor', 'Seri Kenanga Dekor', 'Bangi', 'Selangor', 27, 4.7, 66, '4 jam', 4800],
  [15, 'decor', 'Laman Bunga Events', 'Kuala Lumpur', 'WP Kuala Lumpur', 24, 4.8, 39, '2 jam', 8200],
  [11, 'makeup', 'Andaman Seri Ayu', 'Bangi', 'Selangor', 27, 5.0, 47, '1 jam', 1800, true],
  [16, 'makeup', 'Wajah Berseri by Kak Ros', 'Klang', 'Selangor', 18, 4.8, 92, '2 jam', 2200, true],
  [17, 'makeup', 'Glow Bridal Studio', 'Cyberjaya', 'Selangor', 33, 4.6, 28, '3 jam', 1500],
  [18, 'band', 'Akustik Rindu', 'Kuala Lumpur', 'WP Kuala Lumpur', 22, 4.9, 57, '1 jam', 2500],
  [19, 'band', 'Irama Kasih Band', 'Shah Alam', 'Selangor', 8, 4.7, 34, '3 jam', 3800],
  [20, 'band', 'Suara Syahdu Duo', 'Kajang', 'Selangor', 35, 4.8, 21, '2 jam', 1600, true],
  [8, 'mc', 'Amir Hakimi', 'Kuala Lumpur', 'WP Kuala Lumpur', 24, 4.8, 61, '30 min', 1200, true],
  [21, 'mc', 'Kak Long Emcee', 'Shah Alam', 'Selangor', 5, 4.9, 109, '1 jam', 1500, true],
  [22, 'mc', 'Faizal Bicara', 'Seremban', 'Negeri Sembilan', 64, 4.6, 23, '2 jam', 800, true],
  [23, 'bride', 'Pengapit Setia', 'Petaling Jaya', 'Selangor', 20, 4.9, 38, '1 jam', 900, true],
  [24, 'bride', 'Dara Assist', 'Bangi', 'Selangor', 29, 4.7, 19, '2 jam', 650, true],
  [25, 'bride', 'Teman Raja Sehari', 'Kuala Lumpur', 'WP Kuala Lumpur', 23, 4.8, 44, '1 jam', 1200],
  [26, 'kompang', 'Kompang Warisan Kg. Baru', 'Kuala Lumpur', 'WP Kuala Lumpur', 25, 4.9, 72, '3 jam', 800],
  [27, 'kompang', 'Hadrah Nurul Iman', 'Klang', 'Selangor', 17, 4.8, 36, '2 jam', 1100],
  [28, 'kompang', 'Paluan Seri Selangor', 'Shah Alam', 'Selangor', 9, 4.6, 25, '4 jam', 600],
  [29, 'inai', 'Inai by Mira', 'Subang Jaya', 'Selangor', 14, 5.0, 53, '1 jam', 450, true],
  [30, 'inai', 'Henna Kasturi', 'Kuala Lumpur', 'WP Kuala Lumpur', 23, 4.8, 31, '2 jam', 380, true],
  [31, 'inai', 'Jari Berseri Henna', 'Seremban', 'Negeri Sembilan', 61, 4.7, 17, '3 jam', 300, true],
];

const IMG: Record<CategoryId, string[]> = {
  photo: ['img/gen/photographer.jpg', 'img/gen/couple.jpg', 'img/gen/planning.jpg'],
  decor: ['img/gen/pelamin.jpg', 'img/gen/venue.jpg', 'img/gen/pelamin.jpg'],
  makeup: ['img/gen/makeup.jpg', 'img/gen/makeup.jpg', 'img/gen/couple.jpg'],
  band: ['img/gen/band.jpg', 'img/gen/band.jpg', 'img/gen/band.jpg'],
  mc: ['img/gen/mc.jpg', 'img/gen/mc.jpg', 'img/gen/mc.jpg'],
  bride: ['img/gen/bride-assistant.jpg', 'img/gen/bride-assistant.jpg', 'img/gen/bride-assistant.jpg'],
  kompang: ['img/gen/kompang.jpg', 'img/gen/kompang.jpg', 'img/gen/kompang.jpg'],
  inai: ['img/gen/inai.jpg', 'img/gen/inai.jpg', 'img/gen/inai.jpg'],
};

const PKG_ITEMS: Record<CategoryId, [string, number, string[]][]> = {
  photo: [['Akad sahaja', 0.55, ['4 jam liputan', '300 foto suntingan', 'Galeri online']], ['Akad + Sanding', 1, ['10 jam liputan', '800 foto suntingan', 'Video highlight 3 min', 'Album 30 muka']], ['Premium 2 hari', 1.6, ['2 hari liputan', 'Foto + video penuh', 'Drone', 'Pre-wedding']]],
  decor: [['Pelamin mini', 0.6, ['Pelamin 12 kaki', 'Bunga segar', 'Kusyen songket']], ['Pelamin + meja beradab', 1, ['Pelamin 20 kaki', 'Meja beradab', 'Laluan pengantin', 'Lampu tanglung']], ['Dekor penuh dewan', 1.7, ['Pelamin 24 kaki', 'Hiasan meja tetamu', 'Photo booth', 'Pintu gerbang bunga']]],
  makeup: [['Solekan akad', 0.6, ['1 sesi solekan', 'Gubahan tudung', 'Touch-up 1 kali']], ['Akad + Sanding', 1, ['2 sesi solekan', '2 persalinan', 'Gubahan tudung & veil']], ['Pakej penuh + ibu', 1.5, ['3 sesi solekan', 'Solekan ibu pengantin', 'Sewa aksesori']]],
  band: [['Duo akustik 2 set', 0.6, ['2 set x 45 min', 'Sistem bunyi kecil']], ['Band 3 set', 1, ['3 set x 45 min', 'Sistem bunyi penuh', '1 lagu permintaan']], ['Band + persembahan masuk', 1.4, ['4 set', 'Lagu masuk pengantin', 'Penyanyi tambahan']]],
  mc: [['Majlis 4 jam', 1, ['Dwibahasa BM/EN', 'Atur cara majlis', 'Koordinasi vendor']], ['Akad + Sanding', 1.6, ['2 majlis', 'Doa & bacaan', 'Raptai sehari sebelum']]],
  bride: [['Akad (4 jam)', 1, ['Bantu pakaian & veil', 'Touch-up', 'Bawa barang hantaran']], ['Akad + Sanding (10 jam)', 1.8, ['Ikut pengantin sepanjang hari', 'Urus jadual', 'Bantu salam tetamu', 'Kit kecemasan']]],
  kompang: [['Kompang 10 orang', 1, ['Arak pengantin', 'Pakaian sedondon']], ['Kompang + Hadrah', 1.6, ['15 orang', 'Hadrah 30 min', 'Selawat']]],
  inai: [['Inai jari', 1, ['Kedua-dua tangan', 'Corak ringkas']], ['Inai penuh', 1.8, ['Tangan & kaki', 'Corak tradisional', 'Malam berinai di rumah']]],
};

export const VENDORS: Vendor[] = SEEDS.map(([id, cat, name, area, state, km, rating, reviews, reply, base, freelancer], i) => {
  const imgs = IMG[cat];
  const k = SEEDS.filter(s => s[1] === cat).findIndex(s => s[0] === id);
  return {
    id, cat, name, area, state, km, rating, reviews, reply, freelancer,
    img: imgs[k % imgs.length],
    gallery: [imgs[k % imgs.length], ...imgs.filter((_, j) => j !== k % imgs.length), FALLBACK_IMG[cat]],
    since: ['Mei 2026', 'Jun 2026', 'Jul 2026', 'Ogo 2026'][i % 4],
    about: `${name} berpangkalan di ${area} dan melayani majlis di sekitar ${state}. Kami utamakan komunikasi jelas, harga telus dan kerja yang tepat masa.`,
    packages: pkgs(id, base, PKG_ITEMS[cat], cat === 'inai' || cat === 'mc' ? PLAN2 : PLAN3),
    cancelPolicy: 'Batal lebih 60 hari sebelum majlis: deposit dipulangkan 50%. Kurang 60 hari: deposit tidak dipulangkan.',
    busy: i % 3 === 0 ? [...busy, '2027-02-14'] : busy,
    sampleReviews: reviewsFor(i),
  };
});
export const vendorById = (id: number) => VENDORS.find(v => v.id === id);
export const fromPrice = (v: Vendor) => Math.min(...v.packages.map(p => p.price));

export const REELS: Reel[] = [
  { id: 1, vendorId: 10, video: 'video/reel-2.mp4', poster: 'video/reel-2.jpg', title: 'Pelamin minimalis cream & hijau, setup 4 jam', loc: 'Puchong', desc: 'Konsep moden untuk majlis dalam dewan hotel. Bunga segar, kusyen songket emas dan lampu tanglung. Pakej termasuk pelamin, meja beradab dan laluan pengantin.', tags: '#pelamin #pelaminmoden #weddingmalaysia', likes: 8950, shares: 1210, views: '97K',
    comments: [{ name: 'Aisyah Z.', text: 'Cantiknya warna dia, tak serabut. Berapa harga pakej ni?', time: '5j', likes: 22 }, { name: 'Teratak Pelamin', vendor: true, text: 'Salam Aisyah, pakej ini bermula RM 6,500. Boleh mesej kami untuk tarikh.', time: '4j', likes: 9 }] },
  { id: 2, vendorId: 11, video: 'video/reel-3.mp4', poster: 'video/reel-3.jpg', title: 'Solekan akad natural, tahan 12 jam', loc: 'Bangi', desc: 'Untuk pengantin yang mahu nampak macam diri sendiri, cuma lebih berseri. Solekan kalis peluh, sesuai untuk majlis siang di luar. Termasuk gubahan tudung dan veil.', tags: '#makandam #solekanakad #bridalmakeup', likes: 21300, shares: 2400, views: '302K', comments: [] },
  { id: 3, vendorId: 7, video: 'video/reel-1.mp4', poster: 'video/reel-1.jpg', title: 'Di sebalik tabir: liputan kenduri kampung', loc: 'Shah Alam', desc: 'Kami rakam setiap detik dari dapur ke pelamin. Video highlight 3 minit siap dalam 2 minggu.', tags: '#weddingvideo #kenduri #jurugambar', likes: 12400, shares: 860, views: '184K',
    comments: [{ name: 'Hafiz Rahman', text: 'Video highlight dia memang buat menangis. Recommended!', time: '2j', likes: 48 }, { name: 'Lensa Kasih Studio', vendor: true, text: 'Terima kasih Encik Hafiz!', time: '1j', likes: 12 }] },
];

export const CHATS: Record<number, ChatMsg[]> = {
  7: [{ me: false, text: 'Assalamualaikum Aina! Tahniah atas majlis nanti.', time: '09:02' }, { me: true, text: 'Waalaikumsalam. Boleh buat sesi pre-wedding sekali?', time: '09:05' }, { me: false, text: 'Boleh. Gambar pre-wedding boleh buat di Taman Botani.', time: '09:12' }],
  11: [{ me: true, text: 'Salam kak, untuk akad 14 Feb pukul 9 pagi, boleh?', time: 'Semalam' }, { me: false, text: 'Saya ada slot pukul 6 pagi untuk solekan akad.', time: 'Semalam' }],
  10: [{ me: false, text: 'Warna pelamin sudah dikemaskini, sila semak.', time: 'Isnin' }, { me: false, photo: 'img/gen/pelamin.jpg', time: 'Isnin' }],
};

export const PHONES: Record<number, string> = { 7: '012-334 8810', 10: '017-662 4401', 11: '019-220 7314' };
