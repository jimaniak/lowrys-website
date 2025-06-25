-- Add industry field to existing seo_intake_forms table
-- Run this in your Turso database to add the industry column

ALTER TABLE seo_intake_forms ADD COLUMN industry TEXT DEFAULT 'pest-control';
