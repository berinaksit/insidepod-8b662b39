import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  TrendingDown,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Upload,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/contexts/ProjectsContext';
import { useDocuments } from '@/contexts/DocumentsContext';
import { generateAskResponse } from '@/utils/askPipeline';
import { AskResponse, AskEvidenceCard, AskActionCard, ImpactLevel } from '@/types/ask';
import { EvidenceDetailPanel } from '@/components/EvidenceDetailPanel';
import { AskActionDetailPanel } from '@/components/AskActionDetailPanel';
import AllAskActionsModal from '@/components/AllAskActionsModal';

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-[hsl(145,60%,45%)]/10 text-[hsl(145,60%,35%)]',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-muted text-muted-foreground',
};

export default function AskResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProjectId, activeProject } = useProjects();
  const { documents, agents, generatedInsights, openUploadModal } = useDocuments();
  
  const { query } = (location.state as { query?: string }) || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<AskEvidenceCard | null>(null);
  const [selectedAction, setSelectedAction] = useState<AskActionCard | null>(null);
  const [showAllActions, setShowAllActions] = useState(false);

  useEffect(() => {
    // Redirect if no project selected
    if (!activeProjectId) {
      navigate('/');
      return;
    }

    // Simulate loading and generate response
    if (query) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const result = generateAskResponse({
          query,
          projectId: activeProjectId,
          documents,
          agents,
          insights: generatedInsights,
        });
        setResponse(result);
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [query, activeProjectId, documents, agents, generatedInsights, navigate]);

  // Get source documents for an evidence/action card
  const getSourceDocs = (docIds: string[]) => {
    return documents.filter(d => docIds.includes(d.id));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-48" />
          </div>

          <Skeleton className="h-32 w-full rounded-2xl" />

          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No query provided
  if (!query) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">No question asked</h1>
          <p className="text-muted-foreground">Go back and ask a question in the search bar.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // Empty state - no documents
  if (response?.isEmpty) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span>Back</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
              {response.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Query: "{response.originalQuery}"
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-foreground text-background rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">
              Summary
            </h2>
            <p className="text-lg md:text-xl text-background leading-relaxed">
              {response.summary}
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Missing sources
            </h2>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <p className="text-muted-foreground mb-4">
                To answer this question, consider uploading:
              </p>
              <ul className="space-y-2 mb-6">
                {response.missingSourceTypes?.map((type, i) => (
                  <li key={i} className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    {type}
                  </li>
                ))}
              </ul>
              <Button onClick={() => openUploadModal('ask-empty-state')} className="gap-2">
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Upload documents
              </Button>
            </div>
          </motion.section>
        </main>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground capitalize">
              {response.intentType.replace('-', ' ')}
            </span>
            {activeProject && (
              <span className="text-sm text-muted-foreground font-medium">
                {activeProject.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {response.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                {response.metadata.sourceCount} sources analyzed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  response.metadata.confidence === 'high'
                    ? 'bg-[hsl(145,60%,45%)]'
                    : response.metadata.confidence === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-muted-foreground'
                }`}
              />
              <span className="text-sm font-medium capitalize">
                {response.metadata.confidence} confidence
              </span>
            </span>
          </div>
          {response.originalQuery !== response.title && (
            <p className="text-xs text-muted-foreground mt-2">
              Query: "{response.originalQuery}"
            </p>
          )}
        </motion.div>

        {/* Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-foreground text-background rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">
            Summary
          </h2>
          <p className="text-lg md:text-xl text-background leading-relaxed">
            {response.summary}
          </p>
          {response.metadata.assumptions && (
            <p className="text-sm text-background/60 mt-4 italic">
              Assumptions: {response.metadata.assumptions}
            </p>
          )}
          {response.metadata.conflictingSignals && (
            <p className="text-sm text-background/60 mt-2 italic">
              Note: {response.metadata.conflictingSignals}
            </p>
          )}
        </motion.section>

        {/* Completion Trend */}
        {response.trend?.showTrend && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {response.trend.label}
              </h2>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={response.trend.data} barCategoryGap="20%">
                    <XAxis
                      dataKey="week"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--foreground))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">
                  {response.trend.label}
                </span>
                <span className="text-sm font-semibold text-destructive">
                  {response.trend.change} overall
                </span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Evidence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Evidence
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {response.evidenceCards.map((evidence, i) => (
              <motion.button
                key={evidence.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                onClick={() => setSelectedEvidence(evidence)}
                className="bg-card hover:bg-muted/50 rounded-2xl p-5 border border-border text-left transition-colors group"
              >
                <div className="flex gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      evidence.type === 'quantitative'
                        ? 'bg-primary/10'
                        : 'bg-secondary/10'
                    }`}
                  >
                    {evidence.type === 'quantitative' ? (
                      <TrendingDown
                        className="w-4 h-4 text-primary"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <FileText
                        className="w-4 h-4 text-secondary"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{evidence.label}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {evidence.explanation}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3 h-3" strokeWidth={1.5} />
                        {evidence.sourceCount} source{evidence.sourceCount !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Suggested Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4 pb-10"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Suggested actions
            </h2>
            {response.actionCards.length > 2 && (
              <button
                onClick={() => setShowAllActions(true)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                View all
              </button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {response.actionCards.slice(0, 4).map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                onClick={() => setSelectedAction(action)}
                className="bg-card hover:bg-muted/50 rounded-2xl p-5 border border-border text-left transition-colors group"
              >
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {i === 0 ? (
                      <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{action.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {action.rationale}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      {action.expectedImpact && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            impactColors[action.expectedImpact]
                          }`}
                        >
                          {action.expectedImpact} impact
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <FileText className="w-3 h-3" strokeWidth={1.5} />
                        {action.sourceCount} source{action.sourceCount !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform ml-auto" />
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Evidence Detail Panel */}
      {selectedEvidence && (
        <EvidenceDetailPanel
          evidence={selectedEvidence}
          sourceDocuments={getSourceDocs(selectedEvidence.sourceDocIds)}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

      {/* Action Detail Panel */}
      {selectedAction && (
        <AskActionDetailPanel
          action={selectedAction}
          sourceDocuments={getSourceDocs(selectedAction.sourceDocIds)}
          onClose={() => setSelectedAction(null)}
        />
      )}

      {/* All Actions Modal */}
      <AllAskActionsModal
        isOpen={showAllActions}
        onClose={() => setShowAllActions(false)}
        actions={response.actionCards}
        queryTitle={response.title}
      />
    </div>
  );
}
