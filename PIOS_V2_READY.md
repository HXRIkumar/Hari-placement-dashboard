# PIOS v2 — Ready for Production

**Strategic Placement Companion for Hari K's 2027 Cycle**

Built: May 28, 2026

## Architecture

```
src/
├── main.jsx                          # Entry point with CompanyProvider
├── App.jsx                           # Layout + macro/micro view switch
├── index.css                         # Tailwind v4 CSS-first setup
├── context/
│   └── CompanyContext.jsx            # Global selectedCompany state
├── hooks/
│   └── useCSVData.js                 # Data fetching + processing pipeline
├── lib/
│   ├── constants.js                  # Profile, timelines, skill maps
│   ├── parser.js                     # CSV normalization (509 lines)
│   └── engine.js                     # Aggregation + clamping engine
└── components/
    ├── MacroView.jsx                 # Aggregate strategy (no company selected)
    ├── MicroView.jsx                 # Company deep-dive (company selected)
    ├── EligibilityWall.jsx           # 67% cutoff visualization
    ├── PackageDistribution.jsx       # CTC range bar chart
    ├── SelectionRatioChart.jsx       # Top 15 safe companies by odds
    ├── SkillPriorityChart.jsx        # DSA/Dev/Aptitude/Core weights
    ├── DifficultyROIScatter.jsx      # Difficulty vs CTC scatter plot
    └── PrepTimeline.jsx              # 10-month prep plan timeline
```

## Design Principles

1. **Calm & Focused** — Zinc-50 to zinc-950 palette, Inter font, high whitespace
2. **Company-Centric** — Click any company → entire view transitions to deep analysis
3. **Data-Defensive** — Selection ratios clamped 0-100%, CTC outliers > 100L filtered
4. **Single Goal** — Everything serves one purpose: 2027 placement strategy for Hari K

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (CSS-first, @tailwindcss/vite plugin)
- Recharts 3 (5 clean chart types)
- Lucide React (icons)
- PapaParse (CSV ingestion)

## Key Metrics

- **554** total companies aggregated across 4 years
- **362** safe targets (65.3% accessible)
- **104** borderline (within 3% of cutoff)
- **88** blocked (requires > 67%)
- **₹7.93L** average CTC for safe targets
- **Zero NaN, zero errors** in browser console

## Build

```
✓ built in 171ms
dist/index.html      0.94 kB
dist/assets/css     23.86 kB (gzip: 5.34 kB)
dist/assets/js     608.85 kB (gzip: 183.64 kB)
```
