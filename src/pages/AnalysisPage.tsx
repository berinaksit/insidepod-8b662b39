import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, TrendingDown, Users, AlertTriangle, Lightbulb } from 'lucide-react';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, documents } = location.state || { query: '', documents: [] };

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
      detail: "Users don't know how many steps remain. Showing progress reduces anxiety.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {query || 'Analysis Results'}
          </h1>
          {documents.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* Analysis summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="analysis-panel analysis-panel-primary rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-sm font-medium text-primary-surface-foreground/70 uppercase tracking-wider mb-3">
            Summary
          </h2>
          <p className="text-lg md:text-xl text-primary-surface-foreground leading-relaxed">
            The onboarding drop-off is primarily driven by friction at the profile setup step, 
            where users encounter too many required fields. Data shows a 23% decline in step 2 
            completion over the past month.
          </p>
        </motion.section>

        {/* Data visualization */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Completion trend
          </h2>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-end gap-4 h-32">
              {chartData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${item.height}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className="flex-1 flex flex-col items-center gap-3"
                >
                  <div 
                    className="w-full bg-primary/80 rounded-lg"
                    style={{ height: '100%' }}
                  />
                  <span className="text-sm text-muted-foreground font-medium">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <span className="text-sm text-muted-foreground font-medium">Step 2 completion rate</span>
              <span className="text-sm font-semibold text-destructive">-31% overall</span>
            </div>
          </div>
        </motion.section>

        {/* Evidence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Evidence
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {evidence.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-card rounded-2xl p-5 border border-border"
                >
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" strokeWidth={1.5} />
                        Source: {item.source}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Suggested actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4 pb-10"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Suggested actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {suggestedActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="bg-card hover:bg-muted/50 rounded-2xl p-5 border border-border text-left transition-colors group"
                >
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{action.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{action.detail}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
