import type { Application, AuditEntry, ContentReport, ReviewReport, VendorBooking, VendorVideo } from './types';

/** the demo vendor account: Andaman Seri Ayu (Mak Andam, Bangi). Aina's B-1063 is a request to it, so both sides stay in sync. */
export const ME_VENDOR = 11;

/** other customers' requests and bookings with the demo vendor (dates relative to TODAY 2026-11-11) */
export const VENDOR_BOOKINGS: VendorBooking[] = [
  { id: 'B-1066', vendorId: 11, packageId: '11-1', date: '2027-01-09', total: 1800, note: 'Majlis di rumah, 2 persalinan.', status: 'requested', createdAt: '2026-11-10', payments: [], customer: 'Syafiqah Ismail', phone: '013-448 2290', pax: 400, place: 'Kajang' },
  { id: 'B-1068', vendorId: 11, packageId: '11-0', date: '2026-12-19', total: 1100, note: 'Akad di masjid pukul 10 pagi.', status: 'requested', createdAt: '2026-11-11', payments: [], customer: 'Nurul Huda', phone: '011-3020 7781', pax: 150, place: 'Bangi' },
  { id: 'B-1060', vendorId: 11, packageId: '11-2', date: '2027-03-06', total: 2700, note: 'Solekan untuk pengantin dan ibu.', status: 'deposit_due', createdAt: '2026-10-20', depositDeadline: '2026-11-19', customer: 'Aisyah Kamal', phone: '019-772 1043', pax: 600, place: 'Putrajaya',
    payments: [{ label: 'Deposit', amount: 810, due: '2026-11-19' }, { label: 'Bayaran kedua', amount: 1080, due: '2027-01-05' }, { label: 'Baki akhir', amount: 810, due: '2027-02-27' }] },
  { id: 'B-1031', vendorId: 11, packageId: '11-1', date: '2026-12-05', total: 1800, note: '', status: 'confirmed', createdAt: '2026-09-28', depositDeadline: '2026-10-28', customer: 'Farah Wahid', phone: '012-901 3344', pax: 300, place: 'Seremban',
    payments: [{ label: 'Deposit', amount: 540, due: '2026-10-28', paidAt: '2026-10-01' }, { label: 'Bayaran kedua', amount: 720, due: '2026-11-28' }, { label: 'Baki akhir', amount: 540, due: '2026-11-28' }] },
  { id: 'B-1012', vendorId: 11, packageId: '11-0', date: '2026-11-07', total: 1100, note: '', status: 'confirmed', createdAt: '2026-08-15', depositDeadline: '2026-09-14', customer: 'Izzah Rahim', phone: '017-650 2210', pax: 200, place: 'Bangi',
    payments: [{ label: 'Deposit', amount: 330, due: '2026-09-14', paidAt: '2026-08-20' }, { label: 'Baki akhir', amount: 770, due: '2026-10-31', paidAt: '2026-10-30' }] },
  { id: 'B-0974', vendorId: 11, packageId: '11-1', date: '2026-10-17', total: 1800, note: '', status: 'reviewed', createdAt: '2026-07-01', depositDeadline: '2026-07-31', customer: 'Liyana Danial', phone: '016-220 8812', pax: 350, place: 'Kajang',
    payments: [{ label: 'Deposit', amount: 540, due: '2026-07-31', paidAt: '2026-07-04' }, { label: 'Baki akhir', amount: 1260, due: '2026-10-10', paidAt: '2026-10-09' }] },
  { id: 'B-0990', vendorId: 11, packageId: '11-0', date: '2026-12-12', total: 1100, note: '', status: 'cancelled', createdAt: '2026-09-10', payments: [], customer: 'Hana Yusri', phone: '018-332 0091', pax: 120, place: 'Cyberjaya', cancelReason: 'Majlis ditangguhkan' },
];

export const VENDOR_VIDEOS: VendorVideo[] = [
  { id: 2, title: 'Solekan akad natural, tahan 12 jam', loc: 'Bangi', desc: 'Solekan kalis peluh untuk majlis siang.', tags: '#makeupakad #pengantin', poster: 'video/reel-3.jpg', status: 'live', views: 18400, likes: 2310, comments: 86, profileTaps: 640, enquiries: 23, pinned: true, packageId: '11-0' },
  { id: 101, title: 'Tutorial gubahan tudung pengantin', loc: 'Bangi', desc: 'Tiga gaya gubahan tudung untuk sanding.', tags: '#tudungpengantin', poster: 'img/gen/makeup.jpg', status: 'review', views: 0, likes: 0, comments: 0, profileTaps: 0, enquiries: 0 },
  { id: 102, title: 'Before after solekan ibu pengantin', loc: 'Kajang', desc: 'Solekan lembut untuk ibu pengantin.', tags: '#ibupengantin', poster: 'img/gen/couple.jpg', status: 'removed', reason: 'Muzik berhak cipta tanpa lesen', views: 2100, likes: 140, comments: 9, profileTaps: 31, enquiries: 1 },
];

