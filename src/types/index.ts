// Inside Pōd Type Definitions

export type InsightType = 'pulse' | 'insight' | 'signal';

export interface Source {
  id: string;
  name: string;
  type: 'dovetail' | 'salesforce' | 'amplitude' | 'mixpanel' | 'intercom' | 'zendesk' | 'internal';
  icon?: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  synthesis: string;
  source: Source;
  timestamp: Date;
  confidence: number;
  evidenceCount: number;
  isNew?: boolean;
  priority?: 'high' | 'medium' | 'low';
  relatedGoals?: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'risk-scanner' | 'retention-monitor' | 'adoption-tracker' | 'insight-synthesizer' | 'trend-summarizer';
  status: 'active' | 'idle' | 'running';
  lastRun?: Date;
  nextRun?: Date;
  outputCount: number;
}

export interface AgentOutput {
  id: string;
  agentId: string;
  summary: string;
  evidence: Evidence[];
  confidence: number;
  suggestedAction?: string;
  timestamp: Date;
}

export interface Evidence {
  id: string;
  type: 'qualitative' | 'quantitative';
  source: Source;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  progress: number;
  signals: Signal[];
  insights: Insight[];
}

export interface Signal {
  id: string;
  name: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  source: Source;
}

export interface AnalysisView {
  id: string;
  question: string;
  synthesis: string;
  evidence: Evidence[];
  suggestedActions: string[];
  colorTheme: 'primary' | 'secondary' | 'tertiary';
  timestamp: Date;
}

export interface SearchQuery {
  text: string;
  timestamp: Date;
  response?: AnalysisView;
}
