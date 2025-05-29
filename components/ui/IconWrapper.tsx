// simri-app/components/ui/IconWrapper.tsx
import { LucideProps } from 'lucide-react';
import React from 'react';

interface IconWrapperProps {
  icon: React.ComponentType<LucideProps>; // Correct type for Lucide icons
  className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon: Icon, className = "w-5 h-5" }) => (
  <Icon className={className} />
);

export default IconWrapper;
