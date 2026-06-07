'use client';

import Link from 'next/link';
import ResumeAccessButton from '@/components/ResumeAccessButton';

export default function HomeHeroActions() {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full max-w-lg md:max-w-none">
      <Link href="/projects" className="btn-touch-full bg-blue-600 hover:bg-blue-700 text-white font-medium">
        View Projects
      </Link>
      <Link href="/contact" className="btn-touch-full bg-white text-gray-900 hover:bg-gray-100 font-medium">
        Request Resume
      </Link>
      <ResumeAccessButton variant="light" label="Have a Code?" className="btn-touch-full w-full sm:w-auto justify-center" />
    </div>
  );
}
