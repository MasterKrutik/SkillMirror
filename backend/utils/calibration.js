/**
 * SkillMirror Percentile Calibration Benchmark Population
 */

const POPULATION_SIZE = 500;
const ROLES = ['Software Engineer', 'Data Analyst', 'Product Manager', 'Generic'];

const BENCHMARK_POPULATION = {};

// Box-Muller transform for normal distribution
function randomNormal(mean = 60, std = 15) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.min(100, Math.max(0, Math.round(mean + num * std)));
}

function initializeCalibrationData() {
  ROLES.forEach((role) => {
    const contentScores = [];
    const deliveryScores = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      contentScores.push(randomNormal(62, 15));
      deliveryScores.push(randomNormal(58, 18));
    }
    contentScores.sort((a, b) => a - b);
    deliveryScores.sort((a, b) => a - b);

    BENCHMARK_POPULATION[role] = { contentScores, deliveryScores };
  });
}

// Binary search for percentile lookup
function calculatePercentile(array, value) {
  if (!array || array.length === 0) return 50;
  let low = 0;
  let high = array.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (array[mid] <= value) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return Math.round((low / array.length) * 100);
}

function getCandidatePercentiles(role = 'Software Engineer', contentScore = 60, deliveryScore = 60) {
  const population = BENCHMARK_POPULATION[role] || BENCHMARK_POPULATION['Generic'] || BENCHMARK_POPULATION['Software Engineer'];
  const contentPercentile = calculatePercentile(population.contentScores, contentScore);
  const deliveryPercentile = calculatePercentile(population.deliveryScores, deliveryScore);

  return {
    role,
    contentPercentile,
    deliveryPercentile,
    overallPercentile: Math.round((contentPercentile + deliveryPercentile) / 2)
  };
}

// Initialize on module load
initializeCalibrationData();

module.exports = {
  initializeCalibrationData,
  getCandidatePercentiles
};
