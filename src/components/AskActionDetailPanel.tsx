import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ExternalLink, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoredDocument } from '@/contexts/DocumentsContext';
import { AskActionCard, ImpactLevel } from '@/types/ask';
import { getDocumentIcon, getSourceTypeLabel } from '@/utils/documentSynthesis';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface AskActionDetailPanelProps {
  action: AskActionCard;
  sourceDocuments: StoredDocument[];
  onClose: () => void;
}

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-[hsl(145,60%,45%)]/10 text-[hsl(145,60%,35%)] border-[hsl(145,60%,45%)]/20',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  low: 'bg-muted text-muted-foreground border-border',
};

export function AskActionDetailPanel({
  action,
  sourceDocuments,
  onClose,
}: AskActionDetailPanelProps) {
  const downloadAsPRD = async () => {
    const children: Paragraph[] = [];

    // Title
    children.push(
      new Paragraph({
        text: action.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 200 },
      })
    );

    // Date
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
        spacing: { after: 400 },
      })
    );

    // Problem Section
    children.push(
      new Paragraph({
        text: 'Problem',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        text: action.problem || action.rationale,
        spacing: { after: 200 },
      })
    );

    // Evidence Section
    children.push(
      new Paragraph({
        text: 'Evidence',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        text: action.evidence || `Based on ${action.sourceCount} sources.`,
        spacing: { after: 200 },
      })
    );

    // Recommendation Section
    children.push(
      new Paragraph({
        text: 'Recommendation',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );
    children.push(
      new Paragraph({
        text: action.recommendation || action.title,
        spacing: { after: 200 },
      })
    );

    // Scope Section
    if (action.scope) {
      children.push(
        new Paragraph({
          text: 'Scope',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.scope,
          spacing: { after: 200 },
        })
      );
    }

    // Success Metrics Section
    if (action.successMetrics) {
      children.push(
        new Paragraph({
          text: 'Success Metrics',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.successMetrics,
          spacing: { after: 200 },
        })
      );
    }

    // Risks Section
    if (action.risks) {
      children.push(
        new Paragraph({
          text: 'Risks',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: action.risks,
          spacing: { after: 200 },
        })
      );
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Arial' },
          },
        },
      },
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `prd-${action.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.docx`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="h-full w-full max-w-lg bg-card border-l border-border shadow-xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                Suggested Action
              </span>
              {action.expectedImpact && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                    impactColors[action.expectedImpact]
                  }`}
                >
                  {action.expectedImpact} impact
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Action Title */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {action.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {action.rationale}
              </p>
            </div>

            {/* Problem */}
            {action.problem && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Problem
                </h3>
                <p className="text-foreground">{action.problem}</p>
              </div>
            )}

            {/* Evidence */}
            {action.evidence && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Evidence
                </h3>
                <p className="text-foreground">{action.evidence}</p>
              </div>
            )}

            {/* Recommendation */}
            {action.recommendation && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Recommendation
                </h3>
                <p className="text-foreground">{action.recommendation}</p>
              </div>
            )}

            {/* Success Metrics */}
            {action.successMetrics && (
              <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success metrics</p>
                  <p className="font-medium text-foreground">{action.successMetrics}</p>
                </div>
              </div>
            )}

            {/* Risks */}
            {action.risks && (
              <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risks to consider</p>
                  <p className="font-medium text-foreground">{action.risks}</p>
                </div>
              </div>
            )}

            {/* Source Documents */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Supporting sources ({sourceDocuments.length})
              </h3>
              {sourceDocuments.length > 0 ? (
                <div className="space-y-2">
                  {sourceDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-card rounded-xl p-4 border border-border flex items-center justify-between group hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base flex-shrink-0">
                          {getDocumentIcon(doc)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {doc.aiTitle || doc.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getSourceTypeLabel(doc)}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    Source documents are not available
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <Button onClick={downloadAsPRD} className="gap-2">
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Download as PRD
              </Button>
              <Button variant="outline" className="rounded-xl">
                <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1.5} />
                View sources
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
