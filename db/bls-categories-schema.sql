-- Additional tables for BLS special categories
-- These represent occupations that appear in specific BLS projection tables

-- Table 1.3: Fastest growing occupations (by percentage)
CREATE TABLE IF NOT EXISTS fastest_growing_occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    rank INTEGER,
    projected_percent_change REAL,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code)
);

-- Table 1.4: Occupations with the most job growth (by absolute numbers)
CREATE TABLE IF NOT EXISTS most_job_growth_occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    rank INTEGER,
    projected_change REAL,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code)
);

-- Table 1.5: Fastest declining occupations (by percentage)
CREATE TABLE IF NOT EXISTS fastest_declining_occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    rank INTEGER,
    projected_percent_change REAL,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code)
);

-- Table 1.6: Occupations with the largest job declines (by absolute numbers)
CREATE TABLE IF NOT EXISTS largest_decline_occupations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    occupation_code TEXT NOT NULL,
    rank INTEGER,
    projected_change REAL,
    FOREIGN KEY (occupation_code) REFERENCES occupations(code),
    UNIQUE(occupation_code)
);

-- View to get occupation status badges
CREATE VIEW IF NOT EXISTS occupation_status AS
SELECT 
    o.code,
    o.name,
    CASE 
        WHEN fg.occupation_code IS NOT NULL THEN 'fastest_growing'
        WHEN mjg.occupation_code IS NOT NULL THEN 'most_growth'
        WHEN fd.occupation_code IS NOT NULL THEN 'fastest_declining'
        WHEN ld.occupation_code IS NOT NULL THEN 'largest_declines'
        ELSE NULL
    END as status_category,
    COALESCE(fg.rank, mjg.rank, fd.rank, ld.rank) as category_rank
FROM occupations o
LEFT JOIN fastest_growing_occupations fg ON o.code = fg.occupation_code
LEFT JOIN most_job_growth_occupations mjg ON o.code = mjg.occupation_code
LEFT JOIN fastest_declining_occupations fd ON o.code = fd.occupation_code
LEFT JOIN largest_decline_occupations ld ON o.code = ld.occupation_code;

-- Indexes for the new tables
CREATE INDEX IF NOT EXISTS idx_fastest_growing_occupation ON fastest_growing_occupations(occupation_code);
CREATE INDEX IF NOT EXISTS idx_most_job_growth_occupation ON most_job_growth_occupations(occupation_code);
CREATE INDEX IF NOT EXISTS idx_fastest_declining_occupation ON fastest_declining_occupations(occupation_code);
CREATE INDEX IF NOT EXISTS idx_largest_decline_occupation ON largest_decline_occupations(occupation_code);
