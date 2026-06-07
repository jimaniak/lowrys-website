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
    <nav className="md:hidden bg-gray-700 border-t border-gray-600" aria-label="Mobile">
      <div className="page-container py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`block min-h-[44px] flex items-center text-base py-2 transition duration-300 ${
                isActive ? 'text-blue-400 font-medium' : 'text-gray-100 hover:text-blue-400'
              }`}
              prefetch={true}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
