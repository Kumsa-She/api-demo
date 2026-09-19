import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'secondary';

type SharedProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

type ButtonLinkProps = SharedProps & {
  to: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

type NativeButtonProps = SharedProps & {
  to?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
};

type ButtonProps = ButtonLinkProps | NativeButtonProps;

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#010409] disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:shadow-blue-500/40',
  secondary:
    'border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const classes =
    `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  // Route link
  if ('to' in props) {
    return (
      <Link className={classes} to={props.to} onClick={props.onClick}>
        {children}
      </Link>
    );
  }

  // Native button
  const { onClick, type, disabled } = props;

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type ?? 'button'}
    >
      {children}
    </button>
  );
}
