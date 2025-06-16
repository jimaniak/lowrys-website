"use client";

// Employment type toggle
  // (must be after "use client")


import { useState, useEffect, useRef } from "react";

// US State codes to names (add more as needed)
const US_STATE_NAMES: Record<string, string> = {
  US: "All (United States)",
  // CA: "California", // Commented out to display 'CA' like other unlisted state codes
  // ...add all states as before
};


export default function Page() {
  // Add employmentType state for toggle functionality
  const [employmentType, setEmploymentType] = useState<'consulting' | 'employee'>('employee');
  const [data, setData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Hierarchical selection state
  const [majorGroups, setMajorGroups] = useState<any[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL"); // Default to ALL
  const [detailedOccupations, setDetailedOccupations] = useState<any[]>([]);
  const [selectedDetailed, setSelectedDetailed] = useState<string>("");
  const [detailedOccupationSearch, setDetailedOccupationSearch] = useState<string>(""); // New state for search text
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("US");
  // Use a ref to store the merged detail map for the current major group
  const mergedDetailMapRef = useRef(new Map());

  // Benchmark state
  const [blsWage, setBlsWage] = useState<number | null>(null);
  const [blsBenefit, setBlsBenefit] = useState<number | null>(null);

  // User input state (as before)
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(12000);
  const [billableDays, setBillableDays] = useState<number>(180);
  const [taxRate, setTaxRate] = useState<number>(25);
  const [includeBenefits, setIncludeBenefits] = useState(false);
  const [benefits, setBenefits] = useState<number>(0);
  // Load hierarchical data with projections
  useEffect(() => {
    // Try to load the merged data first, fall back to original if not available
    fetch("/data/bls-benchmarks-hierarchical-with-projections.json")
      .then(res => {
        if (!res.ok) {
          // Fall back to original file
          return      fetch("/data/bls-benchmarks-hierarchical-with-projections.json");
        }
        return res;
      })
      .then(res => res.json())
      .then(json => {
        setData(json);
        const refreshDate = Object.keys(json)[0];
        setLastRefreshed(refreshDate);
        let majors = Object.entries(json[refreshDate]).map(([code, val]: any) => ({ code, name: val.name }));
        majors.sort((a, b) => a.name.localeCompare(b.name)); // Sort major groups by name
        // Add "All Major Groups" option to the beginning
        setMajorGroups([{ code: "ALL", name: "All Major Groups" }, ...majors]);
        // setSelectedMajor is already defaulted to "ALL"
      })
      .catch(err => {
        console.error('Error loading BLS data:', err);
      });
  }, []);

  // Update detailed occupations when major group changes (MERGED REGIONS, useRef)
  useEffect(() => {
    if (!data || !selectedMajor) return;
    const refreshDate = Object.keys(data)[0];
    const majorObj = data[refreshDate][selectedMajor];
    // Map: code -> { code, name, regions: { ...all regions merged... } }
    const mergedDetailMap = new Map();
    if (majorObj && majorObj.minor_groups) {
      for (const minor of Object.values(majorObj.minor_groups)) {
    for (const broad of Object.values((minor as any).broad_occupations)) {
      for (const [dCode, dVal] of Object.entries((broad as any).detailed_occupations)) {
        const safeDVal = dVal as any;
        if (!mergedDetailMap.has(dCode)) {
          mergedDetailMap.set(dCode, {
            code: dCode,
            name: safeDVal.name,
            regions: { ...safeDVal.regions },
            projections: safeDVal.projections, // Ensure projections are carried over
            occupationData: safeDVal.occupationData // Ensure occupationData is carried over
          });
        } else {
          // Merge regions
          const existing = mergedDetailMap.get(dCode);
          for (const [regionKey, regionVal] of Object.entries((safeDVal).regions)) {
            existing.regions[regionKey] = regionVal;
          }
        }
      }
    }
      }
    }
    mergedDetailMapRef.current = mergedDetailMap;
    // Prepare deduped list for dropdown, filtering out roll-up/aggregate rows (where code === major group code)
    // and also filtering out detailed occupations that only have the US region (no state-level data)
    const details = Array.from(mergedDetailMap.values())
      .filter(({ code, regions }) => code !== selectedMajor && Object.keys(regions).some(r => r !== 'US'))
      .map(({ code, name }) => ({ code, name }));
    details.sort((a, b) => a.name.localeCompare(b.name));
    setDetailedOccupations(details);
    setSelectedDetailed(details[0]?.code || "");
    setRegions([]);
    setSelectedRegion("US");
  }, [data, selectedMajor]);

  // Update detailed occupations when major group or data changes
  useEffect(() => {
    if (!data) return;
    const refreshDate = Object.keys(data)[0];
    const allDetailedOccupations = new Map();

    const processMajorGroup = (majorCode: string) => {
      const majorObj = data[refreshDate][majorCode];
      if (majorObj && majorObj.minor_groups) {
        for (const minor of Object.values(majorObj.minor_groups)) {
          for (const broad of Object.values((minor as any).broad_occupations)) {
            for (const [dCode, dVal] of Object.entries((broad as any).detailed_occupations)) {
              const safeDVal = dVal as any;
              if (!allDetailedOccupations.has(dCode)) {
                allDetailedOccupations.set(dCode, {
                  code: dCode,
                  name: safeDVal.name,
                  regions: { ...safeDVal.regions },
                  projections: safeDVal.projections,
                  occupationData: safeDVal.occupationData,
                  majorGroupCode: majorCode // Keep track of the original major group for later use if needed
                });
              } else {
                // If dCode is already there, merge regions (though less likely if processing all groups)
                const existing = allDetailedOccupations.get(dCode);
                for (const [regionKey, regionVal] of Object.entries((safeDVal).regions)) {
                  existing.regions[regionKey] = regionVal;
                }
              }
            }
          }
        }
      }
    };

    if (selectedMajor === "ALL") {
      // Iterate over all major groups in the data (excluding the "ALL" we added to majorGroups state)
      majorGroups.filter(mg => mg.code !== "ALL").forEach(mg => {
        processMajorGroup(mg.code);
      });
    } else if (data[refreshDate][selectedMajor]) {
      // Process only the selected major group
      processMajorGroup(selectedMajor);
    }

    mergedDetailMapRef.current = allDetailedOccupations;

    const detailsArray = Array.from(allDetailedOccupations.values())
      .filter(({ code, regions }) => {
        // When "ALL" major groups, we don't filter by code === selectedMajor
        // We might still want to filter out occupations that only have US region if that's desired
        return Object.keys(regions).some(r => r !== 'US');
      })
      .map(({ code, name }) => ({ code, name }));

    detailsArray.sort((a, b) => a.name.localeCompare(b.name));
    setDetailedOccupations(detailsArray);
    setDetailedOccupationSearch(""); // Reset search on major group change
    // Don't auto-select first detailed occupation here, let the search filter handle it
    // setSelectedDetailed(detailsArray[0]?.code || ""); 
    setRegions([]);
    setSelectedRegion("US");

  }, [data, selectedMajor, majorGroups]); // Added majorGroups to dependency array

  // Filter detailed occupations based on search text
  const filteredDetailedOccupations = detailedOccupations.filter(occupation =>
    occupation.name.toLowerCase().includes(detailedOccupationSearch.toLowerCase())
  );

  // Update selectedDetailed when filteredDetailedOccupations changes
  useEffect(() => {
    if (filteredDetailedOccupations.length > 0 && !filteredDetailedOccupations.some(do_ => do_.code === selectedDetailed)) {
      setSelectedDetailed(filteredDetailedOccupations[0].code);
    }
  }, [filteredDetailedOccupations]);

  // Update regions and benchmarks when detailed occupation changes (use merged map from useRef)
  useEffect(() => {
    if (!data || !selectedDetailed) return; // Removed selectedMajor dependency here as mergedDetailMapRef should have all occupations if ALL is selected
    const mergedDetailMap = mergedDetailMapRef.current;
    if (!mergedDetailMap || !mergedDetailMap.has(selectedDetailed)) {
      setRegions([]);
      setSelectedRegion("US");
      setBlsWage(null);
      setBlsBenefit(null);
      return;
    }
    const detailObj = mergedDetailMap.get(selectedDetailed);
    if (!detailObj || !detailObj.regions) {
      setRegions([]);
      setSelectedRegion("US");
      setBlsWage(null);
      setBlsBenefit(null);
      // If detailedObj exists but regions don't, it might be an issue with data structure or initial load
      // console.log("Detail object found, but no regions:", detailObj);
      return;
    }
    const regionKeys = Object.keys(detailObj.regions);
    // Sort regionKeys by their display names via US_STATE_NAMES, putting 'US' first
    regionKeys.sort((a, b) => {
      if (a === 'US') return -1;
      if (b === 'US') return 1;
      return (US_STATE_NAMES[a] || a).localeCompare(US_STATE_NAMES[b] || b);
    });
    setRegions(regionKeys);
    setSelectedRegion(regionKeys[0]);
    // Set wage/benefit for default region
    setBlsWage(detailObj.regions[regionKeys[0]].wage.mean_annual);
    setBlsBenefit(detailObj.regions[regionKeys[0]].benefits.avg_annual);
    setIncome(detailObj.regions[regionKeys[0]].wage.mean_annual);
    setBenefits(detailObj.regions[regionKeys[0]].benefits.avg_annual);
  }, [data, selectedDetailed]); // Removed selectedMajor from dependency array

  // Update wage/benefit when region changes (use merged map from useRef)
  useEffect(() => {
    if (!data || !selectedDetailed || !selectedRegion) return; // Removed selectedMajor dependency
    const mergedDetailMap = mergedDetailMapRef.current;
    if (!mergedDetailMap || !mergedDetailMap.has(selectedDetailed)) return;
    const detailObj = mergedDetailMap.get(selectedDetailed);
    if (!detailObj || !detailObj.regions) return;
    const regionObj = detailObj.regions[selectedRegion];
    setBlsWage(regionObj.wage.mean_annual);
    setBlsBenefit(regionObj.benefits.avg_annual);
    setIncome(regionObj.wage.mean_annual);
    setBenefits(regionObj.benefits.avg_annual);
  }, [selectedRegion, data, selectedDetailed]); // Removed selectedMajor from dependency array

  // Calculation
  const totalExpenses = includeBenefits ? expenses + benefits : expenses;
  const grossNeeded = (income + totalExpenses) / (1 - taxRate / 100);
  const dailyRate = billableDays > 0 ? grossNeeded / billableDays : 0;
  const blsDaily = blsWage && billableDays > 0 ? blsWage / billableDays : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-200 via-yellow-100 to-amber-100 flex items-center justify-center py-12">
      <div className="w-full max-w-xl bg-white/90 rounded-3xl shadow-2xl border-2 border-amber-300 p-10 relative overflow-hidden">
        <div className="flex items-center mb-8 relative z-10">
          <span className="inline-block bg-green-200 rounded-full p-4 mr-4 shadow-md">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <path fill="#059669" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 10.9 12 11.5 12 13h-2v-.5c0-1 .45-1.99 1.17-2.71l1.24-1.26A2 2 0 0012 7a2 2 0 00-2 2H8a4 4 0 018 0c0 1.1-.45 2.1-1.17 2.83z"/>
            </svg>
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-green-900 tracking-tight">Consultant Rate Calculator</h1>
            <p className="text-base text-amber-700 font-medium mt-1">Financial clarity for independent professionals</p>
          </div>
        </div>
        {/* --- Employment Type Toggle --- */}
        <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl bg-green-100 border border-green-300 shadow-sm overflow-hidden dark:bg-slate-700 dark:border-slate-600">
          <button
            className={`px-5 py-2 font-semibold transition-colors ${
              employmentType === 'employee'
                ? 'bg-green-300 text-green-900 !dark:text-black' // Selected: light green bg, forced black text for dark mode
                : 'text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-slate-600' // Not selected
            }`}
            onClick={() => setEmploymentType('employee')}
            type="button"
          >
            Traditional Employment
          </button>
          <button
            className={`px-5 py-2 font-semibold transition-colors ${
              employmentType === 'consulting'
                ? 'bg-green-300 text-green-900 !dark:text-black' // Selected: light green bg, forced black text for dark mode
                : 'text-green-700 hover:bg-green-200 dark:text-green-300 dark:hover:bg-slate-600' // Not selected
            }`}
            onClick={() => setEmploymentType('consulting')}
            type="button"
          >
            Consulting / Self-Employed
          </button>
        </div>
        </div>

        {/* --- Cascading Dropdowns --- */}
        <div className="mb-8 relative z-10">
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-green-900 font-semibold mb-1">Major Group</label>
              <select className="border-2 border-amber-200 rounded-lg px-3 py-2" value={selectedMajor} onChange={e => setSelectedMajor(e.target.value)}>
                {majorGroups.map(mg => <option key={mg.code} value={mg.code}>{mg.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-green-900 font-semibold mb-1">Search Detailed Occupation</label>
              <input
                type="text"
                placeholder="Type to search all detailed occupations..."
                className="border-2 border-amber-200 rounded-lg px-3 py-2 mb-2 w-full"
                value={detailedOccupationSearch}
                onChange={e => setDetailedOccupationSearch(e.target.value)}
              />
              <label className="block text-green-900 font-semibold mb-1">Detailed Occupation</label>
              <select
                className="border-2 border-amber-200 rounded-lg px-3 py-2 w-full" // Added w-full for better layout
                value={selectedDetailed}
                onChange={e => setSelectedDetailed(e.target.value)}
                disabled={filteredDetailedOccupations.length === 0}
              >
                {filteredDetailedOccupations.length === 0 ? (
                  <option value="">{detailedOccupationSearch ? 'No matching occupations' : (detailedOccupations.length === 0 ? 'Select Major Group or Search' : 'No occupations loaded')}</option>
                ) : (
                  filteredDetailedOccupations.map((do_: { code: string; name: string }) => <option key={do_.code} value={do_.code}>{do_.name}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-green-900 font-semibold mb-1">U.S. State</label>
              <select className="border-2 border-amber-200 rounded-lg px-3 py-2" value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
                {regions.map(r => <option key={r} value={r}>{US_STATE_NAMES[r] || r}</option>)}
              </select>
            </div>
          </div>

        {/* Benchmark display as before */}
        {blsWage && blsBenefit && (
          <div className="bg-gradient-to-r from-amber-100 to-green-50 border border-amber-300 rounded-xl p-4 flex flex-col gap-1 shadow-inner mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-700 font-bold">BLS Benchmark:</span>
              <span className="text-green-900 font-semibold">
                {detailedOccupations.find(d => d.code === selectedDetailed)?.name} ({US_STATE_NAMES[selectedRegion] || selectedRegion})
              </span>
            </div>
            <div className="text-sm text-green-900">
              <b>Avg. Annual Wage ({lastRefreshed}):</b> ${blsWage.toLocaleString()}
              {blsDaily && (
                <span className="ml-4"><b>Avg. Daily:</b> ${blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              )}
            </div>
            <div className="text-sm text-green-900">
              <b>Est. Avg. Benefits:</b> ${blsBenefit?.toLocaleString()} (31% of wage, BLS ECEC)
            </div>
            <div className="text-xs text-green-700 mt-1">Wages and benefits are U.S. national averages for consulting services. Adjust for your region and specialty as needed.</div>
            <div className="text-xs text-amber-700 mt-1 italic">Benchmarks last refreshed: {lastRefreshed} (static, updated periodically)</div>
          </div>
        )}        {/* --- BLS Outlook/Projections Information Window (Enhanced) --- */}
        {(() => {
          // Get comprehensive occupation data for the selected detailed occupation
          const mergedDetailMap = mergedDetailMapRef.current;
          const detailObj = mergedDetailMap && mergedDetailMap.get(selectedDetailed);
          const projections = detailObj && detailObj.projections;
          const occupationData = detailObj && detailObj.occupationData;
          
          // Check for flags from different tables
          const isInTable13 = occupationData && occupationData.sheets && occupationData.sheets['Table 1.3']; // Fastest growing
          const isInTable14 = occupationData && occupationData.sheets && occupationData.sheets['Table 1.4']; // Most job growth
          const isInTable15 = occupationData && occupationData.sheets && occupationData.sheets['Table 1.5']; // Fastest declining
          const isInTable16 = occupationData && occupationData.sheets && occupationData.sheets['Table 1.6']; // Largest declines
          
          return (
            <div className="bg-gradient-to-r from-green-50 to-amber-100 border border-green-300 rounded-xl p-4 flex flex-col gap-1 shadow-inner mb-6" aria-live="polite">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-green-700 font-bold">Job Outlook (BLS 2023–33):</span>
                <span className="text-green-900 font-semibold">{detailedOccupations.find(d => d.code === selectedDetailed)?.name}</span>
                
                {/* Status Badges */}
                {isInTable13 && (
                  <span className="px-2 py-1 rounded bg-green-200 text-green-900 font-bold text-xs border border-green-400 animate-pulse" title="BLS: Among the fastest growing occupations">
                    ⬆️ FASTEST GROWING
                  </span>
                )}
                {isInTable14 && (
                  <span className="px-2 py-1 rounded bg-blue-200 text-blue-900 font-bold text-xs border border-blue-400" title="BLS: Among occupations with the most job growth">
                    � MOST JOB GROWTH
                  </span>
                )}
                {isInTable15 && (
                  <span className="px-2 py-1 rounded bg-red-200 text-red-900 font-bold text-xs border border-red-400 animate-pulse" title="BLS: Among the fastest declining occupations">
                    ⬇️ FASTEST DECLINING
                  </span>
                )}
                {isInTable16 && (
                  <span className="px-2 py-1 rounded bg-orange-200 text-orange-900 font-bold text-xs border border-orange-400" title="BLS: Among occupations with the largest job declines">
                    📉 LARGEST DECLINES
                  </span>
                )}
              </div>
              
              {projections ? (
                <>
                  {/* Primary Employment & Growth Data */}
                  <div className="text-sm text-green-900 flex flex-wrap gap-4 mb-2">
                    {projections.projected_2023 && (
                      <span><b>2023 Jobs:</b> {parseFloat(projections.projected_2023).toLocaleString()}K</span>
                    )}
                    {projections.projected_2033 && (
                      <span><b>2033 Jobs:</b> {parseFloat(projections.projected_2033).toLocaleString()}K</span>
                    )}
                    {projections.projected_percent && (
                      <span><b>Growth:</b> {projections.projected_percent}%</span>
                    )}
                    {projections.projected_change && (
                      <span><b>Change:</b> +{parseFloat(projections.projected_change).toLocaleString()}K</span>
                    )}
                  </div>
                  
                  {/* Job Openings Data */}
                  <div className="text-sm text-green-900 flex flex-wrap gap-4 mb-2">
                    {projections.projected_openings && (
                      <span><b>Annual Openings:</b> {parseFloat(projections.projected_openings).toLocaleString()}K</span>
                    )}
                    {projections.median_wage && (
                      <span><b>Median Wage:</b> ${parseInt(projections.median_wage).toLocaleString()}</span>
                    )}
                  </div>
                  
                  {/* Education & Requirements */}
                  <div className="text-sm text-green-900 flex flex-wrap gap-4 mb-2">
                    {projections.typical_education && (
                      <span><b>Education:</b> {projections.typical_education}</span>
                    )}
                    {projections.work_experience && projections.work_experience !== 'None' && (
                      <span><b>Experience:</b> {projections.work_experience}</span>
                    )}
                    {projections.on_job_training && projections.on_job_training !== 'None' && (
                      <span><b>Training:</b> {projections.on_job_training}</span>
                    )}
                  </div>
                  
                  {/* Additional Insights */}
                  {projections.factors && (
                    <div className="text-xs text-green-800 mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                      <b>Market Factors:</b> {projections.factors}
                    </div>
                  )}
                  
                  <div className="text-xs text-green-700 mt-1">Source: BLS Employment Projections, Tables 1.2–1.12 (2023–2033)</div>
                </>
              ) : (
                <div className="text-xs text-amber-700 mt-2">
                  {occupationData ? 
                    'Limited projections data available for this occupation.' : 
                    'No projections data found for this occupation.'
                  }
                  {occupationData && (
                    <div className="mt-2">
                      <b>Available data from:</b> {Object.keys(occupationData.sheets || {}).join(', ')}
                    </div>
                  )}
                </div>              )}
            </div>
          );
        })()}

        {/* --- User Input Fields --- */}
        {employmentType === 'consulting' && (
        <div className="space-y-4">
          <div>
            <label className="block text-green-900 font-semibold mb-1">Annual Income Target ($)
              {blsWage && (
                <span className="ml-2 text-xs text-amber-700">(BLS avg: ${blsWage.toLocaleString()})</span>
              )}
            </label>
            <input
              type="number"
              className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-amber-200"
              value={income}
              min={0}
              onChange={e => setIncome(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-green-900 font-semibold mb-1">Annual Business Expenses ($)</label>
            <input
              type="number"
              className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-amber-200"
              value={expenses}
              min={0}
              onChange={e => setExpenses(Number(e.target.value))}
            />
            <div className="text-xs text-amber-600 mt-1">Estimate all recurring business costs (software, insurance, office, etc.)</div>
          </div>
          <div>
            <label className="block text-green-900 font-semibold mb-1">Billable Days per Year</label>
            <input
              type="number"
              className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-amber-200"
              value={billableDays}
              min={1}
              max={260}
              onChange={e => setBillableDays(Number(e.target.value))}
            />
            <div className="text-xs text-amber-600 mt-1">Typical: 180-220 (account for vacation, holidays, admin, sales, etc.)</div>
          </div>
          <div>
            <label className="block text-green-900 font-semibold mb-1">Tax Rate (%)</label>
            <input
              type="number"
              className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-amber-200"
              value={taxRate}
              min={0}
              max={60}
              onChange={e => setTaxRate(Number(e.target.value))}
            />
            <div className="text-xs text-amber-600 mt-1">Estimate your effective combined federal, state, and local tax rate</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeBenefits"
              checked={includeBenefits}
              onChange={e => setIncludeBenefits(e.target.checked)}
              className="accent-amber-500"
            />
            <label htmlFor="includeBenefits" className="text-green-900 font-semibold">Include Benefits (health, retirement, etc.)</label>
          </div>
          {includeBenefits && (
            <div>
              <label className="block text-green-900 font-semibold mb-1">Annual Benefits Cost ($)
                {blsBenefit && (
                  <span className="ml-2 text-xs text-amber-700">(BLS avg: ${blsBenefit.toLocaleString()})</span>
                )}
              </label>
              <input
                type="number"
                className="w-full border-2 border-amber-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:ring-amber-200"
                value={benefits}
                min={0}
                onChange={e => setBenefits(Number(e.target.value))}
              />
              <div className="text-xs text-amber-600 mt-1">Use an average or your own estimate</div>
            </div>
          )}
        </div>
        )}

        {/* --- Calculated Rate Display --- */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-full max-w-md bg-gradient-to-br from-green-300 via-green-100 to-amber-50 border border-green-400 rounded-2xl shadow-xl px-8 py-8 flex flex-col items-center">
            <div className="text-lg text-green-900 font-semibold mb-2 tracking-wide">Your Target Daily Rate</div>
            <div className="text-6xl font-extrabold text-amber-600 drop-shadow-xl mb-2">${
              employmentType === 'consulting'
                ? (dailyRate > 0 ? dailyRate.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--')
                : (blsDaily ? blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '--')
            }</div>
            <div className="text-green-800 text-base mb-2">
              {employmentType === 'consulting' ? 'Based on your inputs above' : 'Based on BLS benchmark for selected occupation'}
            </div>
            <div className="text-green-900 text-sm mb-2">
              {(employmentType === 'consulting' && dailyRate > 0) && (
                <span>Equivalent hourly: <b>${(dailyRate / 8).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> <span className="font-normal">(8-hour day)</span></span>
              )}
              {(employmentType === 'employee' && blsDaily) && (
                <span>Equivalent hourly: <b>${(blsDaily / 8).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b> <span className="font-normal">(8-hour day)</span></span>
              )}
            </div>
            {employmentType === 'consulting' && blsDaily && (
              <div className="text-xs text-amber-700">BLS avg daily: ${blsDaily.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            )}
          </div>
        </div>
        </div>
        {/* ...rest of your form and calculation UI as before... */}
      </div>
    </main>
  );
}
