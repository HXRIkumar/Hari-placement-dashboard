import { useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import SkillPriorityChart from './SkillPriorityChart';
import DifficultyROIScatter from './DifficultyROIScatter';
import {
  ArrowLeft, Building2, Briefcase, IndianRupee, Users, Target,
  ShieldCheck, ShieldX, AlertTriangle, TrendingUp, Calendar, Lightbulb,
} from 'lucide-react';

export default function MicroView({ company, allProfiles }) {
  const { clearSelection, selectCompany } = useCompany();

  const similar = useMemo(() => {
    return allProfiles
      .filter((p) => p.domain === company.domain && p.id !== company.id)
      .sort((a, b) => b.avgCTC - a.avgCTC)
      .slice(0, 5);
  }, [allProfiles, company]);

  const selectionPct = (company.avgSelectionRate * 100).toFixed(1);

  const advice = useMemo(() => generateAdvice(company), [company]);

  return (
    <div className="space-y-8">
      {/* Back + Company header */}
      <div>
        <button
          onClick={clearSelection}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to overview
        </button>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">{company.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{company.domain}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{company.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {company.roles.map((role, i) => (
                  <span key={i} className="text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-md">
                    <Briefcase className="w-3 h-3 inline mr-1" />
                    {role.length > 60 ? role.substring(0, 60) + '…' : role}
                  </span>
                ))}
              </div>
            </div>

            <EligibilityDetail eligibility={company.eligibility} cutoff={company.cutoff} cgpa={company.cgpaCutoff} />
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-100">
            <MiniStat icon={<IndianRupee className="w-3.5 h-3.5" />} label="Avg CTC" value={`₹${company.avgCTC}L`} />
            <MiniStat icon={<TrendingUp className="w-3.5 h-3.5" />} label="Max CTC" value={`₹${company.maxCTC}L`} />
            <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Selection Rate" value={`${selectionPct}%`} />
            <MiniStat icon={<Target className="w-3.5 h-3.5" />} label="Difficulty" value={`${company.difficulty}/10`} />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillPriorityChart skillFocus={company.skillFocus} companyName={company.name} />
        <DifficultyROIScatter allProfiles={allProfiles} currentCompany={company} />
      </div>

      {/* Prep advice */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-base font-semibold text-zinc-900">Preparation Strategy for {company.name}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {advice.map((item, i) => (
            <div key={i} className="bg-zinc-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{item.area}</p>
              <p className="text-sm text-zinc-700">{item.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visit history */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <h3 className="text-base font-semibold text-zinc-900">Visit History</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Past {company.visitCount} year(s) of placement data</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50">
              <th className="text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Year</th>
              <th className="text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Role</th>
              <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">CTC</th>
              <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Applied</th>
              <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Selected</th>
              <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {company.visits.map((v, i) => (
              <tr key={i} className="hover:bg-zinc-50">
                <td className="px-5 py-3 text-sm text-zinc-700">{v.year}</td>
                <td className="px-5 py-3 text-sm text-zinc-600 max-w-[300px] truncate">{v.role.length > 60 ? v.role.substring(0, 60) + '…' : v.role}</td>
                <td className="px-5 py-3 text-sm text-zinc-900 text-right font-medium">₹{v.ctc}L</td>
                <td className="px-5 py-3 text-sm text-zinc-600 text-right">{v.applied.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-zinc-600 text-right">{v.selected}</td>
                <td className="px-5 py-3 text-sm text-right">
                  <span className={`font-medium ${v.selectionRate > 0.05 ? 'text-emerald-600' : v.selectionRate > 0.01 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {(Math.min(1, v.selectionRate) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Similar Companies */}
      {similar.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <h3 className="text-base font-semibold text-zinc-900 mb-4">Similar Companies in {company.domain}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {similar.map((s) => (
              <button
                key={s.id}
                onClick={() => selectCompany(s)}
                className="text-left p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-zinc-500">₹{s.avgCTC}L</span>
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                    s.eligibility.status === 'safe' ? 'bg-emerald-50 text-emerald-700' :
                    s.eligibility.status === 'blocked' ? 'bg-rose-50 text-rose-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>{s.eligibility.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

function EligibilityDetail({ eligibility, cutoff, cgpa }) {
  const iconMap = {
    safe: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    blocked: <ShieldX className="w-5 h-5 text-rose-500" />,
    borderline: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };
  const bgMap = {
    safe: 'bg-emerald-50 border-emerald-200',
    blocked: 'bg-rose-50 border-rose-200',
    borderline: 'bg-amber-50 border-amber-200',
  };
  const textMap = {
    safe: 'text-emerald-700',
    blocked: 'text-rose-700',
    borderline: 'text-amber-700',
  };

  return (
    <div className={`px-4 py-3 rounded-lg border ${bgMap[eligibility.status]}`}>
      <div className="flex items-center gap-2 mb-1">
        {iconMap[eligibility.status]}
        <span className={`text-sm font-semibold ${textMap[eligibility.status]}`}>{eligibility.label}</span>
      </div>
      {eligibility.reasons.length > 0 ? (
        eligibility.reasons.map((r, i) => (
          <p key={i} className="text-xs text-zinc-600">{r}</p>
        ))
      ) : (
        <p className="text-xs text-zinc-600">No cutoff restrictions for your profile</p>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function generateAdvice(company) {
  const advice = [];
  const sf = company.skillFocus;

  const skills = Object.entries(sf).sort((a, b) => b[1] - a[1]);
  const topSkill = skills[0];
  const skillNames = { dsa: 'DSA & Problem Solving', dev: 'Development & Projects', aptitude: 'Aptitude & Reasoning', core: 'Core CS Fundamentals' };

  advice.push({
    area: 'Primary Focus',
    recommendation: `${skillNames[topSkill[0]]} is the most critical skill area for ${company.domain} companies (${topSkill[1]}% weight). Dedicate most of your prep time here.`,
  });

  if (company.eligibility.status === 'blocked') {
    advice.push({
      area: 'Eligibility Warning',
      recommendation: `This company requires ${company.cutoff}% in 10th/12th. Your 67% blocks you. Focus prep effort on accessible companies instead, but monitor if they relax cutoffs.`,
    });
  } else if (company.eligibility.status === 'borderline') {
    advice.push({
      area: 'Borderline Access',
      recommendation: `You're close to the cutoff (${company.cutoff}%). Some years they may relax requirements. Apply if given the chance, but have backup plans.`,
    });
  } else {
    advice.push({
      area: "You're Eligible!",
      recommendation: 'No academic cutoff blocks you. Your 9.01 CGPA is a strong differentiator. Make sure to clear the Online Assessment to get to interviews.',
    });
  }

  if (company.avgSelectionRate < 0.01) {
    advice.push({
      area: 'Competition Level',
      recommendation: `Selection rate is very low (${(company.avgSelectionRate * 100).toFixed(1)}%). This is a moonshot — prepare aggressively but don't rely on this as your only target.`,
    });
  } else if (company.avgSelectionRate > 0.05) {
    advice.push({
      area: 'Competition Level',
      recommendation: `Reasonable selection rate of ${(company.avgSelectionRate * 100).toFixed(1)}%. This is a solid target with good odds if you prepare well.`,
    });
  } else {
    advice.push({
      area: 'Competition Level',
      recommendation: `Moderate selection rate (${(company.avgSelectionRate * 100).toFixed(1)}%). Worth targeting with focused preparation. Not a moonshot, but competitive.`,
    });
  }

  advice.push({
    area: 'Interview Strategy',
    recommendation: company.domain === 'Product' || company.domain === 'FinTech'
      ? 'Expect 2-3 DSA rounds + System Design. Practice LeetCode Medium/Hard. Know your projects inside out.'
      : company.domain === 'IT Services'
      ? 'Focus on aptitude + basic coding. Most IT Services use standardized assessments (TCS NQT, Infosys SP). Practice mock tests.'
      : company.domain === 'Finance'
      ? 'Strong aptitude focus. Practice mental math, probability, and data interpretation. DSA rounds are typically Medium difficulty.'
      : `Prepare for a mix of technical and aptitude rounds. Research ${company.name}'s specific selection process on Glassdoor/LinkedIn.`,
  });

  return advice;
}
