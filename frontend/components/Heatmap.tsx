import React from 'react';
import { useProgress } from '../context/ProgressContext';

const Heatmap: React.FC = () => {
  const { progress } = useProgress();

  // Generate last 365 days (approx 52 weeks)
  // We want to align columns by weeks (Sunday to Saturday)
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364); // Roughly a year back

  // Adjust start date to the previous Sunday to ensure alignment
  const dayOfWeek = startDate.getDay(); // 0 is Sunday
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const dates: Date[] = [];
  let d = new Date(startDate);
  while (d <= endDate) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
  }

  // Create grid: 7 rows (days), ~53 columns (weeks)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  dates.forEach((date) => {
      currentWeek.push(date);
      if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
      }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);


  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'; // Empty/Grey
    if (count <= 2) return 'bg-green-200';
    if (count <= 5) return 'bg-green-400';
    if (count <= 8) return 'bg-green-600';
    return 'bg-green-800'; // Bright Green
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      <div className="min-w-[700px]">
        {/* Month Labels */}
        <div className="flex mb-2 text-xs text-gray-400 pl-8">
            {weeks.map((week, i) => {
                const firstDay = week[0];
                // Show month label only if it's the first week of the month
                if (i === 0 || week[0].getDate() <= 7) {
                    if (i > 0 && weeks[i-1][0].getMonth() === week[0].getMonth()) return <div key={i} className="w-3 mx-[1px]" />;
                    return <div key={i} className="w-3 mx-[1px] overflow-visible whitespace-nowrap">{monthNames[firstDay.getMonth()]}</div>
                }
                return <div key={i} className="w-3 mx-[1px]" />;
            })}
        </div>

        <div className="flex gap-2">
            {/* Day Labels */}
            <div className="flex flex-col gap-[2px] text-[10px] text-gray-400 mt-[2px]">
                <div className="h-3"></div>
                <div className="h-3">Mon</div>
                <div className="h-3"></div>
                <div className="h-3">Wed</div>
                <div className="h-3"></div>
                <div className="h-3">Fri</div>
                <div className="h-3"></div>
            </div>

            {/* Grid */}
            <div className="flex gap-[2px]">
                {weeks.map((week, wIndex) => (
                    <div key={wIndex} className="flex flex-col gap-[2px]">
                        {week.map((date, dIndex) => {
                            const dateStr = date.toLocaleDateString('en-CA');
                            const count = progress.activityByDate[dateStr] || 0;
                            return (
                                <div
                                    key={dateStr}
                                    className={`w-3 h-3 rounded-[2px] ${getColor(count)} transition-colors hover:ring-1 hover:ring-gray-400`}
                                    title={`${date.toDateString()}: ${count} solved`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span>Less</span>
            <div className="w-3 h-3 bg-gray-100 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-green-200 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-green-400 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-green-600 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-green-800 rounded-[2px]"></div>
            <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;