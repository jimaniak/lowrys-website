

// src/app/demo/page.tsx

"use client";

import { useEffect, useState, useMemo } from 'react';
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
    // Blue for decrease, clamp minimum intensity for visibility
    const intensity = Math.max(Math.min(Math.abs(pct) / 100, 1), 0.3); // at least 0.3
    return `rgb(${Math.round(255 - 155 * intensity)},${Math.round(255 - 255 * intensity)},255)`;
  } else {
    // Red for increase, clamp minimum intensity for visibility
    const intensity = Math.max(Math.min(pct / 100, 1), 0.3); // at least 0.3
    return `rgb(255,${Math.round(255 - 155 * intensity)},${Math.round(255 - 155 * intensity)})`;
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
      let v = values[i];
      // Replace null, undefined, or empty with a placeholder
      if (v === undefined || v === null || v === '') {
        v = 'N/A';
      }
      // Try to convert to number if possible, else keep as string
      obj[k] = isNaN(Number(v)) || v === 'N/A' ? v : Number(v);
    });
    return obj;
  });
}



export default function AnalyticsDemo() {
  // --- State and filter hooks (declare all before any useMemo/useEffect that uses them) ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState('All');
  const [disasterGroup, setDisasterGroup] = useState('All');
  const [disasterSubgroup, setDisasterSubgroup] = useState('All');
  const [disasterType, setDisasterType] = useState('All');
  // For region polygons
  const [regionGeoJson, setRegionGeoJson] = useState<any>(null);
  const [geoJsonLoading, setGeoJsonLoading] = useState(true);
  const [geoJsonError, setGeoJsonError] = useState<string | null>(null);
  // Load region GeoJSON for overlays
  useEffect(() => {
    async function fetchGeoJson() {
      setGeoJsonLoading(true);
      setGeoJsonError(null);
      try {
        const res = await fetch('/data/regions.geojson');
        if (!res.ok) throw new Error('Failed to load regions GeoJSON');
        const geo = await res.json();
        setRegionGeoJson(geo);
      } catch (e) {
        setGeoJsonError('Failed to load region overlays.');
      } finally {
        setGeoJsonLoading(false);
      }
    }
    fetchGeoJson();
  }, []);

  // --- Globe Data Preparation ---

  // Memoize country list for performance (all countries in data, not filtered)
  const countriesList = useMemo(() => {
    return Array.from(new Set(data.map(d => d["Country"])) ).filter(Boolean);
  }, [data]);



  // Memoize country trends based on all filters (except region, which is not country-specific)
  const countryTrends = useMemo(() => {
    // Apply all filters except region (since overlays are country-based)
    let filteredData = data;
    if (disasterGroup !== 'All') filteredData = filteredData.filter(d => d["Disaster Group"] === disasterGroup);
    if (disasterSubgroup !== 'All') filteredData = filteredData.filter(d => d["Disaster Subgroup"] === disasterSubgroup);
    if (disasterType !== 'All') filteredData = filteredData.filter(d => d["Disaster Type"] === disasterType);
    // Use all countries in the filtered data
    const filteredCountries = Array.from(new Set(filteredData.map(d => d["Country"]))).filter(Boolean);
    return filteredCountries.map(countryName => {
      let countryData = filteredData.filter(d => d["Country"] === countryName);
      const years = Array.from(new Set(countryData.map(d => d["Start Year"])) ).filter(Boolean).map(Number);
      const histYears = years.filter(y => y >= 2010 && y <= 2020);
      const histCounts = histYears.map(y => countryData.filter(d => Number(d["Start Year"]) === y).length);
      const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
      const y2024 = countryData.filter(d => Number(d["Start Year"]) === 2024).length;
      const pctChange = histAvg > 0 ? ((y2024 - histAvg) / histAvg) * 100 : 0;
      return {
        country: countryName,
        pctChange,
        color: getTrendColor(pctChange)
      };
    });
  }, [data, disasterGroup, disasterSubgroup, disasterType]);

  // Debug: Log country trends to console (after countryTrends is defined)
  useEffect(() => {
    if (countryTrends && countryTrends.length > 0) {
      console.log('Country Trends:', countryTrends.map(r => ({
        country: r.country,
        pctChange: r.pctChange,
        color: r.color
      })));
    }
  }, [countryTrends]);

  // Map region names to rough lat/lon for demo (expanded to match CSV regions)
  const regionCoords: Record<string, { lat: number, lng: number }> = {
    'Sub-Saharan Africa': { lat: 5, lng: 20 },
    'Northern America': { lat: 55, lng: -100 },
    'Eastern Asia': { lat: 35, lng: 120 },
    'Western Europe': { lat: 50, lng: 10 },
    'Latin America and the Caribbean': { lat: -15, lng: -60 },
    'Southern Asia': { lat: 20, lng: 80 },
    'South-eastern Asia': { lat: 5, lng: 110 },
    'Southern Europe': { lat: 41, lng: 15 },
    'Eastern Europe': { lat: 55, lng: 30 },
    'Western Asia': { lat: 35, lng: 45 },
    'Oceania': { lat: -25, lng: 135 },
    'Northern Europe': { lat: 60, lng: 20 },
    'Central Asia': { lat: 45, lng: 70 },
    'Australia and New Zealand': { lat: -27, lng: 133 },
    'Melanesia': { lat: -9, lng: 160 },
    'Micronesia': { lat: 7, lng: 150 },
    'Polynesia': { lat: -18, lng: -140 },
    // Add more as needed
  };


  // --- Country to Region Mapping ---
  // This should cover all countries in your GeoJSON. Expand as needed.
  // For demo, a partial mapping is provided. For production, use a full ISO country-to-region mapping.
  const countryToRegion: Record<string, string> = {
    'United States of America': 'Northern America',
    'Canada': 'Northern America',
    'Mexico': 'Latin America and the Caribbean',
    'Brazil': 'Latin America and the Caribbean',
    'Argentina': 'Latin America and the Caribbean',
    'Colombia': 'Latin America and the Caribbean',
    'Peru': 'Latin America and the Caribbean',
    'Venezuela': 'Latin America and the Caribbean',
    'Chile': 'Latin America and the Caribbean',
    'Ecuador': 'Latin America and the Caribbean',
    'Bolivia': 'Latin America and the Caribbean',
    'Paraguay': 'Latin America and the Caribbean',
    'Uruguay': 'Latin America and the Caribbean',
    'Guyana': 'Latin America and the Caribbean',
    'Suriname': 'Latin America and the Caribbean',
    'China': 'Eastern Asia',
    'Japan': 'Eastern Asia',
    'South Korea': 'Eastern Asia',
    'North Korea': 'Eastern Asia',
    'Mongolia': 'Eastern Asia',
    'India': 'Southern Asia',
    'Pakistan': 'Southern Asia',
    'Bangladesh': 'Southern Asia',
    'Nepal': 'Southern Asia',
    'Sri Lanka': 'Southern Asia',
    'Afghanistan': 'Southern Asia',
    'Australia': 'Australia and New Zealand',
    'New Zealand': 'Australia and New Zealand',
    'France': 'Western Europe',
    'Germany': 'Western Europe',
    'Netherlands': 'Western Europe',
    'Belgium': 'Western Europe',
    'Switzerland': 'Western Europe',
    'Austria': 'Western Europe',
    'United Kingdom': 'Northern Europe',
    'Ireland': 'Northern Europe',
    'Norway': 'Northern Europe',
    'Sweden': 'Northern Europe',
    'Denmark': 'Northern Europe',
    'Finland': 'Northern Europe',
    'Italy': 'Southern Europe',
    'Spain': 'Southern Europe',
    'Portugal': 'Southern Europe',
    'Greece': 'Southern Europe',
    'Russia': 'Eastern Europe',
    'Ukraine': 'Eastern Europe',
    'Poland': 'Eastern Europe',
    'Czech Republic': 'Eastern Europe',
    'Slovakia': 'Eastern Europe',
    'Hungary': 'Eastern Europe',
    'Romania': 'Eastern Europe',
    'Bulgaria': 'Eastern Europe',
    // ... add all countries as needed
  };

  // Memoize polygonsData for Globe overlays (country-level)
  const polygonsData = useMemo(() => {
    if (!regionGeoJson || !regionGeoJson.features) return [];
    const trendMap = Object.fromEntries(countryTrends.map(r => [r.country, r]));
    const unmatched: string[] = [];
    const features = regionGeoJson.features.map((feature: any) => {
      const countryName = feature.properties?.name;
      const trend = trendMap[countryName];
      if (!trend && countryName) unmatched.push(countryName);
      return {
        ...feature,
        properties: {
          ...feature.properties,
          trend: trend ? trend.pctChange : 0,
          color: trend ? trend.color : '#cccccc',
        }
      };
    });
    if (unmatched.length > 0) {
      // Only log unique unmatched names
      const uniqueUnmatched = Array.from(new Set(unmatched));
      console.warn('GeoJSON countries with no country trend:', uniqueUnmatched);
    }
    return features;
  }, [regionGeoJson, countryTrends]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/data/disasters.csv');
        if (!res.ok) {
          console.error('Failed to fetch disasters.csv:', res.status, res.statusText);
          throw new Error('Failed to fetch disasters.csv');
        }
        const text = await res.text();
        console.log('Fetched disasters.csv:', text.slice(0, 500)); // log first 500 chars
        const parsed = parseCSV(text);
        console.log('Parsed CSV:', parsed.slice(0, 5)); // log first 5 rows
        setData(parsed);
      } catch (e) {
        setError('Failed to load disaster data.');
        console.error('Error loading disaster data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get unique regions, disaster types, disaster groups, and disaster subgroups (match CSV column names)
  const regions = Array.from(new Set(data.map(d => d["Region"])) ).filter(Boolean);
  const disasterTypes = Array.from(new Set(data.map(d => d["Disaster Type"])) ).filter(Boolean);
  const disasterGroups = Array.from(new Set(data.map(d => d["Disaster Group"])) ).filter(Boolean);
  const disasterSubgroups = Array.from(new Set(data.map(d => d["Disaster Subgroup"])) ).filter(Boolean);


  // Filtering logic (no duplicate state declarations)
  let filtered = data;
  if (region !== 'All') filtered = filtered.filter(d => d["Region"] === region);
  if (disasterGroup !== 'All') filtered = filtered.filter(d => d["Disaster Group"] === disasterGroup);
  if (disasterSubgroup !== 'All') filtered = filtered.filter(d => d["Disaster Subgroup"] === disasterSubgroup);
  if (disasterType !== 'All') filtered = filtered.filter(d => d["Disaster Type"] === disasterType);

  // Group by Start Year (count events per year) -- filter out invalid years
  const years = Array.from(new Set(filtered.map(d => d["Start Year"])) )
    .map(Number)
    .filter(y => Number.isFinite(y) && y > 1800 && y < 2100)
    .sort((a, b) => a - b);
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

  // --- Top 10 Increase/Decrease Lists (excluding Region filter) ---
  // Only apply disasterGroup, disasterSubgroup, disasterType filters
  // --- Remove sparse categories from dropdowns ---
  // Compute available categories based on minimum data threshold
  const MIN_EVENTS_FOR_CATEGORY = 2;
  const availableDisasterGroups = useMemo(() => {
    return disasterGroups.filter(group => {
      if (!group) return false;
      const groupData = data.filter(d => d["Disaster Group"] === group);
      // Only show if at least MIN_EVENTS_FOR_CATEGORY in 2010-2020 or 2024
      const years = Array.from(new Set(groupData.map(d => d["Start Year"]))).map(Number);
      const histYears = years.filter(y => y >= 2010 && y <= 2020);
      const histCounts = histYears.map(y => groupData.filter(d => Number(d["Start Year"]) === y).length);
      const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
      const y2024 = groupData.filter(d => Number(d["Start Year"]) === 2024).length;
      return histAvg >= MIN_EVENTS_FOR_CATEGORY || y2024 >= MIN_EVENTS_FOR_CATEGORY;
    });
  }, [data, disasterGroups]);
  const availableDisasterSubgroups = useMemo(() => {
    // Filter subgroups based on selected disasterGroup and disasterType
    let filteredData = data;
    if (disasterGroup !== 'All') {
      filteredData = filteredData.filter(d => d["Disaster Group"] === disasterGroup);
    }
    if (disasterType !== 'All') {
      filteredData = filteredData.filter(d => d["Disaster Type"] === disasterType);
    }
    const subgroups = Array.from(new Set(filteredData.map(d => d["Disaster Subgroup"]))).filter(Boolean);
    return subgroups.filter(subgroup => {
      const subgroupData = filteredData.filter(d => d["Disaster Subgroup"] === subgroup);
      const years = Array.from(new Set(subgroupData.map(d => d["Start Year"]))).map(Number);
      const histYears = years.filter(y => y >= 2010 && y <= 2020);
      const histCounts = histYears.map(y => subgroupData.filter(d => Number(d["Start Year"]) === y).length);
      const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
      const y2024 = subgroupData.filter(d => Number(d["Start Year"]) === 2024).length;
      return histAvg >= MIN_EVENTS_FOR_CATEGORY || y2024 >= MIN_EVENTS_FOR_CATEGORY;
    });
  }, [data, disasterSubgroups, disasterGroup, disasterType]);
  const availableDisasterTypes = useMemo(() => {
    // Filter types based on selected disasterGroup and disasterSubgroup
    let filteredData = data;
    if (disasterGroup !== 'All') {
      filteredData = filteredData.filter(d => d["Disaster Group"] === disasterGroup);
    }
    if (disasterSubgroup !== 'All') {
      filteredData = filteredData.filter(d => d["Disaster Subgroup"] === disasterSubgroup);
    }
    const types = Array.from(new Set(filteredData.map(d => d["Disaster Type"]))).filter(Boolean);
    return types.filter(type => {
      const typeData = filteredData.filter(d => d["Disaster Type"] === type);
      const years = Array.from(new Set(typeData.map(d => d["Start Year"]))).map(Number);
      const histYears = years.filter(y => y >= 2010 && y <= 2020);
      const histCounts = histYears.map(y => typeData.filter(d => Number(d["Start Year"]) === y).length);
      const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
      const y2024 = typeData.filter(d => Number(d["Start Year"]) === 2024).length;
      return histAvg >= MIN_EVENTS_FOR_CATEGORY || y2024 >= MIN_EVENTS_FOR_CATEGORY;
    });
  }, [data, disasterTypes, disasterGroup, disasterSubgroup]);

  let countryTrendsForList = useMemo(() => {
    let filteredData = data;
    if (disasterGroup !== 'All') filteredData = filteredData.filter(d => d["Disaster Group"] === disasterGroup);
    if (disasterSubgroup !== 'All') filteredData = filteredData.filter(d => d["Disaster Subgroup"] === disasterSubgroup);
    if (disasterType !== 'All') filteredData = filteredData.filter(d => d["Disaster Type"] === disasterType);
    // Only include countries that have at least one event in the filtered data
    const countries = Array.from(new Set(filteredData.map(d => d["Country"]))).filter(Boolean);
    return countries.map(countryName => {
      let countryData = filteredData.filter(d => d["Country"] === countryName);
      const years = Array.from(new Set(countryData.map(d => d["Start Year"]))).filter(Boolean).map(Number);
      const histYears = years.filter(y => y >= 2010 && y <= 2020);
      const histCounts = histYears.map(y => countryData.filter(d => Number(d["Start Year"]) === y).length);
      const histAvg = histCounts.length > 0 ? histCounts.reduce((a, b) => a + b, 0) / histCounts.length : 0;
      const y2024 = countryData.filter(d => Number(d["Start Year"]) === 2024).length;
      const pctChange = histAvg > 0 ? ((y2024 - histAvg) / histAvg) * 100 : 0;
      return {
        country: countryName,
        pctChange,
        y2024,
        histAvg
      };
    })
    // Only include countries that have at least one event in the filtered data
    .filter(c => c.y2024 > 0 || c.histAvg > 0);
  }, [data, disasterGroup, disasterSubgroup, disasterType]);

  // Sort for top 10 increase and decrease
  const top10Increase = [...countryTrendsForList]
    .filter(c => c.histAvg > 0)
    .sort((a, b) => b.pctChange - a.pctChange)
    .slice(0, 10);
  const top10Decrease = [...countryTrendsForList]
    .filter(c => c.histAvg > 0)
    .sort((a, b) => a.pctChange - b.pctChange)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-2 sm:px-4 max-w-3xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-blue-700">
          Global Disaster Analytics Demo: Data-Driven Insights & BI Solutions
        </h1>
        <p className="mb-4 sm:mb-6 text-base sm:text-lg text-gray-700 dark:text-gray-100">
          Global disaster trends are brought to life through interactive analytics, advanced data visualizations, and business intelligence best practices. This platform is designed to support organizations, consultants, and decision-makers in analyzing risk, monitoring events, and driving strategic action with Power BI, data engineering, and automation. Robust, actionable insights and modern analytics solutions are delivered to meet the needs of professionals and enterprises seeking data-driven results.
        </p>
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">
          <b>Data Source:</b> EM-DAT (The International Disaster Database), <a href="https://public.emdat.be/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://public.emdat.be/</a><br />
          <span>
            Data is provided as-is and may reflect reporting standards, definitions, and priorities of the source institution. For more information, see the EM-DAT website.
          </span>
        </div>
        {/* Top 10 Increase/Decrease Lists (hidden if Region filter is used) */}
        {region === 'All' && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 mb-4 sm:mb-6 w-full">
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex-1 min-w-[0] w-full sm:min-w-[220px]">
              <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-red-700">Top 10 Country Increases (2024 vs 2010-2020 avg)</h3>
              <ol className="list-decimal list-inside text-xs sm:text-sm">
                {top10Increase.map(c => (
                  <li key={c.country} className="mb-1 flex justify-between">
                    <span>{c.country}</span>
                    <span className="ml-2 font-mono">
                      {c.pctChange > 0 ? '+' : ''}{c.pctChange.toFixed(1)}% &nbsp;
                      <span className="text-gray-500 dark:text-gray-300">({c.y2024} in 2024, avg {c.histAvg.toFixed(1)})</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 flex-1 min-w-[0] w-full sm:min-w-[220px]">
              <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-blue-700">Top 10 Country Decreases (2024 vs 2010-2020 avg)</h3>
              <ol className="list-decimal list-inside text-xs sm:text-sm">
                {top10Decrease.map(c => (
                  <li key={c.country} className="mb-1 flex justify-between">
                    <span>{c.country}</span>
                    <span className="ml-2 font-mono">
                      {c.pctChange > 0 ? '+' : ''}{c.pctChange.toFixed(1)}% &nbsp;
                      <span className="text-gray-500 dark:text-gray-300">({c.y2024} in 2024, avg {c.histAvg.toFixed(1)})</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 w-full">
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
            <span className="font-semibold mr-2">Disaster Group:</span>
            <select value={disasterGroup} onChange={e => setDisasterGroup(e.target.value)} className="border rounded px-2 py-1">
              <option value="All">All</option>
              {availableDisasterGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            <span className="font-semibold mr-2">Disaster Subgroup:</span>
            <select value={disasterSubgroup} onChange={e => setDisasterSubgroup(e.target.value)} className="border rounded px-2 py-1">
              <option value="All">All</option>
              {availableDisasterSubgroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}
            </select>
          </label>
          <label>
            <span className="font-semibold mr-2">Disaster Type:</span>
            <select value={disasterType} onChange={e => setDisasterType(e.target.value)} className="border rounded px-2 py-1">
              <option value="All">All</option>
              {availableDisasterTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
        {loading && <div className="text-blue-600">Loading data...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && years.length > 0 && (
          <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 w-full">
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
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Regional Trends Globe</h2>
          <p className="mb-1 sm:mb-2 text-gray-700 dark:text-gray-100 text-sm sm:text-base">
            Regions are <b>overlaid</b> by disaster trend (2024 vs. 2010–2020 avg): <span style={{color:'#1976d2'}}>blue</span> = decrease, <span style={{color:'#aaa'}}>white</span> = same, <span style={{color:'#d32f2f'}}>red</span> = increase.
          </p>
          <div className="w-full" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ width: '100%', maxWidth: 600, height: 'auto', aspectRatio: '3/2', margin: '0 auto' }}>
              {!geoJsonLoading && !loading && !geoJsonError && polygonsData.length > 0 ? (
                <Globe
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                  polygonsData={polygonsData}
                  polygonCapColor={(feat: any) => {
                    // Use semi-transparent overlays for better visuals
                    const color = feat.properties?.color || '#cccccc';
                    if (color.startsWith('rgb(')) {
                      return color.replace('rgb(', 'rgba(').replace(')', ',0.85)');
                    }
                    return color;
                  }}
                  polygonSideColor={() => 'rgba(0,0,0,0.10)'}
                  polygonStrokeColor={(feat: any) => {
                    // Stronger border for overlays
                    const color = feat.properties?.color || '#222';
                    if (color.startsWith('rgb(')) {
                      // Use a more saturated border for blue/red
                      if (color.includes('255,0,255')) return '#1976d2'; // blue
                      if (color.includes('255,100,100')) return '#d32f2f'; // red
                    }
                    return '#222';
                  }}
                  // polygonStrokeWidth prop removed: not supported by react-globe.gl
                  polygonLabel={(feat: any) =>
                    `${feat.properties?.name}
Region: ${feat.properties?.name}
Trend: ${feat.properties?.trend > 0 ? '+' : ''}${feat.properties?.trend?.toFixed(1) ?? '0'}%
Color: ${feat.properties?.color}`
                  }
                  width={typeof window !== 'undefined' && window.innerWidth < 640 ? window.innerWidth - 32 : 600}
                  height={typeof window !== 'undefined' && window.innerWidth < 640 ? Math.round((window.innerWidth - 32) * 2 / 3) : 400}
                />
              ) : geoJsonError ? (
                <div className="text-red-600 text-center pt-20">{geoJsonError}</div>
              ) : (
                <div className="text-gray-500 dark:text-gray-300 text-center pt-20">No regional overlays to display.</div>
              )}
            </div>
            {/* Legend for color mapping */}
            <div className="flex flex-wrap justify-center mt-3 sm:mt-4 gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1"><span style={{display:'inline-block',width:14,height:14,background:'rgba(37,99,235,0.65)',borderRadius:3,border:'1px solid #1976d2'}}></span> Decrease</div>
              <div className="flex items-center gap-1"><span style={{display:'inline-block',width:14,height:14,background:'#fff',borderRadius:3,border:'1px solid #aaa'}}></span> Same</div>
              <div className="flex items-center gap-1"><span style={{display:'inline-block',width:14,height:14,background:'rgba(211,47,47,0.65)',borderRadius:3,border:'1px solid #d32f2f'}}></span> Increase</div>
            </div>
          </div>
        </div>
        {/* NASA Satellite Imagery section removed: Not directly relevant to disaster analytics context. */}
      </div>
    </main>
  );
}
