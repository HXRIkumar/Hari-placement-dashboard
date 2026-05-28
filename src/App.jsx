import { useCSVData } from './hooks/useCSVData';
import { useCompany } from './context/CompanyContext';
import { HARI_PROFILE } from './lib/constants';
import MacroView from './components/MacroView';
import MicroView from './components/MicroView';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function App() {
  const { profiles, stats, packageDist, isLoading, error } = useCSVData();
  const { selectedCompany, clearSelection } = useCompany();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Loading placement data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-900 leading-tight">PIOS</h1>
              <p className="text-[10px] text-zinc-400 leading-tight">Placement Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {selectedCompany && (
              <button
                onClick={clearSelection}
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                ← Back to overview
              </button>
            )}
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-700">{HARI_PROFILE.name}</p>
              <p className="text-[10px] text-zinc-400">{HARI_PROFILE.cgpa} CGPA · {HARI_PROFILE.institution}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedCompany ? (
          <MicroView company={selectedCompany} allProfiles={profiles} />
        ) : (
          <MacroView profiles={profiles} stats={stats} packageDist={packageDist} />
        )}
      </main>
    </div>
  );
}
