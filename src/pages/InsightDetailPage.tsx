import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  AlertCircle,
  Upload,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRunAI, AIResult } from '@/hooks/useRunAI';
import { useProjects } from '@/contexts/ProjectsContext';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useInsights } from '@/hooks/useSupabaseData';

export default function InsightDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { activeProjectId } = useProjects();
  const { hasDocuments, openUploadModal } = useDocuments();
  const { data: insights = [] } = useInsights();
  const { runAI, isLoading } = useRunAI();
  const [detail, setDetail] = useState<AIResult | null>(null);

  const insight = insights.find(i => i.id === id);

  // Generate detailed analysis from documents
  useEffect(() => {
    if (insight && hasDocuments && !detail && !isLoading) {
      runAI({
        projectId: activeProjectId,
        query: `Provide a detailed analysis for the following insight: "${insight.title}". Include what changed, why it matters, what's likely causing it, and recommended actions.`,
        mode: 'grounded',
      }).then(r => r && setDetail(r));
    }
  }, [insight?.id, hasDocuments]);

  if (!hasDocuments) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-20 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-foreground mb-3">No insights yet</h1>
          <p className="text-muted-foreground mb-8">Upload documents to generate insights.</p>
          <Button onClick={() => { navigate('/app'); openUploadModal('insight-detail'); }}>Upload Documents</Button>
        </main>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-foreground mb-3">Insight not found</h1>
          <p className="text-muted-foreground mb-8">This insight may have been deleted or doesn't exist.</p>
          <Button onClick={() => navigate('/app')}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground">
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground font-medium">{insight.source.name}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {insight.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-3">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">{insight.evidenceCount} sources analyzed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${insight.confidence >= 0.8 ? 'bg-[hsl(145,60%,45%)]' : 'bg-[hsl(45,80%,50%)]'}`} />
              <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}% confidence</span>
            </span>
          </div>
        </motion.div>

        {/* Synthesis */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-foreground text-background rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">Summary</h2>
          <p className="text-lg md:text-xl text-background leading-relaxed">{insight.synthesis}</p>
        </motion.section>

        {/* Loading detail */}
        {isLoading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Generating detailed analysis...</span>
          </div>
        )}

        {/* AI-generated detail */}
        {detail && !detail.insufficient && (
          <>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Detailed Analysis</h3>
              <p className="text-foreground leading-relaxed">{detail.answer || detail.synthesis}</p>
            </motion.section>

            {detail.used_sources && detail.used_sources.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                  Sources Referenced
                </h3>
                <div className="space-y-2">
                  {detail.used_sources.map((s, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-foreground font-medium">{s.title}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {detail.next_actions && detail.next_actions.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                  Recommended Actions
                </h3>
                <div className="space-y-2">
                  {detail.next_actions.map((action, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" strokeWidth={1.5} />
                      <span className="text-foreground">{action}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}

        {detail?.insufficient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-foreground mb-1">Low evidence</p>
                <p className="text-sm text-muted-foreground">{detail.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
