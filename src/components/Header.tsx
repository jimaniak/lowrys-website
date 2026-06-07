// src/components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaBars, FaTimes } from 'react-icons/fa';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/MobileNavigation';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-40">
      <div className="page-container py-3 sm:py-4 flex justify-between items-center gap-3">
        <Link href="/" className="flex items-center min-w-0 flex-1 md:flex-initial gap-2 sm:gap-3">
          <Image
            src="/favicon/favicon-32x32.png"
            alt="Jim Lowry"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="font-bold leading-tight min-w-0">
            <span className="block text-base sm:text-lg md:hidden truncate">Jim Lowry</span>
            <span className="hidden md:block text-xl lg:text-2xl">Jim Lowry · AI Product Engineer</span>
          </span>
        </Link>

        <Navigation />

        <button
          type="button"
          className="md:hidden shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700 transition"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

export default Header;
