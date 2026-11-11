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
  place: string;
  pax: number;
  budget: number;
  split: Partial<Record<CategoryId, number>>;
  /** vendors picked from the suggested package (not booked yet) */
  shortlist: Partial<Record<CategoryId, number>>;
  cats: CategoryId[];
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
}

export interface Rsvp { id: string; name: string; phone: string; attending: boolean; count: number; message: string; at: string }

export interface TabungEntry { id: string; amount: number; note: string; at: string }

export interface ChatMsg { me: boolean; text?: string; photo?: string; time: string; failed?: boolean }
