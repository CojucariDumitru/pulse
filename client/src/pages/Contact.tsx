import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Input, Textarea } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { sendContact } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { SITE } from '../lib/site';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(2, 'Add a subject'),
  message: z.string().min(5, 'Say a little more'),
});

type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: sendContact,
    onSuccess: () => {
      toast('Message sent — we’ll get back to you fast.', 'success');
      reset();
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <div className="pt-32 pb-28 min-h-screen bg-grid">
      <div className="mx-auto max-w-5xl px-6">
        <p className="label text-volt mb-5">Say hello</p>
        <h1 className="display text-6xl md:text-8xl mb-14">
          Talk to us<span className="text-volt">.</span>
        </h1>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="card p-6 md:p-8 space-y-5" noValidate>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Name" required id="name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
              <Input label="Email" required id="email" type="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
            </div>
            <Input label="Subject" required id="subject" placeholder="What's this about?" error={errors.subject?.message} {...register('subject')} />
            <Textarea label="Message" required id="message" className="min-h-[150px]" error={errors.message?.message} {...register('message')} />
            <button type="submit" className="btn-volt w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : 'Send message'}
            </button>
          </form>

          <div className="space-y-7">
            {[
              { icon: Phone, label: 'Phone', value: SITE.phone, href: SITE.phoneHref },
              { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
              { icon: MapPin, label: 'Studio', value: SITE.address.full },
            ].map((row) => (
              <div key={row.label} className="flex gap-4">
                <row.icon className="text-volt shrink-0 mt-1" size={20} />
                <div>
                  <p className="label text-ash/60 mb-1">{row.label}</p>
                  {row.href ? (
                    <a href={row.href} className="text-bone hover:text-volt">
                      {row.value}
                    </a>
                  ) : (
                    <p className="text-bone">{row.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="card p-5 border-volt/30">
              <p className="font-display font-bold text-lg text-volt">First class free</p>
              <p className="text-ash text-sm mt-1">
                Mention this message when you come by — your first ride's on us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
