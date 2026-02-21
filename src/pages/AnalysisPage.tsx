import { useState } from 'react';
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
  HelpCircle,
  Upload,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/contexts/ProjectsContext';

// ── Types matching the NEW grounded backend JSON contract ──

interface EvidenceItem {
  doc_id: string;
  doc_title: string;
  chunk_id: string;
  quote: string;
  start_char: number;
  end_char: number;
}

interface SuggestedPrompt {
  label: string;
  prompt: string;
}

interface MissingContext {
  need: string;
  why: string;
}

interface AnswerSection {
  heading: string;
  content: string;
}

interface GroundedResponse {
  status: 'ok' | 'need_more_context' | 'unrelated';
  answer: {
    format: 'diagnosis_page' | 'chat_with_evidence';
    title: string;
    summary: string;
    sections: AnswerSection[];
  };
  evidence: EvidenceItem[];
  suggested_prompts: SuggestedPrompt[];
  missing_context: MissingContext[];
}

// ── Helpers ──

function EmptySection({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-6 bg-muted/20 rounded-xl border border-dashed border-border">
      <HelpCircle className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">No {label.toLowerCase()} data available for this query.</p>
    </div>
  );
}

// Map section headings to icons
function getSectionIcon(heading: string) {
  const h = heading.toLowerCase();
  if (h.includes('executive') || h.includes('diagnosis')) return Target;
  if (h.includes('evidence')) return FileText;
  if (h.includes('hypothes')) return Beaker;
  if (h.includes('segment')) return Layers;
  if (h.includes('opportunity') || h.includes('sizing')) return TrendingDown;
  if (h.includes('decision') || h.includes('option')) return Target;
  if (h.includes('action') || h.includes('plan')) return CheckCircle2;
  if (h.includes('confidence') || h.includes('gap')) return AlertTriangle;
  return Lightbulb;
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProjectId } = useProjects();

  const locationState = (location.state || {}) as { query?: string; documents?: any[]; analysisData?: GroundedResponse };
  const { query = '', documents = [], analysisData } = locationState;

  const data: GroundedResponse | null = analysisData || null;

  // For running suggestion prompts
  const [isRunning, setIsRunning] = useState(false);

  // Evidence viewer modal
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  const handleSuggestionClick = async (prompt: string) => {
    setIsRunning(true);
    try {
      const { data: newData, error } = await supabase.functions.invoke("ask", {
        body: { question: prompt, project_id: activeProjectId },
      });
      if (error || newData?.error) {
        console.error("Suggestion error:", error || newData?.error);
      } else {
        navigate('/analysis', { state: { query: prompt, analysisData: newData, documents }, replace: true });
      }
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  // ── "Need more context" / "Unrelated" intermediate states ──
  if (data && (data.status === 'need_more_context' || data.status === 'unrelated')) {
    const isUnrelated = data.status === 'unrelated';
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

        <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              {isUnrelated ? (
                <AlertCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
              ) : (
                <HelpCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
              {isUnrelated
                ? "That question doesn't match the data in this project."
                : "I need a bit more context to answer correctly."}
            </h1>
            {data.missing_context && data.missing_context.length > 0 && (
              <p className="text-muted-foreground max-w-lg mx-auto">
                {data.missing_context.map(m => m.why).join(' ')}
              </p>
            )}
          </motion.div>

          {/* Suggestion chips */}
          {data.suggested_prompts && data.suggested_prompts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">Try asking</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {data.suggested_prompts.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sp.prompt)}
                    disabled={isRunning}
                    className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground font-medium hover:border-primary/30 hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upload CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Upload className="w-4 h-4" strokeWidth={1.5} />
              Upload documents
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // ── status="ok" — render the answer page ──

  const isDiagnosis = data?.answer?.format === 'diagnosis_page';
  const sections = data?.answer?.sections || [];
  const evidence = data?.evidence || [];
  const suggestedPrompts = data?.suggested_prompts || [];

  // For diagnosis_page, map sections to the 8-section layout
  const diagnosisSectionOrder = [
    'Executive Diagnosis',
    'Evidence Map',
    'Causal Hypotheses',
    'Segmentation Findings',
    'Opportunity Sizing',
    'Decision Options',
    'Action Plan',
    'Confidence & Gaps',
  ];

  const sectionIcons = [Target, FileText, Beaker, Layers, TrendingDown, Target, CheckCircle2, AlertTriangle];

  function findSection(heading: string): AnswerSection | undefined {
    return sections.find(s => s.heading.toLowerCase().includes(heading.toLowerCase().split(' ')[0]));
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
            {data?.answer?.title || query || 'Analysis Results'}
          </h1>
          {data?.answer?.summary && (
            <p className="text-muted-foreground leading-relaxed">{data.answer.summary}</p>
          )}
          {documents && documents.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* Sections — diagnosis_page uses 8-section layout, chat_with_evidence uses dynamic sections */}
        {isDiagnosis ? (
          // Diagnosis: render all 8 sections, using content from response or empty state
          diagnosisSectionOrder.map((sectionName, idx) => {
            const Icon = sectionIcons[idx];
            const section = findSection(sectionName);
            const isFirst = idx === 0;

            return (
              <motion.section
                key={sectionName}
                custom={idx + 1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className={isFirst
                  ? "bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8"
                  : "space-y-4"
                }
              >
                <h2 className={`text-sm font-medium uppercase tracking-wider flex items-center gap-2 ${isFirst ? 'text-primary mb-4' : 'text-muted-foreground'}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {sectionName}
                </h2>
                {section && section.content ? (
                  <div className={isFirst ? '' : 'bg-card rounded-2xl p-5 border border-border'}>
                    <p className="text-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                  </div>
                ) : (
                  <EmptySection label={sectionName} />
                )}
              </motion.section>
            );
          })
        ) : (
          // chat_with_evidence: render whatever sections came back
          sections.length > 0 ? sections.map((section, idx) => {
            const Icon = getSectionIcon(section.heading);
            return (
              <motion.section
                key={idx}
                custom={idx + 1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className="space-y-4"
              >
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {section.heading}
                </h2>
                <div className="bg-card rounded-2xl p-5 border border-border">
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{section.content}</p>
                </div>
              </motion.section>
            );
          }) : (
            <EmptySection label="Analysis" />
          )
        )}

        {/* Evidence Panel */}
        {evidence.length > 0 && (
          <motion.section
            custom={10}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Supporting Evidence ({evidence.length} sources)
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {evidence.map((ev, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedEvidence(ev)}
                  className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-foreground text-sm truncate">{ev.doc_title}</p>
                      <p className="text-sm text-muted-foreground italic line-clamp-2">"{ev.quote}"</p>
                      <div className="flex items-center gap-1 pt-1">
                        <ExternalLink className="w-3 h-3 text-primary" strokeWidth={2} />
                        <span className="text-xs text-primary font-medium">View source</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Suggested follow-up prompts */}
        {suggestedPrompts.length > 0 && (
          <motion.section
            custom={11}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4 pb-10"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              Follow-up questions
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sp.prompt)}
                  disabled={isRunning}
                  className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground font-medium hover:border-primary/30 hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Evidence detail modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedEvidence(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border max-w-lg w-full p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{selectedEvidence.doc_title}</h3>
              <button onClick={() => setSelectedEvidence(null)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <p className="text-sm text-foreground italic leading-relaxed">"{selectedEvidence.quote}"</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Chunk: {selectedEvidence.chunk_id}</span>
              <span>Characters: {selectedEvidence.start_char}–{selectedEvidence.end_char}</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
