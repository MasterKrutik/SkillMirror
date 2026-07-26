'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import BlobPanel from '@/components/ui/BlobPanel';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

const ROLE_OPTIONS = [
  { isHeader: true, label: 'ENGINEERING' },
  { value: 'Software Engineer', label: 'Software Engineer', description: 'Systems & Algorithms' },
  { value: 'Frontend Engineer', label: 'Frontend Engineer', description: 'UI Architecture & Performance' },
  { value: 'Backend Engineer', label: 'Backend Engineer', description: 'APIs, Databases & Scalability' },
  { value: 'Full-Stack Engineer', label: 'Full-Stack Engineer', description: 'End-to-End Product Delivery' },
  { value: 'DevOps / SRE', label: 'DevOps / SRE', description: 'Infrastructure & Reliability' },
  { value: 'Mobile Engineer', label: 'Mobile Engineer', description: 'iOS/Android Fundamentals' },
  { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer', description: 'Models & Pipelines' },

  { isHeader: true, label: 'DATA & ANALYTICS' },
  { value: 'Data Analyst', label: 'Data Analyst', description: 'SQL, Statistics & Dashboards' },
  { value: 'Data Scientist', label: 'Data Scientist', description: 'Modeling & Experimentation' },
  { value: 'Data Engineer', label: 'Data Engineer', description: 'Pipelines & Warehousing' },

  { isHeader: true, label: 'PRODUCT & DESIGN' },
  { value: 'Product Manager', label: 'Product Manager', description: 'Metrics, Roadmaps & Tradeoffs' },
  { value: 'UX/UI Designer', label: 'UX/UI Designer', description: 'Research & Interaction Design' },

  { isHeader: true, label: 'BUSINESS & GENERAL' },
  { value: 'Business Analyst', label: 'Business Analyst', description: 'Process & Requirements' },
  { value: 'Consulting / Case Interview', label: 'Consulting / Case Interview', description: 'Structured Problem-Solving' },
  { value: 'General Behavioral', label: 'General Behavioral', description: 'Role-Agnostic Soft Skills' }
];

export default function UploadResume() {
  const router = useRouter();

  // Mode state: 'upload' vs 'builder'
  const [activeTab, setActiveTab] = useState('upload');

  // Upload & Scan state
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Section toggle state
  const [showParsePreview, setShowParsePreview] = useState(false);

  // AI Resume Builder State
  const [builderStep, setBuilderStep] = useState(1);
  const [builderBasic, setBuilderBasic] = useState({
    fullName: '',
    targetRole: 'Software Engineer',
    yearsOfExperience: '3-5 years',
    email: '',
    phone: '',
    location: '',
    linkedin: ''
  });

  const [builderExperiences, setBuilderExperiences] = useState([
    {
      id: 1,
      company: '',
      title: '',
      dates: '',
      description: ''
    }
  ]);

  const [builderEducation, setBuilderEducation] = useState([
    {
      id: 1,
      institution: '',
      degree: '',
      dates: ''
    }
  ]);

  const [builderSkills, setBuilderSkills] = useState(['JavaScript', 'React', 'Node.js', 'SQL', 'System Design']);
  const [skillInput, setSkillInput] = useState('');
  const [builderGenerating, setBuilderGenerating] = useState(false);

  // Download Word Document Helper (.doc / .docx)
  function downloadAsWordDoc(resumeText, fullName) {
    const nameStr = fullName || 'Candidate';
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Resume - ${nameStr}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.45; margin: 1in; color: #1e293b; }
          h1 { font-size: 18pt; margin-bottom: 2pt; color: #0f172a; text-transform: uppercase; text-align: center; font-weight: bold; }
          .contact { text-align: center; font-size: 10pt; color: #475569; margin-bottom: 16pt; }
          h2 { font-size: 12pt; border-bottom: 1.5pt solid #0f172a; margin-top: 14pt; margin-bottom: 6pt; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5pt; font-weight: bold; }
          p { margin: 4pt 0; }
          ul { margin: 4pt 0 8pt 18pt; padding: 0; }
          li { margin-bottom: 3.5pt; }
        </style>
      </head>
      <body>
        ${(resumeText || '').split('\n').map(line => {
          if (line.startsWith('•') || line.startsWith('-')) {
            return `<li>${line.replace(/^[•\-]\s*/, '')}</li>`;
          }
          if (line.toUpperCase() === line && line.length > 3 && !line.includes('|')) {
            return `<h2>${line}</h2>`;
          }
          return `<p>${line}</p>`;
        }).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${nameStr.replace(/\s+/g, '_')}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Upload & Scan handler
  async function handleUpload(e) {
    e.preventDefault();
    if (!file && !pastedText.trim()) return alert('Please upload a resume file or paste your resume text.');
    setLoading(true);
    setResult(null);

    const fd = new FormData();
    if (file) {
      fd.append('resume', file);
    }
    if (jobDescription.trim()) {
      fd.append('jobDescription', jobDescription.trim());
    }
    if (pastedText.trim()) {
      fd.append('pastedText', pastedText.trim());
    }

    try {
      const res = await axios.post('/api/resume-analysis', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setResult({
        isResume: false,
        error: err.response?.data?.error || "This doesn't look like a resume or CV. Please upload a document containing your work experience, education, and skills.",
        fileName: file ? file.name : 'Pasted Resume Text'
      });
    } finally {
      setLoading(false);
    }
  }



  // AI Resume Builder Submit Handler
  async function handleBuildGenerate() {
    if (!builderBasic.fullName.trim()) return alert('Please enter your full name');
    setBuilderGenerating(true);

    try {
      const res = await axios.post('/api/generate-resume', {
        basicInfo: builderBasic,
        experiences: builderExperiences,
        education: builderEducation,
        skills: builderSkills
      });

      setResult(res.data);
      setBuilderStep(5); // Go to Preview & Export step
    } catch (err) {
      console.error("Generate Resume Error:", err);
      alert("Failed to generate resume. Please try again.");
    } finally {
      setBuilderGenerating(false);
    }
  }

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Format Recharts radar data
  const getRadarData = () => {
    if (!result?.radarMetrics) return [];
    const rm = result.radarMetrics;
    return [
      { axis: 'Keyword Match', score: rm.keywordMatch || 70 },
      { axis: 'Structure & Format', score: rm.structureFormatting || 80 },
      { axis: 'Quantified Impact', score: rm.quantifiedImpact || 65 },
      { axis: 'Action Verbs', score: rm.actionVerbStrength || 75 },
      { axis: 'ATS Parse Safety', score: rm.atsParseSafety || 85 }
    ];
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA888] bg-sage-50 px-3 py-1 rounded-full border border-sage-200">
            SkillMirror ATS Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#2E2A26] mt-1">Resume ATS Studio</h1>
        </div>
        <Button variant="ghost" accentColor="sage" onClick={() => router.back()} className="!py-1.5 !px-4 !text-xs font-bold border border-slate-300">
          ← Back
        </Button>
      </div>

      {/* TOP ENTRY POINT TAB TOGGLE: UPLOAD vs BUILD */}
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex rounded-2xl bg-white p-1.5 border border-amber-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-xl font-serif text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-[#D9A441] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/50'
            }`}
          >
            <span>📄 Already have a resume? Upload it</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex-1 py-3 px-4 rounded-xl font-serif text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'builder'
                ? 'bg-[#D9A441] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-amber-50/50'
            }`}
          >
            <span>✨ Don't have one yet? Build one with AI</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD DROPZONE FORM */}
        {activeTab === 'upload' && (
          <BlobPanel accentColor="amber" className="p-6 space-y-6">
            <form onSubmit={handleUpload} className="space-y-5">
              
              {/* Drag & Drop Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-[#D9A441] bg-amber-50/80 scale-[1.01]'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 bg-white/70 hover:border-[#D9A441] hover:bg-amber-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />

                <div className="space-y-2">
                  <span className="text-4xl block">
                    {file ? '📄' : '📁'}
                  </span>
                  {file ? (
                    <div>
                      <p className="font-serif font-bold text-sm text-[#2E2A26]">{file.name}</p>
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        ✓ Ready for multi-axis ATS scanning ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-serif font-bold text-sm text-[#2E2A26]">
                        Drag & Drop your Resume here, or <span className="text-[#D9A441] underline">Browse</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supports PDF, DOCX, or scanned Image files
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Job Description Targeting Expandable Box */}
              <div className="p-4 bg-white/90 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="w-full flex items-center justify-between font-bold text-[#2E2A26]"
                >
                  <span className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Target a Specific Job Description (Optional)</span>
                    {jobDescription.trim() && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                        JD Added
                      </span>
                    )}
                  </span>
                  <span>{showJdInput ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                <AnimatePresence>
                  {showJdInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the target job description or key requirements here to analyze specific keyword match scoring..."
                        rows={4}
                        className="w-full p-3 rounded-xl border border-amber-900/15 bg-white/90 text-xs text-[#2E2A26] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A441] font-sans leading-relaxed"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Optional Paste Raw Resume Text Expandable Box */}
              <div className="p-4 bg-white/90 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPasteInput(!showPasteInput)}
                  className="w-full flex items-center justify-between font-bold text-[#2E2A26]"
                >
                  <span className="flex items-center gap-2">
                    <span>📝</span>
                    <span>Paste Raw Resume Text Directly (Bypass PDF Parsing)</span>
                    {pastedText.trim() && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono">
                        Text Provided
                      </span>
                    )}
                  </span>
                  <span>{showPasteInput ? '▲ Hide' : '▼ Expand'}</span>
                </button>

                <AnimatePresence>
                  {showPasteInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden space-y-2"
                    >
                      <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                        Useful if your PDF has embedded font-encoding issues or non-standard formatting.
                      </p>
                      <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste your plain-text resume content here directly..."
                        rows={5}
                        className="w-full p-3 rounded-xl border border-amber-900/15 bg-white/90 text-xs text-[#2E2A26] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D9A441] font-mono leading-relaxed"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <Button
                accentColor="amber"
                type="submit"
                disabled={loading || (!file && !pastedText.trim())}
                className="w-full !py-3.5 text-sm font-bold shadow-lg"
              >
                {loading ? 'Running Multi-Axis ATS Scanner & AI Parsing...' : '✨ Scan & Optimize Resume'}
              </Button>


            </form>
          </BlobPanel>
        )}

        {/* TAB 2: AI RESUME BUILDER MULTI-STEP FORM */}
        {activeTab === 'builder' && (
          <BlobPanel accentColor="amber" className="p-6 space-y-6">
            
            {/* Builder Stepper Tracker */}
            <div className="flex items-center justify-between border-b border-amber-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded">
                  AI Resume Generator
                </span>
                <h3 className="font-serif font-bold text-xl text-[#2E2A26] mt-1">
                  Step {builderStep} of 5 — {
                    builderStep === 1 ? 'Basic Candidate Profile' :
                    builderStep === 2 ? 'Work Experience (In Your Own Words)' :
                    builderStep === 3 ? 'Education & Background' :
                    builderStep === 4 ? 'Skills & Proficiencies' : 'AI Resume Preview & ATS Audit'
                  }
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    onClick={() => { if (s <= builderStep || result) setBuilderStep(s); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                      builderStep === s
                        ? 'bg-[#D9A441] text-white shadow-md scale-105'
                        : s < builderStep
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {s < builderStep ? '✓' : s}
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 1: BASIC INFO */}
            {builderStep === 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={builderBasic.fullName}
                      onChange={(e) => setBuilderBasic({ ...builderBasic, fullName: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">Target Role Focus *</label>
                    <Select
                      options={ROLE_OPTIONS}
                      value={builderBasic.targetRole}
                      onChange={(val) => setBuilderBasic({ ...builderBasic, targetRole: val })}
                      accentColor="amber"
                      placeholder="Select target role..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">Years of Experience</label>
                    <input
                      type="text"
                      value={builderBasic.yearsOfExperience}
                      onChange={(e) => setBuilderBasic({ ...builderBasic, yearsOfExperience: e.target.value })}
                      placeholder="e.g. 4 years"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={builderBasic.email}
                      onChange={(e) => setBuilderBasic({ ...builderBasic, email: e.target.value })}
                      placeholder="alex.morgan@example.com"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={builderBasic.phone}
                      onChange={(e) => setBuilderBasic({ ...builderBasic, phone: e.target.value })}
                      placeholder="(555) 019-2834"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2E2A26] block mb-1">City, State / Location</label>
                    <input
                      type="text"
                      value={builderBasic.location}
                      onChange={(e) => setBuilderBasic({ ...builderBasic, location: e.target.value })}
                      placeholder="San Francisco, CA"
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button accentColor="amber" onClick={() => setBuilderStep(2)} className="!py-2.5 !px-6 text-xs font-bold">
                    Next: Work Experience →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: WORK EXPERIENCE */}
            {builderStep === 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <p className="text-xs text-slate-600 italic">
                  💡 Simply describe what you did in your own words — our AI will rewrite it into 3-4 strong, quantified ATS resume bullet points.
                </p>

                {builderExperiences.map((exp, index) => (
                  <div key={exp.id || index} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Work Experience #{index + 1}
                      </span>
                      {builderExperiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBuilderExperiences(builderExperiences.filter((_, i) => i !== index))}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          ✕ Remove Role
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...builderExperiences];
                          updated[index].company = e.target.value;
                          setBuilderExperiences(updated);
                        }}
                        placeholder="Company Name (e.g. TechCorp)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...builderExperiences];
                          updated[index].title = e.target.value;
                          setBuilderExperiences(updated);
                        }}
                        placeholder="Job Title (e.g. Software Engineer)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={exp.dates}
                        onChange={(e) => {
                          const updated = [...builderExperiences];
                          updated[index].dates = e.target.value;
                          setBuilderExperiences(updated);
                        }}
                        placeholder="Dates (e.g. 2022 - Present)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Plain-Language Work Description ("Describe what you did in your own words")
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...builderExperiences];
                          updated[index].description = e.target.value;
                          setBuilderExperiences(updated);
                        }}
                        rows={3}
                        placeholder="e.g. I led a small team building backend microservices with Node.js and Postgres. I sped up SQL queries and helped ship features for our customer dashboard."
                        className="w-full p-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setBuilderExperiences([...builderExperiences, { id: Date.now(), company: '', title: '', dates: '', description: '' }])}
                  className="w-full py-2.5 border-2 border-dashed border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
                >
                  + Add Another Work Experience Role
                </button>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBuilderStep(1)} className="!py-2 !px-4 text-xs">
                    ← Back
                  </Button>
                  <Button accentColor="amber" onClick={() => setBuilderStep(3)} className="!py-2.5 !px-6 text-xs font-bold">
                    Next: Education →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: EDUCATION */}
            {builderStep === 3 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {builderEducation.map((edu, index) => (
                  <div key={edu.id || index} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Education #{index + 1}
                      </span>
                      {builderEducation.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setBuilderEducation(builderEducation.filter((_, i) => i !== index))}
                          className="text-xs text-rose-600 font-bold hover:underline"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...builderEducation];
                          updated[index].institution = e.target.value;
                          setBuilderEducation(updated);
                        }}
                        placeholder="Institution (e.g. State University)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...builderEducation];
                          updated[index].degree = e.target.value;
                          setBuilderEducation(updated);
                        }}
                        placeholder="Degree (e.g. B.S. Computer Science)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={edu.dates}
                        onChange={(e) => {
                          const updated = [...builderEducation];
                          updated[index].dates = e.target.value;
                          setBuilderEducation(updated);
                        }}
                        placeholder="Dates (e.g. 2018 - 2022)"
                        className="p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setBuilderEducation([...builderEducation, { id: Date.now(), institution: '', degree: '', dates: '' }])}
                  className="w-full py-2 border-2 border-dashed border-amber-300 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
                >
                  + Add Another Education Entry
                </button>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBuilderStep(2)} className="!py-2 !px-4 text-xs">
                    ← Back
                  </Button>
                  <Button accentColor="amber" onClick={() => setBuilderStep(4)} className="!py-2.5 !px-6 text-xs font-bold">
                    Next: Skills →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SKILLS */}
            {builderStep === 4 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <label className="text-xs font-bold text-[#2E2A26] block">Technical & Soft Skills</label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (skillInput.trim() && !builderSkills.includes(skillInput.trim())) {
                          setBuilderSkills([...builderSkills, skillInput.trim()]);
                          setSkillInput('');
                        }
                      }
                    }}
                    placeholder="Type skill (e.g. Docker, Python, Microservices) and press Enter"
                    className="flex-1 p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D9A441] focus:outline-none"
                  />
                  <Button
                    type="button"
                    accentColor="amber"
                    onClick={() => {
                      if (skillInput.trim() && !builderSkills.includes(skillInput.trim())) {
                        setBuilderSkills([...builderSkills, skillInput.trim()]);
                        setSkillInput('');
                      }
                    }}
                    className="!py-2.5 !px-5 text-xs font-bold"
                  >
                    + Add Skill
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {builderSkills.map((sk, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-300 text-xs font-semibold text-amber-950 shadow-2xs">
                      {sk}
                      <button
                        type="button"
                        onClick={() => setBuilderSkills(builderSkills.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setBuilderStep(3)} className="!py-2 !px-4 text-xs">
                    ← Back
                  </Button>
                  <Button
                    accentColor="amber"
                    onClick={handleBuildGenerate}
                    disabled={builderGenerating}
                    className="!py-3 !px-8 text-sm font-bold shadow-lg"
                  >
                    {builderGenerating ? '✨ Generating Quantified ATS Resume...' : '✨ Generate & Audit Resume'}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PREVIEW & DOWNLOAD */}
            {builderStep === 5 && result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      ✓ Resume Built & ATS Analyzed
                    </span>
                    <p className="text-sm font-serif font-bold text-emerald-950">
                      Your ATS-Optimized Resume is ready! Review below and download as Word Doc.
                    </p>
                  </div>

                  <Button
                    accentColor="amber"
                    onClick={() => downloadAsWordDoc(result.formattedText || result.rawParsePreview, builderBasic.fullName)}
                    className="!py-2.5 !px-5 text-xs font-bold shrink-0 shadow-md"
                  >
                    📥 Download as Word Doc (.doc)
                  </Button>
                </div>

                {/* Formatted Clean Resume Preview Card */}
                <div className="p-6 bg-white rounded-2xl border border-slate-300 font-sans shadow-sm leading-relaxed text-xs space-y-4">
                  <div className="border-b border-slate-200 pb-3 text-center space-y-1">
                    <h2 className="font-serif text-xl font-bold uppercase text-slate-900 tracking-wide">
                      {builderBasic.fullName || 'Candidate Name'}
                    </h2>
                    <p className="text-slate-600 font-semibold text-xs">
                      {builderBasic.targetRole} | {builderBasic.email} | {builderBasic.phone} | {builderBasic.location}
                    </p>
                  </div>

                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                    {result.formattedText || result.rawParsePreview}
                  </pre>
                </div>
              </motion.div>
            )}

          </BlobPanel>
        )}

      </div>

      {/* NON-RESUME REJECTION ERROR STATE */}
      {result && result.isResume === false && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <BlobPanel accentColor="rose" className="p-6 space-y-4 text-center">
            <span className="text-4xl block">🚫</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                Document Validation Notice
              </span>
              <h3 className="font-serif font-bold text-2xl text-rose-950 mt-2">
                Unable to Parse Resume Content
              </h3>
              <p className="text-xs text-rose-800 font-sans leading-relaxed max-w-lg mx-auto mt-1">
                {result.error || "Please upload a document containing your work experience, education, and skills."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                accentColor="rose"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="!py-2.5 !px-5 text-xs font-bold shadow-md"
              >
                ✕ Remove File & Try Again
              </Button>

              <Button
                variant="ghost"
                accentColor="rose"
                onClick={() => setShowPasteInput(!showPasteInput)}
                className="!py-2.5 !px-5 text-xs font-bold border border-rose-300 shadow-xs"
              >
                📋 Paste Resume Text Instead
              </Button>
            </div>

            {showPasteInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleUpload}
                className="pt-3 space-y-3 max-w-xl mx-auto text-left"
              >
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your plain-text resume content here directly to bypass file parsing..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-rose-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono leading-relaxed shadow-inner"
                />
                <Button
                  accentColor="amber"
                  type="submit"
                  disabled={loading || !pastedText.trim()}
                  className="w-full !py-2.5 text-xs font-bold shadow-md"
                >
                  {loading ? 'Running Multi-Axis ATS Scanner...' : '✨ Analyze Pasted Text →'}
                </Button>
              </motion.form>
            )}
          </BlobPanel>
        </motion.div>
      )}


      {/* FULL-WIDTH SCAN RESULTS SECTION (GATED BEHIND VALID RESUME CHECK) */}
      {result && result.isResume !== false && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8 w-full"
        >
          {/* BORDERLINE WARNING BANNER */}
          {result.isBorderline && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 flex items-center justify-between gap-3 text-xs font-semibold text-amber-950 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">⚠️</span>
                <span>{result.warning || "We're not fully confident this is a resume — results may be less accurate."}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded text-amber-900 shrink-0">
                Borderline Content
              </span>
            </div>
          )}

          {/* 1. SCORE BREAKDOWN VISUALIZATION */}
          <BlobPanel accentColor="indigo" className="p-6 space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-indigo-100 pb-4 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  ATS Diagnostic Complete
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">Multi-Axis Score Breakdown</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 font-mono">File: {result.fileName}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              
              {/* Score Headline Cards */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-white/90 p-5 rounded-2xl border border-indigo-100 text-center shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">ATS Parse Safety Score</span>
                  <span className="font-mono text-4xl font-bold text-[#4A5B8C] mt-1 block">
                    <AnimatedNumber value={result.atsScore || result.score} />
                    <span className="text-xl text-slate-400 font-normal">/100</span>
                  </span>
                </div>

                <div className="bg-white/90 p-5 rounded-2xl border border-indigo-100 text-center shadow-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Overall Content Depth Score</span>
                  <span className="font-mono text-4xl font-bold text-[#D9A441] mt-1 block">
                    <AnimatedNumber value={result.score} />
                    <span className="text-xl text-slate-400 font-normal">/100</span>
                  </span>
                </div>
              </div>

              {/* 5-Axis Recharts Radar Chart */}
              <div className="bg-white/90 p-5 rounded-2xl border border-slate-200 space-y-2 lg:col-span-2 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 text-center">
                  5-Vector ATS Radar Diagnostics
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={getRadarData()}>
                      <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: '#2E2A26', fontSize: 11, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="Candidate Resume" dataKey="score" stroke="#4A5B8C" fill="#4A5B8C" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Missing Job Description Keywords Pill Tags */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block">
                  Missing Key Target Keywords {result.hasJobDescription ? '(Relative to Job Posting)' : ''}
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw, i) => (
                    <span key={i} className="text-xs font-semibold bg-white text-rose-700 px-3 py-1 rounded-full border border-rose-300 shadow-2xs">
                      Missing: {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </BlobPanel>

          {/* 2. BEFORE/AFTER REWRITE PANEL */}
          {result.rewrites && result.rewrites.length > 0 && (
            <BlobPanel accentColor="sage" className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  Line-By-Line Optimization
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">✨ See It Rewritten</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  AI-enhanced bullet points transforming passive duty statements into quantified impact results.
                </p>
              </div>

              <div className="space-y-4">
                {result.rewrites.map((rw, i) => (
                  <div key={i} className="p-4 bg-white/95 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original Line */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Original Line</span>
                        <p className="text-sm text-slate-500 line-through leading-relaxed italic">
                          "{rw.original}"
                        </p>
                      </div>

                      {/* Improved Line */}
                      <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">AI Rewritten Line</span>
                        <p className="text-sm font-bold text-emerald-950 leading-relaxed">
                          "{rw.improved}"
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                      💡 Optimization: {rw.reason}
                    </span>
                  </div>
                ))}
              </div>
            </BlobPanel>
          )}

          {/* 3. TAILORED IMPROVEMENT SUGGESTIONS */}
          <BlobPanel accentColor="amber" className="p-6 space-y-4">
            <div className="border-b border-amber-200/80 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                Actionable Advice
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">Tailored Improvement Suggestions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.suggestions?.map((s, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-4 bg-white/95 rounded-2xl border border-amber-200/80 text-sm text-[#2E2A26] shadow-2xs hover:border-amber-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      #{i + 1}
                    </span>
                    <span className="leading-relaxed font-sans font-medium">{s}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0 self-start">
                    ATS Tip
                  </span>
                </div>
              ))}
            </div>
          </BlobPanel>

          {/* 4. RAW ATS PARSE PREVIEW */}
          <BlobPanel accentColor="plum" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  ATS Engine Parsing Inspection
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26] mt-1">🔍 See What the ATS Actually Reads</h3>
              </div>
              <Button
                variant="ghost"
                accentColor="plum"
                onClick={() => setShowParsePreview(!showParsePreview)}
                className="!py-2 !px-4 text-xs font-bold border border-purple-200 shadow-xs flex items-center gap-1.5"
              >
                <span>{showParsePreview ? '▲ Collapse Plain-Text Parse' : '▼ Expand Plain-Text Parse'}</span>
              </Button>
            </div>

            <AnimatePresence>
              {showParsePreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                    {result.rawParsePreview || result.formattedText || 'No plain-text extraction available.'}
                  </div>

                  {result.parsingWarnings && result.parsingWarnings.length > 0 ? (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block">
                        ⚠️ Detected Parse Safety Warnings & Garbled Layout Snippets
                      </span>
                      <div className="space-y-2">
                        {result.parsingWarnings.map((w, i) => (
                          <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 text-xs font-sans space-y-1 shadow-2xs">
                            <span className="font-mono text-rose-950 font-bold text-[11px] bg-rose-100/70 px-2 py-0.5 rounded inline-block">
                              Snippet: "{w.snippet}"
                            </span>
                            <p className="text-rose-800 leading-relaxed font-medium">{w.warning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs font-bold text-emerald-950 shadow-2xs">
                      <span className="text-base">✅</span>
                      <span>No parsing issues detected — this resume extracts cleanly for ATS systems.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </BlobPanel>

          {/* 5. INTERVIEW ENGINE PLATFORM BRIDGE CROSS-LINK */}
          <BlobPanel accentColor="indigo" className="p-6 bg-indigo-900/5 border border-indigo-300 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5B8C] bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-300">
                  SkillMirror Platform Bridge
                </span>
                <h3 className="font-serif font-bold text-2xl text-[#2E2A26]">
                  Bridge Your Resume Diagnostic to Mock Practice
                </h3>
                <p className="text-xs text-[#2E2A26]/80 max-w-xl font-sans leading-relaxed">
                  This resume suggests a possible gap in <strong className="capitalize">{result.weakestTheme || 'quantified leadership evidence'}</strong>. Want to practice answering targeted interview questions probing this gap?
                </p>
              </div>

              <Button
                accentColor="indigo"
                onClick={() => {
                  const gap = encodeURIComponent(result.weakestTheme || 'quantified leadership');
                  const style = encodeURIComponent(result.recommendedEvaluationStyle || 'Behavioral Focus');
                  router.push(`/mock-interview?targetGap=${gap}&evaluationStyle=${style}`);
                }}
                className="!py-3 !px-6 text-xs font-bold shrink-0 shadow-lg"
              >
                🚀 Start Targeted Session →
              </Button>
            </div>
          </BlobPanel>

        </motion.div>
      )}

    </div>
  );
}


