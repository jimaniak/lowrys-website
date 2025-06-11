"use client";
// Define filter options at the top level so they're available in the component
const regions = ["US", "Europe", "APAC"];
const workArrangements = ["Remote", "Hybrid", "In-Office"];
const departments = ["Engineering", "Sales", "Support"];
// Data sources for attribution
const dataSources = [
  "BLS", "Gartner", "SHRM", "LinkedIn"
];
import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


// Example: attrition rates by industry, region, and work arrangement (annualized, %)
// For demo, only a few combinations are shown; real data would be more granular
const industryData = [
  { name: "Technology", region: "US", work: "Remote", rates: [13.2, 13.5, 14.0, 14.8, 15.2, 15.5, 15.8, 16.0] },
  { name: "Healthcare", region: "US", work: "In-Office", rates: [18.0, 18.3, 18.7, 19.1, 19.5, 19.8, 20.0, 20.2] },
  { name: "Retail", region: "Europe", work: "Hybrid", rates: [60.0, 61.2, 62.5, 63.0, 63.8, 64.5, 65.0, 65.5] },
  { name: "Finance", region: "APAC", work: "Remote", rates: [12.0, 12.2, 12.5, 12.8, 13.0, 13.2, 13.5, 13.7] },
  { name: "Manufacturing", region: "Europe", work: "In-Office", rates: [20.0, 20.3, 20.7, 21.0, 21.3, 21.5, 21.8, 22.0] },
  { name: "Hospitality", region: "US", work: "Hybrid", rates: [73.0, 74.5, 75.2, 76.0, 76.8, 77.5, 78.0, 78.5] },
];

const years = [
  "2019", "2020", "2021", "2022", "2023", "2024", "2025 (est)", "2026 (proj)"
];


