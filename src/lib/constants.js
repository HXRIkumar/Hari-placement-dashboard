export const HARI_PROFILE = {
  name: 'Hari K',
  institution: 'SRM IST Kattankulathur',
  major: 'CSE',
  cgpa: 9.01,
  tenthPercent: 67,
  twelfthPercent: 67,
  targetCycle: '2027',
  careerTargets: ['Software Engineering', 'Analytics'],
};

export const CSV_YEARS = ['2024', '2025', '2026', '2027'];

export const LEVEL_TO_CATEGORY = {
  'Level 1': 'Super Dream',
  'Level 2': 'Super Dream',
  'Level 3': 'Dream',
  'Level 4': 'Dream',
  'Level 5': 'Mass',
  'Level 6': 'Mass',
  'Level 7': 'Internship',
};

// Skill focus weights by domain (DSA, Development, Aptitude, Core)
export const DOMAIN_SKILL_MAP = {
  'IT Services':  { dsa: 25, dev: 20, aptitude: 40, core: 15 },
  Product:        { dsa: 45, dev: 30, aptitude: 15, core: 10 },
  Finance:        { dsa: 35, dev: 20, aptitude: 35, core: 10 },
  FinTech:        { dsa: 40, dev: 35, aptitude: 15, core: 10 },
  Consulting:     { dsa: 15, dev: 10, aptitude: 50, core: 25 },
  Analytics:      { dsa: 20, dev: 25, aptitude: 35, core: 20 },
  Enterprise:     { dsa: 20, dev: 25, aptitude: 30, core: 25 },
  Semiconductor:  { dsa: 15, dev: 15, aptitude: 25, core: 45 },
  Automotive:     { dsa: 15, dev: 20, aptitude: 25, core: 40 },
  Healthcare:     { dsa: 15, dev: 25, aptitude: 30, core: 30 },
  FMCG:           { dsa: 10, dev: 10, aptitude: 50, core: 30 },
  Telecom:        { dsa: 20, dev: 25, aptitude: 30, core: 25 },
  Networking:     { dsa: 25, dev: 25, aptitude: 25, core: 25 },
  Other:          { dsa: 25, dev: 25, aptitude: 25, core: 25 },
};

// Preparation timeline for 2027 cycle
export const PREP_TIMELINE = [
  { month: 'Jun 2026', focus: 'DSA Fundamentals', description: 'Arrays, Strings, Linked Lists. Solve 100 Easy problems on LeetCode.' },
  { month: 'Jul 2026', focus: 'DSA Intermediate', description: 'Trees, Graphs, Dynamic Programming. Target 50 Medium problems.' },
  { month: 'Aug 2026', focus: 'DSA Advanced + OA Practice', description: 'Advanced DP, Segment Trees. Practice timed Online Assessments.' },
  { month: 'Sep 2026', focus: 'System Design Basics', description: 'Load balancers, databases, caching. Read "Designing Data-Intensive Applications".' },
  { month: 'Oct 2026', focus: 'Core CS + Aptitude', description: 'OS, DBMS, CN fundamentals. Practice quantitative aptitude daily.' },
  { month: 'Nov 2026', focus: 'Development Projects', description: 'Build 2 portfolio projects. Focus on full-stack (React + Node) or data pipeline.' },
  { month: 'Dec 2026', focus: 'Mock Interviews', description: 'Weekly mock interviews. Practice behavioral questions (STAR method).' },
  { month: 'Jan 2027', focus: 'Company-Specific Prep', description: 'Research target companies. Tailor prep to their specific selection processes.' },
  { month: 'Feb 2027', focus: 'Placement Season Begins', description: 'Apply strategically. Safe bets first, then moonshots. Stay consistent.' },
  { month: 'Mar 2027', focus: 'Active Placement Season', description: 'Continue applications. Iterate on feedback from interviews.' },
];
