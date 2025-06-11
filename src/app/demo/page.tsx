// src/app/demo/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import dynamic from 'next/dynamic';

// Dynamically import react-globe.gl to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Helper: interpolate color between blue (decrease), white (same), red (increase)
function getTrendColor(pct: number) {
  // pct: percent change, negative = decrease, 0 = same, positive = increase
  if (isNaN(pct)) return '#cccccc';
  if (pct === 0) return '#ffffff';
  if (pct < 0) {
    // Blue for decrease, interpolate from white to blue
    const intensity = Math.min(Math.abs(pct) / 100, 1);
    return `rgb(${255 - 155 * intensity},${255 - 255 * intensity},255)`;
  } else {
    // Red for increase, interpolate from white to red
    const intensity = Math.min(pct / 100, 1);
    return `rgb(255,${255 - 155 * intensity},${255 - 155 * intensity})`;
  }
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Helper to parse CSV
function parseCSV(text: string) {
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const keys = header.split(',');
  return rows.map(row => {
    const values = row.split(',');
    const obj: any = {};
    keys.forEach((k, i) => {
      obj[k] = isNaN(Number(values[i])) ? values[i] : Number(values[i]);
    });
    return obj;
  });
}

// Dynamically generate yesterday's date in YYYY-MM-DD format for NASA imagery (to avoid blank images)
const today = new Date();
today.setDate(today.getDate() - 1); // Go back one day
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const NASA_DATE = `${yyyy}-${mm}-${dd}`;
const NASA_IMAGE_URL = `https://worldview.earthdata.nasa.gov/?v=-180,-90,180,90&l=MODIS_Terra_CorrectedReflectance_TrueColor,Reference_Labels(hidden),Reference_Features(hidden)&t=${NASA_DATE}T00:00:00Z`;

export default function AnalyticsDemo() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('All');
  const [disasterType, setDisasterType] = useState('All');

  // --- Globe Data Preparation ---
  // Calculate percent change for each region (2024 vs. 2010-2020 avg)
  const regionsList = Array.from(new Set(data.map(d => d["Region"]))).filter(Boolean);
  const regionTrends = regionsList.map(regionName => {
    const regionData = data.filter(d => d["Region"] === regionName);
    const years = Array.from(new Set(regionData.map(d => d["Start Year"])) ).filter(Boolean).map(Number);
    const histYears = years.filter(y => y >= 2010 && y <= 2020);
    const histCounts = histYears.map(y => regionData.filter(d => Number(d["Start Year"]) === y).length);
    const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
    const y2024 = regionData.filter(d => Number(d["Start Year"]) === 2024).length;
    const pctChange = histAvg > 0 ? ((y2024 - histAvg) / histAvg) * 100 : 0;
    return {
      region: regionName,
      pctChange,
      color: getTrendColor(pctChange)
    };
  });

  // Map region names to rough lat/lon for demo (should be improved for production)
  const regionCoords: Record<string, { lat: number, lng: number }> = {
    'Africa': { lat: 5, lng: 20 },
    'Americas': { lat: 15, lng: -75 },
    'Asia': { lat: 30, lng: 100 },
    'Europe': { lat: 55, lng: 15 },
    'Oceania': { lat: -25, lng: 135 },
    // Add more as needed
  };


  const globePoints = regionTrends
    .filter(r => regionCoords[r.region])
    .map(r => ({
      lat: regionCoords[r.region].lat,
      lng: regionCoords[r.region].lng,
      size: 1.2,
      color: r.color,
      region: r.region,
      pctChange: r.pctChange
    }));

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/data/disasters.csv');
        const text = await res.text();
        setData(parseCSV(text));
      } catch (e) {
        setError('Failed to load disaster data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get unique regions and disaster types (match CSV column names)
  const regions = Array.from(new Set(data.map(d => d["Region"])) ).filter(Boolean);
  const disasterTypes = Array.from(new Set(data.map(d => d["Disaster Type"])) ).filter(Boolean);

  // Filtered data
  let filtered = data;
  if (region !== 'All') filtered = filtered.filter(d => d["Region"] === region);
  if (disasterType !== 'All') filtered = filtered.filter(d => d["Disaster Type"] === disasterType);

  // Group by Start Year (count events per year)
  const years = Array.from(new Set(filtered.map(d => d["Start Year"])) ).filter(Boolean).map(Number).sort((a, b) => a - b);
  const eventsByYear = years.map(y => filtered.filter(d => Number(d["Start Year"]) === y).length);

  // Calculate historical average (2010-2020) and compare to 2024
  const histYears = years.filter(y => y >= 2010 && y <= 2020);
  const histIndices = histYears.map(y => years.indexOf(y)).filter(i => i !== -1);
  const histAvg = histIndices.length > 0 ?
    histIndices.reduce((sum, i) => sum + eventsByYear[i], 0) / histIndices.length : 0;
  const y2024Idx = years.indexOf(2024);
  const y2024 = y2024Idx !== -1 ? eventsByYear[y2024Idx] : null;

  let wowInsight = '';
  if (y2024 !== null && histAvg > 0) {
    const pct = ((y2024 - histAvg) / histAvg) * 100;
    wowInsight = `In 2024, the number of events${region !== 'All' ? ' in ' + region : ''}${disasterType !== 'All' ? ' (' + disasterType + ')' : ''} was ${pct > 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(1)}% compared to the 2010-2020 average.`;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 text-blue-700">Global Disaster Analytics Demo</h1>
        <p className="mb-6 text-lg text-gray-700">
          Explore global natural disaster trends by region and type, using real EM-DAT-style data. Compare recent years to historical averages and see how the world is changing.
        </p>
        <div className="flex flex-wrap gap-4 mb-6">
          <label>
            <span className="font-semibold mr-2">Region:</span>
            <select value={region} onChange={e => setRegion(e.target.value)} className="border rounded px-2 py-1">
          <option value="All">All</option>
          {regions.map((r, idx) => (
            <option key={r || idx} value={r}>{r}</option>
          ))}
            </select>
          </label>
          <label>
            <span className="font-semibold mr-2">Disaster Type:</span>
            <select value={disasterType} onChange={e => setDisasterType(e.target.value)} className="border rounded px-2 py-1">
              <option value="All">All</option>
              {disasterTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        {loading && <div className="text-blue-600">Loading data...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && years.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <Bar
              data={{
                labels: years,
                datasets: [
                  {
                    label: 'Number of Events',
                    data: eventsByYear,
                    backgroundColor: 'rgba(37, 99, 235, 0.6)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Disaster Events by Year' },
                },
              }}
            />
            {wowInsight && <div className="mt-4 text-blue-700 font-semibold">{wowInsight}</div>}
          </div>
        )}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-2">Regional Trends Globe</h2>
          <p className="mb-2 text-gray-700">Regions are color-coded by disaster trend (2024 vs. 2010–2020 avg): <span style={{color:'#1976d2'}}>blue</span> = decrease, <span style={{color:'#aaa'}}>white</span> = same, <span style={{color:'#d32f2f'}}>red</span> = increase.</p>
          <div style={{ width: '100%', height: 400 }}>
            {globePoints.length > 0 && !loading && !error ? (
              <Globe
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                pointsData={globePoints}
                pointLat="lat"
                pointLng="lng"
                pointColor="color"
                pointAltitude="size"
                pointLabel={(d: any) => `${d['region']}: ${d['pctChange'] > 0 ? '+' : ''}${d['pctChange'].toFixed(1)}%`}
                width={600}
                height={400}
              />
            ) : (
              <div className="text-gray-500 text-center pt-20">No regional data to display.</div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-2">Satellite Imagery Example</h2>
          <p className="mb-2 text-gray-700">See real NASA Worldview imagery for June 2024. For more, visit <a href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">NASA Worldview</a>.</p>
          <a href={NASA_IMAGE_URL} target="_blank" rel="noopener noreferrer">
            <img
              src={`https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&SRS=EPSG:4326&BBOX=-180,-90,180,90&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&CRS=EPSG:4326&WRAP=DAY&FORMAT=image%2Fjpeg&WIDTH=600&HEIGHT=300&DATE=${NASA_DATE}`}
              alt={`NASA Worldview ${NASA_DATE}`}
              className="rounded shadow-md w-full max-w-lg mx-auto"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