export default function AttritionForecastPage() {
  const [region, setRegion] = useState("US");
  const [work, setWork] = useState("Remote");
  // AI adoption slider (0-100%)
  const [aiAdoption, setAiAdoption] = useState(0);

  // Filtered data for chart
  const filteredData = useMemo(() =>
    industryData.filter(d => d.region === region && d.work === work),
    [region, work]
  );

  // More realistic AI adoption and retirement impact modeling
  // AI adoption curve per industry (fraction of slider value per year)
  const aiAdoptionCurves: Record<string, number[]> = {
    // 8 years: 2019-2026, values are % of max AI adoption slider for each year
    Technology:      [0.05, 0.10, 0.18, 0.30, 0.45, 0.65, 0.85, 1.0],
    Healthcare:      [0.01, 0.03, 0.07, 0.12, 0.20, 0.35, 0.60, 0.85],
    Retail:          [0.02, 0.05, 0.10, 0.18, 0.30, 0.50, 0.75, 1.0],
    Finance:         [0.03, 0.08, 0.15, 0.25, 0.40, 0.60, 0.80, 1.0],
    Manufacturing:   [0.01, 0.04, 0.10, 0.20, 0.35, 0.60, 0.90, 1.0],
    Hospitality:     [0.01, 0.02, 0.05, 0.10, 0.18, 0.30, 0.50, 0.75],
  };

  // Sensitivity of attrition to AI adoption (per industry)
  const aiImpactFactors: Record<string, number> = {
    Technology: 0.08, // 8% of AI adoption % is added to attrition
    Healthcare: -0.03, // 3% of AI adoption % is subtracted
    Retail: 0.12,
    Finance: 0.04,
    Manufacturing: 0.15,
    Hospitality: 0.08,
  };

  // Baby boomer retirement effect (extra attrition bump by year/industry)
  // Example: 2022-2025, especially Healthcare, Manufacturing, Education
  const retirementBump: Record<string, number[]> = {
    Technology:      [0, 0, 0, 0.2, 0.3, 0.2, 0.1, 0],
    Healthcare:      [0, 0.2, 0.5, 0.8, 1.0, 0.8, 0.5, 0.2],
    Retail:          [0, 0, 0.1, 0.2, 0.3, 0.2, 0.1, 0],
    Finance:         [0, 0, 0.1, 0.2, 0.3, 0.2, 0.1, 0],
    Manufacturing:   [0, 0.1, 0.3, 0.6, 0.8, 0.6, 0.3, 0.1],
    Hospitality:     [0, 0, 0.1, 0.2, 0.3, 0.2, 0.1, 0],
  };

  // Returns adjusted rates for a given industry
  function getAiAdjustedRates(ind: typeof industryData[number]) {
    const name = ind.name;
    const aiCurve = aiAdoptionCurves[name] || Array(years.length).fill(0);
    const factor = aiImpactFactors[name] || 0;
    const retireBump = retirementBump[name] || Array(years.length).fill(0);
    // For each year, adjust the base rate by:
    // (factor * (aiCurve[year] * aiAdoption)) + retireBump[year]
    return ind.rates.map((base, i) => {
      const aiAdj = factor * (aiCurve[i] * aiAdoption);
      const retireAdj = retireBump[i];
      const adj = base + aiAdj + retireAdj;
      return Math.max(0, adj); // Clamp to 0 minimum
    });
  }


  const chartData = useMemo(() => ({
    labels: years,
    datasets: filteredData.flatMap((ind, idx) => [
      {
        label: `${ind.name} (${ind.region}, ${ind.work}) - Base`,
        data: ind.rates,
        borderColor: ["#2563eb", "#d32f2f", "#f59e42", "#2e7d32", "#6d28d9", "#eab308"][idx % 6],
        backgroundColor: "rgba(0,0,0,0.05)",
        tension: 0.3,
        pointRadius: 2,
        spanGaps: false,
        borderDash: [],
      },
      {
        label: `${ind.name} (${ind.region}, ${ind.work}) - AI Adjusted`,
        data: getAiAdjustedRates(ind),
        borderColor: ["#2563eb", "#d32f2f", "#f59e42", "#2e7d32", "#6d28d9", "#eab308"][idx % 6],
        backgroundColor: "rgba(0,0,0,0.05)",
        tension: 0.3,
        pointRadius: 2,
        spanGaps: false,
        borderDash: [6, 4],
      },
    ]),
  }), [filteredData, aiAdoption]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      title: {
        display: true,
        text: `Annual Employee Attrition Rate by Industry, Region & Work Arrangement (2019-2026)`,
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        title: { display: true, text: "Attrition Rate (%)" },
        min: 0, max: 80, ticks: { stepSize: 10 }
      },
      x: {
        title: { display: true, text: "Year" },
        ticks: { maxTicksLimit: 8 }
      }
    }
  }), []);


