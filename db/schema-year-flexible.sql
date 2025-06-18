-- Year-flexible BLS database schema
-- This design supports multiple data years and automatic updates

-- Core tables (remain the same)
CREATE TABLE IF NOT EXISTS major_groups (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS occupations (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    major_group_code TEXT NOT NULL,
    FOREIGN KEY (major_group_code) REFERENCES major_groups(code)
);

-- Year-flexible employment and wage data
CREATE TABLE IF NOT EXISTS occupation_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    region TEXT NOT NULL,
    region_name TEXT,
    data_year INTEGER NOT NULL, -- e.g., 2024, 2025
    mean_annual REAL,
    median_annual REAL,
    mean_hourly REAL,
    median_hourly REAL,
    benefit_annual REAL,
    total_employment INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, region, data_year)
);

-- Year-flexible projections table
CREATE TABLE IF NOT EXISTS projections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    base_year INTEGER NOT NULL,        -- e.g., 2023
    projection_year INTEGER NOT NULL,  -- e.g., 2033
    employment REAL,                   -- Employment in thousands
    employment_change REAL,            -- Numeric change in thousands
    employment_percent_change REAL,    -- Percent change
    annual_openings REAL,             -- Annual job openings in thousands
    median_wage INTEGER,              -- Median annual wage
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    summary TEXT,
    projection_period TEXT,           -- e.g., "2023-33", "2024-34"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, base_year, projection_year)
);

-- Year-flexible BLS special tables
CREATE TABLE IF NOT EXISTS bls_special_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    table_number TEXT NOT NULL,       -- e.g., "1.3", "1.4", "1.5", "1.6"
    table_name TEXT NOT NULL,         -- e.g., "Fastest growing occupations"
    data_year INTEGER NOT NULL,       -- Year of the data release
    projection_period TEXT NOT NULL,  -- e.g., "2023-33"
    rank_order INTEGER,
    value REAL,                       -- The key metric (growth rate, job change, etc.)
    value_type TEXT,                  -- "percent_change", "numeric_change", etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, table_number, data_year)
);

-- Convenience views for current data (latest year)
CREATE VIEW current_occupation_data AS
SELECT od.*, o.name as occupation_name, mg.name as major_group_name
FROM occupation_data od
JOIN occupations o ON od.occupation_code = o.code
JOIN major_groups mg ON o.major_group_code = mg.code
WHERE od.data_year = (SELECT MAX(data_year) FROM occupation_data);

CREATE VIEW current_projections AS
SELECT p.*, o.name as occupation_name
FROM projections p
JOIN occupations o ON p.occupation_code = o.code
WHERE p.base_year = (SELECT MAX(base_year) FROM projections);

CREATE VIEW current_fastest_growing AS
SELECT bst.*, o.name as occupation_name
FROM bls_special_tables bst
JOIN occupations o ON bst.occupation_code = o.code
WHERE bst.table_number = '1.3' 
  AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.3');

CREATE VIEW current_most_job_growth AS
SELECT bst.*, o.name as occupation_name
FROM bls_special_tables bst
JOIN occupations o ON bst.occupation_code = o.code
WHERE bst.table_number = '1.4' 
  AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.4');

CREATE VIEW current_fastest_declining AS
SELECT bst.*, o.name as occupation_name
FROM bls_special_tables bst
JOIN occupations o ON bst.occupation_code = o.code
WHERE bst.table_number = '1.5' 
  AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.5');

CREATE VIEW current_largest_declines AS
SELECT bst.*, o.name as occupation_name
FROM bls_special_tables bst
JOIN occupations o ON bst.occupation_code = o.code
WHERE bst.table_number = '1.6' 
  AND bst.data_year = (SELECT MAX(data_year) FROM bls_special_tables WHERE table_number = '1.6');

-- Indexes for performance
CREATE INDEX idx_occupation_data_year ON occupation_data(data_year);
CREATE INDEX idx_occupation_data_region ON occupation_data(region);
CREATE INDEX idx_occupation_data_occupation ON occupation_data(occupation_code);
CREATE INDEX idx_projections_base_year ON projections(base_year);
CREATE INDEX idx_projections_occupation ON projections(occupation_code);
CREATE INDEX idx_bls_special_tables_year ON bls_special_tables(data_year);
CREATE INDEX idx_bls_special_tables_table ON bls_special_tables(table_number);
CREATE INDEX idx_occupations_major_group ON occupations(major_group_code);
