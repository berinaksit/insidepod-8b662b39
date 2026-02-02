// Ask Experience Types - AI-powered structured responses

export type AskIntentType = 
  | 'diagnosis'    // What is driving / why is X happening
  | 'synthesis'    // What are the common themes / patterns / needs
  | 'risk'         // Churn risk / early warning / anomalies
  | 'planning'     // Opportunities / what should we do next
  | 'goal-linked'; // Goal status / KPI or OKR tracking

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ImpactLevel = 'high' | 'medium' | 'low';

export interface AskEvidenceCard {
  id: string;
  label: string;
  explanation: string;
  sourceCount: number;
  sourceDocIds: string[];
  type: 'quantitative' | 'qualitative' | 'mixed';
  agentName?: string;
}

export interface AskActionCard {
  id: string;
  title: string;
  rationale: string;
  sourceCount: number;
  sourceDocIds: string[];
  expectedImpact?: ImpactLevel;
  problem?: string;
  evidence?: string;
  recommendation?: string;
  scope?: string;
  successMetrics?: string;
  risks?: string;
}

export interface AskTrendData {
  week: string;
  value: number;
}

export interface AskResponse {
  id: string;
  projectId: string;
  originalQuery: string;
  title: string; // Clean rewritten title
  summary: string; // 35-55 words, executive-ready
  intentType: AskIntentType;
  trend?: {
    data: AskTrendData[];
    label: string;
    change: string;
    showTrend: boolean;
  };
  evidenceCards: AskEvidenceCard[];
  actionCards: AskActionCard[];
  metadata: {
    confidence: ConfidenceLevel;
    sourceCount: number;
    timestamp: Date;
    assumptions?: string; // For broad questions
    conflictingSignals?: string; // When evidence conflicts
  };
  isEmpty: boolean; // No sources available
  missingSourceTypes?: string[]; // What to upload
}

export interface AskQuery {
  id: string;
  projectId: string;
  query: string;
  timestamp: Date;
  response?: AskResponse;
}

// Query classification patterns
export const INTENT_PATTERNS: Record<AskIntentType, RegExp[]> = {
  diagnosis: [
    /what is driving/i,
    /why is/i,
    /why are/i,
    /what caused/i,
    /what's causing/i,
    /drop-?off/i,
    /decline/i,
    /issue with/i,
  ],
  synthesis: [
    /common themes/i,
    /patterns/i,
    /themes/i,
    /top \d+/i,
    /summarize/i,
    /summary/i,
    /what are the/i,
    /pain points/i,
    /needs/i,
    /feedback/i,
  ],
  risk: [
    /churn/i,
    /risk/i,
    /warning/i,
    /anomal/i,
    /signals/i,
    /early warning/i,
    /at risk/i,
  ],
  planning: [
    /opportunit/i,
    /should we/i,
    /priorit/i,
    /next/i,
    /roadmap/i,
    /what to do/i,
    /recommend/i,
  ],
  'goal-linked': [
    /goal/i,
    /kpi/i,
    /okr/i,
    /on track/i,
    /progress/i,
    /status/i,
    /metric/i,
  ],
};

// Classify intent from query
export function classifyIntent(query: string): AskIntentType {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        return intent as AskIntentType;
      }
    }
  }
  // Default to synthesis for general questions
  return 'synthesis';
}

// Generate clean title from query
export function generateCleanTitle(query: string): string {
  // Remove question marks and clean up
  let title = query.replace(/\?+$/, '').trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Truncate if too long
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  
  return title;
}
