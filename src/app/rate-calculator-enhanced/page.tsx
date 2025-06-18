"use client";

import { useState, useEffect, useMemo } from "react";

// US State codes to names
const US_STATE_NAMES: Record<string, string> = {
  US: "All (United States)",
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", 
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  PR: "Puerto Rico", GU: "Guam", VI: "Virgin Islands"
};

interface MajorGroup {
  code: string;
  name: string;
}

interface Occupation {
  code: string;
  name: string;
  majorGroupCode: string;
}

interface Region {
  code: string;
  name: string;
}

interface WageData {
  occupationName: string;
  regionName: string;
  wage: {
    mean_annual: number | null;
    mean_hourly: number | null;
    median_annual: number | null;
    median_hourly: number | null;
  };
  benefits: {
    avg_annual: number | null;
  };
}

interface ProjectionData {
  projected_2023: number;
  projected_2033: number;
  projected_change: number;
  projected_percent: number;
  projected_openings: number;
  median_wage: number | null;
  typical_education: string;
  work_experience: string;
  on_job_training: string;
  factors: string | null;
  // Add status flags from database
  is_fastest_growing?: boolean;
  is_most_job_growth?: boolean;
  is_fastest_declining?: boolean;
  is_largest_declines?: boolean;
  is_most_openings?: boolean;
  is_highest_paying?: boolean;
  is_stem?: boolean;
  // Add ranks
  fastest_growing_rank?: number;
  most_job_growth_rank?: number;
  fastest_declining_rank?: number;
  largest_declines_rank?: number;
  most_openings_rank?: number;
  highest_paying_rank?: number;
}

// Helper function to get status badges based on database flags
const getStatusBadges = (projectionData: ProjectionData | null): JSX.Element[] => {
  if (!projectionData) return [];
  
  const badges: JSX.Element[] = [];
  
  if (projectionData.is_fastest_growing) {
    badges.push(
      <span key="fastest_growing" className="px-2 py-1 rounded bg-green-200 text-green-900 font-bold text-xs border border-green-400 animate-pulse" title="BLS: Among the fastest growing occupations">
        ⬆️ FASTEST GROWING
      </span>
    );
  }
  
  if (projectionData.is_most_job_growth) {
    badges.push(
      <span key="most_job_growth" className="px-2 py-1 rounded bg-blue-200 text-blue-900 font-bold text-xs border border-blue-400" title="BLS: Among occupations with the most job growth">
        📈 MOST JOB GROWTH
      </span>
    );
  }
  
  if (projectionData.is_fastest_declining) {
    badges.push(
      <span key="fastest_declining" className="px-2 py-1 rounded bg-red-200 text-red-900 font-bold text-xs border border-red-400 animate-pulse" title="BLS: Among the fastest declining occupations">
        ⬇️ FASTEST DECLINING
      </span>
    );
  }
  
  if (projectionData.is_largest_declines) {
    badges.push(
      <span key="largest_declines" className="px-2 py-1 rounded bg-orange-200 text-orange-900 font-bold text-xs border border-orange-400" title="BLS: Among occupations with the largest job declines">
        📉 LARGEST DECLINES
      </span>
    );
  }
  
  if (projectionData.is_most_openings) {
    badges.push(
      <span key="most_openings" className="px-2 py-1 rounded bg-purple-200 text-purple-900 font-bold text-xs border border-purple-400" title="BLS: Among occupations with the most job openings">
        🚪 MOST OPENINGS
      </span>
    );
  }
  
  if (projectionData.is_highest_paying) {
    badges.push(
      <span key="highest_paying" className="px-2 py-1 rounded bg-yellow-200 text-yellow-900 font-bold text-xs border border-yellow-400" title="BLS: Among the highest paying occupations">
        💰 HIGHEST PAYING
      </span>
    );
  }
  
  if (projectionData.is_stem) {
    badges.push(
      <span key="stem" className="px-2 py-1 rounded bg-indigo-200 text-indigo-900 font-bold text-xs border border-indigo-400" title="BLS: STEM (Science, Technology, Engineering, Mathematics) occupation">
        🔬 STEM
      </span>
    );
  }
  
  return badges;
};

interface HierarchyData {
  major?: {
    code: string;
    name: string;
  };
  minor?: {
    code: string;
    name: string;
  };
  broad?: {
    code: string;
    name: string;
  };
  detailed: {
    code: string;
    name: string;
    type: string;
  };
}

