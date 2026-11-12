import { useState } from 'react';
import { Download, ScrollText } from 'lucide-react';
import { useStore } from '../../store';
import { EmptyState } from '../../components/ui';
import { Btn, Card, PageHead, SearchBox, Select, T, Table } from './kit';
import { downloadCsv } from './logic';

/** audit log: every admin decision, newest first (RBAC: logged) */
export default function AuditLog() {
  const { s } = useStore();
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  // stable newest-first: by timestamp, later entries win ties
  const all = s.audit.map((e, i) => ({ e, i })).sort((a, b) => b.e.at.localeCompare(a.e.at) || b.i - a.i).map(x => x.e);
  const ql = q.toLowerCase();
  const rows = all.filter(e => (!action || e.action === action) && (!q || [e.target, e.who, e.reason ?? ''].some(x => x.toLowerCase().includes(ql))));
  const actions = [...new Set(all.map(e => e.action))].sort();
  return (
    <>
      <PageHead title="Log audit" sub="Setiap keputusan admin direkodkan dan tidak boleh diubah."
        right={<Btn v="secondary" onClick={() => downloadCsv(`log-audit-${new Date().toISOString().slice(0, 10)}.csv`, [['ID', 'Masa', 'Admin', 'Tindakan', 'Sasaran', 'Sebab'], ...rows.map(e => [e.id, e.at, e.who, e.action, e.target, e.reason])])}>
          <Download className="w-4 h-4 shrink-0" />Eksport CSV</Btn>} />
      <div className="w-full flex flex-row items-center justify-between gap-3">
        <SearchBox label="Cari sasaran, admin atau sebab" value={q} onChange={setQ} />
        <Select label="Tindakan" value={action} onChange={setAction} options={[['', 'Semua tindakan'], ...actions.map(a => [a, a] as [string, string])]} />
      </div>
      {rows.length === 0 ? <Card><EmptyState icon={<ScrollText className="w-6 h-6 shrink-0" />} title="Tiada rekod sepadan" /></Card> : (
        <Table label="Log audit" rows={rows} k={e => e.id} h="h-[52px]" cols={[
          { h: 'Masa', w: 'w-[150px] shrink-0', c: e => <T>{e.at}</T> },
          { h: 'Admin', w: 'w-[120px] shrink-0', c: e => <T>{e.who}</T> },
          { h: 'Tindakan', w: 'w-[190px] shrink-0', c: e => <T strong>{e.action}</T> },
          { h: 'Sasaran', w: 'flex-1 min-w-0', c: e => <span className="flex-1 min-w-0 truncate" title={e.target}>{e.target}</span> },
          { h: 'Sebab', w: 'flex-1 min-w-0', c: e => <span className="flex-1 min-w-0 truncate text-body" title={e.reason}>{e.reason ?? '—'}</span> },
        ]} />
      )}
    </>
  );
}
