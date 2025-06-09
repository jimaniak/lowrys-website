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
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Skills', path: '/skills' },
    { label: 'Projects', path: '/projects' },
    { label: 'Resources', path: '/resources' },
    { label: 'Contact', path: '/contact' },
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-gray-700">
      <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`block py-2 transition duration-300 ${
                isActive ? 'text-blue-400' : 'hover:text-blue-400'
              }`}
              prefetch={true}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;