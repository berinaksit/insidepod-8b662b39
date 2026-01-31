import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  Zap,
  Lightbulb,
  FileText,
  Clock,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Goal, GoalType } from '@/components/CreateGoalModal';

// Extended Goal type with additional fields for detail view
export interface GoalDetail extends Goal {
  status?: 'on-track' | 'at-risk' | 'off-track' | 'unknown';
  healthSummary?: string;
  trend?: 'improving' | 'declining' | 'stable';
  confidence?: 'high' | 'medium' | 'low';
  lastUpdated?: Date;
  linkedSignals?: LinkedSignal[];
  dataSources?: DataSource[];
  timeline?: TimelineEvent[];
  monitoringAgents?: MonitoringAgent[];
  suggestedActions?: string[];
}

interface LinkedSignal {
  id: string;
  type: 'signal' | 'pulse' | 'insight';
  headline: string;
  explanation: string;
  sourceCount: number;
  agentName: string;
}

interface DataSource {
  name: string;
  documentCount: number;
  lastSync: Date;
}

interface TimelineEvent {
  id: string;
  description: string;
  timestamp: Date;
  type: 'signal' | 'insight' | 'status-change';
}

interface MonitoringAgent {
  id: string;
  name: string;
  status: 'active' | 'paused';
}

interface GoalDetailViewProps {
  goal: GoalDetail;
  onClose: () => void;
}

// Mock data generator for demo purposes
function generateMockData(goal: Goal): GoalDetail {
  const statuses: Array<'on-track' | 'at-risk' | 'off-track' | 'unknown'> = ['on-track', 'at-risk', 'off-track', 'unknown'];
  const trends: Array<'improving' | 'declining' | 'stable'> = ['improving', 'declining', 'stable'];
  const confidences: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomTrend = trends[Math.floor(Math.random() * trends.length)];
  const randomConfidence = confidences[Math.floor(Math.random() * confidences.length)];

  const healthMessages: Record<string, string> = {
    'on-track': `${goal.title} is progressing well. Key metrics show positive momentum with user engagement increasing 12% week-over-week. Recent signals indicate strong adoption patterns across the target user segments.`,
    'at-risk': `${goal.title} shows mixed signals requiring attention. While overall progress is acceptable, recent data suggests a slowdown in key conversion metrics. Consider reviewing the onboarding flow for potential friction points.`,
    'off-track': `${goal.title} is currently behind expected targets. Analysis reveals a significant drop in activation rates over the past two weeks. Immediate intervention recommended to address user drop-off at step 3 of the journey.`,
    'unknown': `Insufficient data to determine the health of ${goal.title}. More signals and insights are needed to establish a reliable baseline for tracking progress.`
  };

  return {
    ...goal,
    status: randomStatus,
    healthSummary: healthMessages[randomStatus],
    trend: randomTrend,
    confidence: randomConfidence,
    lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 3),
    linkedSignals: [
      {
        id: '1',
        type: 'signal',
        headline: 'Activation rate dropped 8% this week',
        explanation: 'New users are not completing the setup flow at expected rates',
        sourceCount: 12,
        agentName: 'Adoption Tracker'
      },
      {
        id: '2',
        type: 'insight',
        headline: 'Support tickets mention "confusing onboarding"',
        explanation: 'Qualitative analysis reveals UX friction in step 2',
        sourceCount: 8,
        agentName: 'Insight Synthesizer'
      },
      {
        id: '3',
        type: 'pulse',
        headline: 'Power users increasingly using new feature',
        explanation: 'Feature adoption among engaged users trending positively',
        sourceCount: 5,
        agentName: 'Trend Summarizer'
      }
    ],
    dataSources: [
      { name: 'Product Analytics', documentCount: 24, lastSync: new Date(Date.now() - 3600000) },
      { name: 'User Interviews', documentCount: 8, lastSync: new Date(Date.now() - 86400000) },
      { name: 'Support Tickets', documentCount: 156, lastSync: new Date(Date.now() - 7200000) }
    ],
    timeline: [
      { id: '1', description: 'Status changed from Unknown to On Track', timestamp: new Date(Date.now() - 86400000 * 5), type: 'status-change' },
      { id: '2', description: 'New signal detected: Activation rate increase', timestamp: new Date(Date.now() - 86400000 * 3), type: 'signal' },
      { id: '3', description: 'Insight added: Positive user feedback on new flow', timestamp: new Date(Date.now() - 86400000 * 2), type: 'insight' },
      { id: '4', description: 'Risk signal: Drop in week 2 retention', timestamp: new Date(Date.now() - 86400000), type: 'signal' }
    ],
    monitoringAgents: [
      { id: '1', name: 'Adoption Tracker', status: 'active' },
      { id: '2', name: 'Risk Scanner', status: 'active' },
      { id: '3', name: 'Retention Monitor', status: 'paused' }
    ],
    suggestedActions: [
      'Review onboarding step two friction points',
      'Compare new cohort behavior vs previous month',
      'Schedule user interviews for qualitative feedback'
    ]
  };
}

