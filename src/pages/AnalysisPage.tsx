import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Beaker,
  BarChart3,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, analysisData } = location.state || { query: '', analysisData: null };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  // Extract data from the AI response, with safe defaults
  const data = analysisData || {};
  const title = data.title || query || 'Analysis Results';
  const docCount = data.doc_count || 0;
  const diagnosis = data.executive_diagnosis || {};
  const evidenceCards = data.evidence_map || [];
  const hypotheses = data.causal_hypotheses || [];
  const segmentationData = data.segmentation_findings || [];
  const opportunitySizing = data.opportunity_sizing || {};
  const decisionOptions = data.decision_options || [];
  const actionPlanData = data.action_plan || [];
  const confidenceData = data.confidence_gaps || {};

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
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Page header */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {docCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Based on {docCount} uploaded document{docCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* 1. Executive Diagnosis */}
        {diagnosis.description && (
          <motion.section
            custom={1}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" strokeWidth={1.5} />
              Executive Diagnosis
            </h2>
            <div className="space-y-4">
              {diagnosis.journey_step && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{diagnosis.journey_step}</span>
                </div>
              )}
              <p className="text-foreground leading-relaxed">{diagnosis.description}</p>
              {diagnosis.key_metric_label && diagnosis.key_metric_value && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{diagnosis.key_metric_label}</span>
                  <p className="text-lg font-semibold text-foreground mt-1">{diagnosis.key_metric_value}</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* 2. Evidence Map */}
        {evidenceCards.length > 0 && (
          <motion.section
            custom={2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Evidence Map
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {evidenceCards.map((card: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="bg-card rounded-2xl p-5 border border-border"
                >
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/10">
                      <BarChart3 className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="font-semibold text-foreground text-sm leading-snug">{card.title}</p>
                      <p className="text-sm text-muted-foreground italic">"{card.excerpt}"</p>
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {card.tags.map((tag: string, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs font-medium">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 3. Causal Hypotheses */}
        {hypotheses.length > 0 && (
          <motion.section
            custom={3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Beaker className="w-4 h-4" strokeWidth={1.5} />
              Causal Hypotheses
            </h2>
            <div className="space-y-4">
              {hypotheses.map((h: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="bg-card rounded-2xl p-5 border border-border"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-foreground font-medium leading-relaxed">{h.hypothesis}</p>
                    </div>
                    <div className="ml-9 space-y-2">
                      {h.falsification && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-accent-foreground mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Falsification:</span> {h.falsification}</p>
                        </div>
                      )}
                      {h.missing_data && (
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Missing data:</span> {h.missing_data}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 4. Segmentation Findings */}
        {segmentationData.length > 0 && (
          <motion.section
            custom={4}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" strokeWidth={1.5} />
              Segmentation Findings
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {segmentationData.map((seg: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${seg.has_data !== false ? 'bg-secondary/10' : 'bg-muted/50'}`}>
                      <Users className={`w-4 h-4 ${seg.has_data !== false ? 'text-secondary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{seg.segment}</p>
                      <p className={`text-sm mt-0.5 ${seg.has_data !== false ? 'text-muted-foreground' : 'text-destructive'}`}>{seg.finding}</p>
                    </div>
                    {seg.has_data !== false && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={2} />}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* 5. Opportunity Sizing */}
        {(opportunitySizing.revenue_lift || opportunitySizing.expected_benefit) && (
          <motion.section
            custom={5}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
              Opportunity Sizing
            </h2>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {opportunitySizing.revenue_lift && (
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Est. Revenue Lift</p>
                    <p className="text-2xl font-display font-bold text-foreground">{opportunitySizing.revenue_lift}</p>
                  </div>
                )}
                {opportunitySizing.confidence && (
                  <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                    <p className="text-2xl font-display font-bold text-primary">{opportunitySizing.confidence}</p>
                  </div>
                )}
              </div>
              {opportunitySizing.expected_benefit && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground">Expected Benefit</p>
                  <p className="text-foreground mt-1">{opportunitySizing.expected_benefit}</p>
                </div>
              )}
              {opportunitySizing.details && (
                <div>
                  <p className="text-sm font-semibold text-foreground">Details</p>
                  <p className="text-sm text-muted-foreground mt-1">{opportunitySizing.details}</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* 6. Decision Options */}
        {decisionOptions.length > 0 && (
          <motion.section
            custom={6}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4" strokeWidth={1.5} />
              Decision Options
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {decisionOptions.map((option: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                      {option.label}
                    </span>
                    {option.dev_effort && (
                      <Badge variant="outline" className="text-xs">{option.dev_effort}</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                  {option.tags && option.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {option.tags.map((tag: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 7. Action Plan */}
        {actionPlanData.length > 0 && (
          <motion.section
            custom={7}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
              Action Plan
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {actionPlanData.map((category: any, catIndex: number) => (
                <div key={catIndex}>
                  <div className="bg-muted/30 px-5 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold text-foreground capitalize">{category.category}</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {(category.actions || []).map((action: string, i: number) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3">
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <p className="text-sm text-foreground">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* 8. Confidence & Gaps */}
        {confidenceData.level && (
          <motion.section
            custom={8}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4 pb-10"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
              Confidence & Gaps
            </h2>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  confidenceData.level === 'High' ? 'bg-secondary/10 text-secondary' :
                  confidenceData.level === 'Medium' ? 'bg-accent text-accent-foreground' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {confidenceData.level} Confidence{confidenceData.percentage ? ` (${confidenceData.percentage}%)` : ''}
                </div>
              </div>
              {confidenceData.reasoning && (
                <p className="text-muted-foreground mb-4">{confidenceData.reasoning}</p>
              )}
              {confidenceData.missing_inputs && confidenceData.missing_inputs.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Top Missing Inputs</p>
                  <ul className="space-y-2">
                    {confidenceData.missing_inputs.map((input: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                        {input}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
