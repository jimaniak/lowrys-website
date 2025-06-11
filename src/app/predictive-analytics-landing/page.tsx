"use client";

import { useMemo } from "react";
import { Line } from "react-chartjs-2";
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

// Synthetic demo data: historical + forecast
const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];
const actual = [42, 44, 47, 49, 53, 56, 60]; // up to 2024
const forecast = [62, 65, 68]; // 2025-2027

export default function PredictiveAnalyticsLanding() {
  // Combine for chart
  const chartData = useMemo(() => {
    return {
      labels: years,
      datasets: [
        {
          label: "Actual Attrition Events",
          data: [...actual, null, null, null],
          borderColor: "#2563eb",
          backgroundColor: "#2563eb22",
          pointRadius: 4,
          pointBackgroundColor: "#2563eb",
          tension: 0.3,
        },
        {
          label: "Forecasted Attrition Events",
          data: [null, null, null, null, null, null, actual[6], ...forecast],
          borderColor: "#f59e42",
          backgroundColor: "#f59e4222",
          borderDash: [8, 4],
          pointRadius: 4,
          pointBackgroundColor: "#f59e42",
          tension: 0.3,
        },
      ],
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col items-center justify-start">
      {/* Hero Section */}
      <section className="w-full max-w-3xl px-4 pt-12 pb-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">
          Predictive Analytics for Talent Retention
        </h1>
        <p className="text-lg sm:text-2xl text-gray-700 mb-6 font-medium">
          Discover how data-driven forecasting empowers organizations to anticipate workforce trends and make smarter hiring decisions.
        </p>
        <a
          href="#dashboard"
          className="inline-block bg-gradient-to-r from-blue-600 to-orange-400 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
        >
          View Live Dashboard
        </a>
      </section>

      {/* Dashboard Section */}
      <section
        id="dashboard"
        className="w-full max-w-2xl bg-white/90 rounded-3xl shadow-2xl px-6 py-8 mb-10 flex flex-col items-center border border-blue-100"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-2">Attrition Forecast Dashboard</h2>
        <p className="mb-4 text-gray-600 text-base sm:text-lg">
          This dashboard visualizes historical attrition events and projects future trends using predictive analytics. The forecast (orange) helps leaders proactively address retention challenges.
        </p>
        <div className="w-full" style={{ maxWidth: 600 }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: false },
                tooltip: { mode: "index", intersect: false },
              },
              scales: {
                x: {
                  grid: { display: false },
                  title: { display: true, text: "Year" },
                },
                y: {
                  grid: { color: "#e0e7ef" },
                  title: { display: true, text: "Attrition Events" },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </section>

      {/* Explanation & Explore More */}
      <section className="w-full max-w-2xl px-4 pb-12 text-center">
        <p className="text-gray-700 text-base sm:text-lg mb-6">
          Predictive analytics leverages historical data to forecast future outcomes, enabling organizations to take proactive, data-driven action. This demo uses a simple linear regression for illustration. For more robust business scenarios, advanced models and additional data sources can further improve accuracy.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/projects"
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-6 py-2 rounded-full shadow"
          >
            Explore More Projects
          </a>
          <a
            href="/skills"
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-semibold px-6 py-2 rounded-full shadow"
          >
            View Data Skills
          </a>
          <a
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-full shadow"
          >
            Return to Home
          </a>
        </div>
      </section>
    </main>
  );
}
