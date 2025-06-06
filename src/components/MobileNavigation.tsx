// src/components/MobileNavigation.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-400' : 'hover:text-blue-400';
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-gray-700">
      <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
        <Link 
          href="/" 
          className={`block py-2 transition duration-300 ${isActive('/')}`}
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          href="/about" 
          className={`block py-2 transition duration-300 ${isActive('/about')}`}
          onClick={onClose}
        >
          About
        </Link>
        <Link 
          href="/skills" 
          className={`block py-2 transition duration-300 ${isActive('/skills')}`}
          onClick={onClose}
        >
          Skills
        </Link>
        <Link 
          href="/projects" 
          className={`block py-2 transition duration-300 ${isActive('/projects')}`}
          onClick={onClose}
        >
          Projects
        </Link>
        <Link 
          href="/resources" 
          className={`block py-2 transition duration-300 ${isActive('/resources')}`}
          onClick={onClose}
        >
          Resources
        </Link>
        <Link 
          href="/contact" 
          className={`block py-2 transition duration-300 ${isActive('/contact')}`}
          onClick={onClose}
        >
          Contact
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;