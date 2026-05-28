import { PREP_TIMELINE } from '../lib/constants';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function PrepTimeline() {
  const now = new Date();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-4 h-4 text-zinc-400" />
        <h3 className="text-base font-semibold text-zinc-900">Preparation Timeline</h3>
      </div>
      <p className="text-xs text-zinc-400 mb-6">Month-by-month action plan for the 2027 placement cycle</p>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-zinc-200" />

        <div className="space-y-6">
          {PREP_TIMELINE.map((item, i) => {
            const isPast = isMonthPast(item.month, now);
            const isCurrent = isCurrentMonth(item.month, now);

            return (
              <div key={i} className="relative flex gap-4">
                {/* Dot */}
                <div className={`relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 ${
                  isPast ? 'bg-emerald-100' : isCurrent ? 'bg-blue-100 ring-2 ring-blue-400 ring-offset-2' : 'bg-zinc-100'
                }`}>
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <span className={`text-[10px] font-semibold ${isCurrent ? 'text-blue-600' : 'text-zinc-400'}`}>{i + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-zinc-400">{item.month}</p>
                    {isCurrent && <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                  <p className="text-sm font-medium text-zinc-900 mt-0.5">{item.focus}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isMonthPast(monthStr, now) {
  const parsed = new Date(monthStr + ' 1');
  if (isNaN(parsed.getTime())) return false;
  return parsed < new Date(now.getFullYear(), now.getMonth(), 1);
}

function isCurrentMonth(monthStr, now) {
  const parsed = new Date(monthStr + ' 1');
  if (isNaN(parsed.getTime())) return false;
  return parsed.getFullYear() === now.getFullYear() && parsed.getMonth() === now.getMonth();
}
