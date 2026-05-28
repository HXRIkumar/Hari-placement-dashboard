# 🚀 Placement Intelligence Operating System (PIOS)

> **A highly tactical, server-side rendered placement war room engineered to optimize preparation strategy for the 2027 cycle.**

PIOS is a specialized, data-defensive SaaS companion designed to transform historical raw placement data into brutally actionable strategic insights. Evolving from an over-engineered complex dashboard into a calm, focused strategic interface, PIOS actively combats data noise, manages strict academic constraints, and delivers structured execution milestones. 

---

## 🌟 Key Core Platform Capabilities

- **Eligibility Wall Analytics**  
  Bulletproof parsing of real-world datasets across multiple placement years to flag strict percentage bottlenecks. Accurately maps the high-school 67% constraint wall, visually separating targets into *Accessible*, *Borderline*, and *Blocked* states to eliminate FOMO and wasted preparation.

- **Confidence-Threshold Odds Engine**  
  Real-world data contains sample-size noise. The underlying `engine.js` automatically discards low-sample mathematical anomalies (filtering out applicant pools with <50 candidates) to deliver realistic selection probabilities and clamped historical metrics (0–100%).

- **Brutally Actionable MicroViews**  
  Replaces generic preparation advice with dynamic, company-centric detail modules. When drilling down into specific companies, PIOS computes specific DSA topics tested, historical arrival windows (~45-60 Days), and structured LeetCode or Project-building milestones tailored to the domain.

---

## 🏗 Tech Stack & Configuration Rigor

PIOS has undergone a significant architectural migration from Vite Client-Side Rendering to a robust, server-enabled framework.

- **Architecture**: Next.js 14+ (App Router) & React 19. Features Server-Side Rendered (SSR) infrastructure ensuring instant SEO crawlability and performant first-paint metrics.
- **Styling & UI**: Tailwind CSS v4, Framer Motion (60fps minimal canvas layers), Recharts (data visualizations), and Lucide React.
- **Core Processing**: Client-side PapaParse pipeline reading structured, real-world data asynchronously from `/public/placement-data/`.
- **Deployment**: Vercel CI/CD Native. Configured explicitly with `vercel.json` framework overrides to seamlessly handle serverless build targets.

---

## 📦 Repository Structure & Workspace Map

```text
hari-placement-dashboard/
├── next.config.mjs               # Next.js architectural configuration
├── vercel.json                   # Vercel deployment overrides
├── package.json
├── public/
│   └── placement-data/           # Raw, real-world CSV intelligence (2024-2027)
└── src/
    ├── app/
    │   ├── layout.jsx            # Next.js Server Root Layout
    │   ├── page.jsx              # Next.js Server Entry Point
    │   └── globals.css           # Tailwind v4 injection
    ├── components/               # Client-Boundary React UI modules
    │   ├── MacroView.jsx         # Aggregate timeline and High-ROI trackers
    │   ├── MicroView.jsx         # Drill-down actionable execution plans
    │   ├── EligibilityWall.jsx   # 67% constraint visualization
    │   └── ...                   # Recharts modules (Package Distribution, etc.)
    ├── context/
    │   └── CompanyContext.jsx    # Global master-detail state controller
    ├── hooks/
    │   └── useCSVData.js         # Asynchronous PapaParse data pipeline
    └── lib/
        ├── engine.js             # Defensive data math, aggregation, and threshold constraints
        ├── parser.js             # Advanced CTC normalization logic
        └── constants.js          # Platform constants, Domain maps, Profile baselines
```

---

## ⚡ Quick Start & Local Development Initialization

To initialize the PIOS dashboard on your local machine, execute the following commands in your terminal:

**1. Clone the repository & enter the workspace**
```bash
git clone https://github.com/HXRIkumar/Hari-placement-dashboard.git
cd Hari-placement-dashboard
```

**2. Install dependencies**
```bash
npm install
```

**3. Boot the Next.js Development Server**
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the running PIOS interface.

**4. Build the production optimization bundle (SSR target testing)**
```bash
npm run build
npm run start
```