export function GoalDetailView({ goal, onClose }: GoalDetailViewProps) {
  // Enrich goal with mock data for demo
  const enrichedGoal = generateMockData(goal);
  
  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'OKR': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Success Metric': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Custom': 'bg-muted text-muted-foreground',
  };

  const statusConfig = {
    'on-track': { label: 'On Track', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
    'at-risk': { label: 'At Risk', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: AlertCircle },
    'off-track': { label: 'Off Track', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
    'unknown': { label: 'Unknown', color: 'bg-muted text-muted-foreground', icon: HelpCircle }
  };

  const trendConfig = {
    'improving': { label: 'Improving', icon: TrendingUp, color: 'text-green-600' },
    'declining': { label: 'Declining', icon: TrendingDown, color: 'text-red-600' },
    'stable': { label: 'Stable', icon: Minus, color: 'text-muted-foreground' }
  };

  const signalTypeConfig = {
    'signal': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    'pulse': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    'insight': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }
  };

  const status = enrichedGoal.status || 'unknown';
  const StatusIcon = statusConfig[status].icon;
  const trend = enrichedGoal.trend || 'stable';
  const TrendIcon = trendConfig[trend].icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // Check if sections have data
  const hasLinkedSignals = enrichedGoal.linkedSignals && enrichedGoal.linkedSignals.length > 0;
  const hasDataSources = enrichedGoal.dataSources && enrichedGoal.dataSources.length > 0;
  const hasTimeline = enrichedGoal.timeline && enrichedGoal.timeline.length > 0;
  const hasMonitoringAgents = enrichedGoal.monitoringAgents && enrichedGoal.monitoringAgents.length > 0;
  const hasSuggestedActions = enrichedGoal.suggestedActions && enrichedGoal.suggestedActions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className="min-h-full"
    >
      {/* Header */}
      <div className="mb-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
          Back to Goals
        </Button>

        <div className="flex flex-wrap items-start gap-2 mb-4">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeColors[enrichedGoal.type]}`}>
            {enrichedGoal.type}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1.5 ${statusConfig[status].color}`}>
            <StatusIcon className="w-3 h-3" strokeWidth={1.5} />
            {statusConfig[status].label}
          </span>
        </div>

        <h1 className="text-2xl font-display text-foreground">
          {enrichedGoal.title}
        </h1>
      </div>

      {/* Goal Health Summary */}
      <section className="mb-12">
        <div className="bg-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-foreground">Goal Health Summary</h2>
          </div>
          
          <p className="text-foreground/80 leading-relaxed mb-6">
            {enrichedGoal.healthSummary}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-4 h-4 ${trendConfig[trend].color}`} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">
                Trend: <span className="text-foreground">{trendConfig[trend].label}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">
                Confidence: <span className="text-foreground capitalize">{enrichedGoal.confidence}</span>
              </span>
            </div>
            {enrichedGoal.lastUpdated && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground">
                  Updated: <span className="text-foreground">{formatRelativeTime(enrichedGoal.lastUpdated)}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Linked Signals and Insights */}
      {hasLinkedSignals && (
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
            <Lightbulb className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            What's affecting this goal
          </h2>
          
          <div className="space-y-4">
            {enrichedGoal.linkedSignals!.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${signalTypeConfig[signal.type].color}`}>
                    {signal.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {signal.sourceCount} sources
                  </span>
                </div>
                <h3 className="font-medium text-foreground mb-1.5">{signal.headline}</h3>
                <p className="text-sm text-muted-foreground mb-3">{signal.explanation}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  <Bot className="w-3 h-3" strokeWidth={1.5} />
                  {signal.agentName}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Related Data Sources */}
      {hasDataSources && (
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
            <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Connected sources
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {enrichedGoal.dataSources!.map((source, index) => (
              <div
                key={index}
                className="bg-muted/30 rounded-lg px-4 py-2.5 text-sm"
              >
                <span className="text-foreground">{source.name}</span>
                <span className="text-muted-foreground ml-2">
                  {source.documentCount} docs · {formatRelativeTime(source.lastSync)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goal Timeline */}
      {hasTimeline && (
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
            <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Timeline
          </h2>
          
          <div className="space-y-4">
            {enrichedGoal.timeline!.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 text-sm"
              >
                <span className="text-muted-foreground/60 whitespace-nowrap min-w-[72px]">
                  {formatRelativeTime(event.timestamp)}
                </span>
                <span className="text-foreground">{event.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monitoring Agents */}
      {hasMonitoringAgents && (
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
            <Bot className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Monitoring agents
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {enrichedGoal.monitoringAgents!.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 bg-muted/30 rounded-lg px-4 py-2.5"
              >
                <span className="text-sm text-foreground">{agent.name}</span>
                <Badge 
                  variant={agent.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs font-normal"
                >
                  {agent.status === 'active' ? 'Active' : 'Paused'}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Actions */}
      {hasSuggestedActions && (
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-medium text-foreground mb-6">
            <Sparkles className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            Suggested next steps
          </h2>
          
          <div className="space-y-3">
            {enrichedGoal.suggestedActions!.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-muted/20 rounded-lg px-5 py-4"
              >
                <span className="text-muted-foreground text-sm">{index + 1}.</span>
                <span className="text-foreground text-sm">{action}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
