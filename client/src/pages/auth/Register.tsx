import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';
import { AuthShell } from './AuthShell';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  // If the user came from Pricing with a plan in mind, send them back there.
  const intendedPlan = (location.state as { plan?: string })?.plan;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setError(null);
    try {
      await doRegister(v);
      navigate(intendedPlan ? '/pricing' : '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create your account'));
    }
  };

  return (
    <AuthShell title="Join PULSE." sub="One account for booking, memberships and your program.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && (
          <p className="rounded-xl bg-ember/10 border border-ember/40 px-4 py-2.5 text-ember text-sm font-mono">
            {error}
          </p>
        )}
        <Input label="Name" id="name" placeholder="Jordan Lee" error={errors.name?.message} {...register('name')} />
        <Input label="Email" id="email" type="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" id="password" type="password" placeholder="8+ characters" error={errors.password?.message} {...register('password')} />
        <button type="submit" className="btn-volt w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-ash">
          Already a member?{' '}
          <Link to="/login" className="text-volt hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
