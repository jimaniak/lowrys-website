// Enhanced Rate Calculator using Turso database
"use client";

import { useState, useEffect } from "react";

// US State codes to names
const US_STATE_NAMES: Record<string, string> = {
  US: "All (United States)",
};

interface MajorGroup {
  code: string;
  name: string;
}

interface Occupation {
  code: string;
  name: string;
}

interface Region {
  region: string;
  region_name: string;
}

interface BenchmarkData {
  mean_annual: number;
  median_annual: number;
  benefit_annual: number;
  mean_hourly: number;
  median_hourly: number;
}

export default function RateCalculatorTurbo() {
  // Employment type toggle
  const [employmentType, setEmploymentType] = useState<'consulting' | 'employee'>('employee');

  // Hierarchical selection state
  const [majorGroups, setMajorGroups] = useState<MajorGroup[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState<string>("");
  const [occupationSearch, setOccupationSearch] = useState<string>("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("US");

  // Benchmark state
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(false);

  // User input state
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(12000);
  const [billableDays, setBillableDays] = useState<number>(180);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [includeBenefits, setIncludeBenefits] = useState(false);
  const [benefits, setBenefits] = useState<number>(0);

  // Load major groups
  useEffect(() => {
    async function loadMajorGroups() {
      try {
        const response = await fetch('/api/rate-calculator?action=major-groups');
        const data = await response.json();
        setMajorGroups(data);
      } catch (error) {
        console.error('Error loading major groups:', error);
      }
    }
    loadMajorGroups();
  }, []);

  // Load occupations when major group changes
  useEffect(() => {
    async function loadOccupations() {
      if (!selectedMajor) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/rate-calculator?action=occupations&majorGroup=${selectedMajor}`);
        const data = await response.json();
        setOccupations(data);
        setSelectedOccupation(data[0]?.code || "");
      } catch (error) {
        console.error('Error loading occupations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOccupations();
  }, [selectedMajor]);

  // Load regions when occupation changes
  useEffect(() => {
    async function loadRegions() {
      if (!selectedOccupation) return;
      
      try {
        const response = await fetch(`/api/rate-calculator?action=regions&occupationCode=${selectedOccupation}`);
        const data = await response.json();
        setRegions(data);
        setSelectedRegion(data[0]?.region || "US");
      } catch (error) {
        console.error('Error loading regions:', error);
      }
    }
    loadRegions();
  }, [selectedOccupation]);

  // Load benchmark data when occupation or region changes
  useEffect(() => {
    async function loadBenchmarkData() {
      if (!selectedOccupation || !selectedRegion) return;
      
      try {
        const response = await fetch(`/api/rate-calculator?action=benchmark&occupationCode=${selectedOccupation}&region=${selectedRegion}`);
        const data = await response.json();
        setBenchmarkData(data);
      } catch (error) {
        console.error('Error loading benchmark data:', error);
      }
    }
    loadBenchmarkData();
  }, [selectedOccupation, selectedRegion]);

  // Filter occupations based on search
  const filteredOccupations = occupations.filter(occ =>
    occ.name.toLowerCase().includes(occupationSearch.toLowerCase())
  );

  // Calculate consulting rate
  const calculateConsultingRate = () => {
    if (!benchmarkData) return 0;
    
    const annualSalary = benchmarkData.mean_annual || 0;
    const totalExpenses = expenses + (includeBenefits ? benefits : 0);
    const afterTaxIncome = income * (1 - taxRate / 100);
    const requiredRevenue = afterTaxIncome + totalExpenses;
    const dailyRate = requiredRevenue / billableDays;
    const hourlyRate = dailyRate / 8;
    
    return employmentType === 'consulting' ? hourlyRate : annualSalary;
  };

  const rate = calculateConsultingRate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Professional Rate Calculator
          </h1>
          
          {/* Employment Type Toggle */}
          <div className="mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setEmploymentType('employee')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  employmentType === 'employee'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Employee Salary
              </button>
              <button
                onClick={() => setEmploymentType('consulting')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  employmentType === 'consulting'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Consulting Rate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Occupation Selection */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Select Occupation
              </h2>

              {/* Major Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major Group
                </label>
                <select
                  value={selectedMajor}
                  onChange={(e) => setSelectedMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {majorGroups.map(group => (
                    <option key={group.code} value={group.code}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occupation Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Occupations
                </label>
                <input
                  type="text"
                  value={occupationSearch}
                  onChange={(e) => setOccupationSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Occupation Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Occupation
                </label>
                <select
                  value={selectedOccupation}
                  onChange={(e) => setSelectedOccupation(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filteredOccupations.map(occ => (
                    <option key={occ.code} value={occ.code}>
                      {occ.name}
                    </option>
                  ))}
                </select>
                {loading && <p className="text-sm text-gray-500 mt-1">Loading occupations...</p>}
              </div>

              {/* Region Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {regions.map(region => (
                    <option key={region.region} value={region.region}>
                      {region.region_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column - Rate Calculation */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {employmentType === 'consulting' ? 'Rate Calculation' : 'Salary Information'}
              </h2>

              {/* Benchmark Data Display */}
              {benchmarkData && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">BLS Benchmark Data</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Mean Annual:</span>
                      <span className="font-medium ml-2">
                        ${benchmarkData.mean_annual?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Median Annual:</span>
                      <span className="font-medium ml-2">
                        ${benchmarkData.median_annual?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Mean Hourly:</span>
                      <span className="font-medium ml-2">
                        ${benchmarkData.mean_hourly?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Median Hourly:</span>
                      <span className="font-medium ml-2">
                        ${benchmarkData.median_hourly?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculated Rate Display */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  {employmentType === 'consulting' ? 'Recommended Hourly Rate' : 'Market Salary'}
                </h3>
                <div className="text-3xl font-bold text-green-800">
                  {employmentType === 'consulting' 
                    ? `$${rate.toFixed(0)}/hour`
                    : `$${rate.toLocaleString()}/year`
                  }
                </div>
              </div>

              {/* Input Fields for Consulting */}
              {employmentType === 'consulting' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desired Annual Income ($)
                    </label>
                    <input
                      type="number"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Business Expenses ($)
                    </label>
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billable Days per Year
                    </label>
                    <input
                      type="number"
                      value={billableDays}
                      onChange={(e) => setBillableDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
