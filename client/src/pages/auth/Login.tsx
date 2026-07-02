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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setError(null);
    try {
      await login(v.email, v.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <AuthShell title="Welcome back." sub="Sign in to book classes and see your schedule.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && (
          <p className="rounded-xl bg-ember/10 border border-ember/40 px-4 py-2.5 text-ember text-sm font-mono">
            {error}
          </p>
        )}
        <Input label="Email" id="email" type="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <button type="submit" className="btn-volt w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-ash">
          New here?{' '}
          <Link to="/register" className="text-volt hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-center font-mono text-[11px] text-ash/50">
          Demo: demo@pulsestudio.app / Pulse2024!
        </p>
      </form>
    </AuthShell>
  );
}
