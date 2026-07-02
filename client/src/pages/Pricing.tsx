import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
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
        window.location.href = r.url; // Stripe hosted checkout
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
    <div className="pt-28 pb-24 min-h-screen bg-ink bg-grid">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center mb-14">
          <p className="label text-volt mb-3">Memberships</p>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl">Pick your pace.</h1>
          <p className="text-ash mt-4 max-w-xl mx-auto">
            Every plan includes all four class formats, the member dashboard, and booking from
            your phone. Cancel or pause anytime.
          </p>
          {data && !data.stripeConfigured && (
            <p className="mt-4 inline-block font-mono text-[11px] text-volt/80 border border-volt/30 rounded-full px-4 py-1.5">
              Portfolio demo — checkout activates instantly, no card required
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(data?.plans ?? []).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`card p-7 flex flex-col ${p.featured ? 'border-volt shadow-volt-sm md:-translate-y-3' : ''}`}
            >
              {p.featured && (
                <p className="label text-volt mb-3 flex items-center gap-1.5">
                  <Zap size={12} /> Most popular
                </p>
              )}
              <h2 className="font-display font-extrabold text-2xl">{p.name}</h2>
              <p className="text-ash text-sm mt-1">{p.tagline}</p>
              <div className="mt-5 mb-6">
                <span className="font-display font-extrabold text-6xl">${p.price}</span>
                <span className="text-ash font-mono text-sm">{p.cadence}</span>
              </div>
              <ul className="space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-bone/90">
                    <Check size={16} className="text-volt shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => pick(p.id)}
                disabled={checkout.isPending || activePlan === p.id}
                className={`mt-7 w-full ${p.featured ? 'btn-volt' : 'btn-ghost'}`}
              >
                {activePlan === p.id
                  ? 'Your current plan'
                  : checkout.isPending
                    ? 'One sec…'
                    : `Choose ${p.name}`}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
