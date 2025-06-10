// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Skills', path: '/skills' },
    { label: 'Projects', path: '/projects' },
    { label: 'Resources', path: '/resources' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleClick = (path: string) => {
    console.log('Navigation clicked:', path);
    console.log('Current pathname:', pathname);
  };

  return (
    <nav className="hidden md:flex space-x-8">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => handleClick(item.path)}
            className={`text-sm font-medium transition-colors hover:text-blue-500 ${
              isActive ? 'text-blue-600' : 'text-gray-100'
            }`}
            prefetch={true}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;