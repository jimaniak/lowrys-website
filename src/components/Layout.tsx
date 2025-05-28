'use client';

import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Jim Lowry. All rights reserved.</p>
          <p className="mt-2 text-sm text-gray-400">
            Versatile Professional with Cross-Domain Expertise
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
