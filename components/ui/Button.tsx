// simri-app/components/ui/Button.tsx
'use client';

import { LucideProps } from 'lucide-react';
import React, { ComponentType, ReactNode } from 'react';
import IconWrapper from './IconWrapper'; // Assuming IconWrapper is in the same directory or path is adjusted

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  icon?: ComponentType<LucideProps>;
  iconClassName?: string;
  as?: 'button' | 'a'; // To allow rendering as a link styled as a button
}

const Button: React.FC<ButtonProps> = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  iconClassName = "w-4 h-4",
  type = "button",
  as = 'button',
  ...props
}, ref) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 shadow-none hover:shadow-none"
  };

  const combinedClassName = `${baseStyle} ${variants[variant]} ${className}`;

  if (as === 'a') {
    return (
      <a
        // @ts-ignore
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={combinedClassName}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} // Cast props for anchor
      >
        {Icon && <IconWrapper icon={Icon} className={iconClassName} />}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      // @ts-ignore
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={combinedClassName}
      {...props} // props already match ButtonHTMLAttributes
    >
      {Icon && <IconWrapper icon={Icon} className={iconClassName} />}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
