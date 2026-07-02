import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { fetchAdminMessages, markMessageRead, deleteMessage } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../components/ui/Toast';

export default function AdminMessages() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['admin-messages'], queryFn: fetchAdminMessages });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-messages'] });
    qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
  };

  const read = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => markMessageRead(id, next),
    onSuccess: invalidate,
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const del = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      invalidate();
      toast('Message deleted.', 'info');
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <div>
      <h1 className="font-display font-extrabold text-4xl mb-8">Messages</h1>

      {isLoading && <div className="card h-28 animate-pulse" />}
      {!isLoading && (data?.length ?? 0) === 0 && <p className="font-mono text-ash">Inbox zero. Nice.</p>}

      <div className="space-y-3">
        {data?.map((m) => (
          <article key={m.id} className={`card p-5 ${m.read ? '' : 'border-volt/50'}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!m.read && <span className="w-2 h-2 rounded-full bg-volt shrink-0" />}
                  <h2 className="font-semibold text-bone">{m.subject}</h2>
                </div>
                <p className="font-mono text-xs text-ash mt-1">
                  {m.name} · {m.email} ·{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(m.createdAt))}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => read.mutate({ id: m.id, next: !m.read })}
                  className="p-2 rounded-full border border-steel text-ash hover:border-volt hover:text-volt transition-colors"
                  title={m.read ? 'Mark unread' : 'Mark read'}
                >
                  {m.read ? <Mail size={14} /> : <MailOpen size={14} />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this message?')) del.mutate(m.id);
                  }}
                  className="p-2 rounded-full border border-steel text-ash hover:border-ember hover:text-ember transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="mt-4 text-ash leading-relaxed whitespace-pre-wrap text-sm">{m.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
