// BLS Data Configuration Management
// Centralized configuration for data years and sources

const BLS_CONFIG = {
  // Current data years - update these when new BLS releases are available
  CURRENT: {
    BASE_YEAR: 2023,
    PROJECTION_YEAR: 2033,
    WAGE_YEAR: 2023,
    PROJECTED_WAGE_YEAR: 2034
  },
  
  // BLS release schedule and update detection
  RELEASE_SCHEDULE: {
    // OEWS data is typically released in March/April for previous year
    EXPECTED_RELEASE_MONTHS: [3, 4], // March, April
    CHECK_FREQUENCY_DAYS: 7, // Check every Sunday
    FORCE_UPDATE_AFTER_DAYS: 30 // Force update if we haven't checked in 30 days
  },
  
  // Data source URLs (automatically generated from years)
  getUrls() {
    const yearSuffix = this.CURRENT.BASE_YEAR % 100;
    return {
      NATIONAL: `https://www.bls.gov/oes/special.requests/oesm${yearSuffix}nat.zip`,
      STATE: `https://www.bls.gov/oes/special.requests/oesm${yearSuffix}st.zip`,
      NAT_FILENAME: `oesm${yearSuffix}nat/national_M${this.CURRENT.BASE_YEAR}_dl.xlsx`,
      STATE_FILENAME: `oesm${yearSuffix}st/state_M${this.CURRENT.BASE_YEAR}_dl.xlsx`
    };
  },
  
  // Auto-detect if we should update years based on current date
  shouldCheckForNewYear() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-based months
    const currentYear = now.getFullYear();
    
    // If we're in release season and our data is for previous year
    if (this.RELEASE_SCHEDULE.EXPECTED_RELEASE_MONTHS.includes(currentMonth)) {
      const expectedDataYear = currentYear - 1;
      if (this.CURRENT.BASE_YEAR < expectedDataYear) {
        return {
          shouldUpdate: true,
          suggestedYear: expectedDataYear,
          reason: `Current month ${currentMonth} is in release season, expected data for ${expectedDataYear}`
        };
      }
    }
    
    return { shouldUpdate: false };
  },
  
  // Update configuration (would typically write to config file)
  updateYears(newBaseYear) {
    console.log(`📅 Updating configuration from ${this.CURRENT.BASE_YEAR} to ${newBaseYear}`);
    
    this.CURRENT.BASE_YEAR = newBaseYear;
    this.CURRENT.PROJECTION_YEAR = newBaseYear + 10;
    this.CURRENT.WAGE_YEAR = newBaseYear;
    this.CURRENT.PROJECTED_WAGE_YEAR = newBaseYear + 11;
    
    // In a real implementation, you'd write this to a config file
    console.log('📝 New configuration:', this.CURRENT);
  }
};

// Usage in your script:
async function checkForConfigUpdates() {
  const yearCheck = BLS_CONFIG.shouldCheckForNewYear();
  
  if (yearCheck.shouldUpdate) {
    console.log(`🔔 ATTENTION: ${yearCheck.reason}`);
    console.log(`💡 Consider updating BASE_YEAR to ${yearCheck.suggestedYear}`);
    console.log(`   Current config: ${JSON.stringify(BLS_CONFIG.CURRENT, null, 2)}`);
    
    // You could auto-update or require manual confirmation
    // For safety, let's require manual update for now
    console.log('⚠️  Manual configuration update required!');
    return false; // Don't auto-update
  }
  
  return true; // OK to proceed
}

module.exports = { BLS_CONFIG, checkForConfigUpdates };
