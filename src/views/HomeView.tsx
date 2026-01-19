import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { AgentsList } from '@/components/AgentsList';
import { EmptyState } from '@/components/EmptyState';
import { EditAgentModal } from '@/components/EditAgentModal';
import { mockInsights } from '@/data/mockData';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Agent } from '@/types';
import { Sparkles, Target, Bot, Plus, LayoutDashboard, CircleDot, FileText, Link2, Code2, FileUp, Scan, Calendar, Activity, MessageSquare, TrendingUp, MonitorCheck, Search, RefreshCw, Upload } from 'lucide-react';
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
          createdAt: new Date(g.createdAt),
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
      createdAt: new Date(),
    };
    setGoals((prev) => [...prev, newGoal]);
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

  const connectedSources = [
    ...documents.map(doc => ({
      name: doc.aiTitle || doc.name,
      icon: doc.type === 'pdf' ? '📕' : doc.type === 'csv' ? '📊' : '📄',
      color: 'text-blue-400'
    })),
    {
      name: 'Salesforce_CRM Data',
      icon: '☁️',
      color: 'text-blue-400'
    },
    {
      name: 'Drive_User Interviews',
      icon: '📁',
      color: 'text-yellow-400'
    },
    {
      name: 'Meeting transcript_Sales 2025',
      icon: '📄',
      color: 'text-blue-300'
    }
  ];

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
      return (
        <EmptyState
          icon={Upload}
          title="Upload documents to get started"
          description="Add your first document to start generating insights from your data."
          action={{
            label: "Upload Document",
            onClick: handleUploadClick
          }}
        />
      );
    }
    
    if (!hasAgents && generatedInsights.length === 0) {
      // Create a local set for this render pass
      const localUsedIcons = new Set<string>();
      const handleLocalIconUsed = (iconName: string) => {
        localUsedIcons.add(iconName);
      };
      
      return (
        <div>
          <div className="mb-6">
            <EmptyState
              icon={Bot}
              title="Create an agent to generate insights"
              description="You have documents uploaded. Create an agent to analyze them and surface insights."
              action={{
                label: "Create Agent",
                onClick: () => onTabChange('create-agent')
              }}
            />
          </div>
          {/* Still show mock insights */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockInsights.map((insight, index) => (
              <InsightCard 
                key={insight.id} 
                insight={insight} 
                index={index} 
                usedIcons={localUsedIcons}
                onIconUsed={handleLocalIconUsed}
                onClick={() => {}} 
              />
            ))}
          </div>
        </div>
      );
    }

    // Create a local set for this render pass
    const localUsedIcons = new Set<string>();
    const handleLocalIconUsed = (iconName: string) => {
      localUsedIcons.add(iconName);
    };

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allInsights.map((insight, index) => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            index={index} 
            usedIcons={localUsedIcons}
            onIconUsed={handleLocalIconUsed}
            onClick={() => {}} 
          />
        ))}
      </div>
    );
  };

  // Determine what empty state to show for Agents
  const renderAgentsContent = () => {
    if (!hasDocuments) {
      return (
        <EmptyState
          icon={Upload}
          title="Upload documents first"
          description="Agents need data to analyze. Upload documents to create your first agent."
          action={{
            label: "Upload Document",
            onClick: handleUploadClick
          }}
        />
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-5">
          <p className="text-muted-foreground font-medium">AI agents continuously monitoring your product signals</p>
          <button 
            onClick={() => onTabChange('create-agent')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Agent
          </button>
        </div>
        
        {/* Summary cards */}
        <div className="grid gap-3.5 md:grid-cols-3 mb-5">
          <div className="insight-card">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Bot className="w-5 h-5 text-muted-foreground stroke-[1.75]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{agents.filter(a => a.isActive).length}</p>
                <p className="text-sm text-muted-foreground font-medium">Active agents</p>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <FileUp className="w-5 h-5 text-muted-foreground stroke-[1.75]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {agents.reduce((sum, a) => sum + a.outputCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Total outputs</p>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-xl bg-[hsl(145,60%,90%)] flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[hsl(145,60%,40%)] stroke-[1.75]" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {agents.filter(a => a.status === 'running' && a.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground font-medium">Currently running</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-3.5 shadow-card">
          <AgentsList agents={agents} onAgentClick={handleAgentClick} />
        </div>
      </>
    );
  };

  const typeColors: Record<GoalType, string> = {
    'KPI': 'bg-blue-100 text-blue-700',
    'OKR': 'bg-purple-100 text-purple-700',
    'Success Metric': 'bg-green-100 text-green-700',
    'Custom': 'bg-muted text-muted-foreground',
  };

  // Handle goal card click
  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  // Render Goals content
  const renderGoalsContent = () => {
    // Show detail view if a goal is selected
    if (selectedGoal) {
      return (
        <GoalDetailView
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-5">
          <p className="text-muted-foreground font-medium">Track product outcomes over time</p>
          <Button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No goals yet</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Create goals to track product outcomes over time
            </p>
            <Button
              onClick={() => setIsGoalModalOpen(true)}
              className="rounded-xl"
            >
              Add your first goal
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleGoalClick(goal)}
                className="bg-card rounded-2xl p-5 shadow-card border border-border/50 hover:border-border hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${typeColors[goal.type]}`}>
                    {goal.type}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-tight">
                  {goal.title}
                </h3>
              </motion.div>
            ))}
          </div>
        )}

        <CreateGoalModal
          open={isGoalModalOpen}
          onOpenChange={setIsGoalModalOpen}
          onCreateGoal={handleCreateGoal}
        />
      </>
    );
  };

  return (
    <div className="min-h-full">
      {/* Hero section with greeting and search */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }} 
        className="px-6 py-12 md:py-16"
      >
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="font-display text-3xl md:text-4xl text-foreground mb-3"
          >
            Clarity at a glance
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }} 
            className="text-muted-foreground text-lg"
          >
            Here's what matters for your product today
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SearchBar isProcessing={isSearching} />
        </motion.div>
      </motion.section>

      {/* Tabs */}
      <section className="px-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => onTabChange(tab.id)} 
                className={`flex items-center gap-1.5 px-1 py-2.5 border-b-2 transition-colors ${isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                <span className="font-semibold">{tab.label}</span>
                {tab.id === 'home' && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full font-medium">
                    {allInsights.filter(i => i.isNew).length} new
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div 
              key="insights" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
            >
              {renderInsightsContent()}
            </motion.div>
          )}

          {currentTab === 'goals' && (
            <motion.div 
              key="goals" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
            >
              {renderGoalsContent()}
            </motion.div>
          )}


          {currentTab === 'agents' && (
            <motion.div 
              key="agents" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
            >
              {renderAgentsContent()}
            </motion.div>
          )}

          {currentTab === 'dashboard' && (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Detail Views */}
              {dashboardView === 'insight' && (
                <InsightDetailView
                  onClose={() => setDashboardView('none')}
                  insight={{
                    headline: "Users aren't returning as often, fewer complete the first key action, and more exit at checkout, indicating blockers in onboarding and purchase steps.",
                    type: 'Signal',
                    source: 'Semi structured interviews',
                    contributorCount: 41
                  }}
                />
              )}

              {dashboardView === 'task' && (
                <ActionDetailPanel
                  onClose={() => setDashboardView('none')}
                  task={{
                    title: "Review today's drop in step-two activation."
                  }}
                />
              )}

              {dashboardView === 'sources' && (
                <SourcesOverviewView
                  onClose={() => setDashboardView('none')}
                />
              )}

              {dashboardView === 'prompt' && (
                <SuggestedPromptView
                  onClose={() => setDashboardView('none')}
                  prompt="What's driving this month's performance changes?"
                />
              )}

              {dashboardView === 'recent' && (
                <RecentActivityView
                  onClose={() => setDashboardView('none')}
                />
              )}

              {dashboardView === 'agents' && (
                <AgentsOverviewView
                  onClose={() => setDashboardView('none')}
                />
              )}

              {/* Dashboard Cards Grid */}
              {dashboardView === 'none' && (
                <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                  {/* Featured Insight Card - Purple */}
                  <div 
                    onClick={() => setDashboardView('insight')}
                    className="bg-highlight-surface rounded-2xl p-5 text-highlight-foreground cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full bg-highlight/20 flex items-center justify-center mb-3">
                      <CircleDot className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <p className="text-xl font-semibold mb-5">
                      Users aren't returning as often, fewer complete the first key action, and more exit at checkout, indicating blockers in onboarding and purchase steps.
                    </p>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-highlight/20 rounded-full text-sm font-semibold">
                        Semi structured interviews
                      </span>
                      <div className="flex -space-x-2">
                        <div className="w-5.5 h-5.5 rounded-full bg-highlight/30" />
                        <div className="w-5.5 h-5.5 rounded-full bg-highlight/40" />
                        <div className="w-5.5 h-5.5 rounded-full bg-highlight/50" />
                      </div>
                      <span className="text-sm text-highlight-foreground/70 font-medium">+41</span>
                    </div>
                  </div>

                  {/* Suggested Task Card */}
                  <div 
                    onClick={() => setDashboardView('task')}
                    className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                      <FileText className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Suggested task</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Review today's drop in step-two activation.
                    </h3>
                    <div className="gap-1.5 mt-auto pb-0 text-muted-foreground flex items-end justify-start">
                      <Link2 className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Select data source</span>
                      <span className="text-sm font-medium">›</span>
                    </div>
                  </div>

                  {/* Connected Sources Card */}
                  <div 
                    onClick={() => setDashboardView('sources')}
                    className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                      <Link2 className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Connected sources</span>
                    </div>
                    <div className="space-y-2.5 flex-1 max-h-32 overflow-y-auto">
                      {connectedSources.slice(0, 5).map(source => (
                        <div key={source.name} className="flex items-center gap-2.5">
                          <span className="text-base">{source.icon}</span>
                          <span className="text-foreground font-medium truncate">{source.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="relative mt-auto pb-0" onClick={(e) => e.stopPropagation()}>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground stroke-[2.5]" />
                      <input 
                        type="text" 
                        placeholder="Search for documents" 
                        className="w-full bg-muted/50 rounded-full pl-9 pr-3.5 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none font-medium" 
                      />
                    </div>
                  </div>

                  {/* Suggested Prompt Card */}
                  <div 
                    onClick={() => setDashboardView('prompt')}
                    className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                      <Code2 className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Suggested prompt</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      What's driving this month's performance changes?
                    </h3>
                    <div className="flex items-center gap-1.5 mt-auto pb-0 text-muted-foreground py-0 pt-[130px]">
                      <Link2 className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Select data source</span>
                      <span className="text-xs font-medium">›</span>
                    </div>
                  </div>

                  {/* Recently Uploaded Card */}
                  <div 
                    onClick={() => setDashboardView('recent')}
                    className="insight-card flex flex-col cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-2.5">
                      <FileUp className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Recently uploaded</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Which emerging patterns matter for our next release?
                    </h3>
                    <div className="flex items-center gap-1.5 mt-auto pb-0 text-muted-foreground">
                      <span>📕</span>
                      <span className="text-sm">E-commerce Trends_2025  ›</span>
                    </div>
                  </div>

                  {/* Active Agents Card */}
                  <div 
                    onClick={() => setDashboardView('agents')}
                    className="insight-card cursor-pointer hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
                      <Bot className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-sm font-medium">Active Agents</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {activeAgents.map(agent => {
                        const Icon = agent.icon;
                        return (
                          <div 
                            key={agent.name} 
                            className="flex items-center gap-1.5 bg-muted/50 rounded-xl text-sm text-foreground font-medium py-[28px] px-[10px]"
                          >
                            <Icon className="w-4 h-4 text-muted-foreground stroke-[2.5]" />
                            <span>{agent.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Edit Agent Modal */}
      <EditAgentModal
        agent={editingAgent}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
