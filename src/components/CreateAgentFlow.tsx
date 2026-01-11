import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Check, AlertTriangle, 
  TrendingUp, Zap, Lightbulb, Sparkles, Upload, FileText,
  BarChart3, FolderOpen, Link2, Clock, Bell
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { mockGoals } from '@/data/mockData';

interface CreateAgentFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (agent: AgentFormData) => void;
}

interface AgentFormData {
  name: string;
  description: string;
  template: string;
  prompt: string;
  dataSources: string[];
  uploadedFiles: File[];
  linkedGoalId: string | null;
  frequency: string;
  notifyOnInsights: boolean;
}

const STEPS = [
  { id: 1, title: 'Basics', description: 'Name your agent' },
  { id: 2, title: 'Template', description: 'Choose what to monitor' },
  { id: 3, title: 'Prompt', description: 'Define the focus' },
  { id: 4, title: 'Data', description: 'Connect sources' },
  { id: 5, title: 'Goals', description: 'Link to goals' },
  { id: 6, title: 'Frequency', description: 'Set schedule' },
  { id: 7, title: 'Review', description: 'Confirm & create' },
];

const TEMPLATES = [
  {
    id: 'risk-scanner',
    name: 'Risk Scanner',
    description: 'Monitors early signals of churn, friction, or drop-offs',
    icon: AlertTriangle,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    defaultPrompt: 'Monitor changes in user behavior, support tickets, and feedback to identify early warning signals of churn or friction. Flag accounts showing declining engagement or expressing frustration.',
  },
  {
    id: 'retention-monitor',
    name: 'Retention Monitor',
    description: 'Tracks engagement and repeat usage patterns',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    defaultPrompt: 'Track user engagement patterns, session frequency, and feature usage over time. Identify users at risk of churning based on declining activity or compare cohort retention rates.',
  },
  {
    id: 'adoption-tracker',
    name: 'Adoption Tracker',
    description: 'Identifies underutilized features and adoption velocity',
    icon: Zap,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    defaultPrompt: 'Monitor feature adoption rates, time-to-first-use metrics, and identify features that are underutilized. Surface opportunities to improve onboarding and feature discovery.',
  },
  {
    id: 'insight-synthesizer',
    name: 'Insight Synthesizer',
    description: 'Connects qualitative feedback with quantitative signals',
    icon: Lightbulb,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    defaultPrompt: 'Analyze qualitative feedback from interviews, surveys, and support tickets alongside quantitative usage data. Identify patterns and synthesize actionable insights.',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Blank starting point for custom monitoring',
    icon: Sparkles,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    defaultPrompt: '',
  },
];

const DATA_SOURCES = [
  { id: 'amplitude', name: 'Amplitude', type: 'Analytics' },
  { id: 'mixpanel', name: 'Mixpanel', type: 'Analytics' },
  { id: 'dovetail', name: 'Dovetail', type: 'Research' },
  { id: 'salesforce', name: 'Salesforce', type: 'CRM' },
  { id: 'intercom', name: 'Intercom', type: 'Support' },
  { id: 'zendesk', name: 'Zendesk', type: 'Support' },
];

const FREQUENCIES = [
  { id: 'daily', label: 'Daily', description: 'Runs every day' },
  { id: 'weekly', label: 'Weekly', description: 'Runs every Monday' },
  { id: 'biweekly', label: 'Bi-weekly', description: 'Runs every other week' },
  { id: 'monthly', label: 'Monthly', description: 'Runs on the 1st of each month' },
  { id: 'manual', label: 'Manual only', description: 'Run on demand' },
];

