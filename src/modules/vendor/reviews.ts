/**
 * Reviews written in the app (C-5.0).
 * ponytail: kept in their own localStorage key because the store has no reviews field yet;
 * move into AppState (and reset()) when the shared field lands.
 */
export interface UserReview { bookingId: string; vendorId: number; name: string; rating: number; text: string; photos: string[]; at: string }

const KEY = 'majlishub.reviews';
const EVENT = 'majlishub:reviews';

let mem: UserReview[] | null = null;
export const loadReviews = (): UserReview[] => {
  if (mem) return mem;
  try { mem = JSON.parse(localStorage.getItem(KEY) ?? '[]') as UserReview[]; } catch { mem = []; }
  return mem;
};

export const saveReview = (r: UserReview) => {
  const next = [r, ...loadReviews().filter(x => x.bookingId !== r.bookingId)];
  mem = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: review shows until refresh */ }
  window.dispatchEvent(new Event(EVENT));
  return next;
};

export const reviewsChanged = EVENT;
export const clearReviews = () => {
  mem = [];
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(EVENT));
};
