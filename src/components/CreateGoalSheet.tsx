import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, Calendar } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

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
  timeHorizon: string;
  endDate: Date | undefined;
}

const defaultCategories = ['Activation', 'Retention', 'Revenue', 'Efficiency'];
const defaultMetrics = ['Completion rate', 'Conversion rate', 'Response time', 'Active users', 'NPS score'];
const defaultUnits = ['%', 'users', 'days', 'hours', 'points', '$'];
const timePresets = [
  { label: '30 days', days: 30 },
  { label: '60 days', days: 60 },
  { label: '90 days', days: 90 },
];

export function CreateGoalSheet({ open, onOpenChange, onSave }: CreateGoalSheetProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    category: '',
    metric: '',
    targetValue: '',
    targetUnit: '%',
    timeHorizon: '',
    endDate: undefined,
  });

  const [customCategory, setCustomCategory] = useState('');
  const [customMetric, setCustomMetric] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomMetric, setShowCustomMetric] = useState(false);
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCustomCategory(false);
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim()) {
      setFormData(prev => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  };

  const handleMetricSelect = (metric: string) => {
    setFormData(prev => ({ ...prev, metric }));
    setShowMetricDropdown(false);
    setShowCustomMetric(false);
  };

  const handleAddCustomMetric = () => {
    if (customMetric.trim()) {
      setFormData(prev => ({ ...prev, metric: customMetric.trim() }));
      setCustomMetric('');
      setShowCustomMetric(false);
      setShowMetricDropdown(false);
    }
  };

  const handleTimePreset = (days: number, label: string) => {
    setFormData(prev => ({
      ...prev,
      timeHorizon: label,
      endDate: addDays(new Date(), days),
    }));
  };

  const handleCustomDate = (date: Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      timeHorizon: 'custom',
      endDate: date,
    }));
  };

  const handleSave = () => {
    onSave?.(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      title: '',
      category: '',
      metric: '',
      targetValue: '',
      targetUnit: '%',
      timeHorizon: '',
      endDate: undefined,
    });
  };

  const isComplete = formData.title.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="font-display text-2xl">Create a goal</SheetTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Goals help you focus on what matters most
          </p>
        </SheetHeader>

        <div className="space-y-8">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              What do you want to achieve?
            </label>
            <Input
              placeholder="e.g. Improve onboarding completion"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="h-12 text-base bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    formData.category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat}
                </button>
              ))}
              {formData.category && !defaultCategories.includes(formData.category) && (
                <button
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground"
                >
                  {formData.category}
                </button>
              )}
              <button
                onClick={() => setShowCustomCategory(true)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            <AnimatePresence>
              {showCustomCategory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 overflow-hidden"
                >
                  <Input
                    placeholder="New category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                    className="flex-1 h-10 bg-muted/50 border-0"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAddCustomCategory}
                    className="h-10"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCustomCategory(false)}
                    className="h-10 px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Success Metric */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              How will you measure success?
            </label>
            <div className="relative">
              <button
                onClick={() => setShowMetricDropdown(!showMetricDropdown)}
                className="w-full h-12 px-4 rounded-xl bg-muted/50 text-left flex items-center justify-between hover:bg-muted/70 transition-colors"
              >
                <span className={formData.metric ? "text-foreground" : "text-muted-foreground"}>
                  {formData.metric || "Select a metric"}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  showMetricDropdown && "rotate-180"
                )} />
              </button>
              <AnimatePresence>
                {showMetricDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      {defaultMetrics.map((metric) => (
                        <button
                          key={metric}
                          onClick={() => handleMetricSelect(metric)}
                          className="w-full px-3 py-2 text-left rounded-lg hover:bg-muted transition-colors text-sm"
                        >
                          {metric}
                        </button>
                      ))}
                      <div className="border-t border-border mt-2 pt-2">
                        {showCustomMetric ? (
                          <div className="flex gap-2 px-2">
                            <Input
                              placeholder="Custom metric"
                              value={customMetric}
                              onChange={(e) => setCustomMetric(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMetric()}
                              className="flex-1 h-9 bg-muted/50 border-0 text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleAddCustomMetric} className="h-9">
                              Add
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowCustomMetric(true)}
                            className="w-full px-3 py-2 text-left rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create custom metric
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                placeholder="85"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                className="flex-1 h-12 text-base bg-muted/50 border-0 focus-visible:ring-1"
              />
              <div className="relative">
                <button
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="h-12 px-4 rounded-xl bg-muted/50 flex items-center gap-2 hover:bg-muted/70 transition-colors min-w-[80px] justify-between"
                >
                  <span className="text-foreground">{formData.targetUnit}</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    showUnitDropdown && "rotate-180"
                  )} />
                </button>
                <AnimatePresence>
                  {showUnitDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden min-w-[100px]"
                    >
                      <div className="p-2">
                        {defaultUnits.map((unit) => (
                          <button
                            key={unit}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, targetUnit: unit }));
                              setShowUnitDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left rounded-lg hover:bg-muted transition-colors text-sm"
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Time horizon
            </label>
            <div className="flex flex-wrap gap-2">
              {timePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleTimePreset(preset.days, preset.label)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    formData.timeHorizon === preset.label
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
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                      formData.timeHorizon === 'custom'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {formData.timeHorizon === 'custom' && formData.endDate
                      ? format(formData.endDate, 'MMM d, yyyy')
                      : 'Custom'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={handleCustomDate}
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
            disabled={!isComplete}
            className="w-full h-12 text-base font-medium"
          >
            Save goal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
