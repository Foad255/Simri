// simri-app/components/ui/Card.tsx
import React, { ElementType, ReactNode } from 'react';


interface CardProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

const Card: React.FC<CardProps> = ({ children, className = '', as: Component = 'div' }) => (
  <Component className={`bg-white shadow-lg rounded-xl p-6 ${className}`}>
    {children}
  </Component>
);

export default Card;
