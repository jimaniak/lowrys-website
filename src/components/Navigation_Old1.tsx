// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-400' : 'hover:text-blue-400';
  };

  return (
    <nav className="hidden md:flex space-x-8">
      <Link href="/" className={`transition duration-300 ${isActive('/')}`}>
        Home
      </Link>
      <Link href="/about" className={`transition duration-300 ${isActive('/about')}`}>
        About
      </Link>
      <Link href="/skills" className={`transition duration-300 ${isActive('/skills')}`}>
        Skills
      </Link>
      <Link href="/projects" className={`transition duration-300 ${isActive('/projects')}`}>
        Projects
      </Link>
      <Link
        href="/resources"
        className={`transition duration-300 ${isActive('/resources')}`}
      >
        Resources
      </Link>
      <Link href="/contact" className={`transition duration-300 ${isActive('/contact')}`}>
        Contact
      </Link>
    </nav>
  );
};

export default Navigation;