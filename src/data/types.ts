export type CategoryId = 'photo' | 'mc' | 'makeup' | 'decor' | 'bride' | 'inai' | 'kompang' | 'band';

export interface Category {
  id: CategoryId;
  name: string;
  art: string;
  /** default share of the total budget, % (spec C-3.0a) */
  split: number;
  keywords: string[];
}

export interface Instalment { label: string; pct: number; /** days before the event; null = at deposit */ daysBefore: number | null }

export interface Package {
  id: string;
  name: string;
  price: number;
  includes: string[];
  depositPct: number;
  plan: Instalment[];
}

export interface Review { name: string; rating: number; date: string; text: string; reply?: string }

export interface Vendor {
  id: number;
  cat: CategoryId;
  name: string;
  area: string;
  state: string;
  km: number;
  rating: number;
  reviews: number;
  reply: string;
  img: string;
  gallery: string[];
  freelancer?: boolean;
  /** halal-certified products/ingredients (Mak Andam, Inai) */
  halal?: boolean;
  /** largest majlis (guests) the vendor serves */
  capacity: number;
  /** dates with only one slot left (C-2.2 "1 slot lagi") */
  limited: string[];
  /** joined recently with few reviews (C-2.0 "Baru di Majlis Hub") */
  isNew?: boolean;
  /** suspended by admin: hidden from listings, profile shows "Tidak tersedia" */
  suspended?: boolean;
  lat: number;
  lng: number;
  since: string;
  about: string;
  packages: Package[];
  cancelPolicy: string;
  /** ISO dates already taken */
  busy: string[];
  sampleReviews: Review[];
}

export interface Reel {
  id: number;
  vendorId: number;
  video: string;
  poster: string;
  title: string;
  loc: string;
  desc: string;
  tags: string;
  likes: number;
  shares: number;
  views: string;
  comments: { name: string; text: string; time: string; likes: number; vendor?: boolean }[];
}

export type BookingStatus =
  | 'requested' | 'accepted' | 'deposit_due' | 'confirmed' | 'completed' | 'reviewed'
  | 'declined' | 'expired' | 'lapsed' | 'cancelled';

export interface Payment { label: string; amount: number; due: string; paidAt?: string }

export interface Booking {
  id: string;
  vendorId: number;
  packageId: string;
  date: string;
  total: number;
  note: string;
  status: BookingStatus;
  createdAt: string;
  /** set when the vendor accepts: deadline to pay the deposit (accepted + 30 days) */
  depositDeadline?: string;
  payments: Payment[];
  cancelReason?: string;
}

export interface MajlisEvent {
  name: string;
  type: string;
  date: string;
  /** optional second day, e.g. akad then sanding */
  date2?: string;
  place: string;
  pax: number;
  budget: number;
  split: Partial<Record<CategoryId, number>>;
  /** vendors picked from the suggested package (not booked yet) */
  shortlist: Partial<Record<CategoryId, number>>;
  cats: CategoryId[];
  /** own checklist items, e.g. door gifts (C-3.3) */
  custom?: { id: string; text: string; note: string; done: boolean }[];
}

export interface Invitation {
  template: 'songket' | 'krim' | 'moden' | 'emas';
  bride: string;
  groom: string;
  parents: string;
  date: string;
  time: string;
  venue: string;
  mapUrl: string;
  ayat: string;
  aturcara: { time: string; item: string }[];
  rsvpClose: string;
  /** number of guests invited, for the "Belum jawab" count */
  invited: number;
  photo?: string;
  accent?: 'hijau' | 'emas' | 'malam';
}

export interface Rsvp { id: string; name: string; phone: string; attending: boolean; count: number; message: string; at: string }

export interface TabungEntry { id: string; amount: number; note: string; at: string }

export interface ChatMsg { me: boolean; text?: string; photo?: string; time: string; failed?: boolean }

/* ---------- Wave 2: vendor + admin ---------- */
export type ListingStatus = 'draft' | 'submitted' | 'verified' | 'rejected';

/** a booking request from another customer (the demo customer's own bookings live in AppState.bookings) */
export interface VendorBooking extends Booking { customer: string; phone: string; pax: number; place: string }

export interface VendorVideo {
  id: number; title: string; loc: string; desc: string; tags: string; poster: string;
  status: 'processing' | 'live' | 'review' | 'removed'; reason?: string;
  views: number; likes: number; comments: number; profileTaps: number; enquiries: number; pinned?: boolean; packageId?: string;
}

/** vendor onboarding / verification application (V-1.x, A-2.x) */
export interface Application {
  id: string; business: string; cats: CategoryId[]; freelancer: boolean; ssm: string; ic: string; contact: string; phone: string;
  area: string; radiusKm: number; nationwide: boolean;
  docs: { kind: 'ssm' | 'ic-depan' | 'ic-belakang' | 'halal'; file: string; expiry?: string; broken?: boolean }[];
  about: string; packages: { name: string; price: number }[];
  status: ListingStatus; submittedAt: string; rejectReason?: string;
}

export interface ReviewReport { id: string; vendorId: number; review: Review; reason: string; reporter: string; at: string; status: 'open' | 'kept' | 'hidden'; note?: string }
export interface ContentReport { id: string; kind: 'video' | 'comment'; vendorId: number; title: string; text?: string; poster?: string; reasons: Record<string, number>; autoFlag?: string; at: string; status: 'open' | 'approved' | 'removed' | 'warned'; note?: string }
export interface AuditEntry { id: string; at: string; who: string; action: string; target: string; reason?: string }
