// simri-app/components/layout/RootLayoutComponent.tsx
'use client';

import React from 'react';
import Footer from './Footer';
import Header from './Header';

interface RootLayoutComponentProps {
  children: React.ReactNode;
}

const RootLayoutComponent: React.FC<RootLayoutComponentProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans antialiased"> {/* Added antialiased for smoother fonts */}
      <Header />
      {/* Increased vertical padding (py-10) for content area */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 py-8 md:py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayoutComponent;
