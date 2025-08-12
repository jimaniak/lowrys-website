# Database Table Analysis Report - Phase 1

## Executive Summary
Analysis of specialized tables in the Turso database reveals three well-structured tables with clear purposes, all actively used in the rate calculator API.

---

## Table Analysis Results

### 1. `occupation_data` (39,017 rows)
**Purpose**: Primary wage and employment data by occupation and region
**Status**: ✅ ACTIVELY USED in rate calculator API

**Schema**:
- Primary key: `id` (INTEGER)
- Indexes: `occupation_code` (TEXT), `region` (TEXT)  
- Wage data: `mean_annual`, `mean_hourly`, `median_annual`, `median_hourly`
- Benefits: `benefit_annual`
- Employment projections: `total_employment`, `base_year_employment`, `projection_year_employment`
- Metadata: `last_updated`, `data_year`, `base_year`, `projection_year`

**API Usage**:
- Load available regions for occupation selection
- Retrieve wage data for specific occupation + region combinations
- Source for BLS benchmarks display in rate calculator

**Data Quality**: 
- 1,395 unique occupation codes covered
- Comprehensive regional coverage (all US states)
- Recent data (last_updated: 2025-06-18)

### 2. `projections` (1,110 rows)  
**Purpose**: BLS employment projections (2023-2033) with education requirements
**Status**: ✅ ACTIVELY USED in rate calculator API

**Schema**:
- Primary key: `id` (INTEGER)
- Core data: `occupation_code`, `base_year`, `projection_year`
- Employment metrics: `employment`, `employment_change`, `employment_percent_change`
- Market data: `annual_openings`, `median_wage`
- Requirements: `typical_education`, `work_experience`, `on_job_training`
- Metadata: `summary`, `projection_period`, `created_at`

**API Usage**:
- Display employment projections in rate calculator
- Show education and experience requirements
- Provide market outlook information

**Data Quality**:
- 1,110 unique occupation codes (comprehensive coverage)
- Consistent 2023-2033 projection period
- Rich metadata including education requirements

### 3. `bls_special_tables` (4,024 rows)
**Purpose**: BLS special table flags (fastest growing, declining, etc.)
**Status**: ✅ ACTIVELY USED in rate calculator API

**Schema**:
- Primary key: `id` (INTEGER)
- Reference: `occupation_code`, `table_number`, `table_name`
- Data: `rank_order`, `value`, `value_type`
- Metadata: `data_year`, `projection_period`, `created_at`

**API Usage**:
- Check if occupation appears in special BLS tables (1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9)
- Display special status badges (fastest growing, declining, etc.)
- Retrieve additional occupation insights

**Data Quality**:
- Covers major BLS special tables
- Recent data (2025 data year)
- Consistent 2023-33 projection period

---

## Current API Integration

### Rate Calculator API (`/api/rate-calculator`)
All three tables are integrated into the rate calculator:

1. **`occupation_data`**: 
   - Powers region selection dropdown
   - Provides wage data for calculations
   - Sources BLS benchmark display

2. **`projections`**: 
   - Shows employment outlook section
   - Displays education requirements
   - Provides market trend information

3. **`bls_special_tables`**: 
   - Adds special status badges (fastest growing, etc.)
   - Enhances occupation insights
   - Provides additional context factors

---

## Recommendations

### ✅ Keep All Tables (No Consolidation Needed)
All three tables serve distinct, well-defined purposes:
- **`occupation_data`**: Regional wage data (many-to-many: occupation × region)
- **`projections`**: National employment projections (one-to-one: occupation)  
- **`bls_special_tables`**: Special table references (many-to-many: occupation × table)

### 🔧 Potential Optimizations
1. **Add indexes** on frequently queried columns:
   - `occupation_data(occupation_code, region)`
   - `projections(occupation_code)`
   - `bls_special_tables(occupation_code, table_number)`

2. **Data validation** - ensure referential integrity:
   - All occupation codes should exist in primary `occupations` table
   - Consistent data_year and projection_period values

### 📊 Data Quality Assessment
- **Excellent**: All tables have recent, comprehensive data
- **Well-structured**: Clear schemas with appropriate data types
- **Actively used**: Full integration with production API
- **Performance**: No immediate performance concerns noted

---

## Next Steps for Database Normalization

### Phase 2 Focus: BLS Table Normalization
With specialized tables confirmed as well-structured and necessary, focus should shift to:

1. **BLS workbook tables** (`bls_table_1_*` series) - candidates for normalization
2. **Year-based column splitting** in remaining tables
3. **Metadata standardization** across all BLS data sources

### Phase 2 Priority Actions:
1. Audit `bls_table_1_*` series for normalization opportunities
2. Standardize year-based data structure
3. Add automation metadata tracking
4. Implement referential integrity constraints

---

**Analysis Date**: June 27, 2025  
**Database**: Turso `lowrys-bls-data`  
**Tables Analyzed**: 3 specialized tables  
**Total Rows**: 44,151 across all analyzed tables
