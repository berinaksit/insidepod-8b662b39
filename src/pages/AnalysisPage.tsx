import { useState, useEffect } from 'react';
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
  Monitor,
  Globe,
  Activity,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

// Types for AI response
interface AnalysisResponse {
  mode: 'diagnosis' | 'answer' | 'insufficient_evidence';
  title: string;
  source_count: number;
  empty_reason?: string | null;
  raw_content?: string;
  executive_diagnosis: {
    journey_step: string;
    description: string;
    metrics: { label: string; value: string }[];
  } | null;
  evidence_map: {
    title: string;
    quote: string;
    tags: string[];
  }[] | null;
  causal_hypotheses: {
    hypothesis: string;
    falsification: string;
    missing_data: string;
  }[] | null;
  segmentation_findings: {
    segment: string;
    finding: string;
    icon_hint: string;
  }[] | null;
  opportunity_sizing: {
    metrics: { label: string; value: string }[];
    expected_benefit: string;
    details: { label: string; text: string }[];
  } | null;
  decision_options: {
    label: string;
    title: string;
    description: string;
    dev_effort: string;
    tags: string[];
  }[] | null;
  action_plan: {
    category: string;
    steps: string[];
  }[] | null;
  confidence_gaps: {
    level: string;
    reasoning: string;
    missing_inputs: { label: string; text: string }[];
  } | null;
}

const iconMap: Record<string, any> = {
  users: Users,
  monitor: Monitor,
  globe: Globe,
  layers: Layers,
  activity: Activity,
};

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, project_id, documents } = location.state || { query: '', project_id: null, documents: [] };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    if (!query) {
      setIsLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      console.log("Calling ask function");

      try {
        const { data: resp, error: fnError } = await supabase.functions.invoke("ask", {
          body: { question: query, project_id },
        });

        console.log("Response:", resp);

        if (fnError) {
          setError(fnError.message || 'Something went wrong');
        } else if (resp?.error) {
          setError(resp.error);
        } else {
          setData(resp as AnalysisResponse);
        }
      } catch (err: any) {
        console.error("Error calling ask function:", err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [query, project_id]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  const EmptySection = ({ message }: { message: string }) => (
    <div className="py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

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

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={1.5} />
            <p className="text-muted-foreground font-medium">Analyzing your question…</p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 px-5 py-4 bg-destructive/10 border border-destructive/20 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-destructive">Analysis failed</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {data && !isLoading && (
          <>
            {/* Page header */}
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={sectionVariants}
              className="space-y-3"
            >
              <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
                {data.title || query || 'Analysis Results'}
              </h1>
              {data.source_count > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-sm font-medium">
                    Based on {data.source_count} uploaded document{data.source_count !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Insufficient evidence banner */}
            {data.mode === 'insufficient_evidence' && data.empty_reason && (
              <motion.div
                custom={0.5}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="flex items-start gap-3 px-5 py-4 bg-accent border border-border rounded-xl"
              >
                <AlertTriangle className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-sm text-accent-foreground">{data.empty_reason}</p>
              </motion.div>
            )}

            {/* Raw content fallback */}
            {data.raw_content && !data.executive_diagnosis && (
              <motion.div
                custom={1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                  {data.raw_content}
                </div>
              </motion.div>
            )}

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
              {data.executive_diagnosis ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{data.executive_diagnosis.journey_step}</span>
                    <p className="text-foreground mt-1">{data.executive_diagnosis.description}</p>
                  </div>
                  {data.executive_diagnosis.metrics?.length > 0 && (
                    <div className="flex flex-wrap gap-6">
                      {data.executive_diagnosis.metrics.map((m, i) => (
                        <div key={i}>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</span>
                          <p className="text-foreground mt-1 font-semibold">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <EmptySection message="Not enough data to produce an executive diagnosis yet." />
              )}
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
              {data.evidence_map && data.evidence_map.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {data.evidence_map.map((card, i) => (
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
                          <p className="text-sm text-muted-foreground italic">"{card.quote}"</p>
                          {card.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {card.tags.map((tag, j) => (
                                <Badge key={j} variant="secondary" className="text-xs font-medium">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="No evidence cards available. Upload more documents to enable evidence mapping." />
                </div>
              )}
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
              {data.causal_hypotheses && data.causal_hypotheses.length > 0 ? (
                <div className="space-y-4">
                  {data.causal_hypotheses.map((h, i) => (
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
                            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Missing data:</span> {h.missing_data}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="Not enough data to generate causal hypotheses yet." />
                </div>
              )}
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
              {data.segmentation_findings && data.segmentation_findings.length > 0 ? (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="divide-y divide-border">
                    {data.segmentation_findings.map((seg, i) => {
                      const Icon = iconMap[seg.icon_hint] || Users;
                      return (
                        <div key={i} className="flex items-start gap-4 p-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-secondary/10">
                            <Icon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">{seg.segment}</p>
                            <p className="text-sm mt-0.5 text-muted-foreground">{seg.finding}</p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={2} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="No segmentation data available yet." />
                </div>
              )}
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
              {data.opportunity_sizing ? (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  {data.opportunity_sizing.metrics?.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                      {data.opportunity_sizing.metrics.map((m, i) => (
                        <div key={i} className="text-center p-4 bg-muted/30 rounded-xl">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.label}</p>
                          <p className="text-3xl font-display font-bold text-foreground">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Expected Benefit</p>
                      <p className="text-foreground">{data.opportunity_sizing.expected_benefit}</p>
                    </div>
                    {data.opportunity_sizing.details?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">Details</p>
                        <ul className="space-y-1">
                          {data.opportunity_sizing.details.map((d, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-muted-foreground/50">•</span>
                              <span><span className="font-medium text-foreground/80">{d.label}:</span> {d.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="Not enough data for opportunity sizing." />
                </div>
              )}
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
              {data.decision_options && data.decision_options.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {data.decision_options.map((option, i) => (
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
                          <span className="text-muted-foreground ml-1">{option.dev_effort}</span>
                        </div>
                        {option.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {option.tags.map((tag, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="No decision options generated yet." />
                </div>
              )}
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
              {data.action_plan && data.action_plan.length > 0 ? (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {data.action_plan.map((cat, catIndex) => (
                    <div key={catIndex}>
                      <div className="bg-muted/30 px-5 py-3 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">{cat.category}</h3>
                      </div>
                      <div className="divide-y divide-border">
                        {cat.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-4 px-5 py-3">
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                            <p className="text-sm text-foreground">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="No action plan available yet." />
                </div>
              )}
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
              {data.confidence_gaps ? (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="px-4 py-2 rounded-lg font-semibold text-sm bg-accent text-accent-foreground">
                      {data.confidence_gaps.level}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{data.confidence_gaps.reasoning}</p>
                  {data.confidence_gaps.missing_inputs?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-2">Top Missing Inputs</p>
                      <ul className="space-y-2">
                        {data.confidence_gaps.missing_inputs.map((input, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                            <span><span className="font-medium text-foreground/80">{input.label}:</span> {input.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <EmptySection message="Confidence assessment not available yet." />
                </div>
              )}
            </motion.section>
          </>
        )}

        {/* No query state */}
        {!query && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">No question provided. Go back and ask a question.</p>
          </div>
        )}
      </main>
    </div>
  );
}
