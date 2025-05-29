// simri-app/app/(main)/layout.tsx
import RootLayoutComponent from '@/components/layout/RootLayoutComponent';
import React from 'react';

export default function MainAppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout applies the Header and Footer via RootLayoutComponent
  // to all pages within the (main) route group.
  return <RootLayoutComponent>{children}</RootLayoutComponent>;
}
