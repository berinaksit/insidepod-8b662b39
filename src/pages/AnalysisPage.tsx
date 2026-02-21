import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  TrendingDown, 
  Users, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Beaker,
  BarChart3,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Headphones,
  Activity,
  Smartphone,
  Monitor,
  Globe,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, documents } = location.state || { query: '', documents: [] };

  // Section animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.08 }
    })
  };

  // Evidence Map data
  const evidenceCards = [
    {
      claim: 'Step 2 profile setup has 23% lower completion than Step 1',
      sourceType: 'Product Analytics',
      sourceCount: 1,
      snippet: '"Profile setup shows consistent 23% drop-off across all cohorts"',
      segment: 'All users, last 30 days',
      icon: BarChart3
    },
    {
      claim: '67% of churned users cite "too many required fields" in exit surveys',
      sourceType: 'User Interviews',
      sourceCount: 12,
      snippet: '"I just wanted to try the product, not fill out my life story"',
      segment: 'Churned users within first week',
      icon: MessageSquare
    },
    {
      claim: 'Mobile users abandon 2.1x more than desktop at profile step',
      sourceType: 'Session Recordings',
      sourceCount: 48,
      snippet: 'Mobile form scrolling causes field visibility issues',
      segment: 'Mobile users (iOS + Android)',
      icon: Smartphone
    },
    {
      claim: 'Support tickets mentioning "onboarding" up 34% MoM',
      sourceType: 'Support Tickets',
      sourceCount: 89,
      snippet: '"How do I skip the profile setup?" appears in 41% of tickets',
      segment: 'All support channels',
      icon: Headphones
    },
    {
      claim: 'Contradictions: Power users report onboarding is "too basic"',
      sourceType: 'NPS Feedback',
      sourceCount: 8,
      snippet: '"I wish there were more customization options upfront"',
      segment: 'Users with 10+ sessions, Enterprise tier',
      icon: AlertTriangle,
      isContradiction: true
    }
  ];

  // Causal Hypotheses
  const hypotheses = [
    {
      hypothesis: 'If we reduce required fields from 8 to 3, then Step 2 completion improves by 15-25%, because cognitive load and time-to-value decrease.',
      falsification: 'If completion stays flat after field reduction, the issue is elsewhere (e.g., value prop unclear).',
      missingData: 'A/B test data on minimal vs. full profile forms; field-by-field abandonment rates.'
    },
    {
      hypothesis: 'If we add a progress indicator, then perceived effort decreases and completion improves 5-10%, because users can anticipate the end.',
      falsification: 'If users still drop off at the same rate with progress visible, perceived length isn\'t the issue.',
      missingData: 'Session recordings showing user reactions to progress; eye-tracking on step indicators.'
    },
    {
      hypothesis: 'If we allow "skip for now" on non-critical fields, then completion improves 20-30%, because users prefer gradual disclosure.',
      falsification: 'If skip usage is low (<10%), users don\'t perceive fields as blockers.',
      missingData: 'Profile completion rates over time for users who skip vs. complete upfront.'
    },
    {
      hypothesis: 'If we optimize mobile form layout (single column, larger inputs), then mobile completion parity with desktop is achievable, because current layout causes input errors.',
      falsification: 'If mobile abandonment persists post-optimization, the issue is deeper (e.g., mobile intent differs).',
      missingData: 'Device-specific error rates; tap-target analysis.'
    }
  ];

  // Segmentation Findings
  const segmentationData = [
    { segment: 'New vs Returning', finding: 'New users: 54% completion. Returning: 78% completion. Gap = 24pp.', icon: Users, hasData: true },
    { segment: 'Device', finding: 'Desktop: 68%. Mobile: 32%. Tablet: 61%.', icon: Monitor, hasData: true },
    { segment: 'Acquisition Source', finding: 'Organic: 71%. Paid Social: 48%. Referral: 82%.', icon: Globe, hasData: true },
    { segment: 'Plan Tier', finding: 'Free trial: 51%. Pro: 74%. Enterprise: 89%.', icon: Layers, hasData: true },
    { segment: 'Geography', finding: 'Cannot segment: geo field not captured in analytics.', icon: Globe, hasData: false, recommended: 'Add country/region to user properties.' },
    { segment: 'Behavioral Segment', finding: 'Cannot segment: intent scoring not implemented.', icon: Activity, hasData: false, recommended: 'Implement high-intent vs. browsing classification based on referrer + time-on-site.' }
  ];

  // Opportunity Sizing
  const opportunitySizing = {
    metric: 'Step 2 Completion Rate → Activated Users',
    baseline: '54%',
    targetDelta: '+18-25pp',
    confidenceBand: '70% confidence',
    expectedBenefit: '2,400-3,300 additional activated users/month',
    assumptions: [
      'Current monthly traffic to Step 2: 13,200 users',
      'Activation = completing Step 3 within 7 days',
      'No change to acquisition volume or quality'
    ],
    costRisk: 'Low engineering cost (2-3 sprints). Risk: power users may feel rushed.',
    timeToImpact: '4-6 weeks to full rollout + measurement'
  };

  // Decision Options
  const decisionOptions = [
    {
      label: 'A',
      title: 'Minimal Change (Fast)',
      description: 'Reduce required fields to 3, add "complete later" prompts.',
      expectedImpact: '+10-15pp completion',
      dependencies: 'None',
      risks: 'Incomplete profiles may affect personalization downstream.',
      timeToImplement: 'S (1 sprint)',
      owners: ['Product', 'Engineering']
    },
    {
      label: 'B',
      title: 'Structural Fix (Robust)',
      description: 'Redesign onboarding as progressive disclosure: collect only email upfront, prompt for profile data contextually over first week.',
      expectedImpact: '+20-30pp completion',
      dependencies: 'Requires lifecycle email system; analytics instrumentation.',
      risks: 'Longer time to complete profiles; possible data quality issues.',
      timeToImplement: 'M (2-3 sprints)',
      owners: ['Product', 'Design', 'Engineering', 'Data']
    },
    {
      label: 'C',
      title: 'Product Bet (Bigger)',
      description: 'Introduce AI-powered onboarding that auto-fills profile from LinkedIn/email domain, with user confirmation.',
      expectedImpact: '+30-40pp completion (hypothesis)',
      dependencies: 'LinkedIn OAuth; enrichment API; privacy review.',
      risks: 'Privacy concerns; API costs; accuracy of enrichment.',
      timeToImplement: 'L (1 quarter)',
      owners: ['Product', 'Engineering', 'Legal', 'Security']
    }
  ];

  // Action Plan
  const actionPlan = {
    instrumentation: [
      { action: 'Add field-by-field timing events', owner: 'Engineering', time: 'S', metric: 'Time per field tracked' },
      { action: 'Implement device + geo segmentation', owner: 'Data', time: 'S', metric: 'Segments visible in dashboard' }
    ],
    research: [
      { action: 'Run 5 moderated usability tests on mobile onboarding', owner: 'Research', time: 'M', metric: 'Usability issues documented' },
      { action: 'Analyze exit survey free-text for new themes', owner: 'Research', time: 'S', metric: 'Theme report delivered' }
    ],
    experiments: [
      { action: 'A/B test 3-field vs. 8-field form', owner: 'Product', time: 'M', metric: 'Completion rate delta' },
      { action: 'Test progress indicator variant', owner: 'Product', time: 'S', metric: 'Completion rate delta' }
    ],
    rollout: [
      { action: 'Staged rollout to 10% → 50% → 100%', owner: 'Engineering', time: 'M', metric: 'No regression in activation' }
    ],
    monitoring: [
      { action: 'Weekly review of completion + activation metrics', owner: 'Data', time: 'Ongoing', metric: 'Dashboard review cadence' },
      { action: 'Alert on >5% drop in completion', owner: 'Engineering', time: 'S', metric: 'Alert configured' }
    ]
  };

  // Confidence & Gaps
  const confidenceData = {
    level: 'Medium',
    reasoning: 'Strong qualitative signal (12 interviews, 89 tickets) but limited quantitative experimentation. Mobile-specific data is observational, not causal.',
    missingInputs: [
      'A/B test results on reduced fields (would move to High confidence)',
      'Field-by-field timing data (would pinpoint exact friction points)',
      'Geographic segmentation (would reveal if issue is global or localized)'
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Page header */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground leading-tight">
            {query || 'Analysis Results'}
          </h1>
          {documents.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">
                Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </motion.div>

        {/* 1. Executive Diagnosis */}
        <motion.section
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            Executive Diagnosis
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Failure Point</span>
              <p className="text-lg font-semibold text-foreground mt-1">Step 2 (Profile Setup) on the onboarding flow</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mechanism</span>
              <p className="text-foreground mt-1">Users abandon because the 8-field required form creates high cognitive load and unclear value exchange. Mobile users face additional friction from poor form layout.</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impacted Segment</span>
                <p className="text-foreground mt-1">New users, mobile users, paid social acquisition</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</span>
                <p className="text-foreground mt-1 flex items-center gap-2">
                  <span className="text-destructive font-semibold">-23% completion rate</span>
                  <span className="text-muted-foreground text-sm">(~6,000 lost activations/month)</span>
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. Evidence Map */}
        <motion.section
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            Evidence Map
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {evidenceCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`bg-card rounded-2xl p-5 border ${card.isContradiction ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.isContradiction ? 'bg-amber-500/10' : 'bg-secondary/10'}`}>
                      <Icon className={`w-4 h-4 ${card.isContradiction ? 'text-amber-600' : 'text-secondary'}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="font-semibold text-foreground text-sm leading-snug">{card.claim}</p>
                      <p className="text-sm text-muted-foreground italic">"{card.snippet}"</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {card.sourceType} ({card.sourceCount})
                        </Badge>
                        <span className="text-xs text-muted-foreground">{card.segment}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* 3. Causal Hypotheses */}
        <motion.section
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Beaker className="w-4 h-4" strokeWidth={1.5} />
            Causal Hypotheses
          </h2>
          <div className="space-y-4">
            {hypotheses.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-foreground font-medium leading-relaxed">{h.hypothesis}</p>
                  </div>
                  <div className="ml-9 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-accent-foreground mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Falsification:</span> {h.falsification}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                      <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground/80">Missing data:</span> {h.missingData}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. Segmentation Findings */}
        <motion.section
          custom={4}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4" strokeWidth={1.5} />
            Segmentation Findings
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {segmentationData.map((seg, i) => {
                const Icon = seg.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${seg.hasData ? 'bg-secondary/10' : 'bg-muted/50'}`}>
                      <Icon className={`w-4 h-4 ${seg.hasData ? 'text-secondary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{seg.segment}</p>
                      <p className={`text-sm mt-0.5 ${seg.hasData ? 'text-muted-foreground' : 'text-destructive'}`}>{seg.finding}</p>
                      {seg.recommended && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" strokeWidth={2} />
                          Recommended: {seg.recommended}
                        </p>
                      )}
                    </div>
                    {seg.hasData && <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={2} />}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* 5. Opportunity Sizing */}
        <motion.section
          custom={5}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4" strokeWidth={1.5} />
            Opportunity Sizing
          </h2>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Baseline</p>
                <p className="text-3xl font-display font-bold text-foreground">{opportunitySizing.baseline}</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Target Delta</p>
                <p className="text-3xl font-display font-bold text-primary">{opportunitySizing.targetDelta}</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</p>
                <p className="text-3xl font-display font-bold text-foreground">{opportunitySizing.confidenceBand}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Expected Benefit</p>
                <p className="text-lg text-primary font-medium">{opportunitySizing.expectedBenefit}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Assumptions</p>
                <ul className="space-y-1">
                  {opportunitySizing.assumptions.map((a, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-muted-foreground/50">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-6 pt-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost/Risk</p>
                  <p className="text-sm text-foreground mt-0.5">{opportunitySizing.costRisk}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time to Impact</p>
                  <p className="text-sm text-foreground mt-0.5">{opportunitySizing.timeToImpact}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 6. Decision Options */}
        <motion.section
          custom={6}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            Decision Options
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {decisionOptions.map((option, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {option.label}
                  </span>
                  <Badge variant="outline" className="text-xs">{option.timeToImplement}</Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{option.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium text-foreground">Impact:</span>
                    <span className="text-primary ml-1">{option.expectedImpact}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Dependencies:</span>
                    <span className="text-muted-foreground ml-1">{option.dependencies}</span>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Risks:</span>
                    <span className="text-muted-foreground ml-1">{option.risks}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {option.owners.map((owner, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">{owner}</Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. Action Plan */}
        <motion.section
          custom={7}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
            Action Plan
          </h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {Object.entries(actionPlan).map(([category, actions], catIndex) => (
              <div key={category}>
                <div className="bg-muted/30 px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground capitalize">{category}</h3>
                </div>
                <div className="divide-y divide-border">
                  {actions.map((action, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{action.action}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">{action.owner}</Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" strokeWidth={2} />
                          {action.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 8. Confidence & Gaps */}
        <motion.section
          custom={8}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="space-y-4 pb-10"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
            Confidence & Gaps
          </h2>
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                confidenceData.level === 'High' ? 'bg-secondary/10 text-secondary' :
                confidenceData.level === 'Medium' ? 'bg-accent text-accent-foreground' :
                'bg-destructive/10 text-destructive'
              }`}>
                {confidenceData.level} Confidence
              </div>
            </div>
            <p className="text-muted-foreground mb-4">{confidenceData.reasoning}</p>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Top Missing Inputs</p>
              <ul className="space-y-2">
                {confidenceData.missingInputs.map((input, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" strokeWidth={2} />
                    {input}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
