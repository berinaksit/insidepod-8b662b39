import { jsPDF } from 'jspdf';
import { Insight } from '@/types';
import { Goal } from '@/components/CreateGoalModal';

interface ExecutiveSummaryData {
  insights: Insight[];
  goals: Goal[];
  documents: { name: string; aiTitle?: string }[];
}

// Generate synthesized content from insights
function synthesizePatterns(insights: Insight[]): string[] {
  const patterns: string[] = [];
  
  // Group insights by priority and type to find patterns
  const highPriorityCount = insights.filter(i => i.priority === 'high').length;
  const adoptionInsights = insights.filter(i => 
    i.synthesis.toLowerCase().includes('adoption') || 
    i.synthesis.toLowerCase().includes('onboarding')
  );
  const engagementInsights = insights.filter(i => 
    i.synthesis.toLowerCase().includes('engagement') || 
    i.synthesis.toLowerCase().includes('retention')
  );
  const enterpriseInsights = insights.filter(i => 
    i.synthesis.toLowerCase().includes('enterprise') || 
    i.synthesis.toLowerCase().includes('bulk')
  );
  
  if (adoptionInsights.length > 0) {
    patterns.push('User onboarding and adoption remain critical focus areas with measurable friction points');
  }
  if (engagementInsights.length > 0) {
    patterns.push('Engagement patterns show segment-specific behaviors requiring targeted intervention');
  }
  if (enterpriseInsights.length > 0) {
    patterns.push('Enterprise customers signal need for advanced workflow capabilities');
  }
  if (highPriorityCount >= 2) {
    patterns.push('Multiple high-priority signals indicate concentrated attention needed on core user journeys');
  }
  
  // Add mobile/integration patterns
  const mobileInsights = insights.filter(i => i.synthesis.toLowerCase().includes('mobile'));
  const integrationInsights = insights.filter(i => i.synthesis.toLowerCase().includes('integration'));
  
  if (mobileInsights.length > 0) {
    patterns.push('Mobile platform performance emerging as growth driver');
  }
  if (integrationInsights.length > 0) {
    patterns.push('Integration ecosystem correlates with account expansion success');
  }
  
  return patterns.slice(0, 5);
}

function synthesizeUserNeeds(insights: Insight[]): string[] {
  const needs: string[] = [];
  
  insights.forEach(insight => {
    const synthesis = insight.synthesis.toLowerCase();
    
    if (synthesis.includes('friction') || synthesis.includes('drop') || synthesis.includes('decline')) {
      needs.push('Users need faster time-to-value with reduced setup complexity');
    }
    if (synthesis.includes('bulk') || synthesis.includes('workflow')) {
      needs.push('Power users require efficient batch operations for scaled workflows');
    }
    if (synthesis.includes('churn') || synthesis.includes('risk')) {
      needs.push('At-risk accounts need proactive intervention before disengagement');
    }
    if (synthesis.includes('mobile')) {
      needs.push('Mobile users expect feature parity with desktop experience');
    }
    if (synthesis.includes('integration')) {
      needs.push('Teams need seamless connectivity with existing tool ecosystems');
    }
  });
  
  // Remove duplicates and limit
  return [...new Set(needs)].slice(0, 5);
}

function synthesizeOpportunities(insights: Insight[]): string[] {
  const opportunities: string[] = [];
  
  insights.forEach(insight => {
    if (insight.synthesis.toLowerCase().includes('up') && insight.synthesis.toLowerCase().includes('%')) {
      opportunities.push('Capitalize on mobile momentum with enhanced mobile-first features');
    }
    if (insight.synthesis.toLowerCase().includes('integration') || insight.synthesis.toLowerCase().includes('expansion')) {
      opportunities.push('Expand integration partnerships to drive account growth');
    }
    if (insight.synthesis.toLowerCase().includes('enterprise')) {
      opportunities.push('Address enterprise feature gaps to unlock larger deal sizes');
    }
  });
  
  if (opportunities.length === 0) {
    opportunities.push('Streamline onboarding to accelerate new user activation');
  }
  
  return [...new Set(opportunities)].slice(0, 3);
}

