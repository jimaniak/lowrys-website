-- SEO Intake Form Database Schema
-- Run this SQL in your Turso database to create the table

CREATE TABLE IF NOT EXISTS seo_intake_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Contact Information
  name TEXT NOT NULL,
  title TEXT,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  best_time TEXT,
  
  -- Business Information
  website TEXT NOT NULL,
  years_in_business INTEGER,
  services TEXT, -- JSON array of services
  service_areas TEXT NOT NULL,
  competitors TEXT,
  
  -- Current Marketing
  current_seo_provider TEXT,
  monthly_seo_investment TEXT,
  current_seo_work TEXT, -- JSON array
  
  -- Technical Access
  website_platform TEXT,
  admin_access TEXT,
  google_accounts TEXT, -- JSON array
  
  -- Business Goals
  primary_goal TEXT,
  target_customers TEXT,
  customer_value TEXT,
  top_services TEXT,
  
  -- Package Selection
  package_interest TEXT,
  
  -- Additional Info
  differentiators TEXT,
  common_questions TEXT,
  additional_info TEXT,
  
  -- Metadata
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'new', -- new, contacted, converted, closed
  notes TEXT -- for follow-up notes
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_seo_intake_email ON seo_intake_forms(email);
CREATE INDEX IF NOT EXISTS idx_seo_intake_company ON seo_intake_forms(company);
CREATE INDEX IF NOT EXISTS idx_seo_intake_submitted ON seo_intake_forms(submitted_at);
CREATE INDEX IF NOT EXISTS idx_seo_intake_status ON seo_intake_forms(status);
