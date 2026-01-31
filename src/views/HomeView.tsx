import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { AgentsList } from '@/components/AgentsList';
import { EmptyState } from '@/components/EmptyState';
import { EditAgentModal } from '@/components/EditAgentModal';
import { mockInsights } from '@/data/mockData';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Agent } from '@/types';
import { Sparkles, Target, Bot, Plus, LayoutDashboard, CircleDot, FileText, Link2, Code2, FileUp, Scan, Calendar, Activity, MessageSquare, TrendingUp, MonitorCheck, Search, RefreshCw, Upload, Download } from 'lucide-react';
import { synthesizePrimaryInsight, synthesizeSuggestedTask, synthesizeSuggestedPrompt, synthesizeRecentGuidance, getDocumentIcon } from '@/utils/documentSynthesis';
import { View } from '@/pages/Index';
import { Button } from '@/components/ui/button';
import { CreateGoalModal, Goal, GoalType } from '@/components/CreateGoalModal';
import { GoalDetailView } from '@/components/GoalDetailView';
import { InsightDetailView } from '@/components/InsightDetailView';
import { ActionDetailPanel } from '@/components/ActionDetailPanel';
import { SourcesOverviewView } from '@/components/SourcesOverviewView';
import { SuggestedPromptView } from '@/components/SuggestedPromptView';
import { RecentActivityView } from '@/components/RecentActivityView';
import { AgentsOverviewView } from '@/components/AgentsOverviewView';
import { ProjectSelector } from '@/components/ProjectSelector';
import { generateExecutiveSummaryPDF } from '@/components/ExecutiveSummaryExport';
interface HomeViewProps {
  currentTab: View;
  onTabChange: (tab: View) => void;
}
export function HomeView({
  currentTab,
  onTabChange
}: HomeViewProps) {
  const [isSearching] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Dashboard detail view states
  type DashboardView = 'none' | 'insight' | 'task' | 'sources' | 'prompt' | 'recent' | 'agents';
  const [dashboardView, setDashboardView] = useState<DashboardView>('none');

  // Goals state with localStorage persistence
  const GOALS_STORAGE_KEY = 'insidepod_goals_v2';
  const loadGoals = (): Goal[] => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt)
        }));
      }
    } catch (e) {
      console.warn('Failed to load goals from localStorage:', e);
    }
    return [];
  };
  const [goals, setGoals] = useState<Goal[]>(() => loadGoals());

  // Persist goals whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.warn('Failed to save goals to localStorage:', e);
    }
  }, [goals]);
  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setGoals(prev => [...prev, newGoal]);
  };
  const {
    hasDocuments,
    hasAgents,
    generatedInsights,
    agents,
    openUploadModal,
    documents
  } = useDocuments();

  // Combine mock insights with generated insights
  const allInsights = [...generatedInsights, ...mockInsights];
  const handleAgentClick = (agent: Agent) => {
    setEditingAgent(agent);
    setEditModalOpen(true);
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

  // Synthesized content from real documents
  const primaryInsight = useMemo(() => synthesizePrimaryInsight(documents), [documents]);
  const suggestedTask = useMemo(() => synthesizeSuggestedTask(documents), [documents]);
  const suggestedPrompt = useMemo(() => synthesizeSuggestedPrompt(documents), [documents]);
  const recentGuidance = useMemo(() => synthesizeRecentGuidance(documents), [documents]);

  // Get connected sources from real documents only (last 4 for display)
  const connectedSources = useMemo(() => {
    return documents.slice(-4).reverse().map(doc => ({
      name: doc.aiTitle || doc.name,
      icon: getDocumentIcon(doc),
      color: 'text-blue-400',
      document: doc
    }));
  }, [documents]);

  // Active agents from real agent data
  const activeAgents = useMemo(() => {
    const agentIcons: Record<string, typeof Scan> = {
      'risk-scanner': Scan,
      'retention-monitor': MonitorCheck,
      'adoption-tracker': Activity,
      'insight-synthesizer': MessageSquare,
      'trend-summarizer': TrendingUp
    };
    return agents.filter(a => a.isActive).slice(0, 6).map(agent => ({
      name: agent.name,
      icon: agentIcons[agent.type] || Bot
    }));
  }, [agents]);
  const handleUploadClick = () => {
    openUploadModal('home');
  };

  // Track used icons to prevent duplicates
  const [usedIcons, setUsedIcons] = useState<Set<string>>(new Set());
  const handleIconUsed = (iconName: string) => {
    setUsedIcons(prev => new Set(prev).add(iconName));
  };

  // Reset used icons when insights change
  const resetUsedIcons = () => {
    setUsedIcons(new Set());
  };

  // Determine what empty state to show for Today's Insights
  const renderInsightsContent = () => {
    if (!hasDocuments) {
      return <EmptyState icon={Upload} title="Upload documents to get started" description="Add your first document to start generating insights from your data." action={{
        label: "Upload Document",
        onClick: handleUploadClick
      }} />;
    }
    if (!hasAgents && generatedInsights.length === 0) {
      // Create a local set for this render pass
      const localUsedIcons = new Set<string>();
      const handleLocalIconUsed = (iconName: string) => {
        localUsedIcons.add(iconName);
      };
      return <div>
          <div className="mb-6">
            <EmptyState icon={Bot} title="Create an agent to generate insights" description="You have documents uploaded. Create an agent to analyze them and surface insights." action={{
            label: "Create Agent",
            onClick: () => onTabChange('create-agent')
          }} />
          </div>
          {/* Still show mock insights */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {mockInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} usedIcons={localUsedIcons} onIconUsed={handleLocalIconUsed} onClick={() => {}} />)}
          </div>
        </div>;
    }

    // Create a local set for this render pass
    const localUsedIcons = new Set<string>();
    const handleLocalIconUsed = (iconName: string) => {
      localUsedIcons.add(iconName);
    };
    return <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {allInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} usedIcons={localUsedIcons} onIconUsed={handleLocalIconUsed} onClick={() => {}} />)}
      </div>;
  };

  // Determine what empty state to show for Agents
  const renderAgentsContent = () => {
    if (!hasDocuments) {
      return <EmptyState icon={Upload} title="Upload documents first" description="Agents need data to analyze. Upload documents to create your first agent." action={{
        label: "Upload Document",
        onClick: handleUploadClick
      }} />;
    }
    return <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <p className="text-muted-foreground text-sm sm:text-base">AI agents continuously monitoring your product signals</p>
          <button onClick={() => onTabChange('create-agent')} className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-normal hover:bg-primary/90 transition-colors w-full sm:w-auto">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Agent
          </button>
        </div>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6 sm:mb-8">
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center">
                <Bot className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xl font-medium text-foreground">{agents.filter(a => a.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active agents</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center">
                <FileUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xl font-medium text-foreground">
                  {agents.reduce((sum, a) => sum + a.outputCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total outputs</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xl font-medium text-foreground">
                  {agents.filter(a => a.status === 'running' && a.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl p-4 sm:p-6">
          <AgentsList agents={agents} onAgentClick={handleAgentClick} />
        </div>
      </>;
  };
  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700',
    'OKR': 'bg-purple-100 text-purple-700',
    'Success Metric': 'bg-green-100 text-green-700',
    'Custom': 'bg-muted text-muted-foreground'
  };

  // Handle goal card click
  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  // Render Goals content
  const renderGoalsContent = () => {
    // Show detail view if a goal is selected
    if (selectedGoal) {
      return <GoalDetailView goal={selectedGoal} onClose={() => setSelectedGoal(null)} />;
    }
    return <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <p className="text-muted-foreground text-sm sm:text-base">Track product outcomes over time</p>
          <Button onClick={() => setIsGoalModalOpen(true)} className="flex items-center justify-center gap-1.5 rounded-lg font-normal w-full sm:w-auto">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Add Goal
          </Button>
        </div>

        {goals.length === 0 ? <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-6">
              <Target className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2 text-center">No goals yet</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm sm:text-base">
              Create goals to track product outcomes over time
            </p>
            <Button onClick={() => setIsGoalModalOpen(true)} className="rounded-lg font-normal w-full sm:w-auto">
              Add your first goal
            </Button>
          </div> : <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => <motion.div key={goal.id} initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: index * 0.05
        }} onClick={() => handleGoalClick(goal)} className="bg-card rounded-xl p-5 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${typeColors[goal.type]}`}>
                    {goal.type}
                  </span>
                </div>
                <h3 className="text-base font-medium text-foreground leading-snug">
                  {goal.title}
                </h3>
              </motion.div>)}
          </div>}

        <CreateGoalModal open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen} onCreateGoal={handleCreateGoal} />
      </>;
  };
  return <div className="min-h-full">
      {/* Hero section */}
      <motion.section initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.5
    }} className="px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-16">
          <motion.h1 initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-2 sm:mb-3">
            Clarity at a glance
          </motion.h1>
          <motion.p initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="text-muted-foreground text-sm sm:text-base">
            Here's what matters for your product today
          </motion.p>
        </div>

        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.3
      }}>
          <SearchBar isProcessing={isSearching} />
        </motion.div>
      </motion.section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 pb-10 sm:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`py-2 transition-colors whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}>
                  <span className="text-base font-medium">{tab.label}</span>
                  {tab.id === 'home' && <span className="ml-1.5 sm:ml-2 px-1 sm:px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                      {allInsights.filter(i => i.isNew).length}
                    </span>}
                </button>;
          })}
          </div>

          {/* Right aligned controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => generateExecutiveSummaryPDF({
            insights: allInsights,
            goals,
            documents
          })} className="p-2 rounded-lg hover:bg-muted/50 transition-colors" title="Download executive summary">
              <Download className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </button>
            <ProjectSelector />
          </div>
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
        }}>
              {renderInsightsContent()}
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
              {renderGoalsContent()}
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
              {renderAgentsContent()}
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
              {/* Empty State when no documents */}
              {!hasDocuments ? <EmptyState icon={Upload} title="Upload documents to get started" description="Add your first document to see insights, tasks, and prompts synthesized from your data." action={{
            label: "Upload Document",
            onClick: handleUploadClick
          }} /> : <>
                  {/* Detail Views */}
                  {dashboardView === 'insight' && primaryInsight && <InsightDetailView onClose={() => setDashboardView('none')} insight={{
              headline: primaryInsight.text,
              type: 'Signal',
              source: primaryInsight.sourceLabel,
              contributorCount: primaryInsight.sourceCount
            }} />}

                  {dashboardView === 'task' && suggestedTask && <ActionDetailPanel onClose={() => setDashboardView('none')} task={{
              title: suggestedTask.text
            }} sourceDocuments={suggestedTask.sourceDocuments} />}

                  {dashboardView === 'sources' && <SourcesOverviewView onClose={() => setDashboardView('none')} />}

                  {dashboardView === 'prompt' && suggestedPrompt && <SuggestedPromptView onClose={() => setDashboardView('none')} prompt={suggestedPrompt.text} sourceDocuments={suggestedPrompt.sourceDocuments} />}

                  {dashboardView === 'recent' && <RecentActivityView onClose={() => setDashboardView('none')} />}

                  {dashboardView === 'agents' && <AgentsOverviewView onClose={() => setDashboardView('none')} />}

                  {/* Dashboard Cards Grid */}
                  {dashboardView === 'none' && <div className="grid gap-3 sm:gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Featured Insight Card - Purple */}
                      {primaryInsight && <div onClick={() => setDashboardView('insight')} className="bg-highlight-surface rounded-2xl p-5 text-highlight-foreground cursor-pointer hover:opacity-90 transition-opacity">
                          <div className="w-7 h-7 rounded-full bg-highlight/20 flex items-center justify-center mb-3">
                            <CircleDot className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <p className="text-xl font-semibold mb-5 line-clamp-3">
                            {primaryInsight.text}
                          </p>
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 bg-highlight/20 rounded-full text-sm font-semibold">
                              {primaryInsight.sourceLabel}
                              {primaryInsight.sourceCount > 1 && ` +${primaryInsight.sourceCount - 1}`}
                            </span>
                          </div>
                        </div>}

                      {/* Suggested Task Card */}
                      {suggestedTask && <div onClick={() => setDashboardView('task')} className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                            <FileText className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Suggested task</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                            {suggestedTask.text}
                          </h3>
                          <div className="gap-1.5 mt-auto pb-0 text-muted-foreground flex items-end justify-start">
                            <Link2 className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Used {suggestedTask.sourceCount} source{suggestedTask.sourceCount !== 1 ? 's' : ''}</span>
                            <span className="text-sm font-medium">›</span>
                          </div>
                        </div>}

                      {/* Connected Sources Card */}
                      <div onClick={() => setDashboardView('sources')} className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                          <Link2 className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm font-medium">Connected sources</span>
                        </div>
                        {connectedSources.length > 0 ? <div className="space-y-2.5 flex-1 max-h-32 overflow-y-auto">
                            {connectedSources.map(source => <div key={source.name} className="flex items-center gap-2.5">
                                <span className="text-base">{source.icon}</span>
                                <span className="text-foreground font-medium truncate">{source.name}</span>
                              </div>)}
                          </div> : <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                            No documents uploaded
                          </div>}
                        <div className="relative mt-auto pb-0" onClick={e => e.stopPropagation()}>
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                          <input type="text" placeholder="Search for documents" className="w-full bg-muted/50 rounded-full pl-9 pr-3.5 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none font-medium" />
                        </div>
                      </div>

                      {/* Suggested Prompt Card */}
                      {suggestedPrompt && <div onClick={() => setDashboardView('prompt')} className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                            <Code2 className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Suggested prompt</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                            {suggestedPrompt.text}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-auto pb-0 text-muted-foreground">
                            <Link2 className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Used {suggestedPrompt.sourceCount} source{suggestedPrompt.sourceCount !== 1 ? 's' : ''}</span>
                            <span className="text-xs font-medium">›</span>
                          </div>
                        </div>}

                      {/* Recently Uploaded Card */}
                      {recentGuidance && <div onClick={() => setDashboardView('recent')} className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors">
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                            <FileUp className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Recently uploaded</span>
                          </div>
                          <h3 className="text-xl font-semibold text-foreground line-clamp-2">
                            {recentGuidance.question}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-auto pb-0 text-muted-foreground">
                            <span>{getDocumentIcon(recentGuidance.document)}</span>
                            <span className="text-sm truncate max-w-[200px]">
                              {recentGuidance.document.aiTitle || recentGuidance.document.name} ›
                            </span>
                          </div>
                        </div>}

                      {/* Active Agents Card */}
                      <div onClick={() => setDashboardView('agents')} className="insight-card cursor-pointer hover:border-border transition-colors">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                          <Bot className="w-4 h-4" strokeWidth={1.5} />
                          <span className="text-sm font-medium">Active Agents</span>
                        </div>
                        {activeAgents.length > 0 ? <div className="grid grid-cols-2 gap-1.5">
                            {activeAgents.map(agent => {
                    const Icon = agent.icon;
                    return <div key={agent.name} className="flex items-center gap-1.5 bg-muted/50 rounded-xl text-sm text-foreground font-medium py-[28px] px-[10px]">
                                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                  <span className="truncate">{agent.name}</span>
                                </div>;
                  })}
                          </div> : <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                            No active agents
                          </div>}
                      </div>
                    </div>}
                </>}
            </motion.div>}
        </AnimatePresence>
      </section>

      {/* Edit Agent Modal */}
      <EditAgentModal agent={editingAgent} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </div>;
}