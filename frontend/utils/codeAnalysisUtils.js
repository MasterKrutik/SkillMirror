// Code Analysis Utility Functions

export const getScoreColor = (score) => {
  if (score >= 85) return { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500' };
  if (score >= 70) return { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-500' };
  if (score >= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-500' };
  return { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-500' };
};

export const getVerdictDetails = (verdict) => {
  const details = {
    PASS: {
      icon: '✓',
      title: 'Excellent Solution!',
      color: 'text-green-600',
      message: 'Your solution is correct and well-implemented. Keep up the great work!'
    },
    PARTIAL: {
      icon: '⚠',
      title: 'Good Progress!',
      color: 'text-blue-600',
      message: 'Your solution works but has room for improvement. Check the suggestions below.'
    },
    NEEDS_WORK: {
      icon: '✗',
      title: 'More Work Needed',
      color: 'text-red-600',
      message: 'Your solution needs revision. Review the feedback and try again.'
    }
  };
  return details[verdict] || details.NEEDS_WORK;
};

export const formatCodeSnippet = (code) => {
  // Limit snippet length and format nicely
  const lines = code.split('\n');
  const truncated = lines.length > 10 ? lines.slice(0, 10).join('\n') + '\n...' : code;
  return truncated;
};

export const languageIcons = {
  javascript: '⚡',
  python: '🐍',
  java: '☕',
  cpp: '⚙️',
  'c++': '⚙️',
  csharp: '#',
  'c#': '#',
  typescript: '📘',
  go: '🐹',
  rust: '🦀',
  sql: '🗄️',
  default: '💻'
};

export const getLanguageIcon = (language) => {
  return languageIcons[language?.toLowerCase()] || languageIcons.default;
};

export const calculateDifficultyMultiplier = (difficulty) => {
  const multipliers = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  return multipliers[difficulty?.toLowerCase()] || 1;
};

export const generatePointsReward = (score, difficulty) => {
  const basePoints = 10;
  const diffMultiplier = calculateDifficultyMultiplier(difficulty);
  const scoreMultiplier = score / 100;
  return Math.round(basePoints * diffMultiplier * scoreMultiplier);
};

export async function analyzeCode(code, problemTitle, problemDescription, language = 'javascript', difficulty = 'medium') {
  try {
    const response = await fetch('/api/code-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        problemTitle,
        problemDescription,
        language,
        difficulty
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Analysis failed');
    }

    return {
      success: true,
      analysis: data.analysis,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Code analysis call failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze code. Please try again.',
      analysis: null
    };
  }
}

export const formatAnalysisForDisplay = (analysis) => {
  // Format the analysis response for better display
  return {
    ...analysis,
    improvements: analysis.improvements || [],
    learningPoints: analysis.learningPoints || [],
    nextSteps: analysis.nextSteps || []
  };
};

export const exportAnalysisAsMarkdown = (analysis, problemTitle) => {
  let markdown = `# Code Analysis Report: ${problemTitle}\n\n`;
  markdown += `**Score:** ${analysis.score}/100\n`;
  markdown += `**Verdict:** ${analysis.verdict}\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  
  markdown += `## Summary\n${analysis.summary}\n\n`;
  
  if (analysis.correctness) {
    markdown += `## Correctness\n${analysis.correctness.feedback}\n\n`;
  }
  
  if (analysis.efficiency) {
    markdown += `## Efficiency\n`;
    markdown += `- **Time Complexity:** ${analysis.efficiency.timeComplexity}\n`;
    markdown += `- **Space Complexity:** ${analysis.efficiency.spaceComplexity}\n`;
    markdown += `${analysis.efficiency.suggestions}\n\n`;
  }
  
  if (analysis.learningPoints && analysis.learningPoints.length > 0) {
    markdown += `## Learning Points\n`;
    analysis.learningPoints.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += '\n';
  }
  
  if (analysis.nextSteps && analysis.nextSteps.length > 0) {
    markdown += `## Next Steps\n`;
    analysis.nextSteps.forEach(step => {
      markdown += `- ${step}\n`;
    });
  }
  
  return markdown;
};
