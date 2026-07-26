'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';

export default function ConceptExplainer() {
  const router = useRouter();
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('programming');
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'programming', name: 'Programming', icon: '💻' },
    { id: 'algorithms', name: 'Algorithms', icon: '🧮' },
    { id: 'system-design', name: 'System Design', icon: '🏗️' },
    { id: 'databases', name: 'Databases', icon: '🗄️' },
    { id: 'web-dev', name: 'Web Dev', icon: '🌐' },
    { id: 'ml-ai', name: 'ML/AI', icon: '🤖' }
  ];

  const popularConcepts = {
    programming: ['Closures', 'Promises', 'Async/Await', 'Recursion'],
    algorithms: ['Binary Search', 'Dynamic Programming', 'Graph Traversal', 'QuickSort'],
    'system-design': ['Load Balancing', 'Caching', 'Microservices', 'Rate Limiting'],
    databases: ['Indexing', 'ACID Transactions', 'Sharding', 'NoSQL Consistency'],
    'web-dev': ['REST APIs', 'JWT Auth', 'WebSockets', 'SSR vs CSR'],
    'ml-ai': ['Neural Networks', 'Gradient Descent', 'Overfitting', 'Transformers']
  };

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setIsLoading(true);

    try {
      const prompt = `Explain technical concept "${concept}" (${category}).
Return JSON:
{
  "title": "${concept}",
  "simple": "Simple summary",
  "detailed": "Detailed explanation",
  "analogy": "Real-world analogy",
  "useCases": ["use case 1", "use case 2"],
  "examples": [{"code": "// Example code"}],
  "relatedConcepts": ["Related 1", "Related 2"]
}`;

      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        try {
          const cleanText = data.answer.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleanText);
          setExplanation({ ...parsed, success: true });
        } catch {
          setExplanation({
            title: concept,
            simple: `${concept} is a fundamental technical topic in ${category}.`,
            detailed: data.answer,
            analogy: `Understanding ${concept} is like building with structured blocks.`,
            useCases: ['System architecture', 'Scalable software engineering'],
            examples: [{ code: `// Example of ${concept}` }],
            relatedConcepts: ['System Design', 'Algorithms']
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between border-b border-indigo-900/10 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA888] bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            Conceptual Mastery Studio
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">Technical Concept Simplifier</h1>
        </div>
        <Button variant="ghost" accentColor="sage" onClick={() => router.back()} className="!py-1.5 !px-4 !text-xs">
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar Topics */}
        <div className="space-y-4">
          <BlobPanel accentColor="sage" className="p-4 space-y-2">
            <h3 className="font-serif font-bold text-sm text-[#2E2A26] uppercase">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-2 rounded-xl text-xs font-semibold text-left transition-all ${
                    category === cat.id ? 'bg-[#8BA888] text-white shadow-sm' : 'bg-white/60 text-slate-700 hover:bg-white'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </BlobPanel>

          <BlobPanel accentColor="amber" className="p-4 space-y-2">
            <h3 className="font-serif font-bold text-sm text-[#2E2A26] uppercase">Popular Topics</h3>
            <div className="space-y-1">
              {popularConcepts[category]?.map(t => (
                <button
                  key={t}
                  onClick={() => setConcept(t)}
                  className="w-full text-left text-xs p-2 rounded-lg hover:bg-white/80 font-medium text-slate-700 transition-colors"
                >
                  • {t}
                </button>
              ))}
            </div>
          </BlobPanel>
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <BlobPanel accentColor="sage" className="p-6 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">What concept do you want to master?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. Load Balancing, Closures, Sharding..."
                className="flex-1 p-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
              />
              <Button accentColor="sage" onClick={handleExplain} disabled={isLoading || !concept.trim()} className="!py-3 !px-6 text-xs font-bold">
                {isLoading ? 'Deconstructing...' : '✨ Explain'}
              </Button>
            </div>
          </BlobPanel>

          {explanation && (
            <div className="space-y-4">
              <BlobPanel accentColor="indigo" className="p-6 space-y-3">
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26]">{explanation.title}</h3>
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-[10px] font-bold text-[#4A5B8C] uppercase tracking-wider block mb-1">🎯 1-Sentence Summary</span>
                  <p className="text-xs text-[#2E2A26] font-medium">{explanation.simple}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/80 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">📖 Deep Technical Context</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{explanation.detailed}</p>
                </div>
              </BlobPanel>

              {explanation.analogy && (
                <BlobPanel accentColor="amber" className="p-6 space-y-2">
                  <span className="text-xs font-bold text-[#D9A441] uppercase tracking-wider">💡 Real-World Analogy</span>
                  <p className="text-xs text-[#2E2A26] leading-relaxed italic">"{explanation.analogy}"</p>
                </BlobPanel>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
