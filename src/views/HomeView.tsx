import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard } from '@/components/InsightCard';
import { SearchBar } from '@/components/SearchBar';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import { mockInsights, mockAnalysisViews } from '@/data/mockData';
import { AnalysisView } from '@/types';
import { Sparkles } from 'lucide-react';
export function HomeView() {
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisView | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const handleSearch = async (query: string) => {
    setIsSearching(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo, use the mock analysis view
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
            {greeting()}
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

      {/* Insights Grid */}
      <section className="px-6 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary bg-primary" />
          <h2 className="text-lg font-medium text-foreground">Today's Insights</h2>
          <span className="ml-2 px-2 py-0.5 text-xs bg-secondary/10 text-secondary rounded-full">
            {mockInsights.filter(i => i.isNew).length} new
          </span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} index={index} onClick={() => {
          // Trigger analysis for this insight
          handleSearch(insight.title);
        }} />)}
        </div>
      </section>
    </div>;
}