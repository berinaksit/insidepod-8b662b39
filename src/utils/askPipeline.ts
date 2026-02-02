// Ask Pipeline - Query classification, retrieval, and response generation

import { StoredDocument } from '@/contexts/DocumentsContext';
import { Agent, Insight } from '@/types';
import {
  AskResponse,
  AskIntentType,
  AskEvidenceCard,
  AskActionCard,
  classifyIntent,
  generateCleanTitle,
  ConfidenceLevel,
  ImpactLevel,
} from '@/types/ask';

interface PipelineInput {
  query: string;
  projectId: string;
  documents: StoredDocument[];
  agents: Agent[];
  insights: Insight[];
}

// Keyword-based relevance scoring
function scoreDocumentRelevance(doc: StoredDocument, query: string): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const docText = `${doc.name} ${doc.aiTitle || ''} ${doc.contentText || ''}`.toLowerCase();
  
  let score = 0;
  for (const term of queryTerms) {
    if (docText.includes(term)) {
      score += 1;
    }
  }
  return score;
}

// Get relevant documents for a query
function getRelevantDocuments(documents: StoredDocument[], query: string, maxDocs = 4): StoredDocument[] {
  if (documents.length === 0) return [];
  
  const scored = documents.map(doc => ({
    doc,
    score: scoreDocumentRelevance(doc, query),
  }));
  
  // Sort by relevance, then by date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.doc.uploadedAt).getTime() - new Date(a.doc.uploadedAt).getTime();
  });
  
  // Return top documents, ensuring at least some if available
  return scored.slice(0, Math.max(maxDocs, Math.min(documents.length, 2))).map(s => s.doc);
}

// Generate summary based on intent and documents
function generateSummary(intent: AskIntentType, documents: StoredDocument[], query: string): string {
  const docCount = documents.length;
  
  if (docCount === 0) {
    return 'Not enough evidence yet. Upload relevant documents to get insights on this question.';
  }
  
  const docNames = documents.slice(0, 2).map(d => d.aiTitle || d.name).join(' and ');
  
  switch (intent) {
    case 'diagnosis':
      return `Analysis of ${docCount} source${docCount !== 1 ? 's' : ''} reveals key friction points in the user journey. The primary driver appears to be related to complexity in early-stage interactions, with evidence from ${docNames} supporting this conclusion.`;
    case 'synthesis':
      return `Across ${docCount} document${docCount !== 1 ? 's' : ''}, three key themes emerge: user experience friction, feature discovery gaps, and communication timing. These patterns are consistent across ${docNames}.`;
    case 'risk':
      return `Risk assessment based on ${docCount} source${docCount !== 1 ? 's' : ''} indicates moderate concern levels. Early warning signals detected in ${docNames} suggest proactive intervention may be beneficial.`;
    case 'planning':
      return `Based on ${docCount} source${docCount !== 1 ? 's' : ''}, the highest-impact opportunities center on simplifying user flows and improving first-time experience. ${docNames} provide supporting evidence.`;
    case 'goal-linked':
      return `Goal status review across ${docCount} source${docCount !== 1 ? 's' : ''} shows mixed progress. Key metrics from ${docNames} indicate some areas need attention while others are on track.`;
    default:
      return `Analysis of ${docCount} source${docCount !== 1 ? 's' : ''} provides insights on your question. Key findings from ${docNames} inform the recommendations below.`;
  }
}

