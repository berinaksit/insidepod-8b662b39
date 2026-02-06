import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Zap,
  Lightbulb,
  FileText,
  Clock,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/hooks/useSupabaseData';
import { useRunAI, AIResult } from '@/hooks/useRunAI';
import { useProjects } from '@/contexts/ProjectsContext';
import { useDocuments } from '@/contexts/DocumentsContext';

export type GoalType = 'KPI' | 'OKR' | 'Success Metric' | 'Custom';

export interface GoalDetail extends Goal {
  status?: 'on-track' | 'at-risk' | 'off-track' | 'unknown';
  healthSummary?: string;
  trend?: 'improving' | 'declining' | 'stable';
  confidence?: 'high' | 'medium' | 'low';
}

interface GoalDetailViewProps {
  goal: GoalDetail;
  onClose: () => void;
}

export function GoalDetailView({ goal, onClose }: GoalDetailViewProps) {
  const { runAI, isLoading } = useRunAI();
  const { activeProjectId } = useProjects();
  const { hasDocuments, documents } = useDocuments();
  const [analysis, setAnalysis] = useState<AIResult | null>(null);
  
  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'OKR': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Success Metric': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Custom': 'bg-muted text-muted-foreground',
  };

  // Fetch AI analysis for this goal based on real documents
  useEffect(() => {
    if (hasDocuments && !analysis && !isLoading) {
      runAI({
        projectId: activeProjectId,
        query: `Analyze the status of this goal: "${goal.title}" (type: ${goal.type}). 
Based on the documents, provide:
1. A health assessment (on-track, at-risk, off-track, or unknown)
2. A summary of what's affecting this goal
3. Suggested next steps
Respond with {"answer": "health summary", "confidence": 0.0-1.0, "used_sources": [...], "next_actions": ["action1", "action2"], "priority": "high|medium|low"}`,
        mode: 'grounded',
      }).then(r => r && setAnalysis(r));
    }
  }, [goal.id, hasDocuments]);

  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="min-h-full">
      <div className="mb-12">
        <Button variant="ghost" size="sm" onClick={onClose} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
          Back to Goals
        </Button>

        <div className="flex flex-wrap items-start gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-xs ${typeColors[goal.type]}`}>{goal.type}</span>
        </div>

        <h1 className="text-2xl font-display text-foreground">{goal.title}</h1>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Analyzing goal health from your documents...</span>
        </div>
      )}

      {/* No documents */}
      {!hasDocuments && (
        <section className="mb-12">
          <div className="bg-card rounded-xl p-6 text-center">
            <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
            <h2 className="font-medium text-foreground mb-2">No data to assess this goal</h2>
            <p className="text-sm text-muted-foreground">Upload documents with relevant data to get AI-powered goal health analysis.</p>
          </div>
        </section>
      )}

      {/* AI Analysis */}
      {analysis && !analysis.insufficient && (
        <>
          <section className="mb-12">
            <div className="bg-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="font-medium text-foreground">Goal Health Summary</h2>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-6">{analysis.answer || analysis.synthesis}</p>
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-muted-foreground">
                    Confidence: <span className="text-foreground">{Math.round((analysis.confidence || 0) * 100)}%</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm text-muted-foreground">
                    Sources: <span className="text-foreground">{analysis.used_sources?.length || 0} documents</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Sources */}
          {analysis.used_sources && analysis.used_sources.length > 0 && (
            <section className="mb-12">
              <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
                <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Connected sources
              </h2>
              <div className="flex flex-wrap gap-3">
                {analysis.used_sources.map((source, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg px-4 py-2.5 text-sm">
                    <span className="text-foreground">{source.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Next steps */}
          {analysis.next_actions && analysis.next_actions.length > 0 && (
            <section className="mb-12">
              <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
                <Sparkles className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                Suggested next steps
              </h2>
              <div className="space-y-3">
                {analysis.next_actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 bg-muted/20 rounded-lg px-5 py-4">
                    <span className="text-muted-foreground text-sm">{index + 1}.</span>
                    <span className="text-foreground text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {analysis?.insufficient && (
        <section className="mb-12">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-foreground mb-1">Not enough data</p>
                <p className="text-sm text-muted-foreground">{analysis.message}</p>
                {analysis.suggestion && <p className="text-sm text-muted-foreground mt-1">{analysis.suggestion}</p>}
              </div>
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
