import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckSquare, Square, TrendingUp, LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface SuggestedAction {
  icon: LucideIcon;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  problem?: string;
  solution?: string;
}

interface AllSuggestedActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions: SuggestedAction[];
  insightTitle: string;
}

const priorityColors = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export default function AllSuggestedActionsModal({
  isOpen,
  onClose,
  actions,
  insightTitle,
}: AllSuggestedActionsModalProps) {
  const [selectedActions, setSelectedActions] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const allSelected = selectedActions.size === actions.length;
  const someSelected = selectedActions.size > 0;

  const toggleAction = (index: number) => {
    const newSelected = new Set(selectedActions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedActions(newSelected);
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedActions(new Set());
    } else {
      setSelectedActions(new Set(actions.map((_, i) => i)));
    }
  };

  const generatePRDContent = () => {
    const actionsToExport = someSelected
      ? actions.filter((_, i) => selectedActions.has(i))
      : actions;

    let content = `SUGGESTED ACTIONS PRD
Generated from: ${insightTitle}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Total Actions: ${actionsToExport.length}

${'='.repeat(60)}

`;

    actionsToExport.forEach((action, index) => {
      content += `
ACTION ${index + 1}: ${action.title.toUpperCase()}
${'-'.repeat(50)}

PROBLEM:
${action.problem || action.detail}

PROPOSED SOLUTION:
${action.solution || action.title}

RATIONALE:
${action.detail}

EXPECTED IMPACT:
${action.impact}

PRIORITY:
${action.priority.toUpperCase()}

`;
    });

    content += `
${'='.repeat(60)}
END OF PRD
`;

    return content;
  };

  const downloadPRD = () => {
    const content = generatePRDContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suggested-actions-prd-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All suggested actions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {someSelected ? `${selectedActions.size} of ${actions.length} selected` : `${actions.length} actions available`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Select All Header */}
        <div className="px-6 py-3 border-b border-border bg-muted/30">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-primary" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
          </button>
        </div>

        {/* Actions List */}
        <div className="flex-1 overflow-y-auto">
          {actions.map((action, index) => {
            const isSelected = selectedActions.has(index);
            return (
              <div
                key={index}
                className={`border-b border-border last:border-b-0 transition-colors ${
                  isSelected ? 'bg-primary/5' : ''
                }`}
              >
                <div className="px-6 py-4 flex items-start gap-4">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAction(index)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityColors[action.priority]}`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.detail}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>Expected impact: {action.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {someSelected 
                ? `Download PRD with ${selectedActions.size} selected action${selectedActions.size > 1 ? 's' : ''}`
                : 'Download PRD with all actions'
              }
            </p>
            <Button onClick={downloadPRD} className="gap-2">
              <Download className="w-4 h-4" />
              Download as PRD
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}