// Generate evidence cards based on intent
function generateEvidenceCards(
  intent: AskIntentType,
  documents: StoredDocument[],
  agents: Agent[]
): AskEvidenceCard[] {
  if (documents.length === 0) return [];
  
  const maxCards = Math.min(4, documents.length);
  const activeAgent = agents.find(a => a.isActive);
  
  const evidenceTemplates: Record<AskIntentType, { labels: string[]; explanations: string[] }> = {
    diagnosis: {
      labels: [
        'Completion rate decline detected',
        'User friction identified at key step',
        'Time-to-completion increased',
        'Error rate spike observed',
      ],
      explanations: [
        'Data shows measurable decline in conversion at this stage compared to baseline.',
        'Qualitative feedback indicates users are struggling with specific interface elements.',
        'Average session duration at this step exceeds expected benchmarks.',
        'Form validation and input errors have increased in recent periods.',
      ],
    },
    synthesis: {
      labels: [
        'Theme: User experience concerns',
        'Theme: Feature adoption gaps',
        'Theme: Communication preferences',
        'Theme: Workflow efficiency',
      ],
      explanations: [
        'Multiple sources cite friction in core user journeys and navigation patterns.',
        'Evidence suggests key features are underutilized or difficult to discover.',
        'Feedback patterns indicate preferences for different communication channels.',
        'Users express desire for streamlined processes and reduced steps.',
      ],
    },
    risk: {
      labels: [
        'Engagement decline signal',
        'Usage pattern anomaly',
        'Sentiment shift detected',
        'Churn indicator present',
      ],
      explanations: [
        'Activity metrics show downward trend that correlates with churn risk.',
        'Usage patterns deviate from typical healthy user behavior.',
        'Recent feedback shows shift toward negative sentiment in key areas.',
        'Behavioral patterns match historical churn indicators.',
      ],
    },
    planning: {
      labels: [
        'High-impact opportunity area',
        'Quick win identified',
        'Strategic priority signal',
        'Resource efficiency gain',
      ],
      explanations: [
        'Evidence supports significant impact potential with moderate implementation effort.',
        'Small changes in this area could yield immediate improvements.',
        'Multiple signals point to this as a strategic focus area.',
        'Optimization here could reduce effort while improving outcomes.',
      ],
    },
    'goal-linked': {
      labels: [
        'Goal progress indicator',
        'KPI tracking update',
        'Milestone status',
        'Target variance detected',
      ],
      explanations: [
        'Current metrics show progress relative to established goals.',
        'Key performance indicators are trending as shown in source data.',
        'Major milestone status based on latest available information.',
        'Variance from target suggests need for adjustment or investigation.',
      ],
    },
  };
  
  const templates = evidenceTemplates[intent];
  
  return documents.slice(0, maxCards).map((doc, i) => ({
    id: `evidence-${doc.id}-${i}`,
    label: templates.labels[i % templates.labels.length],
    explanation: templates.explanations[i % templates.explanations.length],
    sourceCount: Math.floor(Math.random() * 3) + 1,
    sourceDocIds: [doc.id],
    type: i % 2 === 0 ? 'quantitative' : 'qualitative' as const,
    agentName: activeAgent?.name,
  }));
}

