
"use client";

// Employment type toggle
  // (must be after "use client")


import { useState, useEffect } from "react";

// US State codes to names (add more as needed)
const US_STATE_NAMES: Record<string, string> = {
  US: "All (United States)",
  CA: "California",
  // ...add all states as before
};


export default function Page() {
  // Add employmentType state for toggle functionality
  const [employmentType, setEmploymentType] = useState<'consulting' | 'employee'>('consulting');
  const [data, setData] = useState<any>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  // Hierarchical selection state
  const [majorGroups, setMajorGroups] = useState<any[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [minorGroups, setMinorGroups] = useState<any[]>([]);
  const [selectedMinor, setSelectedMinor] = useState<string>("");
  const [broadOccupations, setBroadOccupations] = useState<any[]>([]);
  const [selectedBroad, setSelectedBroad] = useState<string>("");
  const [detailedOccupations, setDetailedOccupations] = useState<any[]>([]);
  const [selectedDetailed, setSelectedDetailed] = useState<string>("");
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("US");

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

  // Load hierarchical data
  useEffect(() => {
    fetch("/data/bls-benchmarks-hierarchical.json")
      .then(res => res.json())
      .then(json => {
        setData(json);
        const refreshDate = Object.keys(json)[0];
        setLastRefreshed(refreshDate);
        const majors = Object.entries(json[refreshDate]).map(([code, val]: any) => ({ code, name: val.name }));
        setMajorGroups(majors);
        setSelectedMajor(majors[0]?.code || "");
      });
  }, []);

  // Update minor groups when major changes
  useEffect(() => {
    if (!data || !selectedMajor) return;
    const refreshDate = Object.keys(data)[0];
    const minors = Object.entries(data[refreshDate][selectedMajor]?.minor_groups || {}).map(([code, val]: any) => ({ code, name: val.name }));
    let minorsWithAll = minors;
    if (minors.length > 1) {
      minorsWithAll = minors[0].code !== "ALL" ? [{ code: "ALL", name: "All" }, ...minors] : minors;
    }
    setMinorGroups(minorsWithAll);
    setSelectedMinor(minorsWithAll[0]?.code || "");
    setBroadOccupations([]);
    setSelectedBroad("");
    setDetailedOccupations([]);
    setSelectedDetailed("");
    setRegions([]);
    setSelectedRegion("US");
  }, [data, selectedMajor]);

  // Update broad occupations when minor changes
  useEffect(() => {
    if (!data || !selectedMajor || !selectedMinor) return;
    if (selectedMinor === "ALL") {
      setBroadOccupations([]);
      setSelectedBroad("");
      setDetailedOccupations([]);
      setSelectedDetailed("");
      setRegions([]);
      setSelectedRegion("US");
      return;
    }
    const refreshDate = Object.keys(data)[0];
    const broads = Object.entries(data[refreshDate][selectedMajor]?.minor_groups?.[selectedMinor]?.broad_occupations || {}).map(([code, val]: any) => ({ code, name: val.name }));
    let broadsWithAll = broads;
    if (broads.length > 1) {
      broadsWithAll = broads[0].code !== "ALL" ? [{ code: "ALL", name: "All" }, ...broads] : broads;
    }
    setBroadOccupations(broadsWithAll);
    setSelectedBroad(broadsWithAll[0]?.code || "");
    setDetailedOccupations([]);
    setSelectedDetailed("");
    setRegions([]);
    setSelectedRegion("US");
  }, [data, selectedMajor, selectedMinor]);

  // Update detailed occupations when broad changes
  useEffect(() => {
    if (!data || !selectedMajor || !selectedMinor || !selectedBroad) return;
    if (selectedBroad === "ALL") {
      setDetailedOccupations([]);
      setSelectedDetailed("");
      setRegions([]);
      setSelectedRegion("US");
      return;
    }
    const refreshDate = Object.keys(data)[0];
    const details = Object.entries(
      data[refreshDate][selectedMajor]?.minor_groups?.[selectedMinor]?.broad_occupations?.[selectedBroad]?.detailed_occupations || {}
    ).map(([code, val]: any) => ({ code, name: val.name }));
    let detailsWithAll = details;
    if (details.length > 1) {
      detailsWithAll = details[0].code !== "ALL" ? [{ code: "ALL", name: "All" }, ...details] : details;
    }
    setDetailedOccupations(detailsWithAll);
    setSelectedDetailed(detailsWithAll[0]?.code || "");
    setRegions([]);
    setSelectedRegion("US");
  }, [data, selectedMajor, selectedMinor, selectedBroad]);

  // Update regions and benchmarks when detailed occupation changes
  useEffect(() => {
    if (!data || !selectedMajor || !selectedMinor || !selectedBroad || !selectedDetailed) return;
    if (selectedDetailed === "ALL") {
      setRegions([]);
      setSelectedRegion("US");
      setBlsWage(null);
      setBlsBenefit(null);
      return;
    }
    const refreshDate = Object.keys(data)[0];
    const detailObj =
      data[refreshDate][selectedMajor]?.minor_groups?.[selectedMinor]?.broad_occupations?.[selectedBroad]?.detailed_occupations?.[selectedDetailed];
    if (!detailObj || !detailObj.regions) {
      setRegions([]);
      setSelectedRegion("US");
      setBlsWage(null);
      setBlsBenefit(null);
      return;
    }
    const regionKeys = Object.keys(detailObj.regions);
    setRegions(regionKeys);
    setSelectedRegion(regionKeys[0]);
    // Set wage/benefit for default region
    setBlsWage(detailObj.regions[regionKeys[0]].wage.mean_annual);
    setBlsBenefit(detailObj.regions[regionKeys[0]].benefits.avg_annual);
    setIncome(detailObj.regions[regionKeys[0]].wage.mean_annual);
    setBenefits(detailObj.regions[regionKeys[0]].benefits.avg_annual);
  }, [data, selectedMajor, selectedMinor, selectedBroad, selectedDetailed]);

  // Update wage/benefit when region changes
  useEffect(() => {
    if (!data || !selectedMajor || !selectedMinor || !selectedBroad || !selectedDetailed || !selectedRegion) return;
    const refreshDate = Object.keys(data)[0];
    const detailObj =
      data[refreshDate][selectedMajor].minor_groups[selectedMinor].broad_occupations[selectedBroad].detailed_occupations[selectedDetailed];
    const regionObj = detailObj.regions[selectedRegion];
    setBlsWage(regionObj.wage.mean_annual);
    setBlsBenefit(regionObj.benefits.avg_annual);
    setIncome(regionObj.wage.mean_annual);
    setBenefits(regionObj.benefits.avg_annual);
  }, [selectedRegion]);

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
          <div className="inline-flex rounded-xl bg-green-100 border border-green-300 shadow-sm overflow-hidden">
            <button
              className={`px-5 py-2 font-semibold transition-colors ${employmentType === 'consulting' ? 'bg-green-300 text-green-900' : 'text-green-700 hover:bg-green-200'}`}
              onClick={() => setEmploymentType('consulting')}
              type="button"
            >
              Consulting / Self-Employed
            </button>
            <button
              className={`px-5 py-2 font-semibold transition-colors ${employmentType === 'employee' ? 'bg-green-300 text-green-900' : 'text-green-700 hover:bg-green-200'}`}
              onClick={() => setEmploymentType('employee')}
              type="button"
            >
              Traditional Employment
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
              <label className="block text-green-900 font-semibold mb-1">Minor Group</label>
              <select
                className="border-2 border-amber-200 rounded-lg px-3 py-2"
                value={selectedMinor}
                onChange={e => setSelectedMinor(e.target.value)}
                disabled={minorGroups.length === 0}
              >
                {minorGroups.length === 0 ? (
                  <option value="">No options</option>
                ) : (
                  minorGroups.map(mg => <option key={mg.code} value={mg.code}>{mg.name}</option>)
                )}
              </select>
            </div>
            <div>
              <label className="block text-green-900 font-semibold mb-1">Broad Occupation</label>
              <select
                className="border-2 border-amber-200 rounded-lg px-3 py-2"
                value={selectedBroad}
                onChange={e => setSelectedBroad(e.target.value)}
                disabled={broadOccupations.length === 0}
              >
                {broadOccupations.length === 0 ? (
                  <option value="">No options</option>
                ) : (
                  broadOccupations.map(bo => <option key={bo.code} value={bo.code}>{bo.name}</option>)
                )}
              </select>
            </div>
            <div>
              <label className="block text-green-900 font-semibold mb-1">Detailed Occupation</label>
              <select
                className="border-2 border-amber-200 rounded-lg px-3 py-2"
                value={selectedDetailed}
                onChange={e => setSelectedDetailed(e.target.value)}
                disabled={detailedOccupations.length === 0}
              >
                {detailedOccupations.length === 0 ? (
                  <option value="">No options</option>
                ) : (
                  detailedOccupations.map(do_ => <option key={do_.code} value={do_.code}>{do_.name}</option>)
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
          <div className="bg-gradient-to-r from-amber-100 to-green-50 border border-amber-300 rounded-xl p-4 flex flex-col gap-1 shadow-inner mb-6">
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
        )}

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
