import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { GoalCard } from '@/components/GoalCard';
import { GoalsEmptyState } from '@/components/GoalsEmptyState';
import { AddGoalModal, GoalFormData } from '@/components/AddGoalModal';
import { GoalDetailPanel } from '@/components/GoalDetailPanel';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Plus, Filter, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Goal, GoalType } from '@/types';

type StatusFilter = 'all' | 'on-track' | 'at-risk' | 'off-track';
type TimeframeFilter = 'all' | 'active' | 'completed';
type SortOption = 'progress-desc' | 'progress-asc' | 'updated' | 'type';

const goalTypeLabels: Record<GoalType | 'all', string> = {
  'all': 'All Types',
  'kpi': 'KPI',
  'okr': 'OKR',
  'success-metric': 'Success Metric',
  'custom': 'Custom',
};

const statusLabels: Record<StatusFilter, string> = {
  'all': 'All Status',
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'off-track': 'Off Track',
};

const timeframeLabels: Record<TimeframeFilter, string> = {
  'all': 'All Timeframes',
  'active': 'Active',
  'completed': 'Completed',
};

const sortLabels: Record<SortOption, string> = {
  'progress-desc': 'Progress (High to Low)',
  'progress-asc': 'Progress (Low to High)',
  'updated': 'Last Updated',
  'type': 'Goal Type',
};

export function GoalsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { goals, addGoal } = useDocuments();

  // Filters
  const [typeFilter, setTypeFilter] = useState<GoalType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('updated');

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || timeframeFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setTimeframeFilter('all');
  };

  const handleCreateGoal = (goalData: GoalFormData) => {
    const now = new Date();
    addGoal({
      title: goalData.title,
      description: goalData.description,
      goalType: goalData.goalType,
      targetValue: goalData.targetValue,
      startDate: goalData.startDate,
      endDate: goalData.endDate,
      linkedAgentIds: goalData.linkedAgentIds,
      linkedDataSourceIds: goalData.linkedDataSourceIds,
      progress: 0,
      status: 'on-track' as const,
      signals: [],
      insights: [],
      createdAt: now,
      updatedAt: now,
    });
  };

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailOpen(true);
  };

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(g => g.goalType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(g => g.status === statusFilter);
    }

    // Timeframe filter
    if (timeframeFilter !== 'all') {
      const now = new Date();
      if (timeframeFilter === 'active') {
        result = result.filter(g => !g.endDate || new Date(g.endDate) >= now);
      } else if (timeframeFilter === 'completed') {
        result = result.filter(g => g.progress >= 100 || (g.endDate && new Date(g.endDate) < now));
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'progress-desc':
          return b.progress - a.progress;
        case 'progress-asc':
          return a.progress - b.progress;
        case 'updated':
          const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return bDate - aDate;
        case 'type':
          return (a.goalType || '').localeCompare(b.goalType || '');
        default:
          return 0;
      }
    });

    return result;
  }, [goals, typeFilter, statusFilter, timeframeFilter, sortBy]);

  if (goals.length === 0) {
    return (
      <>
        <GoalsEmptyState onCreateGoal={() => setIsCreateOpen(true)} />
        <AddGoalModal
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSave={handleCreateGoal}
        />
      </>
    );
  }

  return (
    <div className="min-h-full px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-display text-2xl text-foreground mb-1">Goals</h1>
          <p className="text-muted-foreground">
            Track progress toward your product objectives
          </p>
        </div>
        
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </motion.div>

      {/* Filters and Sorting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as GoalType | 'all')}>
          <SelectTrigger className="w-[140px] h-9 rounded-lg bg-background text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {Object.entries(goalTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[130px] h-9 rounded-lg bg-background text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={timeframeFilter} onValueChange={(v) => setTimeframeFilter(v as TimeframeFilter)}>
          <SelectTrigger className="w-[140px] h-9 rounded-lg bg-background text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {Object.entries(timeframeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="w-4 h-4" />
          <span>Sort:</span>
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[180px] h-9 rounded-lg bg-background text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background border border-border z-50">
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Results count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-sm text-muted-foreground mb-4"
      >
        Showing {filteredGoals.length} of {goals.length} goals
      </motion.p>
      
      {/* Goals grid */}
      {filteredGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <p>No goals match your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredGoals.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={index}
              onClick={() => handleGoalClick(goal)}
            />
          ))}
        </div>
      )}

      <AddGoalModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={handleCreateGoal}
      />

      <GoalDetailPanel
        goal={selectedGoal}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}