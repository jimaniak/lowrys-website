-- Extended database schema for Rate Calculator with all BLS tables
-- This includes all Tables 1.1 through 1.12 from the BLS occupation workbook

-- Drop existing tables if they exist
DROP TABLE IF EXISTS occupation_categories;
DROP TABLE IF EXISTS bls_table_11_employment_occupation;
DROP TABLE IF EXISTS bls_table_12_employment_industry;
DROP TABLE IF EXISTS bls_table_13_fastest_growing;
DROP TABLE IF EXISTS bls_table_14_most_job_growth;
DROP TABLE IF EXISTS bls_table_15_fastest_declining;
DROP TABLE IF EXISTS bls_table_16_largest_declines;
DROP TABLE IF EXISTS bls_table_17_most_openings;
DROP TABLE IF EXISTS bls_table_18_highest_paying;
DROP TABLE IF EXISTS bls_table_19_stem_occupations;
DROP TABLE IF EXISTS bls_table_110_education_training;
DROP TABLE IF EXISTS bls_table_111_typical_wages;
DROP TABLE IF EXISTS bls_table_112_replacement_needs;

-- Keep existing core tables
-- major_groups, occupations, occupation_data, projections (already exist)

-- BLS Table 1.1: Employment by major occupational group
CREATE TABLE bls_table_11_employment_occupation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.2: Employment by major industry sector  
CREATE TABLE bls_table_12_employment_industry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    industry_code TEXT NOT NULL,
    industry_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER
);

-- BLS Table 1.3: Fastest growing occupations
CREATE TABLE bls_table_13_fastest_growing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.4: Occupations with the most job growth
CREATE TABLE bls_table_14_most_job_growth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.5: Fastest declining occupations
CREATE TABLE bls_table_15_fastest_declining (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.6: Occupations with the largest job declines
CREATE TABLE bls_table_16_largest_declines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.7: Occupations with the most job openings
CREATE TABLE bls_table_17_most_openings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    job_openings_annual INTEGER,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.8: Highest paying occupations
CREATE TABLE bls_table_18_highest_paying (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    median_wage_2023 INTEGER,
    mean_wage_2023 INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.9: STEM occupations
CREATE TABLE bls_table_19_stem_occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    stem_category TEXT, -- Science, Technology, Engineering, Mathematics
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER,
    typical_education TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- BLS Table 1.10: Education and training categories
CREATE TABLE bls_table_110_education_training (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    education_category TEXT NOT NULL,
    work_experience_category TEXT,
    training_category TEXT,
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER
);

-- BLS Table 1.11: Occupations by typical entry-level wages
CREATE TABLE bls_table_111_typical_wages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wage_category TEXT NOT NULL, -- e.g., "Very high ($77,440 and higher)"
    employment_2023 INTEGER,
    employment_2033 INTEGER,
    change_numeric INTEGER,
    change_percent REAL,
    median_wage_2023 INTEGER
);

-- BLS Table 1.12: Occupations by replacement needs
CREATE TABLE bls_table_112_replacement_needs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    occupation_name TEXT NOT NULL,
    employment_2023 INTEGER,
    job_openings_due_to_growth INTEGER,
    job_openings_due_to_replacement INTEGER,
    total_job_openings INTEGER,
    median_wage_2023 INTEGER,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code)
);

-- Create a lookup table for occupation categories (which tables each occupation appears in)
CREATE TABLE occupation_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    table_name TEXT NOT NULL, -- e.g., 'table_13_fastest_growing'
    rank INTEGER, -- rank within that table, if applicable
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, table_name)
);

-- Indexes for performance
CREATE INDEX idx_table_13_occupation ON bls_table_13_fastest_growing(occupation_code);
CREATE INDEX idx_table_14_occupation ON bls_table_14_most_job_growth(occupation_code);
CREATE INDEX idx_table_15_occupation ON bls_table_15_fastest_declining(occupation_code);
CREATE INDEX idx_table_16_occupation ON bls_table_16_largest_declines(occupation_code);
CREATE INDEX idx_table_17_occupation ON bls_table_17_most_openings(occupation_code);
CREATE INDEX idx_table_18_occupation ON bls_table_18_highest_paying(occupation_code);
CREATE INDEX idx_table_19_occupation ON bls_table_19_stem_occupations(occupation_code);
CREATE INDEX idx_table_112_occupation ON bls_table_112_replacement_needs(occupation_code);
CREATE INDEX idx_occupation_categories_code ON occupation_categories(occupation_code);
CREATE INDEX idx_occupation_categories_table ON occupation_categories(table_name);

-- Enhanced view for occupation status with all categories
CREATE VIEW occupation_status AS
SELECT 
    o.code,
    o.name,
    mg.name as major_group_name,
    od.region,
    od.region_name,
    od.mean_annual,
    od.median_annual,
    od.benefit_annual,
    p.projected_percent_change,
    p.projected_openings,
    p.typical_education,
    -- Status flags
    CASE WHEN oc_13.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_fastest_growing,
    CASE WHEN oc_14.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_most_job_growth,
    CASE WHEN oc_15.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_fastest_declining,
    CASE WHEN oc_16.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_largest_declines,
    CASE WHEN oc_17.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_most_openings,
    CASE WHEN oc_18.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_highest_paying,
    CASE WHEN oc_19.occupation_code IS NOT NULL THEN 1 ELSE 0 END as is_stem,
    -- Ranks
    oc_13.rank as fastest_growing_rank,
    oc_14.rank as most_job_growth_rank,
    oc_15.rank as fastest_declining_rank,
    oc_16.rank as largest_declines_rank,
    oc_17.rank as most_openings_rank,
    oc_18.rank as highest_paying_rank
FROM occupations o
JOIN major_groups mg ON o.major_group_code = mg.code
LEFT JOIN occupation_data od ON o.code = od.occupation_code AND od.region = 'US'
LEFT JOIN projections p ON o.code = p.occupation_code
LEFT JOIN bls_table_13_fastest_growing oc_13 ON o.code = oc_13.occupation_code
LEFT JOIN bls_table_14_most_job_growth oc_14 ON o.code = oc_14.occupation_code
LEFT JOIN bls_table_15_fastest_declining oc_15 ON o.code = oc_15.occupation_code
LEFT JOIN bls_table_16_largest_declines oc_16 ON o.code = oc_16.occupation_code
LEFT JOIN bls_table_17_most_openings oc_17 ON o.code = oc_17.occupation_code
LEFT JOIN bls_table_18_highest_paying oc_18 ON o.code = oc_18.occupation_code
LEFT JOIN bls_table_19_stem_occupations oc_19 ON o.code = oc_19.occupation_code;