export const APPLICATIONS: Application[] = [
  { id: 'AP-301', business: 'Seri Mawar Andaman', cats: ['makeup', 'inai'], freelancer: false, ssm: '202301045512', ic: '', contact: 'Rosmawati Ahmad', phone: '012-480 1192', area: 'Klang', radiusKm: 40, nationwide: false,
    docs: [{ kind: 'ssm', file: 'img/gen/planning.jpg' }, { kind: 'ic-depan', file: 'img/gen/makeup.jpg' }, { kind: 'ic-belakang', file: 'img/gen/makeup.jpg' }, { kind: 'halal', file: 'img/gen/inai.jpg', expiry: '2026-12-01' }],
    about: 'Mak andam dan inai pengantin sejak 2015.', packages: [{ name: 'Solekan akad', price: 1200 }], status: 'submitted', submittedAt: '2026-11-06' },
  { id: 'AP-302', business: 'Lensa Nur Visual', cats: ['photo'], freelancer: true, ssm: '', ic: '920314-10-5527', contact: 'Nur Aiman', phone: '017-221 9087', area: 'Rawang', radiusKm: 60, nationwide: false,
    docs: [{ kind: 'ic-depan', file: 'img/gen/photographer.jpg' }, { kind: 'ic-belakang', file: 'img/gen/photographer.jpg', broken: true }],
    about: 'Jurugambar bebas, gaya candid.', packages: [{ name: 'Akad sahaja', price: 1500 }, { name: 'Akad + Sanding', price: 2800 }], status: 'submitted', submittedAt: '2026-11-09' },
  { id: 'AP-303', business: 'Hadrah Al-Falah', cats: ['kompang'], freelancer: false, ssm: '201901022341', ic: '', contact: 'Ustaz Kamal', phone: '019-334 5521', area: 'Kajang', radiusKm: 0, nationwide: true,
    docs: [{ kind: 'ssm', file: 'img/gen/planning.jpg' }, { kind: 'ic-depan', file: 'img/gen/kompang.jpg' }, { kind: 'ic-belakang', file: 'img/gen/kompang.jpg' }],
    about: 'Kumpulan hadrah dan kompang untuk majlis perkahwinan.', packages: [{ name: 'Kompang 12 orang', price: 900 }], status: 'submitted', submittedAt: '2026-11-10' },
  { id: 'AP-299', business: 'Dekor Impian KL', cats: ['decor'], freelancer: false, ssm: '12345', ic: '', contact: 'Hafiz Rosli', phone: '013-778 0021', area: 'Kuala Lumpur', radiusKm: 30, nationwide: false,
    docs: [{ kind: 'ssm', file: 'img/gen/pelamin.jpg' }], about: 'Pelamin moden.', packages: [{ name: 'Pelamin mini', price: 3500 }], status: 'rejected', submittedAt: '2026-11-02', rejectReason: 'Nombor SSM tidak sepadan dengan nama syarikat' },
];

export const REVIEW_REPORTS: ReviewReport[] = [
  { id: 'RR-1', vendorId: 17, review: { name: 'Pengguna 8812', rating: 1, date: 'Nov 2026', text: 'Penipu! Jangan tempah, ambil duit lari. Nombor dia 012-xxx, hubungi saya untuk cerita penuh.' }, reason: 'Tuduhan palsu & maklumat peribadi', reporter: 'Glow Bridal Studio', at: '2026-11-09', status: 'open' },
  { id: 'RR-2', vendorId: 22, review: { name: 'Khairul A.', rating: 2, date: 'Okt 2026', text: 'MC lambat 30 minit dan tak ikut aturcara yang dipersetujui.' }, reason: 'Tidak benar', reporter: 'Faizal Bicara', at: '2026-11-10', status: 'open' },
];

export const CONTENT_REPORTS: ContentReport[] = [
  { id: 'CR-1', kind: 'video', vendorId: 28, title: 'Paluan kompang meriah di Shah Alam', poster: 'img/gen/kompang.jpg', reasons: { 'Bukan kandungan majlis': 2, 'Spam': 2 }, autoFlag: 'Laporan berulang (4 ≥ 3)', at: '2026-11-10', status: 'open' },
  { id: 'CR-2', kind: 'comment', vendorId: 10, title: 'Komen pada "Pelamin minimalis cream & hijau"', text: 'Murah lagi kat kedai aku, DM wasap 01x-xxxx', reasons: { 'Spam / promosi': 3 }, autoFlag: 'Perkataan dilarang: "DM wasap"', at: '2026-11-11', status: 'open' },
  { id: 'CR-3', kind: 'video', vendorId: 11, title: 'Tutorial gubahan tudung pengantin', poster: 'img/gen/makeup.jpg', reasons: { 'Semakan automatik': 1 }, autoFlag: 'Video baharu, muzik dikesan', at: '2026-11-11', status: 'open' },
];

export const AUDIT: AuditEntry[] = [
  { id: 'L-1', at: '2026-11-04 10:12', who: 'Admin Farid', action: 'Lulus', target: 'Inai by Mira' },
  { id: 'L-2', at: '2026-11-05 15:40', who: 'Admin Farid', action: 'Gantung', target: 'Studio Kilauan', reason: 'Aduan berulang tidak hadir majlis' },
  { id: 'L-3', at: '2026-11-07 09:03', who: 'Admin Siti', action: 'Tolak', target: 'Dekor Impian KL', reason: 'Nombor SSM tidak sepadan dengan nama syarikat' },
];
