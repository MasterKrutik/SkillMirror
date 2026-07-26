const fs = require('fs');
const path = require('path');

const ROLE_FILE_MAP = {
  'Software Engineer': 'software-engineer.json',
  'Frontend Engineer': 'frontend-engineer.json',
  'Backend Engineer': 'backend-engineer.json',
  'Full-Stack Engineer': 'full-stack-engineer.json',
  'DevOps / SRE': 'devops-sre.json',
  'Mobile Engineer': 'mobile-engineer.json',
  'Machine Learning Engineer': 'machine-learning-engineer.json',
  'Data Analyst': 'data-analyst.json',
  'Data Scientist': 'data-scientist.json',
  'Data Engineer': 'data-engineer.json',
  'Product Manager': 'product-manager.json',
  'UX/UI Designer': 'ux-ui-designer.json',
  'Business Analyst': 'business-analyst.json',
  'Consulting / Case Interview': 'consulting-case.json',
  'General Behavioral': 'general-behavioral.json'
};

const ROLE_METADATA = {
  'Software Engineer': {
    label: 'Software Engineer',
    focusAreas: ['System Design & Architecture', 'Data Structures & Algorithms', 'Databases & ACID', 'Networking & Protocols'],
    questionStyleHint: 'Favor practical system design trade-offs, algorithmic complexity, and scalable data structure choices.',
    defaultTopics: ['System Design', 'Algorithms', 'Data Structures', 'Databases', 'Networking']
  },
  'Frontend Engineer': {
    label: 'Frontend Engineer',
    focusAreas: ['Virtual DOM Diffing', 'Core Web Vitals (LCP, INP)', 'State Management (Context, Zustand)', 'Web Accessibility (WCAG)'],
    questionStyleHint: 'Focus on UI architecture, asset loading optimization, component re-render performance, and cross-browser state integrity.',
    defaultTopics: ['UI Architecture', 'Core Web Vitals', 'State Management', 'Web Performance', 'Accessibility']
  },
  'Backend Engineer': {
    label: 'Backend Engineer',
    focusAreas: ['gRPC & REST Endpoints', 'Database Indexing (B-Trees vs LSM)', 'Distributed Locks (Redis/Zookeeper)', 'Concurrency & Thread Pools'],
    questionStyleHint: 'Emphasize microservice communication protocols, database query execution plans, deadlock prevention, and thread pool scaling.',
    defaultTopics: ['API Protocols', 'Database Indexing', 'Distributed Systems', 'Concurrency', 'Security']
  },
  'Full-Stack Engineer': {
    label: 'Full-Stack Engineer',
    focusAreas: ['End-to-End JWT Auth', 'SSR & Client Hydration', 'API Integration & Middleware', 'DB Schema Migrations'],
    questionStyleHint: 'Focus on client-to-server data flow, server-side rendering, hydration error resolution, and full-stack security patterns.',
    defaultTopics: ['Full-Stack Auth', 'SSR & Hydration', 'API Middleware', 'Schema Migrations', 'System Security']
  },
  'DevOps / SRE': {
    label: 'DevOps / SRE',
    focusAreas: ['SLOs & Error Budgets', 'Kubernetes Architecture', 'CI/CD Pipelines & Blue/Green Deployments', 'Infrastructure as Code (Terraform)'],
    questionStyleHint: 'Focus on incident response protocols, container orchestration, automated canary deployments, and system observability.',
    defaultTopics: ['SLOs & Reliability', 'Kubernetes Orchestration', 'CI/CD Automation', 'IaC Terraform', 'Observability']
  },
  'Mobile Engineer': {
    label: 'Mobile Engineer',
    focusAreas: ['MVVM & Clean Architecture', 'Memory Leaks & Profiling', 'Offline-First Data Sync', 'Native Bridge & Performance'],
    questionStyleHint: 'Prioritize mobile UI lifecycle events, memory retention cycles, background synchronization, and frame-rate optimization.',
    defaultTopics: ['Mobile Architecture', 'Memory Profiling', 'Offline Sync', 'Native Bridges', 'App Security']
  },
  'Machine Learning Engineer': {
    label: 'Machine Learning Engineer',
    focusAreas: ['Model Data & Concept Drift', 'LLM Quantization & Pruning', 'Feature Stores & Batch vs Real-Time', 'Inference Latency Optimization'],
    questionStyleHint: 'Emphasize production MLOps pipelines, continuous model evaluation, GPU memory constraints, and model compression techniques.',
    defaultTopics: ['ML Pipelines & MLOps', 'Model Compression', 'Feature Engineering', 'Inference Optimization', 'Model Monitoring']
  },
  'Data Analyst': {
    label: 'Data Analyst',
    focusAreas: ['SQL Window Functions', 'A/B Testing & Hypothesis Testing', 'Cohort & Funnel Analysis', 'Executive Dashboard KPI Modeling'],
    questionStyleHint: 'Focus on complex analytical SQL formulations, statistical hypothesis rigor, and business funnel diagnostic metrics.',
    defaultTopics: ['SQL Analytics', 'A/B Test Design', 'Cohort Analysis', 'KPI Modeling', 'Data Storytelling']
  },
  'Data Scientist': {
    label: 'Data Scientist',
    focusAreas: ['Class Imbalance Strategies', 'CUPED Variance Reduction', 'Feature Engineering & Selection', 'Causal Inference & Propensity Scoring'],
    questionStyleHint: 'Prioritize statistical model evaluation (PR-AUC vs ROC-AUC), experimental design variance reduction, and causal modeling.',
    defaultTopics: ['Predictive Modeling', 'Variance Reduction', 'Feature Selection', 'Causal Inference', 'Model Evaluation']
  },
  'Data Engineer': {
    label: 'Data Engineer',
    focusAreas: ['Spark DAG vs Flink Streaming', 'Star vs Snowflake Schemas', 'Kafka Partition Topologies', 'Data Lakehouse Architecture (Delta/Iceberg)'],
    questionStyleHint: 'Emphasize distributed data batch and stream processing, Lakehouse storage formats, partitioning strategies, and pipeline idempotency.',
    defaultTopics: ['Distributed Processing', 'Data Warehousing', 'Event Streaming', 'Lakehouse Formats', 'Pipeline Orchestration']
  },
  'Product Manager': {
    label: 'Product Manager',
    focusAreas: ['RICE Prioritization Frameworks', 'DAU Metric Drop Investigations', 'PRD & Feature Scoping', 'Go-To-Market & Tradeoffs'],
    questionStyleHint: 'Focus on strategic product prioritization under resource constraints, root-cause metric investigation, and user value trade-offs.',
    defaultTopics: ['Feature Prioritization', 'Metric Root-Cause', 'Product Strategy', 'User Research', 'GTM Execution']
  },
  'UX/UI Designer': {
    label: 'UX/UI Designer',
    focusAreas: ['WCAG 2.1 AA Accessibility', 'Design System Governance & Tokens', 'Usability Testing & Heuristics', 'Information Architecture & Flows'],
    questionStyleHint: 'Emphasize user-centered design principles, accessibility compliance, design token architecture, and iterative usability testing.',
    defaultTopics: ['Design Systems', 'WCAG Accessibility', 'Usability Benchmarking', 'Information Architecture', 'User Flows']
  },
  'Business Analyst': {
    label: 'Business Analyst',
    focusAreas: ['Requirements Elicitation & User Stories', 'Process Mapping (BPMN)', 'Stakeholder Conflict Alignment', 'UML Use Cases & Acceptance Criteria'],
    questionStyleHint: 'Focus on turning ambiguous business requests into rigorous functional specs, process flow diagrams, and measurable acceptance criteria.',
    defaultTopics: ['Requirements Elicitation', 'Process Mapping', 'Stakeholder Alignment', 'Acceptance Criteria', 'Gap Analysis']
  },
  'Consulting / Case Interview': {
    label: 'Consulting / Case Interview',
    focusAreas: ['Profitability Frameworks (Revenue vs Cost)', 'Market Sizing & Estimation', 'Competitive Response & M&A', 'Structure & MECE Synthesis'],
    questionStyleHint: 'Emphasize MECE (Mutually Exclusive, Collectively Exhaustive) problem structuring, quantitative estimation, and executive synthesis.',
    defaultTopics: ['Profitability Frameworks', 'Market Sizing', 'MECE Structuring', 'Competitive Analysis', 'Executive Synthesis']
  },
  'General Behavioral': {
    label: 'General Behavioral',
    focusAreas: ['STAR Method Execution', 'Leadership Under Ambiguity', 'Cross-Functional Conflict Resolution', 'Failure & Retrospective Lessons'],
    questionStyleHint: 'Focus on specific past situations, STAR structure (Situation, Task, Action, Result), personal accountability, and lessons learned.',
    defaultTopics: ['Leadership Under Ambiguity', 'Conflict Resolution', 'Accountability & Ownership', 'STAR Structuring', 'Retrospective Learning']
  }
};

const bankCache = {};

function loadQuestionBank(roleKey) {
  if (bankCache[roleKey]) return bankCache[roleKey];

  const fileName = ROLE_FILE_MAP[roleKey] || 'software-engineer.json';
  const filePath = path.join(__dirname, '../data/questionBanks', fileName);

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const questions = JSON.parse(raw);
      bankCache[roleKey] = questions;
      return questions;
    }
  } catch (err) {
    console.error(`Error loading question bank JSON for ${roleKey}:`, err.message);
  }

  return [];
}

function getRoleProfile(roleFocus) {
  let roleKey = 'Software Engineer';

  if (roleFocus && ROLE_FILE_MAP[roleFocus]) {
    roleKey = roleFocus;
  } else if (roleFocus) {
    const matchedKey = Object.keys(ROLE_FILE_MAP).find(
      k => roleFocus.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(roleFocus.toLowerCase())
    );
    if (matchedKey) roleKey = matchedKey;
  }

  const meta = ROLE_METADATA[roleKey] || ROLE_METADATA['Software Engineer'];
  const questionBank = loadQuestionBank(roleKey);

  return {
    ...meta,
    questionBank
  };
}

module.exports = {
  ROLE_METADATA,
  getRoleProfile,
  loadQuestionBank
};
