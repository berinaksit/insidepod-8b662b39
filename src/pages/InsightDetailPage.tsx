import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  TrendingDown, 
  TrendingUp,
  Users, 
  AlertTriangle, 
  Lightbulb,
  Target,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { mockInsights } from '@/data/mockData';

export default function InsightDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Find the insight by id
  const insight = mockInsights.find(i => i.id === id) || mockInsights[0];

  // Sample data for different chart types
  const completionTrendData = [
    { week: 'Week 1', value: 85, completion: 78 },
    { week: 'Week 2', value: 72, completion: 65 },
    { week: 'Week 3', value: 68, completion: 58 },
    { week: 'Week 4', value: 54, completion: 45 },
  ];

  const segmentData = [
    { name: 'Enterprise', value: 35, color: 'hsl(var(--primary))' },
    { name: 'Mid-Market', value: 28, color: 'hsl(var(--secondary))' },
    { name: 'SMB', value: 22, color: 'hsl(var(--muted-foreground))' },
    { name: 'Startup', value: 15, color: 'hsl(var(--border))' },
  ];

  const timelineData = [
    { date: 'Jan', users: 1200, engaged: 980 },
    { date: 'Feb', users: 1350, engaged: 1100 },
    { date: 'Mar', users: 1180, engaged: 890 },
    { date: 'Apr', users: 980, engaged: 720 },
    { date: 'May', users: 1420, engaged: 1180 },
    { date: 'Jun', users: 1650, engaged: 1380 },
  ];

  const evidence = [
    {
      icon: TrendingDown,
      title: 'Step 2 completion dropped 23%',
      detail: 'Users are abandoning the profile setup step significantly more than last month.',
      source: 'User Feedback',
      type: 'quantitative' as const,
    },
    {
      icon: Users,
      title: '67% cite "too many fields"',
      detail: 'Qualitative feedback shows users feel overwhelmed by required form fields.',
      source: 'Analysis Report',
      type: 'qualitative' as const,
    },
    {
      icon: Clock,
      title: 'Average time on step: 4.2 min',
      detail: 'Users spend excessive time on this step compared to the 45-second benchmark.',
      source: 'Session Analytics',
      type: 'quantitative' as const,
    },
    {
      icon: Activity,
      title: 'Mobile users 2x more likely to drop',
      detail: 'Form fields are particularly challenging on smaller screens.',
      source: 'Device Analytics',
      type: 'quantitative' as const,
    },
  ];

  const suggestedActions = [
    {
      icon: Lightbulb,
      title: 'Reduce required fields to 3',
      detail: 'Based on evidence, simplifying the form could recover 15-20% of lost users.',
      priority: 'high' as const,
      impact: '+15% completion',
    },
    {
      icon: AlertTriangle,
      title: 'Add progress indicator',
      detail: "Users don't know how many steps remain. Showing progress reduces anxiety.",
      priority: 'medium' as const,
      impact: '+8% retention',
    },
    {
      icon: Target,
      title: 'Implement smart defaults',
      detail: 'Pre-fill common choices based on user segment to reduce cognitive load.',
      priority: 'medium' as const,
      impact: '-30% time on step',
    },
    {
      icon: CheckCircle2,
      title: 'A/B test progressive disclosure',
      detail: 'Show only essential fields initially, reveal others as needed.',
      priority: 'low' as const,
      impact: 'Validate hypothesis',
    },
  ];

  const keyMetrics = [
    { label: 'Drop-off Rate', value: '31%', trend: 'down', change: '+12%' },
    { label: 'Avg. Time on Step', value: '4.2m', trend: 'up', change: '+45s' },
    { label: 'Mobile Completion', value: '38%', trend: 'down', change: '-18%' },
    { label: 'Field Errors', value: '24%', trend: 'up', change: '+6%' },
  ];

  const priorityColors = {
    high: 'bg-destructive/10 text-destructive',
    medium: 'bg-amber-500/10 text-amber-600',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-muted text-foreground">
              {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              {insight.source.name}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {insight.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 stroke-[1.75]" />
              <span className="text-sm font-medium">{insight.evidenceCount} sources analyzed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                insight.confidence >= 0.9 ? 'bg-[hsl(145,60%,45%)]' : 
                insight.confidence >= 0.8 ? 'bg-[hsl(145,60%,45%)]' : 
                'bg-[hsl(45,80%,50%)]'
              }`} />
              <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}% confidence</span>
            </span>
          </div>
        </motion.div>

        {/* Analysis summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-foreground text-background rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-sm font-medium text-background/60 uppercase tracking-wider mb-3">
            Summary
          </h2>
          <p className="text-lg md:text-xl text-background leading-relaxed">
            {insight.synthesis}
          </p>
        </motion.section>

        {/* Key metrics grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid gap-4 md:grid-cols-4"
        >
          {keyMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-card rounded-2xl p-5 border border-border"
            >
              <p className="text-sm text-muted-foreground font-medium mb-1">{metric.label}</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  metric.trend === 'down' ? 'text-destructive' : 'text-amber-600'
                }`}>
                  {metric.trend === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5 stroke-[1.75]" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 stroke-[1.75]" />
                  )}
                  {metric.change}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Charts section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Completion Trend - Bar Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground stroke-[1.75]" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Completion trend
              </h2>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionTrendData} barCategoryGap="20%">
                    <XAxis 
                      dataKey="week" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--foreground))" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground font-medium">Step 2 completion rate</span>
                <span className="text-sm font-semibold text-destructive">-31% overall</span>
              </div>
            </div>
          </motion.section>

          {/* User Timeline - Area Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground stroke-[1.75]" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                User engagement over time
              </h2>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--foreground))"
                      fill="hsl(var(--foreground))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="engaged" 
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <span className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <span className="w-3 h-0.5 bg-foreground rounded" />
                  Total users
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <span className="w-3 h-0.5 bg-muted-foreground rounded border-dashed" />
                  Engaged users
                </span>
              </div>
            </div>
          </motion.section>

          {/* Segment Distribution - Pie Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-muted-foreground stroke-[1.75]" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Affected segments
              </h2>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-6">
                <div className="h-40 w-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={segmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {segmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {segmentData.map((segment) => (
                    <div key={segment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{segment.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">{segment.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Funnel Visualization */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground stroke-[1.75]" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Conversion funnel
              </h2>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="space-y-3">
                {[
                  { label: 'Landed on signup', value: 100, users: '12,450' },
                  { label: 'Started onboarding', value: 78, users: '9,711' },
                  { label: 'Completed step 1', value: 65, users: '8,093' },
                  { label: 'Completed step 2', value: 42, users: '5,229', highlight: true },
                  { label: 'Activated', value: 38, users: '4,731' },
                ].map((step, i) => (
                  <div key={step.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${step.highlight ? 'text-destructive' : 'text-foreground'}`}>
                        {step.label}
                      </span>
                      <span className="text-muted-foreground">{step.users} users</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${step.value}%` }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          step.highlight ? 'bg-destructive' : 'bg-foreground'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        {/* Evidence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Evidence
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {evidence.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  className="bg-card rounded-2xl p-5 border border-border"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground stroke-[1.75]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          item.type === 'quantitative' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-secondary/10 text-secondary'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.detail}</p>
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 stroke-[1.75]" />
                        Source: {item.source}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Suggested actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="space-y-4 pb-10"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Suggested actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {suggestedActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05 }}
                  className="bg-card hover:bg-muted/50 rounded-2xl p-5 border border-border text-left transition-colors group"
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-muted-foreground stroke-[1.75]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground">{action.title}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[action.priority]}`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{action.detail}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 stroke-[1.75]" />
                          Expected impact: {action.impact}
                        </span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground stroke-[1.75] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
