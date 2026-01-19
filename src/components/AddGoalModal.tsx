import { useState } from 'react';
import { X, Calendar, Target, Users, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { GoalType } from '@/types';
import { useDocuments } from '@/contexts/DocumentsContext';

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: GoalFormData) => void;
}

export interface GoalFormData {
  title: string;
  description: string;
  goalType: GoalType;
  targetValue: string;
  startDate?: Date;
  endDate?: Date;
  linkedAgentIds: string[];
  linkedDataSourceIds: string[];
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'kpi', label: 'KPI' },
  { value: 'okr', label: 'OKR' },
  { value: 'success-metric', label: 'Success Metric' },
  { value: 'custom', label: 'Custom' },
];

const DATA_SOURCES = [
  { id: 'amplitude', label: 'Amplitude' },
  { id: 'mixpanel', label: 'Mixpanel' },
  { id: 'salesforce', label: 'Salesforce' },
  { id: 'dovetail', label: 'Dovetail' },
  { id: 'intercom', label: 'Intercom' },
  { id: 'zendesk', label: 'Zendesk' },
];

export function AddGoalModal({ open, onOpenChange, onSave }: AddGoalModalProps) {
  const { agents } = useDocuments();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('kpi');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [linkedAgentIds, setLinkedAgentIds] = useState<string[]>([]);
  const [linkedDataSourceIds, setLinkedDataSourceIds] = useState<string[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setGoalType('kpi');
    setTargetValue('');
    setStartDate(undefined);
    setEndDate(undefined);
    setLinkedAgentIds([]);
    setLinkedDataSourceIds([]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave({
      title: title.trim(),
      description: description.trim(),
      goalType,
      targetValue: targetValue.trim(),
      startDate,
      endDate,
      linkedAgentIds,
      linkedDataSourceIds,
    });
    handleReset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const toggleAgent = (agentId: string) => {
    setLinkedAgentIds(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const toggleDataSource = (sourceId: string) => {
    setLinkedDataSourceIds(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <Target className="w-5 h-5" />
            Add Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Goal title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Improve onboarding completion rate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-lg"
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              placeholder="Describe what success looks like..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-lg resize-none"
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Goal type <span className="text-destructive">*</span>
            </label>
            <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
              <SelectTrigger className="h-11 rounded-lg bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border z-50">
                {GOAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target value
            </label>
            <Input
              placeholder="e.g. 85% or 1000 users"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="h-11 rounded-lg"
            />
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Timeframe
            </label>
            <div className="flex gap-3">
              <Popover open={showStartDatePicker} onOpenChange={setShowStartDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-11 justify-start text-left font-normal rounded-lg",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setShowStartDatePicker(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover open={showEndDatePicker} onOpenChange={setShowEndDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-11 justify-start text-left font-normal rounded-lg",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setShowEndDatePicker(false);
                    }}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Linked Agents */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Linked agents
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto rounded-lg border border-border p-3">
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agents available</p>
              ) : (
                agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                  >
                    <Checkbox
                      checked={linkedAgentIds.includes(agent.id)}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                    <span className="text-sm text-foreground">{agent.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Linked Data Sources */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Linked data sources
            </label>
            <div className="flex flex-wrap gap-2">
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => toggleDataSource(source.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    linkedDataSourceIds.includes(source.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-11 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 h-11 rounded-lg"
          >
            Create Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}