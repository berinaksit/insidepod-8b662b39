import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { GoalCard } from '@/components/GoalCard';
import { AgentsList } from '@/components/AgentsList';
import { mockInsights, mockAnalysisViews, mockGoals, mockAgents } from '@/data/mockData';
import { AnalysisView } from '@/types';
import { Sparkles, Target, Bot, Plus, Play, LayoutDashboard, CircleDot, FileText, Link2, Code2, FileUp, Scan, Calendar, Activity, MessageSquare, TrendingUp, MonitorCheck } from 'lucide-react';
import { View } from '@/pages/Index';
interface HomeViewProps {
  currentTab: View;
  onTabChange: (tab: View) => void;
}
export function HomeView({
  currentTab,
  onTabChange
}: HomeViewProps) {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisView | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const analysis: AnalysisView = {
      ...mockAnalysisViews[0],
      question: query,
      timestamp: new Date()
    };
    setActiveAnalysis(analysis);
    setIsSearching(false);
  };
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const tabs = [{
    id: 'home' as View,
    label: "Today's Insights",
    icon: Sparkles
  }, {
    id: 'goals' as View,
    label: 'Goals',
    icon: Target
  }, {
    id: 'agents' as View,
    label: 'Agents',
    icon: Bot
  }, {
    id: 'dashboard' as View,
    label: 'Dashboard',
    icon: LayoutDashboard
  }];
  const connectedSources = [{
    name: 'Salesforce_CRM Data',
    icon: '☁️',
    color: 'text-blue-400'
  }, {
    name: 'Drive_User Interviews',
    icon: '📁',
    color: 'text-yellow-400'
  }, {
    name: 'Meeting transcript_Sales 2025',
    icon: '📄',
    color: 'text-blue-300'
  }];
  const activeAgents = [{
    name: 'Risk Scanner',
    icon: Scan
  }, {
    name: 'Weekly Review',
    icon: Calendar
  }, {
    name: 'Adoption Tracker',
    icon: Activity
  }, {
    name: 'Insights Synthesis',
    icon: MessageSquare
  }, {
    name: 'Retention Monitor',
    icon: MonitorCheck
  }, {
    name: 'Trend Summarizer',
    icon: TrendingUp
  }];
  return <div className="min-h-full">
      {/* Hero section with greeting and search */}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.5
    }} className="px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.h1 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="font-display text-3xl md:text-4xl text-foreground mb-3">
            Clarity at a glance
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="text-muted-foreground text-lg">
            Here's what matters for your product today
          </motion.p>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.3
      }}>
          <SearchBar onSearch={handleSearch} isProcessing={isSearching} />
        </motion.div>
      </motion.section>

      {/* Active Analysis Panel */}
      <AnimatePresence>
        {activeAnalysis && <motion.section initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="px-6 pb-8">
            <AnalysisPanel analysis={activeAnalysis} onClose={() => setActiveAnalysis(null)} />
          </motion.section>}
      </AnimatePresence>

      {/* Tabs */}
      <section className="px-6 pb-12">
        <div className="flex items-center gap-4 mb-6 border-b border-border/50">
          {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'home' && <span className="ml-1 px-2 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full">
                    {mockInsights.filter(i => i.isNew).length} new
                  </span>}
              </button>;
        })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {currentTab === 'home' && <motion.div key="insights" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} onClick={() => handleSearch(insight.title)} />)}
            </motion.div>}

          {currentTab === 'goals' && <motion.div key="goals" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">Track progress toward your product objectives</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockGoals.map((goal, index) => <GoalCard key={goal.id} goal={goal} index={index} />)}
              </div>
            </motion.div>}

          {currentTab === 'agents' && <motion.div key="agents" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">AI agents continuously monitoring your product signals</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  <Play className="w-4 h-4" />
                  Run All
                </button>
              </div>
              
              {/* Summary cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="insight-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-medium text-foreground">{mockAgents.length}</p>
                      <p className="text-sm text-muted-foreground">Active agents</p>
                    </div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-medium text-foreground">
                        {mockAgents.reduce((sum, a) => sum + a.outputCount, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total outputs</p>
                    </div>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Bot className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-medium text-foreground">
                        {mockAgents.filter(a => a.status === 'running').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Currently running</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border/50 rounded-2xl p-4">
                <AgentsList agents={mockAgents} />
              </div>
            </motion.div>}

          {currentTab === 'dashboard' && <motion.div key="dashboard" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Featured Insight Card - Purple */}
                <div className="bg-highlight-surface rounded-2xl p-6 text-highlight-foreground">
                  <div className="w-8 h-8 rounded-full bg-highlight/20 flex items-center justify-center mb-4">
                    <CircleDot className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-medium leading-relaxed mb-6">
                    Users aren't returning as often, fewer complete the first key action, and more exit at checkout, indicating blockers in onboarding and purchase steps.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-highlight/20 rounded-full text-sm font-medium">
                      Semi structured interviews
                    </span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-highlight/30 border-2 border-highlight-surface" />
                      <div className="w-6 h-6 rounded-full bg-highlight/40 border-2 border-highlight-surface" />
                      <div className="w-6 h-6 rounded-full bg-highlight/50 border-2 border-highlight-surface" />
                    </div>
                    <span className="text-sm text-highlight-foreground/70">+41</span>
                  </div>
                </div>

                {/* Suggested Task Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Suggested task</span>
                  </div>
                  <h3 className="text-xl font-medium text-foreground leading-relaxed">
                    Review today's drop in step-two activation.
                  </h3>
                  <div className="gap-2 mt-auto pb-0 text-muted-foreground flex items-end justify-start">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Select data source</span>
                    <span className="text-xs">▼</span>
                  </div>
                </div>

                {/* Connected Sources Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Connected sources</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {connectedSources.map(source => <div key={source.name} className="flex items-center gap-3">
                        <span className="text-lg">{source.icon}</span>
                        <span className="text-foreground">{source.name}</span>
                      </div>)}
                  </div>
                  <div className="relative mt-auto pb-0">
                    <input type="text" placeholder="Search for documents" className="w-full bg-muted/50 border border-border/50 rounded-lg px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>

                {/* Suggested Prompt Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Code2 className="w-4 h-4" />
                    <span className="text-sm">Suggested prompt</span>
                  </div>
                  <h3 className="text-xl font-medium text-foreground leading-relaxed">
                    What's driving this month's performance changes?
                  </h3>
                  <div className="flex items-center gap-2 mt-auto pb-0 text-muted-foreground">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Select data source</span>
                    <span className="text-xs">▼</span>
                  </div>
                </div>

                {/* Recently Uploaded Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileUp className="w-4 h-4" />
                    <span className="text-sm">Recently uploaded</span>
                  </div>
                  <h3 className="text-xl font-medium text-foreground leading-relaxed">
                    Which emerging patterns matter for our next release?
                  </h3>
                  <div className="flex items-center gap-2 mt-auto pb-0 text-muted-foreground">
                    <span className="text-red-400">📕</span>
                    <span className="text-sm">E-commerce Trends_2025</span>
                  </div>
                </div>

                {/* Active Agents Card */}
                <div className="insight-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm">Active Agents</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {activeAgents.map(agent => {
                  const Icon = agent.icon;
                  return <button key={agent.name} className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 hover:bg-muted rounded-xl text-sm text-foreground transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span>{agent.name}</span>
                        </button>;
                })}
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </section>
    </div>;
}