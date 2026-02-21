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
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalysisData {
  title: string;
  executiveDiagnosis: {
    journeyStep: string;
    description: string;
    metricLabel: string;
    metricValue: string;
  };
  evidenceMap: Array<{
    claim: string;
    snippet: string;
    tags: string[];
  }>;
  causalHypotheses: Array<{
    hypothesis: string;
    falsification: string;
    missingData: string;
  }>;
  segmentationFindings: Array<{
    segment: string;
    finding: string;
  }>;
  opportunitySizing: {
    revenueLift: string;
    confidence: string;
    expectedBenefit: string;
    assumptions: string[];
  };
  decisionOptions: Array<{
    label: string;
    title: string;
    description: string;
    devEffort: string;
    tags: string[];
  }>;
  actionPlan: Array<{
    category: string;
    actions: Array<{ action: string }>;
  }>;
  confidenceAndGaps: {
    level: string;
    percentage: number;
    reasoning: string;
    missingInputs: string[];
  };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, documents, aiResponse, rawContent } = location.state || {};

  const analysis: AnalysisData | null = aiResponse;

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  // Loading / fallback state
  if (!analysis) {
    return (
      <div className="min-h-screen bg-background">
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
        <main className="max-w-4xl mx-auto px-6 py-10">
          {rawContent ? (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h1 className="text-2xl font-display font-semibold text-foreground mb-4">{query || 'Analysis Results'}</h1>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{rawContent}</div>
            </div>
          ) : (
            <div className="flex items-center gap-3 justify-center py-20">
              <Loader2 className="w-5 h-5 text-primary animate-spin" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground font-medium">No analysis data available.</p>
            </div>
          )}
        </main>
      </div>
    );
  }

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
            {analysis.title || query || 'Analysis Results'}
          </h1>
          {documents && documents.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* 1. Executive Diagnosis */}
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
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{analysis.executiveDiagnosis.journeyStep}</span>
              <p className="text-foreground mt-1">{analysis.executiveDiagnosis.description}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{analysis.executiveDiagnosis.metricLabel}</span>
              <p className="text-lg font-semibold text-foreground mt-1">{analysis.executiveDiagnosis.metricValue}</p>
            </div>
          </div>
        </motion.section>

        {/* 2. Evidence Map */}
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
            {analysis.evidenceMap.map((card, i) => (
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
                    <p className="font-semibold text-foreground text-sm leading-snug">{card.claim}</p>
                    <p className="text-sm text-muted-foreground italic">"{card.snippet}"</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {card.tags.map((tag, j) => (
                        <Badge key={j} variant="secondary" className="text-xs font-medium">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 3. Causal Hypotheses */}
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
            {analysis.causalHypotheses.map((h, i) => (
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
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-accent-foreground mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Falsification:</span> {h.falsification}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Missing data:</span> {h.missingData}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. Segmentation Findings */}
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
              {analysis.segmentationFindings.map((seg, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary/10">
                    <Users className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{seg.segment}</p>
                    <p className="text-sm mt-0.5 text-muted-foreground">{seg.finding}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={2} />
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. Opportunity Sizing */}
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
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Est. Revenue Lift</p>
                <p className="text-3xl font-display font-bold text-foreground">{analysis.opportunitySizing.revenueLift}</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-3xl font-display font-bold text-primary">{analysis.opportunitySizing.confidence}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Expected Benefit</p>
                <p className="text-lg text-foreground font-medium">{analysis.opportunitySizing.expectedBenefit}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Details</p>
                <ul className="space-y-1">
                  {analysis.opportunitySizing.assumptions.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/50">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 6. Decision Options */}
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
            {analysis.decisionOptions.map((option, i) => (
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
                </div>
                <h3 className="font-semibold text-foreground mb-2">{option.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-foreground">Dev Effort:</span>
                    <span className="text-muted-foreground ml-1">{option.devEffort}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {option.tags.map((tag, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. Action Plan */}
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
            {analysis.actionPlan.map((category, catIndex) => (
              <div key={catIndex}>
                <div className="bg-muted/30 px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground capitalize">{category.category}</h3>
                </div>
                <div className="divide-y divide-border">
                  {category.actions.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 8. Confidence & Gaps */}
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
                analysis.confidenceAndGaps.level === 'High' ? 'bg-secondary/10 text-secondary' :
                analysis.confidenceAndGaps.level === 'Medium' ? 'bg-accent text-accent-foreground' :
                'bg-destructive/10 text-destructive'
              }`}>
                {analysis.confidenceAndGaps.level} Confidence ({analysis.confidenceAndGaps.percentage}%)
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{analysis.confidenceAndGaps.reasoning}</p>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Top Missing Inputs</p>
              <ul className="space-y-2">
                {analysis.confidenceAndGaps.missingInputs.map((input, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                    {input}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}