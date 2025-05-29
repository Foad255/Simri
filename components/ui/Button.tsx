'use client';

import { LucideProps } from 'lucide-react';
import React, { ComponentType, useEffect, useState } from 'react';
import IconWrapper from './IconWrapper';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface BaseProps {
  variant?: ButtonVariant;
  icon?: ComponentType<LucideProps>;
  iconClassName?: string;
  className?: string;

}

interface ButtonAsButtonProps extends BaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button'; // default
}

interface ButtonAsAnchorProps extends BaseProps, React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as: 'a';
  href: string; // href required when rendered as <a>
}

type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    children,
    variant = 'primary',
    className = '',
    icon: Icon,
    iconClassName = 'w-4 h-4',
    as = 'button',
    ...restProps
  } = props;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const baseStyle =
    'px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 shadow-none hover:shadow-none',
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`.trim();

  const buttonProps = restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonProps.type || 'button'}
      className={combinedClassName}
      {...buttonProps}
    >
      {Icon && <IconWrapper icon={Icon} className={iconClassName} />}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