export default function EnhancedRateCalculator() {
  // Employment type toggle
  const [employmentType, setEmploymentType] = useState<'consulting' | 'employee'>('employee');
    // Selection state
  const [majorGroups, setMajorGroups] = useState<MajorGroup[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [allOccupations, setAllOccupations] = useState<Occupation[]>([]);
  const [selectedDetailed, setSelectedDetailed] = useState<string>("");
  const [detailedOccupationSearch, setDetailedOccupationSearch] = useState<string>("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("US");
  
  // Wage data
  const [wageData, setWageData] = useState<WageData | null>(null);
  const [projectionData, setProjectionData] = useState<ProjectionData | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // User input state
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(12000);
  const [billableDays, setBillableDays] = useState<number>(180);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [includeBenefits, setIncludeBenefits] = useState(false);
  const [benefits, setBenefits] = useState<number>(0);
  // Load major groups on mount
  useEffect(() => {
    const loadMajorGroups = async () => {
      try {
        setError(null);
        const response = await fetch('/api/rate-calculator-enhanced?action=major-groups');
        if (!response.ok) {
          throw new Error(`Failed to load major groups: ${response.statusText}`);
        }
        const data = await response.json();
        setMajorGroups(data.majorGroups);
      } catch (error) {
        console.error('Error loading major groups:', error);
        setError('Failed to load major groups. Please refresh the page.');
      }
    };
    
    loadMajorGroups();
  }, []);

  // Load occupations when major group changes or for search
  useEffect(() => {
    const loadOccupations = async () => {
      try {
        setLoading(true);
        let url = '/api/rate-calculator-enhanced?action=detailed-occupations';
        if (selectedMajor && selectedMajor !== "ALL") {
          url += `&majorGroup=${selectedMajor}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        setAllOccupations(data.occupations);
          // Only auto-select first occupation if no occupation is currently selected
        // or if the current selection is not in the new list
        if (data.occupations.length > 0) {
          const currentSelectionExists = data.occupations.find((occ: any) => occ.code === selectedDetailed);
          if (!selectedDetailed || !currentSelectionExists) {
            setSelectedDetailed(data.occupations[0].code);
          }
        }
      } catch (error) {
        console.error('Error loading occupations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (majorGroups.length > 0) {
      loadOccupations();
    }
  }, [selectedMajor, majorGroups]);  // Filter occupations based on search and exclude summary/major group codes (ending in -0000)
  const filteredOccupations = useMemo(() => {
    // First filter out summary/major group codes (ending in -0000)
    const detailedOnly = allOccupations.filter((occ: any) => !occ.code.endsWith('-0000'));
    
    if (!detailedOccupationSearch.trim()) {
      return detailedOnly;
    }
    
    const searchTerm = detailedOccupationSearch.toLowerCase();
    const filtered = detailedOnly.filter((occ: any) => 
      occ.name.toLowerCase().includes(searchTerm)
    );
    
    // Sort search results by relevance:
    // 1. Exact matches first
    // 2. Starts with search term
    // 3. Contains search term (already filtered)
    return filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === searchTerm) return -1;
      if (bName === searchTerm) return 1;
      
      // Starts with search term gets second priority
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Otherwise alphabetical
      return aName.localeCompare(bName);
    });
  }, [allOccupations, detailedOccupationSearch]);

  // Auto-select top search result when user is searching
  useEffect(() => {
    if (detailedOccupationSearch.trim() && filteredOccupations.length > 0) {
      const topResult = filteredOccupations[0];
      if (topResult.code !== selectedDetailed) {
        setSelectedDetailed(topResult.code);
      }
    }
  }, [filteredOccupations, detailedOccupationSearch, selectedDetailed]);

  // Load regions when occupation changes
  useEffect(() => {
    const loadRegions = async () => {
      if (!selectedDetailed) return;
      
      try {
        const response = await fetch(`/api/rate-calculator-enhanced?action=regions&occupation=${selectedDetailed}`);
        const data = await response.json();
        setRegions(data.regions);
          // Set default region - prioritize US if available, otherwise use first region
        if (data.regions.length > 0) {
          const usRegion = data.regions.find((r: any) => r.code === 'US');
          setSelectedRegion(usRegion ? usRegion.code : data.regions[0].code);
        }
      } catch (error) {
        console.error('Error loading regions:', error);
      }
    };
    
    loadRegions();
  }, [selectedDetailed]);
  // Load wage data when occupation or region changes
  useEffect(() => {
    const loadWageData = async () => {
      if (!selectedDetailed || !selectedRegion) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/rate-calculator-enhanced?action=wage-data&occupation=${selectedDetailed}&region=${selectedRegion}`);
        if (!response.ok) {
          throw new Error(`Failed to load wage data: ${response.statusText}`);
        }
        const data = await response.json();
          if (data.wageData) {
          setWageData(data.wageData);
          setIncome(data.wageData.wage.mean_annual || data.wageData.wage.median_annual || 0);
          setBenefits(data.wageData.benefits.avg_annual || 0);
        } else {
          setWageData(null);
          setError('No wage data available for this occupation/region combination.');
        }
        
        // Also load projections data
        const projResponse = await fetch(`/api/rate-calculator-enhanced?action=projections&occupation=${selectedDetailed}`);
        if (projResponse.ok) {
          const projData = await projResponse.json();
          setProjectionData(projData.projections || null);
        } else {
          setProjectionData(null);
        }
        
        // Load hierarchy data
        const hierarchyResponse = await fetch(`/api/rate-calculator-enhanced?action=hierarchy&occupation=${selectedDetailed}`);
        if (hierarchyResponse.ok) {
          const hierarchyData = await hierarchyResponse.json();
          setHierarchy(hierarchyData.hierarchy || null);
        } else {
          setHierarchy(null);
        }
      } catch (error) {
        console.error('Error loading wage data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load wage data');
        setWageData(null);
        setProjectionData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadWageData();
  }, [selectedDetailed, selectedRegion]);
  // Calculations
  const totalExpenses = includeBenefits ? expenses + benefits : expenses;
  const grossNeeded = (income + totalExpenses) / (1 - taxRate / 100);
  const dailyRate = billableDays > 0 ? grossNeeded / billableDays : 0;
  const blsDaily = wageData && wageData.wage.mean_annual && billableDays > 0 ? wageData.wage.mean_annual / billableDays : null;  // Utility functions
  const copyToClipboard = async (text: string) => {
    console.log('Copy button clicked!', text.length, 'characters');
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(text);
      alert('✅ Copied to clipboard successfully!');
    } catch (err) {
      console.error('Modern clipboard failed, trying fallback: ', err);
      // Fallback method for browsers that don't support clipboard API or deny permission
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          alert('✅ Copied to clipboard successfully! (fallback method)');
        } else {
          // Final fallback - show the text in a dialog
          prompt('Copy this text manually (Ctrl+C):', text);
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
        // Final fallback - show the text in a dialog
        prompt('Copy this text manually (Ctrl+C):', text);
      }
    }
  };const generateShareableResults = () => {
    const occupationName = wageData?.occupationName || 'Unknown';
    const regionName = wageData?.regionName || 'Unknown';
    const selectedOcc = allOccupations.find((occ: any) => occ.code === selectedDetailed);
    
    // Get hierarchy path
    let hierarchyPath = '';
    if (hierarchy) {
      const parts = [];
      if (hierarchy.major) parts.push(hierarchy.major.name);
      if (hierarchy.minor) parts.push(hierarchy.minor.name);
      if (hierarchy.broad) parts.push(hierarchy.broad.name);
      if (hierarchy.detailed) parts.push(hierarchy.detailed.name);
      hierarchyPath = parts.join(' → ');
    }
    
    // Get status badges text
    const statusBadges = [];
    if (projectionData?.is_fastest_growing) statusBadges.push('FASTEST GROWING');
    if (projectionData?.is_most_job_growth) statusBadges.push('MOST JOB GROWTH');
    if (projectionData?.is_fastest_declining) statusBadges.push('FASTEST DECLINING');
    if (projectionData?.is_largest_declines) statusBadges.push('LARGEST DECLINES');
    if (projectionData?.is_most_openings) statusBadges.push('MOST OPENINGS');
    if (projectionData?.is_highest_paying) statusBadges.push('HIGHEST PAYING');
    if (projectionData?.is_stem) statusBadges.push('STEM');
    
    const date = new Date().toLocaleDateString();
    
    return `📊 RATE CALCULATOR ANALYSIS - ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 OCCUPATION DETAILS
Occupation: ${occupationName} (${selectedOcc?.code || 'N/A'})
Location: ${regionName}
${hierarchyPath ? `Hierarchy: ${hierarchyPath}` : ''}

💰 RATE CALCULATION
${employmentType === 'consulting' ? 'Consulting Daily Rate' : 'Employee Equivalent Daily Rate'}: $${employmentType === 'consulting' ? dailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (blsDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
${employmentType === 'consulting' ? 'Consulting Hourly Rate' : 'Employee Equivalent Hourly'}: $${employmentType === 'consulting' ? (dailyRate / 8).toLocaleString(undefined, { maximumFractionDigits: 2 }) : ((blsDaily || 0) / 8).toLocaleString(undefined, { maximumFractionDigits: 2 })}
BLS Average Daily: $${(blsDaily || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}

📈 BLS JOB OUTLOOK (2023-2033)
${projectionData ? `Current Employment: ${projectionData.projected_2023?.toLocaleString()}K jobs
Projected Employment: ${projectionData.projected_2033?.toLocaleString()}K jobs
Growth Rate: ${projectionData.projected_percent > 0 ? '+' : ''}${projectionData.projected_percent}%
Job Change: ${projectionData.projected_change > 0 ? '+' : ''}${projectionData.projected_change?.toLocaleString()}K jobs
Annual Openings: ${projectionData.projected_openings?.toLocaleString()}K` : 'No projection data available'}
${statusBadges.length > 0 ? `\n🏆 SPECIAL DESIGNATIONS: ${statusBadges.join(', ')}` : ''}

${projectionData?.factors ? `💡 FACTORS DRIVING CHANGE
${projectionData.factors}\n` : ''}

📚 ENTRY REQUIREMENTS
${projectionData?.typical_education ? `Education: ${projectionData.typical_education}` : ''}
${projectionData?.work_experience && projectionData.work_experience !== 'None' ? `Experience: ${projectionData.work_experience}` : ''}
${projectionData?.on_job_training && projectionData.on_job_training !== 'None' ? `Training: ${projectionData.on_job_training}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Lowry's Rate Calculator (Database-Powered)
Source: Bureau of Labor Statistics Employment Projections`;
  };

  // Preset templates for quick setup
  const applyPreset = (presetType: 'conservative' | 'moderate' | 'aggressive') => {
    const baseIncome = wageData?.wage.mean_annual || 100000;
    
    switch (presetType) {
      case 'conservative':
        setIncome(baseIncome * 0.9);
        setExpenses(8000);
        setBillableDays(200);
        setTaxRate(22);
        setIncludeBenefits(true);
        setBenefits(wageData?.benefits.avg_annual || 15000);
        break;
      case 'moderate':
        setIncome(baseIncome);
        setExpenses(12000);
        setBillableDays(180);
        setTaxRate(25);
        setIncludeBenefits(true);
        setBenefits(wageData?.benefits.avg_annual || 18000);
        break;
      case 'aggressive':
        setIncome(baseIncome * 1.2);
        setExpenses(15000);
        setBillableDays(160);
        setTaxRate(28);
        setIncludeBenefits(true);
        setBenefits(wageData?.benefits.avg_annual || 20000);
        break;
    }
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-white flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6 lg:p-10 relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-slate-400 rounded-full animate-bounce"></div>
        </div>
          {/* Header */}
        <div className="flex items-center mb-8 relative z-10">
          <span className="inline-block bg-blue-100 rounded-full p-4 mr-4 shadow-md">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <path fill="#1e40af" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 10.9 12 11.5 12 13h-2v-.5c0-1 .45-1.99 1.17-2.71l1.24-1.26A2 2 0 0012 7a2 2 0 00-2 2H8a4 4 0 018 0c0 1.1-.45 2.1-1.17 2.83z"/>
            </svg>
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-700 tracking-tight">
              Rate Calculator 
              <span className="text-sm font-normal text-blue-600 ml-2">(Database-Powered)</span>
            </h1>
            <p className="text-base text-blue-600 font-medium mt-1">Financial clarity for independent professionals</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-semibold">Error Loading Data</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600 text-xl font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-blue-800 font-semibold">Loading data...</p>
          </div>
        )}        {/* Employment Type Toggle */}
        <div className="mb-6 flex justify-center relative z-50">
          <div className="inline-flex rounded-xl bg-slate-100 border border-slate-300 shadow-sm overflow-hidden relative z-50">
            <button
              className={`px-5 py-2 font-semibold transition-colors ${
                employmentType === 'employee'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Setting employment type to employee');
                setEmploymentType('employee');
              }}
              type="button"
              style={{ pointerEvents: 'all', position: 'relative', zIndex: 999 }}
            >
              Traditional Employment
            </button>
            <button
              className={`px-5 py-2 font-semibold transition-colors ${
                employmentType === 'consulting'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Setting employment type to consulting');
                setEmploymentType('consulting');
              }}
              type="button"
              style={{ pointerEvents: 'all', position: 'relative', zIndex: 999 }}
            >
              Consulting / Self-Employed
            </button>
          </div>
        </div>{/* Selection Controls */}
        <div className="mb-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            
            {/* Major Group Selection */}
            <div className="md:col-span-1">
              <label className="block text-slate-700 font-semibold mb-2">Major Group</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200" 
                value={selectedMajor} 
                onChange={e => setSelectedMajor(e.target.value)}
              >
                {majorGroups.map((mg: any) => (
                  <option key={mg.code} value={mg.code}>{mg.name}</option>
                ))}
              </select>
            </div>
            
            {/* Occupation Search and Selection */}
            <div className="md:col-span-1">
              <label className="block text-slate-700 font-semibold mb-2">Search Occupation</label>
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={detailedOccupationSearch}
                onChange={e => setDetailedOccupationSearch(e.target.value)}
              />              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                value={selectedDetailed}
                onChange={e => {
                  setSelectedDetailed(e.target.value);
                  setDetailedOccupationSearch(""); // Clear search when occupation is selected
                }}
                disabled={filteredOccupations.length === 0 || loading}
              >
                {loading ? (
                  <option value="">Loading occupations...</option>
                ) : filteredOccupations.length === 0 ? (
                  <option value="">No matching occupations</option>
                ) : (
                  filteredOccupations.map((occ: any) => (
                    <option key={occ.code} value={occ.code}>{occ.name}</option>
                  ))
                )}
              </select>
            </div>
            
            {/* Region Selection */}
            <div className="md:col-span-1">
              <label className="block text-slate-700 font-semibold mb-2">U.S. State</label>
              <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200" 
                value={selectedRegion} 
                onChange={e => setSelectedRegion(e.target.value)}
                disabled={regions.length === 0}
              >
                {regions.map((r: any) => (
                  <option key={r.code} value={r.code}>
                    {US_STATE_NAMES[r.code] || r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>          {/* Current Selections Summary */}
          {wageData && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-300 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-indigo-700 font-bold text-sm">📋 Current Selections:</span>
              </div>
              
              {/* Hierarchical Path */}
              {hierarchy && (
                <div className="mb-3 p-3 bg-white/50 rounded-lg border border-indigo-200">
                  <div className="text-xs text-slate-600 mb-1 font-medium">Occupation Hierarchy:</div>                  <div className="flex flex-wrap items-center gap-1 text-sm">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
                      {hierarchy.major?.name}
                    </span>
                    <span className="text-slate-400">→</span>
                    {hierarchy.minor && (
                      <>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                          {hierarchy.minor.name}
                        </span>
                        <span className="text-slate-400">→</span>
                      </>
                    )}
                    {hierarchy.broad && (
                      <>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {hierarchy.broad.name}
                        </span>
                        <span className="text-slate-400">→</span>
                      </>
                    )}
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                      {hierarchy.detailed?.name}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-600 font-medium">Selected Occupation:</span>                  <span className="text-slate-800 font-semibold truncate" title={allOccupations.find((occ: any) => occ.code === selectedDetailed)?.name}>
                    {allOccupations.find((occ: any) => occ.code === selectedDetailed)?.name} ({selectedDetailed})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-600 font-medium">Location:</span>                  <span className="text-slate-800 font-semibold truncate" title={US_STATE_NAMES[selectedRegion] || regions.find((r: any) => r.code === selectedRegion)?.name}>
                    {US_STATE_NAMES[selectedRegion] || regions.find((r: any) => r.code === selectedRegion)?.name}
                  </span>
                </div>
              </div>
              <div className="text-xs text-indigo-600 mt-2">
                ✨ These selections determine your wage benchmarks and job outlook data
              </div>
            </div>
          )}{/* BLS Benchmark Display */}
          {wageData && (
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-300 rounded-xl p-4 flex flex-col gap-1 shadow-inner mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-700 font-bold">💰 BLS Wage Benchmark</span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <div className="font-medium text-slate-700 mb-1">
                  {wageData.occupationName} in {wageData.regionName}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <b>Annual Wage:</b> ${wageData.wage.mean_annual ? wageData.wage.mean_annual.toLocaleString() : 'N/A'}
                    {blsDaily && (
                      <div className="text-xs text-slate-500">
                        Daily: ${blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                  <div>
                    <b>Est. Benefits:</b> ${wageData.benefits.avg_annual ? wageData.benefits.avg_annual.toLocaleString() : 'N/A'}
                    <div className="text-xs text-slate-500">31% of wage (BLS ECEC)</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                💡 These are BLS averages for your selected occupation and location. Adjust for your specific skills and market conditions.
              </div>
              <div className="text-xs text-blue-600 mt-1 italic">
                ⚡ Database-powered: Real-time BLS data
              </div>
            </div>
          )}          {/* BLS Job Outlook/Projections */}
          {wageData && (
            <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-300 rounded-xl p-4 flex flex-col gap-1 shadow-inner mb-6">              
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-blue-700 font-bold">📊 Job Outlook (BLS 2023–33)</span>
                
                {/* Status Badges */}
                <div className="flex flex-wrap gap-1">
                  {getStatusBadges(projectionData).map(badge => badge)}
                </div>
              </div>
              
              <div className="font-medium text-slate-700 mb-2">
                {wageData.occupationName}
              </div>
              
              {projectionData ? (
                <>
                  {/* Primary Employment & Growth Data */}
                  <div className="bg-white/50 rounded-lg p-3 mb-3 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-800 mb-2">Employment & Growth</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {projectionData.projected_2023 && (
                        <div>
                          <div className="text-xs text-slate-500">2023 Jobs</div>
                          <div className="font-semibold text-green-700">{projectionData.projected_2023.toLocaleString()}K</div>
                        </div>
                      )}
                      {projectionData.projected_2033 && (
                        <div>
                          <div className="text-xs text-slate-500">2033 Jobs</div>
                          <div className="font-semibold text-green-700">{projectionData.projected_2033.toLocaleString()}K</div>
                        </div>
                      )}
                      {projectionData.projected_percent && (
                        <div>
                          <div className="text-xs text-slate-500">Growth Rate</div>
                          <div className={`font-semibold ${projectionData.projected_percent > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {projectionData.projected_percent > 0 ? '+' : ''}{projectionData.projected_percent}%
                          </div>
                        </div>
                      )}
                      {projectionData.projected_change && (
                        <div>
                          <div className="text-xs text-slate-500">Job Change</div>
                          <div className={`font-semibold ${projectionData.projected_change > 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {projectionData.projected_change > 0 ? '+' : ''}{projectionData.projected_change.toLocaleString()}K
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                    {/* Factors Affecting Growth */}
                  {projectionData.factors && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-3 border border-amber-200">
                      <div className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
                        🔍 Why This Growth is Happening
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                        {projectionData.factors.length > 200 ? (
                          <details className="cursor-pointer">
                            <summary className="font-medium text-slate-800 hover:text-amber-700">
                              {projectionData.factors.substring(0, 150)}...
                              <span className="text-amber-600 ml-1">[Click to read more]</span>
                            </summary>
                            <div className="mt-2 pl-2 border-l-2 border-amber-300">
                              {projectionData.factors}
                            </div>
                          </details>
                        ) : (
                          projectionData.factors
                        )}
                      </div>
                      <div className="text-xs text-amber-600 mt-2 italic">
                        Source: BLS Factors Affecting Occupational Utilization
                      </div>
                    </div>
                  )}
                  
                  {/* Job Openings & Wage Data */}
                  <div className="bg-white/50 rounded-lg p-3 mb-3 border border-blue-200">
                    <div className="text-sm font-semibold text-blue-800 mb-2">Opportunities & Compensation</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {projectionData.projected_openings && (
                        <div>
                          <div className="text-xs text-slate-500">Annual Job Openings</div>
                          <div className="font-semibold text-blue-700">{projectionData.projected_openings.toLocaleString()}K</div>
                        </div>
                      )}
                      {projectionData.median_wage && (
                        <div>
                          <div className="text-xs text-slate-500">Median Annual Wage</div>
                          <div className="font-semibold text-green-700">${projectionData.median_wage.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Education & Requirements */}
                  {(projectionData.typical_education || projectionData.work_experience || projectionData.on_job_training) && (
                    <div className="bg-white/50 rounded-lg p-3 mb-3 border border-blue-200">
                      <div className="text-sm font-semibold text-blue-800 mb-2">Entry Requirements</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {projectionData.typical_education && (
                          <div>
                            <div className="text-xs text-slate-500">Education</div>
                            <div className="font-medium text-slate-700">{projectionData.typical_education}</div>
                          </div>
                        )}
                        {projectionData.work_experience && projectionData.work_experience !== 'None' && (
                          <div>
                            <div className="text-xs text-slate-500">Experience</div>
                            <div className="font-medium text-slate-700">{projectionData.work_experience}</div>
                          </div>
                        )}
                        {projectionData.on_job_training && projectionData.on_job_training !== 'None' && (
                          <div>
                            <div className="text-xs text-slate-500">Training</div>
                            <div className="font-medium text-slate-700">{projectionData.on_job_training}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}                  
                  <div className="text-xs text-green-700 border-t border-blue-200 pt-2">
                    📈 Source: BLS Employment Projections, Tables 1.2–1.12 (2023–2033)
                  </div>
                </>
              ) : (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  📊 No projection data available for this occupation in the database yet.
                </div>
              )}
              <div className="text-xs text-blue-600 mt-1">
                ⚡ Database-powered projections
              </div>
            </div>
          )}
        </div>        {/* Input Fields */}
        {employmentType === 'consulting' && (
          <div className="mb-8 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-700">Your Details</h3>
              {wageData && (
                <div className="flex gap-1">
                  <button
                    onClick={() => applyPreset('conservative')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    title="Conservative: Lower risk, more days"
                  >
                    🛡️ Safe
                  </button>
                  <button
                    onClick={() => applyPreset('moderate')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    title="Moderate: Balanced approach"
                  >
                    ⚖️ Balanced
                  </button>
                  <button
                    onClick={() => applyPreset('aggressive')}
                    className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                    title="Aggressive: Higher rates, fewer days"
                  >
                    🚀 Premium
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Annual Income Target ($)                  {wageData && wageData.wage.mean_annual && (
                    <span className="ml-2 text-xs text-blue-600">
                      (BLS avg: ${wageData.wage.mean_annual.toLocaleString()})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  value={income}
                  min={0}
                  onChange={e => setIncome(Number(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Annual Business Expenses ($)</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  value={expenses}
                  min={0}
                  onChange={e => setExpenses(Number(e.target.value))}
                />
                <div className="text-xs text-blue-600 mt-1">
                  Estimate all recurring business costs
                </div>
              </div>
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Billable Days per Year</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  value={billableDays}
                  min={1}
                  max={260}
                  onChange={e => setBillableDays(Number(e.target.value))}
                />
                <div className="text-xs text-blue-600 mt-1">
                  Typical: 180-220 days
                </div>
              </div>
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                  value={taxRate}
                  min={0}
                  max={60}
                  onChange={e => setTaxRate(Number(e.target.value))}
                />
                <div className="text-xs text-blue-600 mt-1">
                  Combined federal, state, local
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="includeBenefits"
                    checked={includeBenefits}
                    onChange={e => setIncludeBenefits(e.target.checked)}
                    className="accent-blue-500"
                  />
                  <label htmlFor="includeBenefits" className="text-slate-700 font-semibold">
                    Include Benefits (health, retirement, etc.)
                  </label>
                </div>
                
                {includeBenefits && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Annual Benefits Cost ($)                      {wageData && wageData.benefits.avg_annual && (
                        <span className="ml-2 text-xs text-blue-600">
                          (BLS avg: ${wageData.benefits.avg_annual.toLocaleString()})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                      value={benefits}
                      min={0}
                      onChange={e => setBenefits(Number(e.target.value))}
                    />
                    <div className="text-xs text-blue-600 mt-1">Use average or your estimate</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}{/* Results */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-md bg-gradient-to-br from-blue-400 via-blue-200 to-slate-50 border border-blue-500 rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center">
            <div className="text-lg text-slate-700 font-semibold mb-2 tracking-wide">
              Your Target Daily Rate
            </div>
            <div className="text-6xl font-extrabold text-blue-600 drop-shadow-xl mb-2">
              ${employmentType === 'consulting' 
                ? (dailyRate > 0 ? dailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--')
                : (blsDaily ? blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--')
              }
            </div>
            <div className="text-slate-600 text-base mb-2">
              {employmentType === 'consulting' 
                ? 'Based on your inputs above' 
                : 'Based on BLS benchmark for selected occupation'
              }
            </div>
            <div className="text-slate-700 text-sm mb-2">
              {(employmentType === 'consulting' && dailyRate > 0) && (
                <span>
                  Equivalent hourly: <b>${(dailyRate / 8).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> 
                  <span className="font-normal"> (8-hour day)</span>
                </span>
              )}
              {(employmentType === 'employee' && blsDaily) && (
                <span>
                  Equivalent hourly: <b>${(blsDaily / 8).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> 
                  <span className="font-normal"> (8-hour day)</span>
                </span>
              )}
            </div>
            {employmentType === 'consulting' && blsDaily && (
              <div className="text-xs text-amber-700 mb-2">
                BLS avg daily: ${blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                {dailyRate > 0 && (
                  <span className={`ml-2 font-bold ${dailyRate > blsDaily ? 'text-green-700' : 'text-red-700'}`}>
                    ({dailyRate > blsDaily ? '+' : ''}{((dailyRate - blsDaily) / blsDaily * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            )}
            {employmentType === 'consulting' && dailyRate > 0 && (
              <div className="text-xs text-slate-600 mt-2 text-center">
                Gross needed: ${grossNeeded.toLocaleString(undefined, { maximumFractionDigits: 2 })} annually
              </div>
            )}
          </div>
          
          {/* Additional Calculation Breakdown for Consulting */}
          {employmentType === 'consulting' && dailyRate > 0 && (
            <div className="w-full max-w-md mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-700 mb-4 text-center">Calculation Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Income:</span>
                  <span className="font-semibold">${income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Business Expenses:</span>
                  <span className="font-semibold">${expenses.toLocaleString()}</span>
                </div>
                {includeBenefits && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Benefits:</span>
                    <span className="font-semibold">${benefits.toLocaleString()}</span>
                  </div>
                )}
                <hr className="border-slate-300" />
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">${(income + totalExpenses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax Rate ({taxRate}%):</span>
                  <span className="font-semibold">${((grossNeeded - (income + totalExpenses))).toLocaleString()}</span>
                </div>
                <hr className="border-slate-300" />
                <div className="flex justify-between text-base font-bold">
                  <span className="text-slate-700">Gross Revenue Needed:</span>
                  <span className="text-blue-600">${grossNeeded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span className="text-slate-700">÷ Billable Days ({billableDays}):</span>
                  <span className="text-blue-600">${dailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>                </div>
              </div>
            </div>
          )}          {/* Action Buttons - Export Analysis */}
          {(dailyRate > 0 || blsDaily) && (
            <div className="w-full max-w-md mt-6 space-y-2 relative z-50">
              <div className="text-xs text-slate-600 font-medium mb-3 text-center">Export Analysis</div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={(e) => {
                    console.log('Copy button clicked - event fired!');
                    e.preventDefault();
                    e.stopPropagation();
                    copyToClipboard(generateShareableResults());
                  }}
                  onMouseDown={(e) => {
                    console.log('Copy button mouse down');
                    e.preventDefault();
                  }}
                  className="group flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-300 hover:border-sky-400 hover:bg-sky-50 text-slate-600 hover:text-sky-700 font-medium py-3 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer relative z-50"
                  title="Copy detailed analysis to clipboard"
                  style={{ pointerEvents: 'all', position: 'relative', zIndex: 999 }}
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform pointer-events-none">📋</span>
                  <span className="text-xs pointer-events-none">Copy</span>
                </button>
                <button
                  onClick={(e) => {
                    console.log('Save button clicked - event fired!');
                    e.preventDefault();
                    e.stopPropagation();
                    const results = generateShareableResults();
                    const blob = new Blob([results], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `rate-analysis-${selectedDetailed || 'occupation'}-${new Date().toISOString().split('T')[0]}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  onMouseDown={(e) => {
                    console.log('Save button mouse down');
                    e.preventDefault();
                  }}
                  className="group flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-medium py-3 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer relative z-50"
                  title="Download analysis as text file"
                  style={{ pointerEvents: 'all', position: 'relative', zIndex: 999 }}
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform pointer-events-none">💾</span>
                  <span className="text-xs pointer-events-none">Save</span>
                </button>
                <button
                  onClick={(e) => {
                    console.log('Print button clicked - event fired!');
                    e.preventDefault();
                    e.stopPropagation();
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Rate Calculator Analysis</title>
                            <style>
                              body { font-family: 'Courier New', monospace; padding: 20px; line-height: 1.4; }
                              pre { white-space: pre-wrap; word-wrap: break-word; }
                            </style>
                          </head>
                          <body>
                            <pre>${generateShareableResults()}</pre>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.print();
                    } else {
                      alert('Please allow popups to use the print feature');
                    }
                  }}
                  onMouseDown={(e) => {
                    console.log('Print button mouse down');
                    e.preventDefault();
                  }}
                  className="group flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium py-3 px-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer relative z-50"
                  title="Print detailed analysis"
                  style={{ pointerEvents: 'all', position: 'relative', zIndex: 999 }}
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform pointer-events-none">🖨️</span>
                  <span className="text-xs pointer-events-none">Print</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
