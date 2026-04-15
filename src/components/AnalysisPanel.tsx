import { motion } from 'framer-motion';
import { AnalysisView } from '@/types';
import { ArrowRight, X, FileText, BarChart3 } from 'lucide-react';
import { useState } from 'react';
interface AnalysisPanelProps {
  analysis: AnalysisView;
  onClose?: () => void;
}
const themeClasses = {
  primary: 'analysis-panel-primary',
  secondary: 'analysis-panel-secondary',
  tertiary: 'analysis-panel-tertiary'
};

// Mock chart data for onboarding completion rate
const weeklyData = [{
  week: 'Week 1',
  value: 72,
  barHeight: 20
}, {
  week: 'Week 2',
  value: 78,
  barHeight: 40
}, {
  week: 'Week 3',
  value: 74,
  barHeight: 60
}, {
  week: 'Week 4',
  value: 82,
  barHeight: 80
}, {
  week: 'Week 5',
  value: 68,
  barHeight: 50
}, {
  week: 'Week 6',
  value: 61,
  barHeight: 40
}];
const timeRanges = ['3 months', '1 month', '7 days'] as const;
export function AnalysisPanel({
  analysis,
  onClose
}: AnalysisPanelProps) {
  const [selectedRange, setSelectedRange] = useState<typeof timeRanges[number]>('1 month');
  const maxValue = Math.max(...weeklyData.map(d => d.value));
  return <motion.div initial={{
    opacity: 0,
    scale: 0.98
  }} animate={{
    opacity: 1,
    scale: 1
  }} exit={{
    opacity: 0,
    scale: 0.98
  }} transition={{
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1]
  }} className={`analysis-panel ${themeClasses[analysis.colorTheme]} relative`}>
      {onClose && <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-foreground/10 transition-colors">
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>}
      
      <div className="w-full">
        <p className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">
          Analysis
        </p>
        
        <h2 className="font-display text-3xl md:text-4xl mb-5">
          {analysis.question}
        </h2>
        
        <p className="text-lg md:text-xl mb-7 opacity-90">
          {analysis.synthesis}
        </p>

        {/* Data Visualization Section */}
        <div className="mb-8 p-5 rounded-2xl bg-[#222222]">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-display text-xl md:text-2xl mb-0.5">
                A closer look at <span className="text-[#9CA3AF]">onboarding completion</span>
              </h3>
              <p className="text-muted-foreground font-medium">
                Showing data from the past 30 days.
              </p>
            </div>
            <div className="flex gap-1.5">
              {timeRanges.map(range => <button key={range} onClick={() => setSelectedRange(range)} className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${selectedRange === range ? 'bg-[#3B3B3B] text-[#E5E5E5]' : 'bg-[#2A2A2A] text-muted-foreground hover:bg-[#333333]'}`}>
                  {range}
                </button>)}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2.5 h-30 mb-3 pt-[30px]">
            {weeklyData.map((data, index) => <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div initial={{
              height: 0
            }} animate={{
              height: `${data.barHeight}px`
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="w-full rounded-t-lg bg-[#4B5563] hover:bg-[#6B7280] transition-colors cursor-pointer relative group">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#333333] text-[#E5E5E5] px-1.5 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                    {data.value}%
                  </div>
                </motion.div>
              </div>)}
          </div>
          <div className="flex gap-2.5">
            {weeklyData.map((data, index) => <div key={index} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-medium">{data.week}</span>
              </div>)}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <div className="p-3.5 rounded-xl bg-[#1A1A1A]">
              <p className="text-sm text-muted-foreground mb-0.5 font-medium">Completion Rate</p>
              <p className="font-display text-sm font-semibold mb-1.5">Current average</p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-display font-bold">68%</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#9CA3AF] font-medium">
                  -14 pp from peak
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1A1A1A]">
              <p className="text-sm text-muted-foreground mb-0.5 font-medium">Drop-off Point</p>
              <p className="font-display text-sm font-semibold mb-1.5">Most common exit</p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-display font-bold">Step 3</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#9CA3AF] font-medium">
                  Profile setup
                </span>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#1A1A1A]">
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5 font-medium">
                <FileText className="w-3 h-3 stroke-[2.5]" />
                Suggested task
              </p>
              <p className="font-display text-sm font-semibold mb-2.5">
                Simplify profile setup flow
              </p>
              <button className="text-xs text-highlight hover:underline flex items-center gap-0.5 my-0 py-0 font-medium">
                Create backlog item <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-7">
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider">
            Evidence
          </p>
          {analysis.evidence.map(item => <div key={item.id} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#222222]">
              <div className="flex-shrink-0 mt-0.5">
                {item.type === 'quantitative' ? <BarChart3 className="w-4 h-4 opacity-60 stroke-[2.5]" /> : <FileText className="w-4 h-4 opacity-60 stroke-[2.5]" />}
              </div>
              <div>
                <p className="text-sm font-medium">{item.content}</p>
                <p className="text-xs opacity-60 mt-0.5 font-medium">{item.source.name}</p>
              </div>
            </div>)}
        </div>
        
        <div>
          <p className="text-sm font-semibold opacity-70 uppercase tracking-wider mb-3">
            Suggested Actions
          </p>
          <div className="space-y-1.5">
            {analysis.suggestedActions.map((action, i) => <button key={i} className="flex items-center gap-2.5 w-full p-3.5 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] transition-colors text-left group">
                <span className="text-sm font-medium">{action}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0 stroke-[2.5]" />
              </button>)}
          </div>
        </div>
      </div>
    </motion.div>;
}