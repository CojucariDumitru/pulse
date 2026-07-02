import { useQuery } from '@tanstack/react-query';
import { fetchAdminMembers } from '../../api/endpoints';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-volt',
  TRIALING: 'text-volt',
  PAST_DUE: 'text-ember',
  CANCELED: 'text-ash',
  INACTIVE: 'text-ash',
};

export default function AdminMembers() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-members'], queryFn: fetchAdminMembers });

  return (
    <div>
      <h1 className="font-display font-extrabold text-4xl mb-8">Members</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-steel">
              {['Name', 'Contact', 'Plan', 'Status', 'Bookings', 'Joined'].map((h) => (
                <th key={h} className="label text-ash/60 px-5 py-3.5 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 font-mono text-ash text-sm">
                  Loading…
                </td>
              </tr>
            )}
            {data?.map((m) => (
              <tr key={m.id} className="border-b border-steel/50 last:border-0">
                <td className="px-5 py-4 font-semibold text-bone whitespace-nowrap">{m.name}</td>
                <td className="px-5 py-4 font-mono text-xs text-ash">
                  <div>{m.email}</div>
                  {m.phone && <div>{m.phone}</div>}
                </td>
                <td className="px-5 py-4 font-mono text-xs text-bone">{m.membership?.plan ?? '—'}</td>
                <td className={`px-5 py-4 font-mono text-xs ${STATUS_COLOR[m.membership?.status ?? 'INACTIVE']}`}>
                  {m.membership?.status ?? 'NONE'}
                </td>
                <td className="px-5 py-4 font-mono text-sm text-ash">{m.bookings}</td>
                <td className="px-5 py-4 font-mono text-xs text-ash whitespace-nowrap">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
                    new Date(m.createdAt),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
