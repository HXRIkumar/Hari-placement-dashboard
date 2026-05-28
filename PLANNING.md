# PIOS — Planning & Data Normalization Strategy

## Phase 0: Workspace Orientation

### CSV Data Structure
All 4 CSV files (2024–2027) share a uniform schema:
```
Company, Role, CTC_LPA, Base_LPA, Students_Eligible, Students_Applied,
Students_Shortlisted, Students_Placed, Selection_Process, CGPA_Cutoff,
Tenth_Cutoff, Twelfth_Cutoff, Backlog_Allowed, Category, Domain
```

### Data Normalization Strategy
1. **PapaParse** ingests CSVs via `fetch()` at runtime (no hardcoded imports)
2. **Type coercion**: All numeric fields parsed via `parseFloat`/`parseInt` with fallback to 0
3. **String trimming**: All string fields trimmed, empty Company rows filtered out
4. **Cutoff of 0**: Treated as "no cutoff" (e.g., Zoho has 0 for 10th/12th)
5. **Defensive parsing**: Missing fields default gracefully — no crashes

### Component Architecture
```
App
├── LoadingScreen (shown during CSV fetch)
├── Header (branding, year selector, profile summary)
├── Tab Navigation (Overview, Deep Analysis, Strategy, Company Intel)
├── Overview Tab
│   ├── OverviewMetrics (6 KPI cards)
│   ├── CTCDistributionChart + DomainBreakdown
│   ├── ExpectedValueChart + YearOverYearChart
│   └── InsightsPanel
├── Deep Analysis Tab
│   ├── CutoffImpactPanel + RiskMatrix
│   ├── ExpectedValueChart + CTCDistributionChart
│   └── YearOverYearChart
├── Strategy Tab
│   ├── InsightsPanel
│   ├── TopTargetsTable
│   └── RiskMatrix + DomainBreakdown
├── Company Intel Tab
│   ├── OverviewMetrics
│   ├── EligibilityMatrix (full sortable table)
│   └── TopTargetsTable
└── Footer
```

### Analytics Engine Functions
- `computeEligibility()` — CGPA/10th/12th/backlog checks
- `computeSelectionProbability()` — Placed/Applied ratio
- `computeExpectedValue()` — CTC × probability
- `computeRiskLevel()` — Safe/Moderate/Aggressive/Moonshot
- `computeCategoryBreakdown()` — Stats by Mass/Mid/Premium/Super Premium
- `computeDomainBreakdown()` — Stats by industry domain
- `computeYearOverYearTrends()` — Cross-year trend analysis
- `computeTopTargets()` — EV-ranked eligible companies
- `computeCutoffImpactAnalysis()` — 67% wall impact
- `computeExpectedValues()` — Full EV table
- `computeRiskProfiles()` — Risk classification

### Personalization Engine
Generates 10 types of data-driven insights:
1. Cutoff Wall Analysis
2. CGPA Strength Assessment
3. Top EV Targets
4. Analytics Domain Opportunity
5. OA-First Company Strategy
6. Mass vs Premium Balance
7. Product/FinTech Merit-Only Companies
8. DSA Investment ROI
9. YoY Market Trends
10. Super Premium Accessibility