function synthesizeRisks(insights: Insight[]): string[] {
  const risks: string[] = [];
  
  insights.forEach(insight => {
    if (insight.priority === 'high') {
      if (insight.synthesis.toLowerCase().includes('churn') || insight.synthesis.toLowerCase().includes('decline')) {
        risks.push('Mid-market churn signals require immediate CSM intervention');
      }
      if (insight.synthesis.toLowerCase().includes('onboarding') || insight.synthesis.toLowerCase().includes('completion')) {
        risks.push('Declining onboarding rates threaten new cohort activation');
      }
    }
  });
  
  if (risks.length === 0) {
    risks.push('Monitor engagement metrics for early warning signals');
  }
  
  return [...new Set(risks)].slice(0, 3);
}

function synthesizeGoalAlignment(insights: Insight[], goals: Goal[]): { name: string; status: string; impact: string }[] {
  const alignments: { name: string; status: string; impact: string }[] = [];
  
  goals.forEach(goal => {
    const title = goal.title.toLowerCase();
    let status = 'On Track';
    let impact = '';
    
    // Determine status and impact based on insight patterns
    insights.forEach(insight => {
      const synthesis = insight.synthesis.toLowerCase();
      
      if (title.includes('retention') || title.includes('churn')) {
        if (insight.priority === 'high' && synthesis.includes('churn')) {
          status = 'At Risk';
          impact = 'Churn signals in mid-market segment require intervention to protect retention metrics';
        }
      }
      if (title.includes('onboarding') || title.includes('activation')) {
        if (synthesis.includes('onboarding') && synthesis.includes('decline')) {
          status = 'At Risk';
          impact = 'Onboarding completion decline directly impacts activation goals';
        }
      }
      if (title.includes('growth') || title.includes('expansion')) {
        if (synthesis.includes('integration') || synthesis.includes('expansion')) {
          impact = 'Integration adoption pattern supports expansion strategy';
        }
      }
      if (title.includes('mobile') || title.includes('engagement')) {
        if (synthesis.includes('mobile') && synthesis.includes('up')) {
          impact = 'Mobile engagement growth contributes positively to engagement goals';
        }
      }
    });
    
    if (!impact) {
      impact = `Insights from ${insights.length} signals inform progress on this ${goal.type}`;
    }
    
    alignments.push({
      name: `${goal.title} (${goal.type})`,
      status,
      impact
    });
  });
  
  return alignments.slice(0, 4);
}

function synthesizeActions(insights: Insight[], goals: Goal[]): string[] {
  const actions: string[] = [];
  const goalNames = goals.map(g => g.title).join(', ');
  
  insights.forEach(insight => {
    const synthesis = insight.synthesis.toLowerCase();
    
    if (synthesis.includes('onboarding') || synthesis.includes('completion')) {
      actions.push(`Reduce onboarding friction by implementing quick-start mode${goals.length > 0 ? ` to support ${goals[0]?.title || 'activation goals'}` : ''}`);
    }
    if (synthesis.includes('churn') || synthesis.includes('risk')) {
      actions.push(`Initiate CSM outreach for at-risk accounts within 48 hours${goals.length > 0 ? ` aligned with retention objectives` : ''}`);
    }
    if (synthesis.includes('enterprise') || synthesis.includes('bulk')) {
      actions.push(`Prioritize bulk action capabilities in next sprint${goals.length > 0 ? ` to address enterprise requirements` : ''}`);
    }
    if (synthesis.includes('mobile')) {
      actions.push(`Expand mobile feature set to maintain engagement momentum${goals.length > 0 ? ` supporting platform goals` : ''}`);
    }
    if (synthesis.includes('integration')) {
      actions.push(`Develop integration partnership roadmap to drive account expansion${goals.length > 0 ? ` aligned with growth targets` : ''}`);
    }
  });
  
  return [...new Set(actions)].slice(0, 5);
}