export function CreateAgentFlow({ open, onOpenChange, onSave }: CreateAgentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    template: '',
    prompt: '',
    dataSources: [],
    uploadedFiles: [],
    linkedGoalId: null,
    frequency: 'weekly',
    notifyOnInsights: true,
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    setFormData({
      ...formData,
      template: templateId,
      prompt: template?.defaultPrompt || '',
    });
  };

  const handleDataSourceToggle = (sourceId: string) => {
    setFormData({
      ...formData,
      dataSources: formData.dataSources.includes(sourceId)
        ? formData.dataSources.filter(id => id !== sourceId)
        : [...formData.dataSources, sourceId],
    });
  };

  const handleSave = () => {
    onSave?.(formData);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      template: '',
      prompt: '',
      dataSources: [],
      uploadedFiles: [],
      linkedGoalId: null,
      frequency: 'weekly',
      notifyOnInsights: true,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.template.length > 0;
      case 3: return formData.prompt.trim().length > 0;
      case 4: return true; // Optional
      case 5: return true; // Optional
      case 6: return formData.frequency.length > 0;
      case 7: return true;
      default: return true;
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === formData.template);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header with progress */}
        <div className="px-8 pt-8 pb-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Create Agent</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Set up an AI agent to monitor your product signals
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors duration-300",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center mt-3">
            <p className="text-sm font-medium text-foreground">{STEPS[currentStep - 1].title}</p>
            <span className="mx-2 text-muted-foreground">•</span>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Content area */}
        <div className="px-8 py-6 min-h-[400px] max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Basics */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Agent name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Retention Risk Scanner"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 rounded-xl border-border bg-background"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Describe what this agent should monitor and why it matters.
                  </p>
                  <Textarea
                    placeholder="e.g. Monitors early signs of churn in enterprise accounts by analyzing usage patterns and support interactions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[120px] rounded-xl border-border bg-background resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Template */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a starting template or create a custom agent.
                </p>
                <div className="grid gap-3">
                  {TEMPLATES.map((template) => {
                    const Icon = template.icon;
                    const isSelected = formData.template === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-border hover:bg-muted/30"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", template.bgColor)}>
                          <Icon className={cn("w-5 h-5", template.color)} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{template.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{template.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Prompt */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    What should this agent look for? <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Describe the patterns, signals, or behaviors this agent should monitor.
                  </p>
                  <Textarea
                    placeholder="e.g. Monitor changes in onboarding completion, feature usage, and user feedback to identify emerging adoption risks."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="min-h-[200px] rounded-xl border-border bg-background resize-none"
                  />
                </div>
                {selectedTemplate && selectedTemplate.id !== 'custom' && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                    <Lightbulb className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Pre-filled from the <span className="font-medium">{selectedTemplate.name}</span> template. Feel free to customize.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Data Sources */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Connected data sources
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Select which data sources this agent should monitor.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {DATA_SOURCES.map((source) => {
                      const isSelected = formData.dataSources.includes(source.id);
                      return (
                        <button
                          key={source.id}
                          onClick={() => handleDataSourceToggle(source.id)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.type}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground px-2">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-border transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Upload data files</p>
                    <p className="text-xs text-muted-foreground">PDF, CSV, DOCX — for early-stage or one-off data</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Link to Goals */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Link to a product goal
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Linking an agent to a goal helps track why the goal is moving — or not — over time.
                  </p>
                  
                  <Select
                    value={formData.linkedGoalId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, linkedGoalId: value === 'none' ? null : value })}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select a goal (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Skip for now</span>
                      </SelectItem>
                      {mockGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              goal.status === 'on-track' && "bg-emerald-500",
                              goal.status === 'at-risk' && "bg-amber-500",
                              goal.status === 'off-track' && "bg-red-500"
                            )} />
                            {goal.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                  <Link2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    When linked, this agent's insights will automatically surface on the goal's timeline, building context over time.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 6: Frequency */}
            {currentStep === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    How often should this agent run?
                  </label>
                  <div className="grid gap-3">
                    {FREQUENCIES.map((freq) => {
                      const isSelected = formData.frequency === freq.id;
                      return (
                        <button
                          key={freq.id}
                          onClick={() => setFormData({ ...formData, frequency: freq.id })}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Clock className={cn("w-4 h-4", isSelected ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{freq.label}</p>
                            <p className="text-sm text-muted-foreground">{freq.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Notify me when new insights are found</p>
                      <p className="text-xs text-muted-foreground">Get alerted when this agent surfaces something new</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.notifyOnInsights}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifyOnInsights: checked })}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 7: Review */}
            {currentStep === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                    <div className="flex items-center gap-3">
                      {selectedTemplate && (
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", selectedTemplate.bgColor)}>
                          <selectedTemplate.icon className={cn("w-4 h-4", selectedTemplate.color)} strokeWidth={1.5} />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{formData.name}</p>
                        {selectedTemplate && (
                          <p className="text-xs text-muted-foreground">{selectedTemplate.name} template</p>
                        )}
                      </div>
                    </div>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Data Sources</p>
                      </div>
                      <p className="text-sm text-foreground">
                        {formData.dataSources.length > 0 
                          ? formData.dataSources.map(id => DATA_SOURCES.find(s => s.id === id)?.name).join(', ')
                          : 'None selected'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Linked Goal</p>
                      </div>
                      <p className="text-sm text-foreground">
                        {formData.linkedGoalId 
                          ? mockGoals.find(g => g.id === formData.linkedGoalId)?.title
                          : 'None'}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frequency</p>
                      </div>
                      <p className="text-sm text-foreground">
                        {FREQUENCIES.find(f => f.id === formData.frequency)?.label}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notifications</p>
                      </div>
                      <p className="text-sm text-foreground">
                        {formData.notifyOnInsights ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>

                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="w-4 h-4" />
                      <span>View agent prompt</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="mt-3 p-4 rounded-xl bg-muted/30 text-sm text-foreground">
                      {formData.prompt}
                    </div>
                  </details>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    This agent will continuously build context over time, learning from each run to surface more relevant insights.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={currentStep === 1 ? () => onOpenChange(false) : handleBack}
              className="gap-2"
            >
              {currentStep === 1 ? (
                'Cancel'
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </>
              )}
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="gap-2"
              >
                Create Agent
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
