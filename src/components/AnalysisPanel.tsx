import { motion } from 'framer-motion';
import { AnalysisView } from '@/types';
import { ArrowRight, X, FileText, BarChart3 } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AnalysisView;
  onClose?: () => void;
}

const themeClasses = {
  primary: 'analysis-panel-primary',
  secondary: 'analysis-panel-secondary',
  tertiary: 'analysis-panel-tertiary',
};

export function AnalysisPanel({ analysis, onClose }: AnalysisPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`analysis-panel ${themeClasses[analysis.colorTheme]} relative`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-foreground/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      
      <div className="max-w-3xl">
        <p className="text-sm font-medium opacity-70 mb-4 uppercase tracking-wider">
          Analysis
        </p>
        
        <h2 className="font-display text-3xl md:text-4xl mb-6 leading-tight">
          {analysis.question}
        </h2>
        
        <p className="text-lg md:text-xl leading-relaxed mb-8 opacity-90">
          {analysis.synthesis}
        </p>
        
        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium opacity-70 uppercase tracking-wider">
            Evidence
          </p>
          {analysis.evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-4 rounded-xl bg-foreground/5"
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.type === 'quantitative' ? (
                  <BarChart3 className="w-4 h-4 opacity-60" />
                ) : (
                  <FileText className="w-4 h-4 opacity-60" />
                )}
              </div>
              <div>
                <p className="text-sm leading-relaxed">{item.content}</p>
                <p className="text-xs opacity-60 mt-1">{item.source.name}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <p className="text-sm font-medium opacity-70 uppercase tracking-wider mb-4">
            Suggested Actions
          </p>
          <div className="space-y-2">
            {analysis.suggestedActions.map((action, i) => (
              <button
                key={i}
                className="flex items-center gap-3 w-full p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors text-left group"
              >
                <span className="text-sm">{action}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
