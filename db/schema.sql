-- BLS Data Schema for Turso SQLite Database

-- Major occupation groups
CREATE TABLE major_groups (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Detailed occupations
CREATE TABLE occupations (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    major_group_code TEXT NOT NULL,
    FOREIGN KEY (major_group_code) REFERENCES major_groups(code)
);

-- Regional wage and employment data
CREATE TABLE occupation_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    region TEXT NOT NULL,
    region_name TEXT NOT NULL,
    mean_annual INTEGER,
    mean_hourly REAL,
    median_annual INTEGER,
    median_hourly REAL,
    benefit_annual INTEGER,
    last_updated DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, region)
);

-- Employment projections (2023-2033)
CREATE TABLE projections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    projection_year INTEGER NOT NULL,
    employment_level REAL,
    projected_change REAL,
    projected_percent_change REAL,
    projected_openings REAL,
    median_wage INTEGER,
    typical_education TEXT,
    work_experience TEXT,
    on_job_training TEXT,
    factors TEXT,
    summary TEXT,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code, projection_year)
);

-- Indexes for performance
CREATE INDEX idx_occupation_data_region ON occupation_data(region);
CREATE INDEX idx_occupation_data_occupation ON occupation_data(occupation_code);
CREATE INDEX idx_projections_occupation ON projections(occupation_code);
CREATE INDEX idx_occupations_major_group ON occupations(major_group_code);

-- Views for common queries
CREATE VIEW occupation_summary AS
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
    p.typical_education
FROM occupations o
JOIN major_groups mg ON o.major_group_code = mg.code
LEFT JOIN occupation_data od ON o.code = od.occupation_code
LEFT JOIN projections p ON o.code = p.occupation_code;

-- View for job stability analysis
CREATE VIEW job_stability AS
SELECT 
    o.code,
    o.name,
    mg.name as major_group_name,
    p.projected_percent_change as growth_rate,
    p.projected_openings as annual_openings,
    od.mean_annual as avg_wage,
    CASE 
        WHEN p.projected_percent_change >= 10 THEN 'High Growth'
        WHEN p.projected_percent_change >= 5 THEN 'Moderate Growth'
        WHEN p.projected_percent_change >= 0 THEN 'Stable'
        WHEN p.projected_percent_change >= -5 THEN 'Declining'
        ELSE 'High Risk'
    END as stability_category,
    CASE 
        WHEN p.projected_percent_change >= 8 AND p.projected_openings >= 50 THEN 'Excellent'
        WHEN p.projected_percent_change >= 5 AND p.projected_openings >= 20 THEN 'Good'
        WHEN p.projected_percent_change >= 0 AND p.projected_openings >= 10 THEN 'Fair'
        ELSE 'Poor'
    END as job_security_score
FROM occupations o
JOIN major_groups mg ON o.major_group_code = mg.code
LEFT JOIN occupation_data od ON o.code = od.occupation_code AND od.region = 'US'
LEFT JOIN projections p ON o.code = p.occupation_code
WHERE p.projected_percent_change IS NOT NULL;
