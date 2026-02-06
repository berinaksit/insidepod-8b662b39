import { motion } from 'framer-motion';
import { ArrowLeft, CircleDot, FileText, MessageSquare, Target, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/contexts/DocumentsContext';
import { useRunAI, AIResult } from '@/hooks/useRunAI';
import { useProjects } from '@/contexts/ProjectsContext';
import { useState, useEffect } from 'react';

interface InsightDetailViewProps {
  onClose: () => void;
  insight: {
    headline: string;
    type: 'Signal' | 'Insight';
    source: string;
    contributorCount: number;
  };
}

export function InsightDetailView({ onClose, insight }: InsightDetailViewProps) {
  const { documents, hasDocuments } = useDocuments();
  const { runAI, isLoading } = useRunAI();
  const { activeProjectId } = useProjects();
  const [detail, setDetail] = useState<AIResult | null>(null);

  useEffect(() => {
    if (hasDocuments && !detail && !isLoading) {
      runAI({
        projectId: activeProjectId,
        query: `Provide a detailed breakdown for this insight: "${insight.headline}". 
Include: 1) What changed, 2) Why it matters, 3) What's likely causing it. 
Respond with {"answer": "detailed analysis", "confidence": 0.0-1.0, "used_sources": [...], "next_actions": [...]}`,
        mode: 'grounded',
      }).then(r => r && setDetail(r));
    }
  }, [insight.headline, hasDocuments]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="min-h-full">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            insight.type === 'Signal' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
          }`}>{insight.type}</span>
        </div>
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-8">{insight.headline}</h1>

      {isLoading && (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Analyzing your documents...</span>
        </div>
      )}

      {detail && !detail.insufficient && (
        <div className="space-y-6 mb-10">
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Detailed Analysis</h3>
            <p className="text-foreground leading-relaxed">{detail.answer || detail.synthesis}</p>
          </div>

          {/* Sources */}
          {detail.used_sources && detail.used_sources.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Sources referenced</h3>
              <div className="flex flex-wrap gap-2">
                {detail.used_sources.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium text-foreground">
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Confidence</p>
              <p className="text-lg font-semibold text-foreground">{Math.round((detail.confidence || 0) * 100)}%</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Sources</p>
              <p className="text-lg font-semibold text-foreground">{detail.used_sources?.length || 0}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Documents analyzed</p>
              <p className="text-lg font-semibold text-foreground">{documents.length}</p>
            </div>
          </div>

          {/* Next actions */}
          {detail.next_actions && detail.next_actions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggested next steps</h3>
              <div className="space-y-2">
                {detail.next_actions.map((action, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg px-5 py-4 flex items-start gap-3">
                    <span className="text-muted-foreground text-sm">{i + 1}.</span>
                    <span className="text-foreground text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {detail?.insufficient && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-foreground mb-1">Not enough evidence</p>
              <p className="text-sm text-muted-foreground">{detail.message}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !detail?.insufficient && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl">
            <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Ask follow-up question
          </Button>
          <Button variant="outline" className="rounded-xl">
            <FileText className="w-4 h-4 mr-2" strokeWidth={1.5} />
            View supporting sources
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Target className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Link to a goal
          </Button>
        </div>
      )}
    </motion.div>
  );
}
