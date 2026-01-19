import { X, Target, Calendar, Users, Database, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Goal } from '@/types';
import { useDocuments } from '@/contexts/DocumentsContext';
import { format } from 'date-fns';

interface GoalDetailPanelProps {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  'on-track': {
    icon: CheckCircle,
    label: 'On Track',
    className: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950',
  },
  'at-risk': {
    icon: AlertTriangle,
    label: 'At Risk',
    className: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-950',
  },
  'off-track': {
    icon: AlertTriangle,
    label: 'Off Track',
    className: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950',
  },
};

const goalTypeLabels = {
  'kpi': 'KPI',
  'okr': 'OKR',
  'success-metric': 'Success Metric',
  'custom': 'Custom',
};

export function GoalDetailPanel({ goal, open, onOpenChange }: GoalDetailPanelProps) {
  const { agents } = useDocuments();

  if (!goal) return null;

  const status = statusConfig[goal.status];
  const StatusIcon = status.icon;
  const linkedAgents = agents.filter(a => goal.linkedAgentIds?.includes(a.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.className}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                {goalTypeLabels[goal.goalType] || 'Goal'}
              </span>
            </div>
          </div>
          <SheetTitle className="font-display text-2xl text-foreground mt-4 text-left">
            {goal.title}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-8">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-3xl font-bold text-foreground">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          {/* Description */}
          {goal.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {goal.description}
              </p>
            </div>
          )}

          {/* Target Value */}
          {goal.targetValue && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target
              </h3>
              <p className="text-lg font-semibold text-foreground">
                {goal.targetValue}
              </p>
            </div>
          )}

          {/* Timeframe */}
          {(goal.startDate || goal.endDate) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeframe
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {goal.startDate && (
                  <span>{format(new Date(goal.startDate), 'MMM d, yyyy')}</span>
                )}
                {goal.startDate && goal.endDate && <span>→</span>}
                {goal.endDate && (
                  <span>{format(new Date(goal.endDate), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
          )}

          {/* Linked Agents */}
          {linkedAgents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Linked Agents
              </h3>
              <div className="flex flex-wrap gap-2">
                {linkedAgents.map((agent) => (
                  <span
                    key={agent.id}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground"
                  >
                    {agent.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Linked Data Sources */}
          {goal.linkedDataSourceIds && goal.linkedDataSourceIds.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {goal.linkedDataSourceIds.map((sourceId) => (
                  <span
                    key={sourceId}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground capitalize"
                  >
                    {sourceId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            {goal.createdAt && (
              <p>Created: {format(new Date(goal.createdAt), 'MMM d, yyyy')}</p>
            )}
            {goal.updatedAt && (
              <p>Last updated: {format(new Date(goal.updatedAt), 'MMM d, yyyy')}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}