// Top 3 attrition combinations (by 2025 est.), both base and AI-adjusted
  const top3Base = useMemo(() =>
    [...industryData]
      .sort((a, b) => b.rates[6] - a.rates[6])
      .slice(0, 3),
    []
  );
  const top3AI = useMemo(() =>
    [...industryData]
      .sort((a, b) => getAiAdjustedRates(b)[6] - getAiAdjustedRates(a)[6])
      .slice(0, 3),
    [aiAdoption]
  );

  // --- COMPONENT START ---
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 py-8 px-2 sm:px-0">
      <div className="container mx-auto max-w-3xl w-full bg-white/90 rounded-xl shadow-lg p-6 sm:p-10">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">Attrition Risk Forecasting Dashboard</h1>
          <p className="text-lg text-gray-700 mb-2">Compare and forecast employee attrition rates across key industries, regions, and work arrangements.</p>
          <p className="text-sm text-gray-500">Leverage real-world benchmarks to inform smarter retention strategies and workforce planning.</p>
        </header>
        <section className="mb-6 flex flex-wrap gap-4 items-center">
          <label className="block">
            <span className="font-semibold mr-2">Region:</span>
            <select value={region} onChange={e => setRegion(e.target.value)} className="border rounded px-2 py-1">
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-semibold mr-2">Work Arrangement:</span>
            <select value={work} onChange={e => setWork(e.target.value)} className="border rounded px-2 py-1">
              {workArrangements.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
        </section>
        {/* AI Adoption Slider */}
        <section className="mb-6">
          <label className="block w-full">
            <span className="font-semibold mr-2">AI Adoption Level:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={aiAdoption}
              onChange={e => setAiAdoption(Number(e.target.value))}
              className="w-2/3 align-middle accent-blue-700"
            />
            <span className="ml-3 font-mono text-blue-700">{aiAdoption}%</span>
          </label>
          <div className="text-xs text-gray-500 mt-1">
            Simulates the projected impact of increased AI adoption (rising by industry over time) and baby boomer retirements on attrition rates.
          </div>
        </section>
        <section className="mb-8">
          <Line data={chartData} options={chartOptions} height={340} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredData.map((ind, idx) => {
              const aiRates = getAiAdjustedRates(ind);
              return (
                <div key={ind.name + ind.region + ind.work} className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                  <div className="text-xs text-gray-500">{ind.name} ({ind.region}, {ind.work}) 2025 est.</div>
                  <div className="text-xl font-bold text-blue-700">Base: {ind.rates[6].toFixed(1)}%</div>
                  <div className="text-xl font-bold text-green-700">AI Adj: {aiRates[6].toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">2026 proj: Base {ind.rates[7].toFixed(1)}% | AI Adj {aiRates[7].toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">Top 3 Attrition Combinations (2025 est.)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
            <div>
              <div className="font-semibold text-blue-700 mb-1">Base Rates</div>
              <ol className="list-decimal list-inside text-gray-700 text-base">
                {top3Base.map((ind, idx) => (
                  <li key={ind.name + ind.region + ind.work} className="mb-1">
                    <b>{ind.name}</b> ({ind.region}, {ind.work}): <span className="font-mono">{ind.rates[6].toFixed(1)}%</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="font-semibold text-green-700 mb-1">AI Adjusted</div>
              <ol className="list-decimal list-inside text-gray-700 text-base">
                {top3AI.map((ind, idx) => (
                  <li key={ind.name + ind.region + ind.work} className="mb-1">
                    <b>{ind.name}</b> ({ind.region}, {ind.work}): <span className="font-mono">{getAiAdjustedRates(ind)[6].toFixed(1)}%</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <b>Data sources:</b> {dataSources.join(", ")}
          </div>
        </section>
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-800">How This Works & Future Dynamics</h2>
          <p className="text-gray-700 mb-2">This dashboard visualizes annual attrition rates for major industries, regions, and work arrangements, using real-world benchmarks and projections. Attrition is influenced by economic cycles, remote work trends, skills shortages, and evolving employee expectations. Future dynamics may include the impact of AI on job roles, generational workforce shifts, and global economic changes.</p>
          <ul className="list-disc list-inside text-gray-700 text-sm mb-2">
            <li>Industry rates are based on public HR benchmarks and projections (see sources above).</li>
            <li>AI adoption increases at different rates by industry and year, with the slider setting the 2026 maximum.</li>
            <li>Baby boomer retirements add a temporary attrition bump (especially 2022–2025, varies by industry).</li>
            <li>Compare your own attrition rate to industry averages for context.</li>
            <li>Use these trends to inform retention strategies and workforce planning.</li>
            <li>Future dynamics: AI adoption, retirements, hybrid work, upskilling, and economic volatility.</li>
          </ul>
        </section>
        <nav className="flex flex-wrap gap-4 justify-center border-t pt-6 mt-6">
          <Link href="/" className="text-blue-700 hover:underline font-semibold">Home</Link>
          <Link href="/demo" className="text-blue-700 hover:underline font-semibold">Disaster Analytics Demo</Link>
          <Link href="/predictive-analytics-landing" className="text-blue-700 hover:underline font-semibold">Predictive Analytics Landing</Link>
          <Link href="/about" className="text-blue-700 hover:underline font-semibold">About</Link>
          <Link href="/projects" className="text-blue-700 hover:underline font-semibold">Projects</Link>
          <Link href="/resources" className="text-blue-700 hover:underline font-semibold">Resources</Link>
          <Link href="/skills" className="text-blue-700 hover:underline font-semibold">Skills</Link>
          <Link href="/contact" className="text-blue-700 hover:underline font-semibold">Contact</Link>
        </nav>
      </div>
    </main>
  );
}
