import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckSquare, Square, TrendingUp, LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

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

  const downloadPRD = async () => {
    const actionsToExport = someSelected
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
          new TextRun(insightTitle),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Date: ', bold: true }),
          new TextRun(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
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

      // Priority
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Priority: ', bold: true }),
            new TextRun({ text: action.priority.toUpperCase(), color: action.priority === 'high' ? 'DC2626' : action.priority === 'medium' ? 'D97706' : '6B7280' }),
          ],
          spacing: { after: 200 },
        })
      );

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
          text: action.problem || action.detail,
          spacing: { after: 200 },
        })
      );

      // Proposed Solution
      children.push(
        new Paragraph({
          text: 'Proposed Solution:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.solution || action.title,
          spacing: { after: 200 },
        })
      );

      // Rationale
      children.push(
        new Paragraph({
          text: 'Rationale:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.detail,
          spacing: { after: 200 },
        })
      );

      // Expected Impact
      children.push(
        new Paragraph({
          text: 'Expected Impact:',
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.impact,
          spacing: { after: 300 },
        })
      );

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
      sections: [
        {
          properties: {},
          children,
        },
      ],
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