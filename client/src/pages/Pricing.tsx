import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fetchPlans, checkoutPlan } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { MembershipPlanId } from '../lib/types';

export default function Pricing() {
  const { data } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });
  const { isAuthenticated, member, refresh } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkout = useMutation({
    mutationFn: (plan: MembershipPlanId) => checkoutPlan(plan),
    onSuccess: async (r) => {
      if (r.demo && r.activated) {
        await refresh();
        toast('Membership active — demo mode, no card charged. Go book a class!', 'success');
        navigate('/schedule');
      } else if (r.url) {
        window.location.href = r.url;
      }
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const pick = (plan: MembershipPlanId) => {
    if (!isAuthenticated) {
      toast('Create an account first — takes 20 seconds.', 'info');
      navigate('/register', { state: { plan } });
      return;
    }
    checkout.mutate(plan);
  };

  const activePlan =
    member?.membership && ['ACTIVE', 'TRIALING'].includes(member.membership.status)
      ? member.membership.plan
      : null;

  return (
    <div className="pt-32 pb-28 min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <p className="label text-volt mb-5">Memberships</p>
        <h1 className="display text-6xl md:text-8xl mb-6">
          Pick your
          <br />
          pace<span className="text-volt">.</span>
        </h1>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <p className="text-ash max-w-md leading-relaxed">
            Every plan includes all four formats, mobile booking and the member dashboard. Cancel
            or pause anytime.
          </p>
          {data && !data.stripeConfigured && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80 border border-volt/25 px-4 py-2 self-start md:self-auto">
              Portfolio demo — checkout activates instantly, no card
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 border hairline divide-y md:divide-y-0 md:divide-x divide-white/10">
          {(data?.plans ?? []).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`relative flex flex-col p-8 md:p-10 ${p.featured ? 'bg-white/[0.03]' : ''}`}
            >
              {p.featured && <span className="absolute top-0 left-0 right-0 h-[2px] bg-volt" />}

              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h2 className="display text-3xl md:text-4xl">{p.name}</h2>
                {p.featured && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink bg-volt px-2 py-1">
                    Popular
                  </span>
                )}
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ash">{p.tagline}</p>

              <div className="mt-10 mb-10">
                <span className="display text-7xl">${p.price}</span>
                <span className="font-mono text-xs text-ash ml-2">{p.cadence}</span>
              </div>

              <ul className="space-y-3.5 flex-1 border-t hairline pt-8">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm text-bone/85">
                    <Check size={15} className="text-volt shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => pick(p.id)}
                disabled={checkout.isPending || activePlan === p.id}
                className={`mt-10 w-full ${p.featured ? 'btn-volt' : 'btn-line'}`}
              >
                {activePlan === p.id ? 'Current plan' : checkout.isPending ? '···' : `Choose ${p.name}`}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
