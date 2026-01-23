import { motion } from 'framer-motion';
import { X, FileText, ArrowRight, TrendingDown, Users, AlertTriangle, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UploadedDocument } from './AddDocumentsModal';

interface AnalysisResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  documents: UploadedDocument[];
}

export function AnalysisResultsModal({ 
  open, 
  onOpenChange, 
  query, 
  documents 
}: AnalysisResultsModalProps) {
  // Sample visualization data
  const chartData = [
    { label: 'Week 1', value: 85, height: 85 },
    { label: 'Week 2', value: 72, height: 72 },
    { label: 'Week 3', value: 68, height: 68 },
    { label: 'Week 4', value: 54, height: 54 },
  ];

  // Generate evidence based on documents
  const evidence = [
    {
      icon: TrendingDown,
      title: 'Step 2 completion dropped 23%',
      detail: 'Users are abandoning the profile setup step significantly more than last month.',
      source: documents[0]?.aiTitle || 'User Feedback',
    },
    {
      icon: Users,
      title: '67% cite "too many fields"',
      detail: 'Qualitative feedback shows users feel overwhelmed by required form fields.',
      source: documents[1]?.aiTitle || documents[0]?.aiTitle || 'Analysis Report',
    },
  ];

  const suggestedActions = [
    {
      icon: Lightbulb,
      title: 'Reduce required fields to 3',
      detail: 'Based on evidence, simplifying the form could recover 15-20% of lost users.',
    },
    {
      icon: AlertTriangle,
      title: 'Add progress indicator',
      detail: 'Users don\'t know how many steps remain. Showing progress reduces anxiety.',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-0 rounded-3xl shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="analysis-panel analysis-panel-primary p-6 pb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2 text-primary-surface-foreground/70">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                {documents.length} document{documents.length !== 1 ? 's' : ''} analyzed
              </span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-primary-surface-foreground" strokeWidth={1.5} />
            </button>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-primary-surface-foreground leading-tight">
            {query}
          </h2>

          {/* Summary */}
          <p className="mt-4 text-primary-surface-foreground/90 text-lg leading-relaxed">
            The onboarding drop-off is primarily driven by friction at the profile setup step, 
            where users encounter too many required fields. Data shows a 23% decline in step 2 
            completion over the past month.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visualization */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Completion trend
            </h3>
            <div className="bg-muted/30 rounded-2xl p-5">
              <div className="flex items-end gap-3 h-24">
                {chartData.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${item.height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div 
                      className="w-full bg-primary/80 rounded-lg"
                      style={{ height: '100%' }}
                    />
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Step 2 completion rate</span>
                <span className="text-sm font-semibold text-destructive">-31% overall</span>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Evidence
            </h3>
            <div className="space-y-3">
              {evidence.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3 p-4 bg-muted/30 rounded-xl"
                  >
                    <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        Source: {item.source}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Suggested Actions */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Suggested actions
            </h3>
            <div className="space-y-3">
              {suggestedActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="w-full flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl text-left transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{action.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{action.detail}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
