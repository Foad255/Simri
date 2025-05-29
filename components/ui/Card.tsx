// simri-app/components/ui/Card.tsx
import React, { ReactNode } from 'react';


interface CardProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const Card: React.FC<CardProps> = ({ children, className = '', as: Component = 'div' }) => (
  <Component className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
    {children}
  </Component>
);

export default Card;
