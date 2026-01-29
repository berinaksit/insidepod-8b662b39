// Utilities for synthesizing content from uploaded documents

import { StoredDocument } from '@/contexts/DocumentsContext';

// Truncate text to a maximum word count
export function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '…';
}

// Determine source type label based on document name/type (AI-generated style)
// Returns plural form for badge display (e.g., "User interviews")
export function getSourceTypeLabel(doc: StoredDocument, plural: boolean = false): string {
  const name = doc.name.toLowerCase();
  const aiTitle = doc.aiTitle?.toLowerCase() || '';
  
  // Check for common document patterns
  if (name.includes('interview') || aiTitle.includes('interview')) {
    return plural ? 'User interviews' : 'User interview';
  }
  if (name.includes('survey') || aiTitle.includes('survey')) {
    return plural ? 'Survey responses' : 'Survey response';
  }
  if (name.includes('support') || name.includes('ticket') || aiTitle.includes('support')) {
    return plural ? 'Support tickets' : 'Support ticket';
  }
  if (name.includes('call') || name.includes('transcript') || aiTitle.includes('call')) {
    return plural ? 'Customer calls' : 'Customer call';
  }
  if (name.includes('feedback') || aiTitle.includes('feedback')) {
    return plural ? 'Customer feedback' : 'Customer feedback';
  }
  if (name.includes('review') || aiTitle.includes('review')) {
    return plural ? 'Product reviews' : 'Product review';
  }
  if (name.includes('analytics') || name.includes('metrics') || aiTitle.includes('analytics')) {
    return plural ? 'Analytics reports' : 'Analytics report';
  }
  if (name.includes('research') || aiTitle.includes('research')) {
    return plural ? 'Research documents' : 'Research document';
  }
  if (name.includes('report') || aiTitle.includes('report')) {
    return plural ? 'Business reports' : 'Business report';
  }
  if (name.includes('nps') || aiTitle.includes('nps')) {
    return plural ? 'NPS data' : 'NPS data';
  }
  if (doc.type === 'csv' || doc.type === 'xlsx') {
    return plural ? 'Data exports' : 'Data export';
  }
  if (doc.type === 'pdf') {
    return plural ? 'PDF documents' : 'PDF document';
  }
  
  return plural ? 'Uploaded documents' : 'Uploaded document';
}

// Get document icon based on type
export function getDocumentIcon(doc: StoredDocument): string {
  switch (doc.type) {
    case 'pdf':
      return '📕';
    case 'csv':
    case 'xlsx':
      return '📊';
    case 'docx':
    case 'doc':
      return '📄';
    case 'txt':
      return '📝';
    default:
      return '📄';
  }
}

// Synthesize a primary insight from documents
export function synthesizePrimaryInsight(documents: StoredDocument[]): {
  text: string;
  sourceLabel: string;
  sourceCount: number;
  additionalSourceCount: number;
} | null {
  if (documents.length === 0) return null;
  
  // Use the most recent document as primary source
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  
  const primaryDoc = sortedDocs[0];
  const hasMultipleSources = documents.length > 1;
  const sourceLabel = getSourceTypeLabel(primaryDoc, hasMultipleSources);
  
  // Generate insight based on document context
  const docName = primaryDoc.aiTitle || primaryDoc.name;
  const insights = generateContextualInsights(docName, documents.length);
  
  // Truncate to max 23 words
  const truncatedText = truncateToWords(insights.primary, 23);
  
  return {
    text: truncatedText,
    sourceLabel,
    sourceCount: documents.length,
    additionalSourceCount: documents.length > 1 ? documents.length - 1 : 0,
  };
}

// Synthesize a suggested task from documents
export function synthesizeSuggestedTask(documents: StoredDocument[]): {
  text: string;
  sourceCount: number;
  sourceDocuments: StoredDocument[];
} | null {
  if (documents.length === 0) return null;
  
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  
  const docName = sortedDocs[0].aiTitle || sortedDocs[0].name;
  const insights = generateContextualInsights(docName, documents.length);
  
  return {
    text: insights.task,
    sourceCount: documents.length,
    sourceDocuments: sortedDocs.slice(0, 3),
  };
}

// Synthesize a suggested prompt from documents
export function synthesizeSuggestedPrompt(documents: StoredDocument[]): {
  text: string;
  sourceCount: number;
  sourceDocuments: StoredDocument[];
} | null {
  if (documents.length === 0) return null;
  
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  
  const docName = sortedDocs[0].aiTitle || sortedDocs[0].name;
  const insights = generateContextualInsights(docName, documents.length);
  
  return {
    text: insights.prompt,
    sourceCount: documents.length,
    sourceDocuments: sortedDocs.slice(0, 3),
  };
}

