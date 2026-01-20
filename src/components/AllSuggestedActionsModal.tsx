import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckSquare, Square, TrendingUp, LucideIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

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

  const downloadPRD = () => {
    const actionsToExport = someSelected
      ? actions.filter((_, i) => selectedActions.has(i))
      : actions;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
    };

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Suggested Actions PRD', margin, yPos);
    yPos += 10;

    // Subtitle
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    pdf.text(`Generated from: ${insightTitle}`, margin, yPos);
    yPos += 5;
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    yPos += 5;
    pdf.text(`Total Actions: ${actionsToExport.length}`, margin, yPos);
    yPos += 10;

    // Divider
    pdf.setDrawColor(200);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    pdf.setTextColor(0);

    actionsToExport.forEach((action, index) => {
      checkPageBreak(60);

      // Action Header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Action ${index + 1}: ${action.title}`, margin, yPos);
      yPos += 6;

      // Priority badge
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const priorityText = `Priority: ${action.priority.toUpperCase()}`;
      pdf.text(priorityText, margin, yPos);
      yPos += 8;

      // Problem
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Problem:', margin, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');
      const problemLines = pdf.splitTextToSize(action.problem || action.detail, contentWidth);
      checkPageBreak(problemLines.length * 5 + 10);
      pdf.text(problemLines, margin, yPos);
      yPos += problemLines.length * 5 + 3;

      // Proposed Solution
      pdf.setFont('helvetica', 'bold');
      pdf.text('Proposed Solution:', margin, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');
      const solutionLines = pdf.splitTextToSize(action.solution || action.title, contentWidth);
      checkPageBreak(solutionLines.length * 5 + 10);
      pdf.text(solutionLines, margin, yPos);
      yPos += solutionLines.length * 5 + 3;

      // Rationale
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rationale:', margin, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');
      const rationaleLines = pdf.splitTextToSize(action.detail, contentWidth);
      checkPageBreak(rationaleLines.length * 5 + 10);
      pdf.text(rationaleLines, margin, yPos);
      yPos += rationaleLines.length * 5 + 3;

      // Expected Impact
      pdf.setFont('helvetica', 'bold');
      pdf.text('Expected Impact:', margin, yPos);
      yPos += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.text(action.impact, margin, yPos);
      yPos += 10;

      // Divider between actions
      if (index < actionsToExport.length - 1) {
        checkPageBreak(15);
        pdf.setDrawColor(220);
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      }
    });

    pdf.save(`suggested-actions-prd-${Date.now()}.pdf`);
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