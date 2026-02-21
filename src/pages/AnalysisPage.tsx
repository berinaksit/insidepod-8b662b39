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
  Search,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { GlobalUploadModal } from '@/components/GlobalUploadModal';
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

interface AnswerPayload {
  format: 'diagnosis_page' | 'chat_with_evidence';
  title: string;
  summary: string;
  sections: AnswerSection[];
}

interface GroundedResponse {
  status: 'ok' | 'need_more_context' | 'unrelated';
  answer: AnswerPayload;
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
  const lower = heading.toLowerCase();
  if (lower.includes('diagnosis') || lower.includes('executive')) return Target;
  if (lower.includes('evidence')) return FileText;
  if (lower.includes('hypothes')) return Beaker;
  if (lower.includes('segment')) return Layers;
  if (lower.includes('opportunit') || lower.includes('sizing')) return TrendingDown;
  if (lower.includes('decision') || lower.includes('option')) return Target;
  if (lower.includes('action') || lower.includes('plan')) return CheckCircle2;
  if (lower.includes('confidence') || lower.includes('gap')) return AlertTriangle;
  if (lower.includes('summary') || lower.includes('overview')) return BarChart3;
  return Lightbulb;
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProjectId } = useProjects();
  const { query, analysisData } = (location.state as { query: string; analysisData?: GroundedResponse }) || { query: '' };

  const data: GroundedResponse | null = analysisData || null;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitData, setResubmitData] = useState<GroundedResponse | null>(null);

  // Use resubmit data if available, otherwise use initial data
  const activeData = resubmitData || data;

  const handleSuggestionClick = async (prompt: string) => {
    setIsResubmitting(true);
    console.log("Calling ask function");
    try {
      const { data: newData, error } = await supabase.functions.invoke("ask", {
        body: { question: prompt, project_id: activeProjectId },
      });
      console.log("Response:", newData);
      if (error || newData?.error) {
        console.error("Error:", error || newData?.error);
      } else {
        setResubmitData(newData);
      }
    } catch (err) {
      console.error("Error calling ask function:", err);
    } finally {
      setIsResubmitting(false);
    }
  };

  // Section animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  // ── Loading state while resubmitting ──
  if (isResubmitting) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <p className="mt-4 text-muted-foreground font-medium">Analyzing your question…</p>
        </main>
      </div>
    );
  }

  // ── "Need more context" or "Unrelated" state ──
  if (activeData && (activeData.status === 'need_more_context' || activeData.status === 'unrelated')) {
    const isUnrelated = activeData.status === 'unrelated';
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                {isUnrelated ? <AlertCircle className="w-5 h-5 text-primary" strokeWidth={1.5} /> : <HelpCircle className="w-5 h-5 text-primary" strokeWidth={1.5} />}
              </div>
              <h1 className="text-2xl font-display font-semibold text-foreground">
                {isUnrelated ? "That question doesn't match the data in this project." : "I need a bit more context to answer correctly."}
              </h1>
            </div>
            {activeData.answer?.summary && (
              <p className="text-muted-foreground">{activeData.answer.summary}</p>
            )}
          </motion.div>

          {/* Missing context details */}
          {activeData.missing_context && activeData.missing_context.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 border border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">What's needed</h3>
              {activeData.missing_context.map((mc, i) => (
                <div key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{mc.need}</p>
                    <p className="text-sm text-muted-foreground">{mc.why}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Suggestion chips */}
          {activeData.suggested_prompts && activeData.suggested_prompts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Try one of these instead</h3>
              <div className="flex flex-wrap gap-2">
                {activeData.suggested_prompts.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(sp.prompt)}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors font-medium"
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Upload CTA */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-3 px-6 py-4 bg-primary/5 border border-primary/10 rounded-2xl hover:bg-primary/10 transition-colors w-full"
            >
              <Upload className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Upload documents</p>
                <p className="text-xs text-muted-foreground">Add research, analytics, or support data to enable grounded analysis</p>
              </div>
            </button>
          </motion.div>
        </main>
        <GlobalUploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />
      </div>
    );
  }

  // ── "OK" state — render analysis with evidence ──
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
            {activeData?.answer?.title || query || 'Analysis Results'}
          </h1>
          {activeData?.answer?.summary && (
            <p className="text-muted-foreground leading-relaxed">{activeData.answer.summary}</p>
          )}
          {activeData?.evidence && activeData.evidence.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Grounded in {activeData.evidence.length} evidence citation{activeData.evidence.length !== 1 ? 's' : ''} from {new Set(activeData.evidence.map(e => e.doc_title)).size} document{new Set(activeData.evidence.map(e => e.doc_title)).size !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* Render sections dynamically */}
        {activeData?.answer?.sections && activeData.answer.sections.length > 0 ? (
          activeData.answer.sections.map((section, i) => {
            const Icon = getSectionIcon(section.heading);
            const isFirst = i === 0 && activeData.answer.format === 'diagnosis_page';
            return (
              <motion.section
                key={i}
                custom={i + 1}
                initial="hidden"
                animate="visible"
                variants={sectionVariants}
                className={isFirst ? "bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8" : "space-y-4"}
              >
                <h2 className={`text-sm font-medium uppercase tracking-wider flex items-center gap-2 ${isFirst ? 'text-primary mb-4' : 'text-muted-foreground'}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {section.heading}
                </h2>
                {section.content ? (
                  <div className="bg-card rounded-2xl p-5 border border-border">
                    <p className="text-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                  </div>
                ) : (
                  <EmptySection label={section.heading} />
                )}
              </motion.section>
            );
          })
        ) : (
          <EmptySection label="Analysis sections" />
        )}

        {/* Evidence Panel */}
        {activeData?.evidence && activeData.evidence.length > 0 && (
          <motion.section
            custom={(activeData?.answer?.sections?.length || 0) + 2}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Evidence Sources
            </h2>
            <div className="space-y-3">
              {activeData.evidence.map((ev, i) => {
                const EvidIcon = evidenceIcons[i % evidenceIcons.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="bg-card rounded-2xl p-5 border border-border"
                  >
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <EvidIcon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs font-medium">{ev.doc_title}</Badge>
                          <span className="text-xs text-muted-foreground">chars {ev.start_char}–{ev.end_char}</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">"{ev.quote}"</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Suggested follow-up prompts */}
        {activeData?.suggested_prompts && activeData.suggested_prompts.length > 0 && (
          <motion.section
            custom={(activeData?.answer?.sections?.length || 0) + 3}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="space-y-4 pb-10"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" strokeWidth={1.5} />
              Follow-up Questions
            </h2>
            <div className="flex flex-wrap gap-2">
              {activeData.suggested_prompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(sp.prompt)}
                  className="px-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground hover:bg-muted transition-colors font-medium"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </main>
      <GlobalUploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />
    </div>
  );
}
