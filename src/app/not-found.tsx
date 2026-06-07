import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-section">
      <div className="page-container text-center max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-4">Page not found</h1>
        <p className="text-gray-600 mb-8">That project or page doesn&apos;t exist.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
          Back to home
        </Link>
      </div>
    </main>
  );
}
