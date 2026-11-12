import type { Route } from '../../router';
/** Wave 2 admin console (stub, builder fills in) */
export default function AdminApp({ r }: { r: Route }) { return <div className="p-10">Admin {r.path}</div>; }
