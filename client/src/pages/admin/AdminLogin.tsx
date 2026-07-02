import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';
import { AuthShell } from '../auth/AuthShell';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter the password'),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setError(null);
    try {
      await adminLogin(v.email, v.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <AuthShell title="Staff access." sub="Admin sign-in for the PULSE team.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {error && (
          <p className="rounded-xl bg-ember/10 border border-ember/40 px-4 py-2.5 text-ember text-sm font-mono">
            {error}
          </p>
        )}
        <Input label="Email" id="email" type="email" placeholder="admin@pulsestudio.app" error={errors.email?.message} {...register('email')} />
        <Input label="Password" id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
        <button type="submit" className="btn-volt w-full" disabled={isSubmitting}>
          <Lock size={15} /> {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