export function generateExecutiveSummaryPDF(data: ExecutiveSummaryData): void {
  const { insights, goals, documents } = data;
  
  // Create PDF in landscape for slide-like appearance
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Colors
  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep blue
  const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate
  const successColor: [number, number, number] = [22, 163, 74]; // Green
  const warningColor: [number, number, number] = [202, 138, 4]; // Amber
  
  let yPos = margin;
  
  // ===== HEADER =====
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(...primaryColor);
  pdf.text('Executive Summary', margin, yPos + 8);
  
  // Date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...secondaryColor);
  pdf.text(currentDate, margin, yPos + 16);
  
  // Context line
  pdf.setFontSize(9);
  pdf.text(`Synthesized from Todays Insights (${insights.length} signals, ${documents.length} sources)`, margin, yPos + 22);
  
  // Divider line
  yPos += 28;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  
  // Calculate column widths (3 columns)
  const colWidth = (contentWidth - 10) / 3;
  const col1X = margin;
  const col2X = margin + colWidth + 5;
  const col3X = margin + (colWidth * 2) + 10;
  
  // ===== COLUMN 1: Patterns + User Needs =====
  let col1Y = yPos;
  
  // Key Patterns & Themes
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.text('Key Patterns & Themes', col1X, col1Y);
  col1Y += 6;
  
  const patterns = synthesizePatterns(insights);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(60, 60, 60);
  
  patterns.forEach(pattern => {
    const lines = pdf.splitTextToSize(`• ${pattern}`, colWidth - 5);
    lines.forEach((line: string) => {
      pdf.text(line, col1X, col1Y);
      col1Y += 4;
    });
    col1Y += 1;
  });
  
  col1Y += 4;
  
  // User Needs & Pain Points
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.text('User Needs & Pain Points', col1X, col1Y);
  col1Y += 6;
  
  const needs = synthesizeUserNeeds(insights);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(60, 60, 60);
  
  needs.forEach(need => {
    const lines = pdf.splitTextToSize(`• ${need}`, colWidth - 5);
    lines.forEach((line: string) => {
      pdf.text(line, col1X, col1Y);
      col1Y += 4;
    });
    col1Y += 1;
  });
  
  // ===== COLUMN 2: Opportunities + Risks =====
  let col2Y = yPos;
  
  // Opportunities
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.text('Opportunities', col2X, col2Y);
  col2Y += 6;
  
  const opportunities = synthesizeOpportunities(insights);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...successColor);
  
  opportunities.forEach(opp => {
    const lines = pdf.splitTextToSize(`+ ${opp}`, colWidth - 5);
    lines.forEach((line: string) => {
      pdf.text(line, col2X, col2Y);
      col2Y += 4;
    });
    col2Y += 1;
  });
  
  col2Y += 4;
  
  // Risks
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.text('Risks', col2X, col2Y);
  col2Y += 6;
  
  const risks = synthesizeRisks(insights);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...warningColor);
  
  risks.forEach(risk => {
    const lines = pdf.splitTextToSize(`! ${risk}`, colWidth - 5);
    lines.forEach((line: string) => {
      pdf.text(line, col2X, col2Y);
      col2Y += 4;
    });
    col2Y += 1;
  });
  
  col2Y += 4;
  
  // Goal Alignment
  if (goals.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryColor);
    pdf.text('Goal Alignment', col2X, col2Y);
    col2Y += 6;
    
    const alignments = synthesizeGoalAlignment(insights, goals);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    alignments.forEach(alignment => {
      // Goal name with status
      const statusColor = alignment.status === 'On Track' ? successColor : warningColor;
      pdf.setTextColor(...statusColor);
      pdf.text(`[${alignment.status}]`, col2X, col2Y);
      pdf.setTextColor(60, 60, 60);
      pdf.text(alignment.name, col2X + 18, col2Y);
      col2Y += 4;
      
      // Impact
      const impactLines = pdf.splitTextToSize(alignment.impact, colWidth - 8);
      pdf.setFontSize(7);
      impactLines.forEach((line: string) => {
        pdf.text(line, col2X + 3, col2Y);
        col2Y += 3.5;
      });
      pdf.setFontSize(8);
      col2Y += 2;
    });
  }
  
  // ===== COLUMN 3: Recommended Actions =====
  let col3Y = yPos;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...primaryColor);
  pdf.text('Recommended Actions', col3X, col3Y);
  col3Y += 6;
  
  const actions = synthesizeActions(insights, goals);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(60, 60, 60);
  
  actions.forEach((action, index) => {
    // Action number
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}.`, col3X, col3Y);
    pdf.setFont('helvetica', 'normal');
    
    const lines = pdf.splitTextToSize(action, colWidth - 8);
    lines.forEach((line: string, lineIndex: number) => {
      pdf.text(line, col3X + 5, col3Y + (lineIndex * 4));
    });
    col3Y += (lines.length * 4) + 3;
  });
  
  // ===== FOOTER =====
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generated by Inside Pod • ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    margin,
    pageHeight - 8
  );
  
  // Save
  const fileName = `Executive_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
