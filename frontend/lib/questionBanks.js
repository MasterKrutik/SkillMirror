/**
 * SkillMirror Frontend Embedded Question Banks
 * Standalone zero-dependency question bank provider for Vercel Next.js serverless API routes.
 */

export const QUESTION_BANKS = {
  'Software Engineer': [
    {
      id: 'swe-001',
      topic: 'system_design',
      difficulty_rating: 1300,
      question: 'How would you design a rate limiter for a high-throughput public REST API?',
      model_answer: 'A strong answer outlines Token Bucket or Sliding Window Counter algorithms, enforcing rate limits at the API Gateway layer using a fast distributed in-memory cache like Redis. It details client identification by API key or IP, handling concurrency with Redis Lua scripts, and returning HTTP 429 Too Many Requests status codes with Retry-After and X-RateLimit headers.',
      key_points: ['Token bucket or sliding window counter algorithms', 'API Gateway enforcement with Redis distributed cache', 'Client identification via API key, user ID, or IP', 'HTTP 429 status code and Retry-After headers']
    },
    {
      id: 'swe-002',
      topic: 'databases',
      difficulty_rating: 1450,
      question: 'Explain the trade-offs between SQL ACID compliance and NoSQL eventual consistency with real examples.',
      model_answer: 'SQL databases prioritize ACID for financial transactions where strict consistency is non-negotiable. NoSQL databases prioritize BASE for horizontal scaling, partitioning, and high throughput, accepting temporary data lag across replicas.',
      key_points: ['ACID vs BASE principles', 'Strong consistency for financial/relational data', 'Eventual consistency for high-throughput horizontal scaling', 'CAP theorem trade-offs (Consistency vs Availability)']
    },
    {
      id: 'swe-003',
      topic: 'data_structures',
      difficulty_rating: 1350,
      question: 'Describe how an LRU Cache is implemented in memory using a Doubly Linked List and Hash Map.',
      model_answer: 'An LRU (Least Recently Used) cache achieves O(1) lookup and O(1) insertion/deletion by pairing a Hash Map with a Doubly Linked List. The Hash Map maps keys directly to list nodes. When accessed or updated, the node moves to the head. When capacity is exceeded, the node at the tail is evicted.',
      key_points: ['Doubly Linked List for O(1) node movement and eviction', 'Hash Map for O(1) key-to-node memory lookup', 'Head insertion for MRU and tail eviction for LRU', 'Capacity constraint and concurrency locking']
    },
    {
      id: 'swe-004',
      topic: 'networking',
      difficulty_rating: 1500,
      question: 'Walk through what happens under the hood when a browser makes an HTTPS GET request to a server.',
      model_answer: 'The process begins with DNS resolution to find the server IP address. Next, a 3-way TCP handshake (SYN, SYN-ACK, ACK) establishes the connection. TLS 1.3 handshake negotiates cipher suites and exchanges keys. The browser sends an encrypted HTTP GET request, the server processes it, returns HTTP response headers and body, and TCP teardown or keep-alive occurs.',
      key_points: ['DNS resolution and IP lookup', '3-way TCP handshake (SYN, SYN-ACK, ACK)', 'TLS 1.3 handshake and asymmetric key exchange', 'HTTP GET request/response cycle over encrypted socket']
    },
    {
      id: 'swe-005',
      topic: 'algorithms',
      difficulty_rating: 1300,
      question: 'Explain how Binary Search and QuickSort operate, analyzing their time and space complexity.',
      model_answer: 'Binary Search operates on sorted arrays in O(log N) time by halving the search space per step. QuickSort uses a divide-and-conquer strategy selecting a pivot to partition elements into sub-arrays, executing in O(N log N) average time and O(log N) space.',
      key_points: ['Binary search O(log N) time on sorted arrays', 'QuickSort pivot partitioning strategy', 'Average O(N log N) vs worst-case O(N^2) time complexity', 'In-place space complexity O(log N)']
    }
  ],
  'Frontend Engineer': [
    {
      id: 'fe-001',
      topic: 'ui_architecture',
      difficulty_rating: 1320,
      question: 'Explain how Virtual DOM reconciliation works in modern UI frameworks like React and how key props prevent unnecessary re-renders.',
      model_answer: 'Reconciliation creates an in-memory Virtual DOM tree, comparing it to the previous tree using a heuristic O(N) diffing algorithm. Unique key props allow the diffing engine to identify moved or mutated elements across re-renders without destroying DOM nodes.',
      key_points: ['Virtual DOM in-memory representation', 'O(N) heuristic diffing algorithm', 'Key props for stable list node identity', 'Batching DOM mutations to prevent layout thrashing']
    },
    {
      id: 'fe-002',
      topic: 'performance',
      difficulty_rating: 1450,
      question: 'How do you optimize Core Web Vitals (LCP, INP, CLS) for a high-traffic Next.js e-commerce application?',
      model_answer: 'LCP is optimized by preloading hero image assets, using next/image with proper sizing, and priority flags. INP is improved by breaking long tasks with requestIdleCallback and web workers. CLS is minimized by assigning explicit width/height aspect ratios to layout elements.',
      key_points: ['LCP hero image prioritization and server rendering', 'INP task breaking and main thread unblocking', 'CLS explicit aspect ratio reserved spaces', 'Font display swap and CSS critical path optimization']
    },
    {
      id: 'fe-003',
      topic: 'state_management',
      difficulty_rating: 1380,
      question: 'Compare Zustand, Redux Toolkit, and React Context for global state management. When would Context cause performance issues?',
      model_answer: 'React Context triggers re-renders on all consuming components whenever any slice of the context value object mutates, lacking selector-level re-render subscription. Libraries like Zustand and Redux Toolkit subscribe to precise state slices via selector hooks.',
      key_points: ['React Context re-render propagation on value object mutation', 'Zustand light-weight atomic state selector subscriptions', 'Redux Toolkit immutable state tree with Immer', 'Preventing re-render cascades using memo and selector patterns']
    }
  ],
  'Backend Engineer': [
    {
      id: 'be-001',
      topic: 'database_indexing',
      difficulty_rating: 1400,
      question: 'Explain how B-Tree indexes improve SQL query read performance and why unindexed WHERE clauses cause sequential table scans.',
      model_answer: 'B-Trees maintain a balanced search tree on disk where nodes store ordered key values and page pointers. This reduces search time from O(N) sequential table scans to O(log N) page reads. Without an index, the engine must scan every row block from disk.',
      key_points: ['B-Tree balanced page structure', 'O(log N) IO page traversals vs O(N) table scans', 'Covering indexes to eliminate table lookup', 'Write amplification overhead on inserts/updates']
    },
    {
      id: 'be-002',
      topic: 'api_protocols',
      difficulty_rating: 1480,
      question: 'Compare gRPC over HTTP/2 with REST over HTTP/1.1 for internal microservice communication.',
      model_answer: 'gRPC utilizes Protocol Buffers binary serialization and HTTP/2 multiplexing, streaming bidirectional frames over a single TCP connection with low latency. REST over HTTP/1.1 uses text JSON serialization subject to head-of-line blocking.',
      key_points: ['Protobuf binary serialization vs JSON text stringifying', 'HTTP/2 multiplexed streams over a single TCP socket', 'Strongly typed contract schema definitions (.proto)', 'Head-of-line blocking elimination in gRPC']
    }
  ],
  'Full-Stack Engineer': [
    {
      id: 'fs-001',
      topic: 'fullstack_auth',
      difficulty_rating: 1350,
      question: 'How do you securely handle JWT authentication across a Next.js frontend and Express backend, preventing XSS and CSRF attacks?',
      model_answer: 'Store JWT access tokens in memory or HttpOnly SameSite=Strict cookies to prevent XSS script access. Implement short-lived access tokens (15 mins) paired with HttpOnly refresh tokens stored in secure database sessions.',
      key_points: ['HttpOnly SameSite=Strict cookies to prevent JS read XSS', 'Short-lived JWT access tokens paired with refresh tokens', 'CSRF protection tokens or SameSite cookie policies', 'Bearer authorization headers for API endpoints']
    }
  ],
  'DevOps / SRE': [
    {
      id: 'dev-001',
      topic: 'kubernetes',
      difficulty_rating: 1420,
      question: 'How do Kubernetes Deployments manage rolling updates, readiness probes, and zero-downtime canary rollouts?',
      model_answer: 'Kubernetes Deployments create new ReplicaSets, spawning new Pods while executing readiness probes. Traffic is shifted to new Pods once probes pass, terminating old Pods gradually based on maxSurge and maxUnavailable configurations.',
      key_points: ['ReplicaSet lifecycle management', 'Readiness vs Liveness probes', 'maxSurge and maxUnavailable parameters', 'Zero-downtime rolling updates']
    }
  ],
  'General Behavioral': [
    {
      id: 'beh-001',
      topic: 'behavioral',
      difficulty_rating: 1250,
      question: 'Describe a situation where you faced a severe technical disagreement with a teammate. How did you resolve it using the STAR method?',
      model_answer: 'A strong response follows Situation, Task, Action, Result. The candidate describes evaluating trade-offs objectively using data/benchmarks rather than personal opinion, aligning the team, and taking personal ownership of the outcome.',
      key_points: ['STAR structure (Situation, Task, Action, Result)', 'Objective data-driven evaluation', 'Active listening and alignment', 'Outcome metrics and team cohesion']
    }
  ]
};

export function getQuestionsForRole(roleFocus) {
  const matchedRole = Object.keys(QUESTION_BANKS).find(
    r => r.toLowerCase() === (roleFocus || '').toLowerCase()
  ) || 'Software Engineer';

  return QUESTION_BANKS[matchedRole] || QUESTION_BANKS['Software Engineer'];
}
