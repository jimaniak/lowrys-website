# Attrition Forecasting Tool - Use Case Document

## Tool Overview
**Name:** Attrition Risk Forecasting / Job Stability Analyzer  
**Status:** 🔄 In Development  
**Purpose:** Predict job/career stability using real BLS employment data

## Primary Use Cases

### Use Case 1: Job Seekers/Career Changers (PRIMARY FOCUS)
**Core Questions to Answer:**
- "Is this occupation/industry stable for my career?"
- "Should I be worried about my current job security?"
- "Which roles are growing vs declining in my region?"
- "Is this a good time to change careers to [X] field?"
- "What's the long-term outlook for my profession?"

**User Journey:**
1. Select current occupation or occupation of interest
2. Choose region/location
3. Get stability score/risk assessment
4. See growth projections and market trends
5. Receive actionable recommendations

### Use Case 2: HR/Hiring Managers (SECONDARY)
**Core Questions to Answer:**
- "Which roles in our company are highest flight risk based on market conditions?"
- "Are we paying competitively enough to retain talent in [X] role?"
- "What occupations should we expect high turnover in?"
- "Where should we focus retention efforts?"

### Use Case 3: Career Counselors/Advisors (TERTIARY)
**Core Questions to Answer:**
- "What stable career paths can I recommend?"
- "Which fields offer long-term job security?"
- "How do I advise clients on career pivots?"

## Data Sources Available (BLS Updated Sundays)
- ✅ Employment projections (2023-2033)
- ✅ Job growth rates by occupation
- ✅ Regional employment data
- ✅ Wage trends and changes
- ✅ Industry classifications and trends
- ✅ Annual job openings data
- ✅ Educational requirements and training needs

## Key Metrics to Calculate
- **Job Security Score** (growth rate + demand + wage trends)
- **Market Volatility Index** (employment fluctuations)
- **Future Demand Indicator** (projected job openings)
- **Regional Stability Rating** (geographic employment trends)
- **Automation Risk Level** (based on occupation characteristics)

## Design Requirements
- Use REAL BLS data (not mock data)
- Professional blue/slate color scheme matching site
- Clear, actionable recommendations
- Visual indicators (scores, risk levels, trend charts)
- Mobile-responsive but desktop-optimized
- Attribution to BLS data sources

## Success Criteria
- [ ] Answers core questions with real data
- [ ] Provides actionable insights, not just information
- [ ] Professional, trustworthy presentation
- [ ] Clear value for job seekers (primary audience)
- [ ] Integrates seamlessly with existing site design

## Implementation Priority
1. **Phase 1:** Basic occupation stability lookup (Use Case 1)
2. **Phase 2:** Regional comparisons and trend analysis  
3. **Phase 3:** Advanced features for HR/counselors (Use Cases 2&3)

---

*This document should be referenced during development to ensure we stay focused on answering the core user questions with real, actionable data.*
