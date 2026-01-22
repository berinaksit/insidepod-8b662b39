import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Bot, Database, ExternalLink, MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionDetailPanelProps {
  onClose: () => void;
  task: {
    title: string;
  };
}

export function ActionDetailPanel({ onClose, task }: ActionDetailPanelProps) {
  // Mock data for the suggested task
  const taskData = {
    reason: "Step-two activation dropped 18% compared to last week. This pattern correlates with recent changes to the onboarding flow and may indicate friction in the workspace configuration step.",
    relatedInsights: [
      { id: '1', title: 'Onboarding completion rate declining', type: 'Insight' },
      { id: '2', title: 'Workspace setup friction detected', type: 'Signal' }
    ],
    linkedAgent: 'Adoption Tracker',
    linkedSources: [
      { name: 'Amplitude Analytics', count: 847 },
      { name: 'User Interviews Q1', count: 12 },
      { name: 'Support Tickets', count: 34 }
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="min-h-full"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
        </button>
        <span className="px-2.5 py-1 bg-secondary/20 text-secondary rounded-md text-xs font-medium">
          Suggested Task
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        {task.title}
      </h1>

      {/* Why this was suggested */}
      <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Why this was suggested</h3>
        <p className="text-foreground">{taskData.reason}</p>
      </div>

      {/* Related Insights */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Related insights</h3>
        <div className="space-y-2">
          {taskData.relatedInsights.map((insight) => (
            <div
              key={insight.id}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  insight.type === 'Signal'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {insight.type}
                </span>
                <span className="text-foreground font-medium">{insight.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Linked Agent */}
      <div className="bg-muted/50 rounded-xl p-4 mb-8 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
          <Bot className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Linked agent</p>
          <p className="font-medium text-foreground">{taskData.linkedAgent}</p>
        </div>
      </div>

      {/* Linked Sources */}
      <div className="mb-10">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Linked data sources</h3>
        <div className="space-y-2">
          {taskData.linkedSources.map((source) => (
            <div
              key={source.name}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-foreground font-medium">{source.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{source.count} items</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-xl">
          <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.8} />
          Open relevant sources
        </Button>
        <Button variant="outline" className="rounded-xl">
          <MessageSquare className="w-4 h-4 mr-2" strokeWidth={1.8} />
          Ask agent about this
        </Button>
        <Button variant="outline" className="rounded-xl text-muted-foreground">
          <X className="w-4 h-4 mr-2" strokeWidth={1.8} />
          Dismiss suggestion
        </Button>
      </div>
    </motion.div>
  );
}
