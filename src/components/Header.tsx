// src/components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image'; // Add this import
import { FaBars, FaTimes } from 'react-icons/fa';
import Navigation from './Navigation';
import MobileNavigation from './MobileNavigation';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo/Name with Icon */}
        <Link href="/" className="text-2xl font-bold flex items-center">
          <Image 
            src="/favicon/favicon-32x32.png" 
            alt="JL Logo" 
            width={32} 
            height={32} 
            className="mr-2" 
          />
          Jim Lowry
        </Link>

        {/* Desktop Navigation */}
        <Navigation />

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

export default Header;
