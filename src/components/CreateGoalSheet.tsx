import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronDown, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface CreateGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (goal: GoalFormData) => void;
}

interface GoalFormData {
  title: string;
  category: string;
  metric: string;
  targetValue: string;
  targetUnit: string;
  timeHorizon: { start: Date; end: Date } | null;
}

const DEFAULT_CATEGORIES = ['Activation', 'Retention', 'Revenue', 'Efficiency'];
const DEFAULT_METRICS = ['Completion rate', 'Conversion rate', 'Time to value', 'NPS score', 'Churn rate', 'Active users'];
const TIME_PRESETS = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];
const UNITS = ['%', 'users', 'days', 'score', 'sessions', '$'];

export function CreateGoalSheet({ open, onOpenChange, onSave }: CreateGoalSheetProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [metric, setMetric] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [showCustomMetric, setShowCustomMetric] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [targetUnit, setTargetUnit] = useState('%');
  const [timePreset, setTimePreset] = useState<number | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [showCustomDate, setShowCustomDate] = useState(false);

  const handleSave = () => {
    const endDate = showCustomDate && customEndDate 
      ? customEndDate 
      : timePreset 
        ? addDays(new Date(), timePreset) 
        : null;
    
    onSave?.({
      title,
      category: showCustomCategory ? customCategory : category,
      metric: showCustomMetric ? customMetric : metric,
      targetValue,
      targetUnit,
      timeHorizon: endDate ? { start: new Date(), end: endDate } : null,
    });
    
    // Reset form
    setTitle('');
    setCategory('');
    setCustomCategory('');
    setShowCustomCategory(false);
    setMetric('');
    setCustomMetric('');
    setShowCustomMetric(false);
    setTargetValue('');
    setTargetUnit('%');
    setTimePreset(null);
    setCustomEndDate(undefined);
    setShowCustomDate(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-display text-2xl">Create a goal</SheetTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Define what success looks like for your product.
          </p>
        </SheetHeader>

        <div className="space-y-8">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What do you want to achieve?
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Improve onboarding completion"
              className="h-12 text-base bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setShowCustomCategory(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    category === cat && !showCustomCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCustomCategory(true);
                  setCategory('');
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                  showCustomCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>
            <AnimatePresence>
              {showCustomCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="h-10 text-sm bg-muted/50 border-0 focus-visible:ring-1 mt-2"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Success Metric */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How will you measure success?
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full h-12 px-4 rounded-xl bg-muted/50 text-left flex items-center justify-between text-base hover:bg-muted transition-colors">
                  <span className={cn(
                    showCustomMetric ? "text-foreground" : metric ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {showCustomMetric ? customMetric || 'Custom metric' : metric || 'Select a metric'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
                <div className="space-y-1">
                  {DEFAULT_METRICS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMetric(m);
                        setShowCustomMetric(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors",
                        metric === m && !showCustomMetric
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                  <div className="border-t border-border my-2" />
                  <button
                    onClick={() => {
                      setShowCustomMetric(true);
                      setMetric('');
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors flex items-center gap-2",
                      showCustomMetric ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create custom metric
                  </button>
                </div>
              </PopoverContent>
            </Popover>
            <AnimatePresence>
              {showCustomMetric && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    value={customMetric}
                    onChange={(e) => setCustomMetric(e.target.value)}
                    placeholder="Enter metric name"
                    className="h-10 text-sm bg-muted/50 border-0 focus-visible:ring-1 mt-2"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Target Value */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Target value
            </label>
            <p className="text-xs text-muted-foreground -mt-1">
              The outcome you want to reach
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 85"
                className="h-12 text-base bg-muted/50 border-0 focus-visible:ring-1 flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-12 px-4 rounded-xl bg-muted/50 flex items-center gap-2 hover:bg-muted transition-colors min-w-[80px] justify-between">
                    <span className="text-base">{targetUnit}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-2" align="end">
                  {UNITS.map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTargetUnit(unit)}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors",
                        targetUnit === unit
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {unit}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Time horizon
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => {
                    setTimePreset(preset.days);
                    setShowCustomDate(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    timePreset === preset.days && !showCustomDate
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => setShowCustomDate(true)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                      showCustomDate
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {showCustomDate && customEndDate 
                      ? format(customEndDate, 'MMM d, yyyy')
                      : 'Custom'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      setTimePreset(null);
                      setShowCustomDate(true);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10 pt-6 border-t border-border">
          <Button
            onClick={handleSave}
            className="w-full h-12 text-base font-medium"
            disabled={!title.trim()}
          >
            Save goal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
