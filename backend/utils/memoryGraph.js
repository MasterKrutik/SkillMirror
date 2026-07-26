/**
 * SkillMirror Topic Memory Graph Engine
 * Dynamically builds prerequisite graph nodes and edges strictly from the current session's actual topics.
 */

const PREREQ_MAP = {
  system_design: ['databases', 'networking', 'caching'],
  databases: ['data_structures'],
  algorithms: ['data_structures'],
  machine_learning: ['algorithms', 'probability'],
  caching: ['data_structures'],
  networking: ['operating_systems', 'security'],
  cloud_architecture: ['networking', 'system_design'],
  devops: ['operating_systems', 'networking'],
  security: ['networking', 'operating_systems'],
  frontend_architecture: ['data_structures', 'networking']
};

function buildSessionMemoryGraph(sessionTopicMap = {}) {
  // sessionTopicMap is an object: { topicId: { scores: number[], deliveryScores: number[] } }
  const sessionTopics = Object.keys(sessionTopicMap);

  if (sessionTopics.length === 0) {
    return {
      nodes: [],
      edges: [],
      note: 'No topics answered in this session.'
    };
  }

  const nodes = sessionTopics.map((tId) => {
    const data = sessionTopicMap[tId] || { scores: [60], deliveryScores: [60] };
    const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / (data.scores.length || 1));
    const avgDelivery = Math.round(data.deliveryScores.reduce((a, b) => a + b, 0) / (data.deliveryScores.length || 1));

    return {
      id: tId,
      label: tId.replace(/_/g, ' ').toUpperCase(),
      score: avgScore,
      deliveryScore: avgDelivery
    };
  });

  const edges = [];
  const sessionTopicSet = new Set(sessionTopics);

  sessionTopics.forEach((depTopic) => {
    const prereqs = PREREQ_MAP[depTopic] || [];
    prereqs.forEach((prereq) => {
      // ONLY include edge if BOTH source and target were actually asked in this session
      if (sessionTopicSet.has(prereq)) {
        const prereqNode = nodes.find(n => n.id === prereq);
        const depNode = nodes.find(n => n.id === depTopic);

        const prereqScore = prereqNode?.score ?? 60;
        const depScore = depNode?.score ?? 60;

        let weight = 0.5;
        if (prereqScore < 50 && depScore < 50) {
          weight = 0.8; // High dependency failure correlation
        } else if (prereqScore < 50 && depScore >= 50) {
          weight = 0.2; // Exception edge
        } else {
          weight = 0.6; // Normal mastery flow
        }

        edges.push({
          source: prereq,
          target: depTopic,
          sourceLabel: prereqNode?.label || prereq,
          targetLabel: depNode?.label || depTopic,
          weight,
          label: `${prereq} → ${depTopic}`
        });
      }
    });
  });

  const note = edges.length === 0
    ? "No prerequisite relationships mapped for this session's topics yet"
    : null;

  return { nodes, edges, note };
}

module.exports = { PREREQ_MAP, buildSessionMemoryGraph };
