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
  MessageSquare,
  Headphones,
  Activity,
  Smartphone,
  Monitor,
  Globe,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ── Types matching the backend JSON contract ──

interface CardCitation {
  label: string;
  chunk_id: string;
}

interface CardMetric {
  name: string;
  value: string;
}

interface SectionCard {
  title: string;
  detail: string;
  metrics?: CardMetric[];
  tags?: string[];
  citations?: CardCitation[];
}

interface SectionItem {
  label: string;
  value: string;
}

interface AnalysisSection {
  type: string;
  heading: string;
  cards?: SectionCard[];
  items?: SectionItem[];
}

interface AnalysisCitation {
  document_title: string;
  chunk_id: string;
  quote: string;
}

interface AnalysisData {
  mode: 'diagnosis' | 'answer' | 'insufficient_evidence';
  title: string;
  summary: string;
  sections: AnalysisSection[];
  citations?: AnalysisCitation[];
  confidence?: { score: number; label: string };
}

// ── Helpers ──

function getSection(sections: AnalysisSection[], type: string): AnalysisSection | undefined {
  return sections.find(s => s.type === type);
}

function EmptySection({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-6 bg-muted/20 rounded-xl border border-dashed border-border">
      <HelpCircle className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">No {label.toLowerCase()} data available for this query.</p>
    </div>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, documents, analysisData } = location.state as { query: string; documents: any[]; analysisData?: AnalysisData } || { query: '', documents: [] };

  const data: AnalysisData | null = analysisData || null;

  // Section animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  const execDiag = data ? getSection(data.sections, 'executive_diagnosis') : undefined;
  const evidenceMap = data ? getSection(data.sections, 'evidence_map') : undefined;
  const hypotheses = data ? getSection(data.sections, 'hypotheses') : undefined;
  const segmentation = data ? getSection(data.sections, 'segmentation') : undefined;
  const opportunitySizing = data ? getSection(data.sections, 'opportunity_sizing') : undefined;
  const decisionOptions = data ? getSection(data.sections, 'decision_options') : undefined;
  const actionPlan = data ? getSection(data.sections, 'action_plan') : undefined;
  const confidenceGaps = data ? getSection(data.sections, 'confidence_gaps') : undefined;

  const evidenceIcons = [BarChart3, MessageSquare, Smartphone, Headphones, AlertTriangle];

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
            {data?.title || query || 'Analysis Results'}
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
          {execDiag && execDiag.cards && execDiag.cards.length > 0 ? (
            <div className="space-y-4">
              {execDiag.cards.map((card, i) => (
                <div key={i}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</span>
                  <p className="text-foreground mt-1">{card.detail}</p>
                  {card.metrics && card.metrics.length > 0 && (
                    <div className="flex flex-wrap gap-6 mt-3">
                      {card.metrics.map((m, j) => (
                        <div key={j}>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.name}</span>
                          <p className="text-foreground mt-1">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptySection label="Executive Diagnosis" />
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
          {evidenceMap && evidenceMap.cards && evidenceMap.cards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {evidenceMap.cards.map((card, i) => {
                const Icon = evidenceIcons[i % evidenceIcons.length];
                const isContradiction = card.tags?.some(t => t.toLowerCase().includes('contradiction'));
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`bg-card rounded-2xl p-5 border ${isContradiction ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'}`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isContradiction ? 'bg-amber-500/10' : 'bg-secondary/10'}`}>
                        <Icon className={`w-4 h-4 ${isContradiction ? 'text-amber-600' : 'text-secondary'}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <p className="font-semibold text-foreground text-sm leading-snug">{card.title}</p>
                        {card.detail && <p className="text-sm text-muted-foreground italic">"{card.detail}"</p>}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {card.tags?.map((tag, j) => (
                            <Badge key={j} variant="secondary" className="text-xs font-medium">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptySection label="Evidence" />
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
          {hypotheses && hypotheses.cards && hypotheses.cards.length > 0 ? (
            <div className="space-y-4">
              {hypotheses.cards.map((card, i) => (
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
                      <p className="text-foreground font-medium leading-relaxed">{card.title}</p>
                    </div>
                    <div className="ml-9 space-y-2">
                      {card.detail && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-accent-foreground mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Falsification:</span> {card.detail}</p>
                        </div>
                      )}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Missing data:</span> {card.tags.join('; ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptySection label="Hypotheses" />
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
          {segmentation && segmentation.items && segmentation.items.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {segmentation.items.map((item, i) => {
                  const segIcons = [Users, Monitor, Globe, Layers, Globe, Activity];
                  const Icon = segIcons[i % segIcons.length];
                  const hasData = !item.value.toLowerCase().includes('cannot segment');
                  return (
                    <div key={i} className="flex items-start gap-4 p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${hasData ? 'bg-secondary/10' : 'bg-muted/50'}`}>
                        <Icon className={`w-4 h-4 ${hasData ? 'text-secondary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{item.label}</p>
                        <p className={`text-sm mt-0.5 ${hasData ? 'text-muted-foreground' : 'text-destructive'}`}>{item.value}</p>
                      </div>
                      {hasData && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={2} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptySection label="Segmentation" />
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
          {opportunitySizing && ((opportunitySizing.cards && opportunitySizing.cards.length > 0) || (opportunitySizing.items && opportunitySizing.items.length > 0)) ? (
            <div className="bg-card rounded-2xl p-6 border border-border">
              {/* Metrics grid from cards */}
              {opportunitySizing.cards && opportunitySizing.cards.length > 0 && (
                <>
                  <div className="grid gap-6 md:grid-cols-3 mb-6">
                    {opportunitySizing.cards[0]?.metrics?.slice(0, 3).map((m, i) => (
                      <div key={i} className={`text-center p-4 rounded-xl ${i === 1 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30'}`}>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{m.name}</p>
                        <p className={`text-3xl font-display font-bold ${i === 1 ? 'text-primary' : 'text-foreground'}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {opportunitySizing.cards[0]?.detail && (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Expected Benefit</p>
                        <p className="text-lg text-primary font-medium">{opportunitySizing.cards[0].detail}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Assumptions from items */}
              {opportunitySizing.items && opportunitySizing.items.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground mb-2">Details</p>
                  <ul className="space-y-1">
                    {opportunitySizing.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-muted-foreground/50">•</span>
                        <span><span className="font-medium text-foreground">{item.label}:</span> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <EmptySection label="Opportunity Sizing" />
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
          {decisionOptions && decisionOptions.cards && decisionOptions.cards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {decisionOptions.cards.map((card, i) => {
                const labels = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                        {labels[i] || i + 1}
                      </span>
                      {card.metrics?.find(m => m.name.toLowerCase().includes('time')) && (
                        <Badge variant="outline" className="text-xs">{card.metrics.find(m => m.name.toLowerCase().includes('time'))!.value}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{card.detail}</p>
                    <div className="space-y-2 text-xs">
                      {card.metrics?.filter(m => !m.name.toLowerCase().includes('time')).map((m, j) => (
                        <div key={j}>
                          <span className="font-medium text-foreground">{m.name}:</span>
                          <span className="text-primary ml-1">{m.value}</span>
                        </div>
                      ))}
                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {card.tags.map((tag, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptySection label="Decision Options" />
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
          {actionPlan && actionPlan.items && actionPlan.items.length > 0 ? (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Group items by label as category */}
              {(() => {
                const categories = new Map<string, string[]>();
                actionPlan.items.forEach(item => {
                  const existing = categories.get(item.label) || [];
                  existing.push(item.value);
                  categories.set(item.label, existing);
                });
                return Array.from(categories.entries()).map(([category, actions], catIndex) => (
                  <div key={catIndex}>
                    <div className="bg-muted/30 px-5 py-3 border-b border-border">
                      <h3 className="text-sm font-semibold text-foreground capitalize">{category}</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {actions.map((action, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-3">
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <EmptySection label="Action Plan" />
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
          {(data?.confidence || (confidenceGaps && ((confidenceGaps.cards && confidenceGaps.cards.length > 0) || (confidenceGaps.items && confidenceGaps.items.length > 0)))) ? (
            <div className="bg-card rounded-2xl p-6 border border-border">
              {data?.confidence && (
                <div className="flex items-center gap-4 mb-4">
                  <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    data.confidence.label === 'high' ? 'bg-secondary/10 text-secondary' :
                    data.confidence.label === 'medium' ? 'bg-accent text-accent-foreground' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {data.confidence.label.charAt(0).toUpperCase() + data.confidence.label.slice(1)} Confidence ({data.confidence.score}%)
                  </div>
                </div>
              )}
              {confidenceGaps?.cards?.[0]?.detail && (
                <p className="text-muted-foreground mb-4">{confidenceGaps.cards[0].detail}</p>
              )}
              {confidenceGaps?.items && confidenceGaps.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Top Missing Inputs</p>
                  <ul className="space-y-2">
                    {confidenceGaps.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                        <span><span className="font-medium text-foreground">{item.label}:</span> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <EmptySection label="Confidence & Gaps" />
          )}
        </motion.section>
      </main>
    </div>
  );
}
