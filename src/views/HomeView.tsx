import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { GoalCard } from '@/components/GoalCard';
import { AgentsList } from '@/components/AgentsList';
import { EmptyState } from '@/components/EmptyState';
import { EditAgentModal } from '@/components/EditAgentModal';
import { mockInsights } from '@/data/mockData';
import { useDocuments } from '@/contexts/DocumentsContext';
import { Agent } from '@/types';
import { Sparkles, Target, Bot, Plus, LayoutDashboard, CircleDot, FileText, Link2, Code2, FileUp, Scan, Calendar, Activity, MessageSquare, TrendingUp, MonitorCheck, Search, RefreshCw, Upload } from 'lucide-react';
import { View } from '@/pages/Index';

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
  
  const { 
    hasDocuments, 
    hasAgents, 
    generatedInsights, 
    agents,
    openUploadModal,
    documents,
    goals
  } = useDocuments();

  const allInsights = [...generatedInsights, ...mockInsights];

  const handleAgentClick = (agent: Agent) => {
    setEditingAgent(agent);
    setEditModalOpen(true);
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
      color: 'text-muted-foreground'
    })),
    {
      name: 'Salesforce CRM Data',
      icon: '☁️',
      color: 'text-muted-foreground'
    },
    {
      name: 'Drive User Interviews',
      icon: '📁',
      color: 'text-muted-foreground'
    },
    {
      name: 'Meeting transcript Sales 2025',
      icon: '📄',
      color: 'text-muted-foreground'
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
      return (
        <div className="space-y-8">
          <EmptyState
            icon={Bot}
            title="Create an agent to generate insights"
            description="You have documents uploaded. Create an agent to analyze them and surface insights."
            action={{
              label: "Create Agent",
              onClick: () => onTabChange('create-agent')
            }}
          />
          <div className="card-grid md:grid-cols-2 lg:grid-cols-3">
            {mockInsights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} onClick={() => {}} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="card-grid md:grid-cols-2 lg:grid-cols-3">
        {allInsights.map((insight, index) => (
          <InsightCard key={insight.id} insight={insight} index={index} onClick={() => {}} />
        ))}
      </div>
    );
  };

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">AI agents continuously monitoring your product signals</p>
          <button 
            onClick={() => onTabChange('create-agent')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
        
        {/* Summary cards */}
        <div className="card-grid md:grid-cols-3">
          <div className="insight-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Bot className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground tracking-tight">{agents.filter(a => a.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active agents</p>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <FileUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground tracking-tight">
                  {agents.reduce((sum, a) => sum + a.outputCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total outputs</p>
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-highlight-surface flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-highlight-foreground" />
              </div>
              <div>
                <p className="text-3xl font-semibold text-foreground tracking-tight">
                  {agents.filter(a => a.status === 'running' && a.isActive).length}
                </p>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <AgentsList agents={agents} onAgentClick={handleAgentClick} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full">
      {/* Hero section with generous spacing */}
      <motion.section 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }} 
        className="px-6 lg:px-8 py-16 md:py-20"
      >
        <div className="max-w-2xl mx-auto text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }} 
            className="text-foreground mb-4"
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

      {/* Tabs with refined spacing */}
      <section className="px-6 lg:px-8 pb-16">
        <div className="flex items-center gap-6 mb-8 border-b border-border">
          {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => onTabChange(tab.id)} 
                className={`flex items-center gap-2 pb-4 border-b-2 -mb-px transition-colors ${
                  isActive 
                    ? 'border-foreground text-foreground' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'home' && allInsights.filter(i => i.isNew).length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    {allInsights.filter(i => i.isNew).length}
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
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {renderInsightsContent()}
            </motion.div>
          )}

          {currentTab === 'goals' && (
            <motion.div 
              key="goals" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">Track progress toward your product objectives</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
              <div className="card-grid md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal, index) => (
                  <GoalCard key={goal.id} goal={goal} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {currentTab === 'agents' && (
            <motion.div 
              key="agents" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {renderAgentsContent()}
            </motion.div>
          )}

          {currentTab === 'dashboard' && (
            <motion.div 
              key="dashboard" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="card-grid md:grid-cols-2 lg:grid-cols-3">
                {/* Featured Insight Card */}
                <div className="bg-primary-surface rounded-2xl p-6 text-primary-surface-foreground">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <CircleDot className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-medium mb-6 leading-relaxed">
                    Users aren't returning as often, fewer complete the first key action, and more exit at checkout.
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium">
                      Semi structured interviews
                    </span>
                    <span className="text-sm opacity-70">+41 sources</span>
                  </div>
                </div>

                {/* Suggested Task Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Suggested task</span>
                  </div>
                  <h3 className="text-foreground mb-auto">
                    Review today's drop in step-two activation.
                  </h3>
                  <div className="flex items-center gap-2 mt-6 text-muted-foreground">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Select data source ›</span>
                  </div>
                </div>

                {/* Connected Sources Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Connected sources</span>
                  </div>
                  <div className="space-y-3 flex-1 max-h-36 overflow-y-auto">
                    {connectedSources.slice(0, 4).map(source => (
                      <div key={source.name} className="flex items-center gap-3">
                        <span className="text-base">{source.icon}</span>
                        <span className="text-foreground text-sm truncate">{source.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      placeholder="Search documents" 
                      className="w-full bg-muted/50 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Suggested Prompt Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <Code2 className="w-4 h-4" />
                    <span className="text-sm">Suggested prompt</span>
                  </div>
                  <h3 className="text-foreground mb-auto">
                    What's driving this month's performance changes?
                  </h3>
                  <div className="flex items-center gap-2 mt-6 text-muted-foreground">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm">Select data source ›</span>
                  </div>
                </div>

                {/* Recently Uploaded Card */}
                <div className="insight-card flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <FileUp className="w-4 h-4" />
                    <span className="text-sm">Recently uploaded</span>
                  </div>
                  <h3 className="text-foreground mb-auto">
                    Which emerging patterns matter for our next release?
                  </h3>
                  <div className="flex items-center gap-2 mt-6 text-muted-foreground">
                    <span>📕</span>
                    <span className="text-sm">E-commerce Trends 2025 ›</span>
                  </div>
                </div>

                {/* Active Agents Card */}
                <div className="insight-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm">Active Agents</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {activeAgents.slice(0, 6).map((agent) => {
                      const AgentIcon = agent.icon;
                      return (
                        <div 
                          key={agent.name} 
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <AgentIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground truncate">{agent.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <EditAgentModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
        agent={editingAgent}
      />
    </div>
  );
}
