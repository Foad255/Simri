'use client';

import { Brain, Home, LayoutGrid, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/upload', label: 'Upload', icon: UploadCloud },
  { href: '/explore', label: 'Explore', icon: LayoutGrid },
];

const Icon = ({ icon: IconComponent, className = 'w-5 h-5' }: { icon: React.ElementType, className?: string }) => (
  <IconComponent className={className} aria-hidden="true" />
);

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm sticky top-0 z-50 border-b border-gray-200/60 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group" aria-label="Go to Simri Homepage">
          <Brain className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
          <h1 className="text-2xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
            Simri
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-2 sm:space-x-3">
          {navLinks.map(({ href, label, icon }) => {
            const isActive = href === '/'
              ? pathname === href
              : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}
                `}
              >
                <Icon icon={icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline-block">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
