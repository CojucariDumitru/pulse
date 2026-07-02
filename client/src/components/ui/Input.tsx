import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

const fieldBase =
  'w-full rounded-xl bg-ink border border-steel text-bone font-body px-4 py-3 ' +
  'placeholder:text-ash/60 focus:outline-none focus:border-volt transition-colors';

function Label({ label, htmlFor, required }: { label: string; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="label text-ash block mb-2">
      {label} {required && <span className="text-volt">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-ember text-xs font-mono">{message}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, id, className, ...props }, ref) => (
    <div>
      {label && <Label label={label} htmlFor={id} required={required} />}
      <input ref={ref} id={id} className={clsx(fieldBase, error && 'border-ember', className)} {...props} />
      <FieldError message={error} />
    </div>
  ),
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, id, className, children, ...props }, ref) => (
    <div>
      {label && <Label label={label} htmlFor={id} required={required} />}
      <select
        ref={ref}
        id={id}
        className={clsx(fieldBase, 'appearance-none cursor-pointer', error && 'border-ember', className)}
        {...props}
      >
        {children}
      </select>
      <FieldError message={error} />
    </div>
  ),
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, id, className, ...props }, ref) => (
    <div>
      {label && <Label label={label} htmlFor={id} required={required} />}
      <textarea
        ref={ref}
        id={id}
        className={clsx(fieldBase, 'resize-y min-h-[120px]', error && 'border-ember', className)}
        {...props}
      />
      <FieldError message={error} />
    </div>
  ),
);
Textarea.displayName = 'Textarea';
