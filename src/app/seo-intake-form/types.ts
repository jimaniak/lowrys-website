export interface FormData {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  bestTime: string;
  website: string;
  yearsInBusiness: string;
  services: string[];
  serviceAreas: string;
  competitors: string;
  currentSeoProvider: string;
  monthlySeoInvestment: string;
  currentSeoWork: string[];
  websitePlatform: string;
  adminAccess: string;
  googleAccounts: string[];
  primaryGoal: string;
  targetCustomers: string;
  customerValue: string;
  topServices: string;
  package: string;
  differentiators: string;
  commonQuestions: string;
  additionalInfo: string;
  industry: string;
}

// Industry-specific service configurations
export const INDUSTRY_CONFIGS = {
  'pest-control': {
    name: 'Pest Control',
    services: [
      { value: 'residential-pest', label: 'Residential Pest Control' },
      { value: 'commercial-pest', label: 'Commercial Pest Control' },
      { value: 'termite-inspection', label: 'Termite Inspection' },
      { value: 'termite-treatment', label: 'Termite Treatment' },
      { value: 'moisture-control', label: 'Moisture Control' },
      { value: 'crawl-space', label: 'Crawl Space Encapsulation' },
      { value: 'insulation', label: 'Insulation Services' },
      { value: 'other-service', label: 'Other' }
    ],
    competitorLabel: 'Main Competitors (Name other pest control companies in your area)',
    serviceAreaPlaceholder: 'Norfolk, Virginia Beach, Portsmouth, etc.'
  },
  'hvac': {
    name: 'HVAC',
    services: [
      { value: 'residential-hvac', label: 'Residential HVAC' },
      { value: 'commercial-hvac', label: 'Commercial HVAC' },
      { value: 'installation', label: 'New System Installation' },
      { value: 'repair-maintenance', label: 'Repair & Maintenance' },
      { value: 'duct-cleaning', label: 'Duct Cleaning' },
      { value: 'indoor-air-quality', label: 'Indoor Air Quality' },
      { value: 'emergency-service', label: 'Emergency Service' },
      { value: 'other-service', label: 'Other' }
    ],
    competitorLabel: 'Main Competitors (Name other HVAC companies in your area)',
    serviceAreaPlaceholder: 'Dallas, Fort Worth, Arlington, etc.'
  },
  'plumbing': {
    name: 'Plumbing',
    services: [
      { value: 'residential-plumbing', label: 'Residential Plumbing' },
      { value: 'commercial-plumbing', label: 'Commercial Plumbing' },
      { value: 'emergency-repair', label: 'Emergency Repairs' },
      { value: 'drain-cleaning', label: 'Drain Cleaning' },
      { value: 'water-heater', label: 'Water Heater Services' },
      { value: 'pipe-installation', label: 'Pipe Installation/Replacement' },
      { value: 'fixture-installation', label: 'Fixture Installation' },
      { value: 'other-service', label: 'Other' }
    ],
    competitorLabel: 'Main Competitors (Name other plumbing companies in your area)',
    serviceAreaPlaceholder: 'Phoenix, Scottsdale, Tempe, etc.'
  }
} as const;

export type IndustryType = keyof typeof INDUSTRY_CONFIGS;
