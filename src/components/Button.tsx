import Link from 'next/link';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode, Ref } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'text';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  text: 'btn-text',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  variant = 'primary',
  icon,
  className = '',
  children,
  type = 'button',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      {...rest}
    >
      {icon ? <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

type LinkButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  variant?: ButtonVariant;
  icon?: ReactNode;
};

export function LinkButton({
  href,
  variant = 'primary',
  icon,
  className = '',
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link href={href} className={`${VARIANT_CLASS[variant]} ${className}`.trim()} {...rest}>
      {icon ? <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
