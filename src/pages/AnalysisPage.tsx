import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Loader2,
  AlertCircle,
  Upload,
  Lightbulb,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRunAI, AIResult } from '@/hooks/useRunAI';
import { useProjects } from '@/contexts/ProjectsContext';
import { useDocuments } from '@/contexts/DocumentsContext';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, aiResult: passedResult } = location.state || { query: '', aiResult: null };
  const { activeProjectId } = useProjects();
  const { hasDocuments, openUploadModal } = useDocuments();
  const { runAI, isLoading } = useRunAI();
  const [result, setResult] = useState<AIResult | null>(passedResult);
  const [followUpQuery, setFollowUpQuery] = useState('');

  // If no result was passed, run the query
  useEffect(() => {
    if (!result && query && hasDocuments) {
      runAI({
        projectId: activeProjectId,
        query,
        mode: 'grounded',
      }).then(r => setResult(r));
    }
  }, []);

  const handleFollowUp = async () => {
    if (!followUpQuery.trim()) return;
    const r = await runAI({
      projectId: activeProjectId,
      query: followUpQuery.trim(),
      mode: 'grounded',
    });
    if (r) {
      setResult(r);
      setFollowUpQuery('');
    }
  };

  // No documents state
  if (!hasDocuments) {
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
        <main className="max-w-4xl mx-auto px-6 py-20 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-foreground mb-3">Upload documents to start</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Analysis requires uploaded documents. Add research, interviews, analytics, or support data to get AI-powered insights.
          </p>
          <Button onClick={() => { navigate('/app'); openUploadModal('analysis'); }}>
            Upload Documents
          </Button>
        </main>
      </div>
    );
  }

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
        {/* Query */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {query || 'Analysis Results'}
          </h1>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center gap-3 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Analyzing your documents...</span>
          </div>
        )}

        {/* Insufficient data */}
        {result?.insufficient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-foreground mb-1">{result.message}</p>
                {result.suggestion && <p className="text-sm text-muted-foreground">{result.suggestion}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Real answer */}
        {result && !result.insufficient && (
          <>
            {/* Answer */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-foreground text-background rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">Analysis</h2>
              <p className="text-lg md:text-xl text-background leading-relaxed">
                {result.answer || result.synthesis || ''}
              </p>
            </motion.section>

            {/* Confidence & metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="bg-card rounded-2xl p-5 border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">Confidence</p>
                <p className="text-2xl font-semibold text-foreground">
                  {Math.round((result.confidence || 0) * 100)}%
                </p>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">Sources Used</p>
                <p className="text-2xl font-semibold text-foreground">
                  {result.used_sources?.length || 0}
                </p>
              </div>
              <div className="bg-card rounded-2xl p-5 border border-border">
                <p className="text-sm text-muted-foreground font-medium mb-1">Priority</p>
                <p className="text-2xl font-semibold text-foreground capitalize">
                  {result.priority || 'N/A'}
                </p>
              </div>
            </motion.div>

            {/* Sources used */}
            {result.used_sources && result.used_sources.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                  Sources Used
                </h2>
                <div className="space-y-2">
                  {result.used_sources.map((source, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-foreground font-medium">{source.title}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Next actions */}
            {result.next_actions && result.next_actions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                  Suggested Next Steps
                </h2>
                <div className="space-y-2">
                  {result.next_actions.map((action, i) => (
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

        {/* Follow-up question */}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-border pt-8"
          >
            <p className="text-sm text-muted-foreground mb-3">Ask a follow-up question</p>
            <div className="flex gap-3">
              <input
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                placeholder="Ask another question about your documents..."
                className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button onClick={handleFollowUp} disabled={!followUpQuery.trim()}>
                Ask
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
