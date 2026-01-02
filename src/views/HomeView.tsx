import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { GoalCard } from '@/components/GoalCard';
import { AgentsList } from '@/components/AgentsList';
import { mockInsights, mockAnalysisViews, mockGoals, mockAgents } from '@/data/mockData';
import { AnalysisView } from '@/types';
import { Sparkles, Target, Bot, Plus, Play } from 'lucide-react';
import { View } from '@/pages/Index';

interface HomeViewProps {
  currentTab: View;
  onTabChange: (tab: View) => void;
}

export function HomeView({ currentTab, onTabChange }: HomeViewProps) {
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

  const tabs = [
    { id: 'home' as View, label: "Today's Insights", icon: Sparkles },
    { id: 'goals' as View, label: 'Goals', icon: Target },
    { id: 'agents' as View, label: 'Agents', icon: Bot },
  ];

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
            {greeting()}
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
          <SearchBar onSearch={handleSearch} isProcessing={isSearching} />
        </motion.div>
      </motion.section>

      {/* Active Analysis Panel */}
      <AnimatePresence>
        {activeAnalysis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 pb-8"
          >
            <AnalysisPanel analysis={activeAnalysis} onClose={() => setActiveAnalysis(null)} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <section className="px-6 pb-12">
        <div className="flex items-center gap-4 mb-6 border-b border-border/50">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
                {tab.id === 'home' && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full">
                    {mockInsights.filter(i => i.isNew).length} new
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
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {mockInsights.map((insight, index) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  index={index}
                  onClick={() => handleSearch(insight.title)}
                />
              ))}
            </motion.div>
          )}

          {currentTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">Track progress toward your product objectives</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockGoals.map((goal, index) => (
                  <GoalCard key={goal.id} goal={goal} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {currentTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}