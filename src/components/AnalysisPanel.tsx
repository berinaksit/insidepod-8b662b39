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
  value: 72
}, {
  week: 'Week 2',
  value: 78
}, {
  week: 'Week 3',
  value: 74
}, {
  week: 'Week 4',
  value: 82
}, {
  week: 'Week 5',
  value: 68
}, {
  week: 'Week 6',
  value: 61
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
      {onClose && <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/10 transition-colors">
          <X className="w-5 h-5" />
        </button>}
      
      <div className="max-w-4xl">
        <p className="text-sm font-medium opacity-70 mb-4 uppercase tracking-wider">
          Analysis
        </p>
        
        <h2 className="font-display text-3xl md:text-4xl mb-6 leading-tight">
          {analysis.question}
        </h2>
        
        <p className="text-lg md:text-xl leading-relaxed mb-8 opacity-90">
          {analysis.synthesis}
        </p>

        {/* Data Visualization Section */}
        <div className="mb-10 p-6 rounded-2xl bg-[#222222]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-display text-xl md:text-2xl mb-1">
                A closer look at <span className="text-[#9CA3AF]">onboarding completion</span>
              </h3>
              <p className="text-muted-foreground">
                Showing data from the past 30 days.
              </p>
            </div>
            <div className="flex gap-2">
              {timeRanges.map(range => <button key={range} onClick={() => setSelectedRange(range)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedRange === range ? 'bg-[#3B3B3B] text-[#E5E5E5]' : 'bg-[#2A2A2A] text-muted-foreground hover:bg-[#333333]'}`}>
                  {range}
                </button>)}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-48 mb-4">
            {weeklyData.map((data, index) => <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div initial={{
              height: 0
            }} animate={{
              height: `${data.value / maxValue * 100}%`
            }} transition={{
              duration: 0.5,
              delay: index * 0.1
            }} className="w-full rounded-t-lg bg-[#4B5563] hover:bg-[#6B7280] transition-colors cursor-pointer relative group min-h-[20px]">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#333333] text-[#E5E5E5] px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {data.value}%
                  </div>
                </motion.div>
              </div>)}
          </div>
          <div className="flex gap-3">
            {weeklyData.map((data, index) => <div key={index} className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">{data.week}</span>
              </div>)}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-[#1A1A1A]">
              <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
              <p className="font-display text-sm font-medium mb-2">Current average</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-display font-bold">68%</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#9CA3AF]">
                  -14 pp from peak
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1A1A]">
              <p className="text-sm text-muted-foreground mb-1">Drop-off Point</p>
              <p className="font-display text-sm font-medium mb-2">Most common exit</p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-display font-bold">Step 3</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#2A2A2A] text-[#9CA3AF]">
                  Profile setup
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1A1A]">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
                <FileText className="w-3 h-3" />
                Suggested task
              </p>
              <p className="font-display text-sm font-medium mb-3">
                Simplify profile setup flow
              </p>
              <button className="text-xs text-highlight hover:underline flex items-center gap-1 my-0 py-0">
                Create backlog item <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium opacity-70 uppercase tracking-wider">
            Evidence
          </p>
          {analysis.evidence.map(item => <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl bg-[#222222]">
              <div className="flex-shrink-0 mt-0.5">
                {item.type === 'quantitative' ? <BarChart3 className="w-4 h-4 opacity-60" /> : <FileText className="w-4 h-4 opacity-60" />}
              </div>
              <div>
                <p className="text-sm leading-relaxed">{item.content}</p>
                <p className="text-xs opacity-60 mt-1">{item.source.name}</p>
              </div>
            </div>)}
        </div>
        
        <div>
          <p className="text-sm font-medium opacity-70 uppercase tracking-wider mb-4">
            Suggested Actions
          </p>
          <div className="space-y-2">
            {analysis.suggestedActions.map((action, i) => <button key={i} className="flex items-center gap-3 w-full p-4 rounded-xl bg-[#222222] hover:bg-[#2a2a2a] transition-colors text-left group">
                <span className="text-sm">{action}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
              </button>)}
          </div>
        </div>
      </div>
    </motion.div>;
}