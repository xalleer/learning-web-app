import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

export function Button({
  className,
  children,
  loading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('rounded-lg border border-border bg-bg-surface', className)}>{children}</div>;
}

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary', className)}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-bg-elevated', className)}>
      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-36 w-full resize-y rounded-md border border-border bg-bg-primary px-3 py-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent',
        props.className,
      )}
    />
  );
}
