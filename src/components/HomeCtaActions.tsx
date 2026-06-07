'use client';

import Link from 'next/link';
import ResumeAccessButton from '@/components/ResumeAccessButton';

export default function HomeCtaActions() {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto">
      <Link href="/contact" className="btn-touch-full bg-white text-blue-600 hover:bg-gray-100 font-medium">
        Request Resume
      </Link>
      <Link
        href="/projects"
        className="btn-touch-full bg-transparent hover:bg-blue-700 text-white border border-white font-medium"
      >
        View All Projects
      </Link>
      <ResumeAccessButton variant="light" label="Have a Code?" className="btn-touch-full w-full sm:w-auto justify-center" />
    </div>
  );
}
