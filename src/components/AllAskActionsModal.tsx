import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckSquare, Square, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { AskActionCard, ImpactLevel } from '@/types/ask';

interface AllAskActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actions: AskActionCard[];
  queryTitle: string;
}

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-[hsl(145,60%,45%)]/10 text-[hsl(145,60%,35%)] border-[hsl(145,60%,45%)]/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export default function AllAskActionsModal({
  isOpen,
  onClose,
  actions,
  queryTitle,
}: AllAskActionsModalProps) {
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

  const downloadPRD = async (selectedOnly = false) => {
    const actionsToExport = selectedOnly && someSelected
      ? actions.filter((_, i) => selectedActions.has(i))
      : actions;

    const children: Paragraph[] = [];

    // Title
    children.push(
      new Paragraph({
        text: 'Suggested Actions PRD',
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Generated from: ', bold: true }),
          new TextRun(queryTitle),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Date: ', bold: true }),
          new TextRun(
            new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          ),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Total Actions: ', bold: true }),
          new TextRun(String(actionsToExport.length)),
        ],
        spacing: { after: 400 },
      })
    );

    // Divider
    children.push(
      new Paragraph({
        border: {
          bottom: { color: 'CCCCCC', space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
        spacing: { after: 400 },
      })
    );

    // Actions
    actionsToExport.forEach((action, index) => {
      // Action Header
      children.push(
        new Paragraph({
          text: `Action ${index + 1}: ${action.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );

      // Expected Impact
      if (action.expectedImpact) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Expected Impact: ', bold: true }),
              new TextRun({
                text: action.expectedImpact.toUpperCase(),
                color:
                  action.expectedImpact === 'high'
                    ? '16A34A'
                    : action.expectedImpact === 'medium'
                    ? 'D97706'
                    : '6B7280',
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }

      // Problem
      children.push(
        new Paragraph({
          text: 'Problem:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.problem || action.rationale,
          spacing: { after: 200 },
        })
      );

      // Evidence
      children.push(
        new Paragraph({
          text: 'Evidence:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.evidence || `Based on ${action.sourceCount} sources.`,
          spacing: { after: 200 },
        })
      );

      // Recommendation
      children.push(
        new Paragraph({
          text: 'Recommendation:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.recommendation || action.title,
          spacing: { after: 200 },
        })
      );

      // Scope
      if (action.scope) {
        children.push(
          new Paragraph({
            text: 'Scope:',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
          })
        );
        children.push(
          new Paragraph({
            text: action.scope,
            spacing: { after: 200 },
          })
        );
      }

      // Success Metrics
      if (action.successMetrics) {
        children.push(
          new Paragraph({
            text: 'Success Metrics:',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
          })
        );
        children.push(
          new Paragraph({
            text: action.successMetrics,
            spacing: { after: 200 },
          })
        );
      }

      // Risks
      if (action.risks) {
        children.push(
          new Paragraph({
            text: 'Risks:',
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 },
          })
        );
        children.push(
          new Paragraph({
            text: action.risks,
            spacing: { after: 300 },
          })
        );
      }

      // Divider between actions
      if (index < actionsToExport.length - 1) {
        children.push(
          new Paragraph({
            border: {
              bottom: { color: 'EEEEEE', space: 1, style: BorderStyle.SINGLE, size: 4 },
            },
            spacing: { after: 300 },
          })
        );
      }
    });

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Arial' } },
          heading1: { run: { font: 'Arial' } },
          heading2: { run: { font: 'Arial' } },
          heading3: { run: { font: 'Arial' } },
          title: { run: { font: 'Arial' } },
        },
      },
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `suggested-actions-prd-${Date.now()}.docx`);
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
              {someSelected
                ? `${selectedActions.size} of ${actions.length} selected`
                : `${actions.length} actions available`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        {/* Select All Header */}
        <div className="px-6 py-3 border-b border-border bg-muted/30">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />
            ) : (
              <Square className="w-5 h-5" strokeWidth={1.5} />
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
                key={action.id}
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
                      {action.expectedImpact && (
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                            impactColors[action.expectedImpact]
                          }`}
                        >
                          {action.expectedImpact}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.rationale}</p>
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                      <span>{action.sourceCount} supporting sources</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {someSelected
                ? `Download PRD with ${selectedActions.size} selected action${
                    selectedActions.size > 1 ? 's' : ''
                  }`
                : 'Download PRD with all actions'}
            </p>
            <div className="flex gap-3">
              {someSelected && (
                <Button onClick={() => downloadPRD(true)} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Download selected
                </Button>
              )}
              <Button onClick={() => downloadPRD(false)} className="gap-2">
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Download all as PRD
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
