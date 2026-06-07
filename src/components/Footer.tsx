import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="page-container text-center">
        <p>© {new Date().getFullYear()} Jim Lowry. All rights reserved.</p>
        <p className="mt-2 text-sm text-gray-400">
          AI-Native Product Engineer · High Ridge, MO · Remote US
        </p>
        <p className="mt-4 text-sm text-gray-400">
          Small business looking for web or AI services?{' '}
          <a
            href="https://ezweb.work"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Visit EZ Web →
          </a>
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/projects" className="text-gray-400 hover:text-white transition">
            Projects
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white transition">
            Contact
          </Link>
          <a
            href="https://www.linkedin.com/in/jimsitsecurity"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/jimaniak"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
