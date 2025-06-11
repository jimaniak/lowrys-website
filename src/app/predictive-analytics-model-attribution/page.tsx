import Link from "next/link";

export default function PredictiveAnalyticsModelAttributionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 py-8 px-2 sm:px-0">
      <div className="container mx-auto max-w-2xl w-full bg-white/90 rounded-xl shadow-lg p-6 sm:p-10">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">Model Attribution & Methodology Transparency</h1>
          <p className="text-lg text-gray-700 mb-2">How we build credible, original predictive analytics for talent retention and workforce forecasting.</p>
        </header>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Our Approach</h2>
          <p className="text-gray-700 mb-2">
            Our predictive analytics models are based on methodologies and frameworks published by leading workforce analytics organizations, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li>U.S. Bureau of Labor Statistics (BLS)</li>
            <li>Gartner</li>
            <li>SHRM (Society for Human Resource Management)</li>
            <li>LinkedIn Workforce Insights</li>
          </ul>
          <p className="text-gray-700 mb-2">
            All modeling and analysis is performed <b>in-house</b> using our own data and code. No proprietary data or report content is used. Model structures and risk factors are adapted from industry-standard predictive analytics frameworks, ensuring our solutions are both credible and original.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Transparency & Best Practices</h2>
          <p className="text-gray-700 mb-2">
            We are committed to transparency and best practices in predictive analytics. For more information about our modeling approach or to request technical documentation, please contact our team or visit the <Link href="/predictive-analytics-landing" className="text-blue-700 hover:underline font-semibold">Predictive Analytics Landing Page</Link>.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Model Attribution Statement</h2>
          <p className="text-gray-700 mb-2">
            Prediction models are based on methodologies published by leading workforce analytics organizations (e.g., BLS, Gartner, SHRM, LinkedIn). All modeling and analysis is performed in-house using our own data and code. No proprietary data or report content is used.
          </p>
        </section>
        <nav className="flex flex-wrap gap-4 justify-center border-t pt-6 mt-6">
          <Link href="/" className="text-blue-700 hover:underline font-semibold">Home</Link>
          <Link href="/predictive-analytics-landing" className="text-blue-700 hover:underline font-semibold">Predictive Analytics Landing</Link>
          <Link href="/attrition-forecast" className="text-blue-700 hover:underline font-semibold">Attrition Forecast Dashboard</Link>
        </nav>
      </div>
    </main>
  );
}