// Generate action cards based on intent
function generateActionCards(
  intent: AskIntentType,
  documents: StoredDocument[]
): AskActionCard[] {
  if (documents.length === 0) return [];
  
  const maxActions = Math.min(4, Math.max(2, documents.length));
  
  const actionTemplates: Record<AskIntentType, { titles: string[]; rationales: string[] }> = {
    diagnosis: {
      titles: [
        'Simplify the identified friction point',
        'Add progress visibility for users',
        'Implement smart defaults',
        'Create guided onboarding path',
      ],
      rationales: [
        'Evidence suggests reducing complexity at this step will improve conversion.',
        'Users need better visibility into their progress through the flow.',
        'Pre-filling common choices reduces cognitive load and time.',
        'Step-by-step guidance addresses confusion patterns.',
      ],
    },
    synthesis: {
      titles: [
        'Address top user experience theme',
        'Improve feature discoverability',
        'Optimize communication timing',
        'Streamline core workflows',
      ],
      rationales: [
        'Addressing the most common theme will impact the largest user segment.',
        'Making key features more visible could increase adoption.',
        'Timing improvements could boost engagement and satisfaction.',
        'Reducing steps in common workflows improves efficiency.',
      ],
    },
    risk: {
      titles: [
        'Proactive outreach to at-risk users',
        'Address root cause of engagement decline',
        'Implement early intervention triggers',
        'Improve re-engagement strategy',
      ],
      rationales: [
        'Early outreach can prevent churn before disengagement deepens.',
        'Fixing underlying issues prevents future risk accumulation.',
        'Automated triggers enable timely response to warning signs.',
        'Better re-engagement can recover users showing decline patterns.',
      ],
    },
    planning: {
      titles: [
        'Prioritize high-impact improvement',
        'Execute identified quick wins',
        'Plan strategic initiative',
        'Optimize resource allocation',
      ],
      rationales: [
        'Focus resources on changes with highest expected impact.',
        'Quick wins build momentum and demonstrate progress.',
        'Strategic initiatives address larger opportunity areas.',
        'Better resource allocation maximizes return on effort.',
      ],
    },
    'goal-linked': {
      titles: [
        'Accelerate on-track goals',
        'Investigate at-risk metrics',
        'Adjust targets based on new data',
        'Align team focus with goal priorities',
      ],
      rationales: [
        'Positive momentum can be amplified with additional focus.',
        'Understanding root causes of variance enables course correction.',
        'New information may warrant target adjustments.',
        'Team alignment ensures resources support goal achievement.',
      ],
    },
  };
  
  const templates = actionTemplates[intent];
  const impacts: ImpactLevel[] = ['high', 'medium', 'medium', 'low'];
  
  return templates.titles.slice(0, maxActions).map((title, i) => ({
    id: `action-${Date.now()}-${i}`,
    title,
    rationale: templates.rationales[i],
    sourceCount: Math.floor(Math.random() * 3) + 1,
    sourceDocIds: documents.slice(0, Math.min(2, documents.length)).map(d => d.id),
    expectedImpact: impacts[i % impacts.length],
    problem: `Based on evidence, users are experiencing challenges that this action addresses.`,
    evidence: `${documents.length} source${documents.length !== 1 ? 's' : ''} support this recommendation.`,
    recommendation: title,
    scope: 'Implementation scope to be determined based on team capacity.',
    successMetrics: 'Track improvement in relevant KPIs after implementation.',
    risks: 'Consider potential edge cases and rollback plan.',
  }));
}

// Determine confidence level
function determineConfidence(documents: StoredDocument[]): ConfidenceLevel {
  if (documents.length >= 4) return 'high';
  if (documents.length >= 2) return 'medium';
  return 'low';
}

// Should show trend based on intent and document types
function shouldShowTrend(intent: AskIntentType, documents: StoredDocument[]): boolean {
  // Show trend for diagnosis and risk intents when we have documents
  return ['diagnosis', 'risk', 'goal-linked'].includes(intent) && documents.length > 0;
}

// Generate mock trend data
function generateTrendData() {
  return [
    { week: 'Week 1', value: 85 },
    { week: 'Week 2', value: 72 },
    { week: 'Week 3', value: 68 },
    { week: 'Week 4', value: 54 },
  ];
}

// Main pipeline function
export function generateAskResponse(input: PipelineInput): AskResponse {
  const { query, projectId, documents, agents, insights } = input;
  
  // Step 1: Classify intent
  const intentType = classifyIntent(query);
  
  // Step 2: Get relevant documents
  const relevantDocs = getRelevantDocuments(documents, query);
  
  // Step 3: Check if we have enough data
  const isEmpty = relevantDocs.length === 0;
  
  // Step 4: Generate response components
  const title = generateCleanTitle(query);
  const summary = generateSummary(intentType, relevantDocs, query);
  const evidenceCards = generateEvidenceCards(intentType, relevantDocs, agents);
  const actionCards = generateActionCards(intentType, relevantDocs);
  const confidence = determineConfidence(relevantDocs);
  const showTrend = shouldShowTrend(intentType, relevantDocs);
  
  // Step 5: Build response
  const response: AskResponse = {
    id: `ask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    originalQuery: query,
    title,
    summary,
    intentType,
    trend: showTrend ? {
      data: generateTrendData(),
      label: 'Completion rate trend',
      change: '-31%',
      showTrend: true,
    } : undefined,
    evidenceCards,
    actionCards,
    metadata: {
      confidence,
      sourceCount: relevantDocs.length,
      timestamp: new Date(),
      assumptions: query.length < 30 ? 'Response based on available sources. Narrow your question for more specific insights.' : undefined,
    },
    isEmpty,
    missingSourceTypes: isEmpty ? ['User feedback documents', 'Analytics exports', 'Interview transcripts'] : undefined,
  };
  
  return response;
}