// Generate recently uploaded guidance
export function synthesizeRecentGuidance(documents: StoredDocument[]): {
  question: string;
  document: StoredDocument;
} | null {
  if (documents.length === 0) return null;
  
  const sortedDocs = [...documents].sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  
  const recentDoc = sortedDocs[0];
  const docName = recentDoc.aiTitle || recentDoc.name;
  
  // Generate contextual guiding question
  const question = generateGuidingQuestion(docName);
  
  return {
    question,
    document: recentDoc,
  };
}

// Generate contextual insights based on document name patterns
function generateContextualInsights(docName: string, docCount: number): {
  primary: string;
  task: string;
  prompt: string;
} {
  const lowerName = docName.toLowerCase();
  
  // Pattern matching for different document types
  if (lowerName.includes('interview') || lowerName.includes('user')) {
    return {
      primary: "Users express frustration with the current onboarding flow, citing unclear next steps and missing progress indicators as key pain points.",
      task: "Review user onboarding feedback patterns.",
      prompt: "What are the main user pain points?",
    };
  }
  
  if (lowerName.includes('survey') || lowerName.includes('nps')) {
    return {
      primary: "Survey responses indicate a shift in user expectations, with mobile experience and response time emerging as top priorities.",
      task: "Analyze survey sentiment trends.",
      prompt: "What's driving satisfaction scores?",
    };
  }
  
  if (lowerName.includes('analytics') || lowerName.includes('metrics') || lowerName.includes('data')) {
    return {
      primary: "Usage patterns show a decline in feature adoption rates, with users dropping off before completing key activation milestones.",
      task: "Investigate activation funnel drop-offs.",
      prompt: "Where are users getting stuck?",
    };
  }
  
  if (lowerName.includes('sales') || lowerName.includes('crm')) {
    return {
      primary: "Sales conversations reveal common objections around pricing clarity and feature comparisons with competitors.",
      task: "Address top sales objections.",
      prompt: "What objections come up most?",
    };
  }
  
  if (lowerName.includes('support') || lowerName.includes('ticket')) {
    return {
      primary: "Support ticket analysis shows recurring issues with account settings and billing, suggesting UX improvements needed.",
      task: "Prioritize support issue categories.",
      prompt: "What issues need urgent attention?",
    };
  }
  
  if (lowerName.includes('feedback') || lowerName.includes('review')) {
    return {
      primary: "Customer feedback highlights strong appreciation for core features but frustration with recent changes to the interface.",
      task: "Review recent UI change feedback.",
      prompt: "How are users responding to changes?",
    };
  }
  
  if (lowerName.includes('research') || lowerName.includes('study')) {
    return {
      primary: "Research findings suggest an opportunity to differentiate through improved personalization and faster load times.",
      task: "Extract key research recommendations.",
      prompt: "What opportunities were identified?",
    };
  }
  
  if (lowerName.includes('report') || lowerName.includes('trend')) {
    return {
      primary: "Report analysis indicates emerging market trends that could impact product positioning and feature prioritization.",
      task: "Review trend implications for roadmap.",
      prompt: "Which trends affect our product?",
    };
  }
  
  // Default fallback based on document count
  if (docCount === 1) {
    return {
      primary: "Initial analysis of your document reveals key themes and patterns that warrant closer examination for actionable insights.",
      task: "Review key themes from your document.",
      prompt: "What are the main takeaways?",
    };
  }
  
  return {
    primary: `Analysis across ${docCount} sources reveals emerging patterns in user behavior and product engagement that require attention.`,
    task: "Synthesize insights across all sources.",
    prompt: "What patterns emerge from the data?",
  };
}

// Generate a guiding question based on document name
function generateGuidingQuestion(docName: string): string {
  const lowerName = docName.toLowerCase();
  
  if (lowerName.includes('interview')) {
    return "What key themes emerged from this interview?";
  }
  if (lowerName.includes('survey')) {
    return "What do the survey results tell us about user needs?";
  }
  if (lowerName.includes('analytics') || lowerName.includes('metrics')) {
    return "Which metrics should we focus on first?";
  }
  if (lowerName.includes('trend') || lowerName.includes('report')) {
    return "Which emerging patterns matter for our next release?";
  }
  if (lowerName.includes('feedback')) {
    return "What actionable feedback stands out here?";
  }
  if (lowerName.includes('sales') || lowerName.includes('call')) {
    return "What customer concerns need addressing?";
  }
  if (lowerName.includes('support') || lowerName.includes('ticket')) {
    return "Which issues should we prioritize?";
  }
  if (lowerName.includes('research')) {
    return "What research insights can we act on?";
  }
  
  return "What should we focus on from this document?";
}
