"use client"
import Link from 'next/link'
import { useState } from 'react'
import CodeFeedbackDisplay from '@/components/CodeFeedbackDisplay'
import { analyzeCode } from '@/utils/codeAnalysisUtils'

export default function TechnicalRound() {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showPartyModal, setShowPartyModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submittedCode, setSubmittedCode] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')

  const assignments = [
    {
      id: 1,
      title: 'Fibonacci Sequence',
      difficulty: 'Easy',
      description: 'Generate the nth Fibonacci number',
      points: 10,
      tags: ['Math', 'Recursion'],
      timeLimit: '30 mins'
    },
    {
      id: 2,
      title: 'Two Sum Problem',
      difficulty: 'Medium',
      description: 'Find two numbers that add up to a target sum',
      points: 20,
      tags: ['Array', 'Hash Map'],
      timeLimit: '45 mins'
    },
    {
      id: 3,
      title: 'Binary Tree Traversal',
      difficulty: 'Medium',
      description: 'Implement in-order, pre-order, and post-order traversal',
      points: 25,
      tags: ['Tree', 'Recursion'],
      timeLimit: '60 mins'
    },
    {
      id: 4,
      title: 'Database Query Optimization',
      difficulty: 'Hard',
      description: 'Optimize complex SQL queries for performance',
      points: 40,
      tags: ['SQL', 'Database'],
      timeLimit: '90 mins'
    },
    {
      id: 5,
      title: 'API Design Challenge',
      difficulty: 'Hard',
      description: 'Design a REST API for an e-commerce platform',
      points: 35,
      tags: ['API', 'System Design'],
      timeLimit: '75 mins'
    }
  ]

  const partyRooms = [
    {
      id: 1,
      name: 'Python Masters',
      members: 4,
      maxMembers: 8,
      currentAssignment: 'Fibonacci Sequence',
      created: '2 hours ago',
      status: 'Active'
    },
    {
      id: 2,
      name: 'JavaScript Squad',
      members: 6,
      maxMembers: 8,
      currentAssignment: 'Two Sum Problem',
      created: '1 hour ago',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Data Structure Deep Dive',
      members: 3,
      maxMembers: 6,
      currentAssignment: 'Binary Tree Traversal',
      created: '30 mins ago',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Database Experts',
      members: 2,
      maxMembers: 5,
      currentAssignment: 'Database Query Optimization',
      created: '15 mins ago',
      status: 'Recruiting'
    }
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-[#fff7f7] to-[#fff5f5] py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-12 animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-2 text-slate-800'>
            <span className='gradient-text'>Technical Round</span>
          </h1>
          <p className='text-slate-600'>Solve coding assignments individually or join a party for collaborative learning</p>
        </div>

        {/* Main CTA Buttons */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
          {/* Assignments Section */}
          <div className='card-gradient rounded-2xl p-8 border border-red-100 hover:border-red-300 transition-all hover:shadow-xl animate-slideInLeft'>
            <div className='text-2xl font-semibold mb-4'>Assignments</div>
            <h2 className='text-3xl font-bold text-slate-800 mb-3'>Individual Assignments</h2>
            <p className='text-slate-600 mb-4'>Solve coding challenges at your own pace and earn points</p>
            <div className='mb-6'>
              <p className='text-sm text-slate-600 mb-3'><strong>HOTS 🔥:</strong></p>
              <div className='space-y-2'>
                {assignments.slice(0, 3).map((assign, idx) => (
                  <div key={idx} className='flex items-center justify-between p-2 bg-white rounded border border-red-50'>
                    <span className='text-sm font-medium text-slate-700'>{assign.title}</span>
                    <span className='px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-semibold'>{assign.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setShowAssignmentModal(true)}
              className='w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all hover:shadow-lg'
            >
              Start Solving
            </button>
          </div>

          {/* Party Section */}
          <div className='card-gradient rounded-2xl p-8 border border-red-100 hover:border-red-300 transition-all hover:shadow-xl animate-slideInRight'>
            <div className='text-2xl font-semibold mb-4'>Party Mode</div>
            <h2 className='text-3xl font-bold text-slate-800 mb-3'>Party Mode</h2>
            <p className='text-slate-600 mb-4'>Collaborate with other students in real-time group coding sessions</p>
            <div className='mb-6'>
              <p className='text-sm text-slate-600 mb-3'><strong>Active Rooms:</strong> {partyRooms.length}</p>
              <div className='space-y-2'>
                {partyRooms.slice(0, 2).map((room, idx) => (
                  <div key={idx} className='flex items-center justify-between p-2 bg-white rounded border border-red-50'>
                    <div>
                      <p className='text-sm font-medium text-slate-700'>{room.name}</p>
                      <p className='text-xs text-slate-500'>{room.members}/{room.maxMembers} members</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${room.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {room.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => setShowPartyModal(true)}
              className='w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all hover:shadow-lg'
            >
              Join Party
            </button>
          </div>
        </div>

        {/* All Assignments Section */}
        <div className='mb-12 animate-fadeInUp'>
          <h2 className='text-3xl font-bold text-slate-800 mb-6'>HOTS 🔥</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {assignments.map((assign, idx) => (
              <div 
                key={idx}
                className='card-gradient rounded-2xl p-6 border border-red-100 hover:border-red-300 transition-all hover:shadow-xl hover:-translate-y-2 animate-slideInLeft cursor-pointer'
                style={{animationDelay: `${idx * 0.1}s`}}
                onClick={() => { setSelectedAssignment(assign); setShowAssignmentModal(true); }}
              >
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-bold text-lg text-slate-800'>{assign.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    assign.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    assign.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {assign.difficulty}
                  </span>
                </div>
                <p className='text-slate-600 text-sm mb-4'>{assign.description}</p>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex gap-2'>
                    {assign.tags.map((tag, tIdx) => (
                      <span key={tIdx} className='px-2 py-1 bg-red-50 text-red-600 text-xs rounded'>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className='font-bold text-red-600'>{assign.points} pts</span>
                </div>
                <div className='flex items-center justify-between text-sm text-slate-600'>
                  <span>Time: {assign.timeLimit}</span>
                  <button className='text-red-600 font-semibold hover:text-red-700'>Solve →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Party Rooms Section */}
        <div className='animate-fadeInUp'>
          <h2 className='text-3xl font-bold text-slate-800 mb-6'>Active Party Rooms</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {partyRooms.map((room, idx) => (
              <div 
                key={idx}
                className='card-gradient rounded-2xl p-6 border border-red-100 hover:border-red-300 transition-all hover:shadow-xl hover:-translate-y-2 animate-slideInLeft cursor-pointer'
                style={{animationDelay: `${idx * 0.12}s`}}
                onClick={() => setShowPartyModal(true)}
              >
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-bold text-lg text-slate-800'>{room.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    room.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {room.status}
                  </span>
                </div>
                <p className='text-slate-600 text-sm mb-4'>
                  <strong>Challenge:</strong> {room.currentAssignment}
                </p>
                <div className='space-y-3 mb-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-slate-600'>Members: {room.members}/{room.maxMembers}</span>
                    <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div 
                        className='h-full bg-gradient-to-r from-red-500 to-red-600' 
                        style={{width: `${(room.members / room.maxMembers) * 100}%`}}
                      />
                    </div>
                  </div>
                  <div className='text-xs text-slate-500'>Created {room.created}</div>
                </div>
                <button className='w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all'>
                  {room.members === room.maxMembers ? 'Full' : 'Join Room'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-slideInUp max-h-[85vh] overflow-y-auto'>
            <button 
              onClick={() => { setShowAssignmentModal(false); setSelectedAssignment(null); }}
              className='float-right text-2xl text-slate-400 hover:text-slate-600'
            >
              Close
            </button>

            {!selectedAssignment ? (
              <div>
                <h2 className='text-3xl font-bold text-slate-800 mb-6'>Choose Assignment</h2>
                <div className='space-y-4'>
                  {assignments.map((assign, idx) => (
                    <div 
                      key={idx}
                      className='p-4 border-2 border-red-100 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all cursor-pointer'
                      onClick={() => setSelectedAssignment(assign)}
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <h3 className='font-bold text-slate-800'>{assign.title}</h3>
                        <span className={`px-3 py-1 rounded text-xs font-bold ${
                          assign.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          assign.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {assign.difficulty}
                        </span>
                      </div>
                      <p className='text-sm text-slate-600 mb-2'>{assign.description}</p>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-slate-600'>Time: {assign.timeLimit}</span>
                        <span className='font-bold text-red-600'>{assign.points} points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : analysisResult ? (
              // Show feedback when analysis is complete
              <CodeFeedbackDisplay 
                analysis={analysisResult}
                problemTitle={selectedAssignment.title}
                difficulty={selectedAssignment.difficulty}
                onClose={() => {
                  setShowAssignmentModal(false)
                  setSelectedAssignment(null)
                  setAnalysisResult(null)
                  setSubmittedCode('')
                }}
              />
            ) : (
              <div>
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>{selectedAssignment.title}</h2>
                <div className='flex gap-2 mb-6'>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedAssignment.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    selectedAssignment.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedAssignment.difficulty}
                  </span>
                  <span className='px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold'>
                    {selectedAssignment.points} points
                  </span>
                  <span className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold'>
                    Time: {selectedAssignment.timeLimit}
                  </span>
                </div>

                <p className='text-slate-600 mb-4'>{selectedAssignment.description}</p>

                <div className='mb-4'>
                  <h3 className='font-bold text-slate-800 mb-2'>Problem Details</h3>
                  <p className='text-slate-600 text-sm'>Complete the coding challenge using your preferred programming language. Your code will be tested against multiple test cases.</p>
                </div>

                <div className='mb-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='font-bold text-slate-800'>Your Solution</h3>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className='px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-red-500'
                    >
                      <option value='javascript'>JavaScript</option>
                      <option value='python'>Python</option>
                      <option value='java'>Java</option>
                      <option value='cpp'>C++</option>
                      <option value='csharp'>C#</option>
                      <option value='go'>Go</option>
                      <option value='rust'>Rust</option>
                      <option value='sql'>SQL</option>
                    </select>
                  </div>
                  <textarea
                    value={submittedCode}
                    onChange={(e) => setSubmittedCode(e.target.value)}
                    placeholder='Write your code here...'
                    className='w-full h-40 p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 font-mono text-sm'
                  />
                </div>

                {isAnalyzing && (
                  <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center gap-3'>
                      <div className='animate-spin'>⚙️</div>
                      <div>
                        <p className='font-semibold text-blue-900'>Analyzing your code with AI...</p>
                        <p className='text-sm text-blue-800'>This may take a few seconds. We\'re checking correctness, efficiency, and best practices.</p>
                      </div>
                    </div>
                  </div>
                )}

                {analysisError && (
                  <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='font-semibold text-red-900'>Error during analysis:</p>
                    <p className='text-sm text-red-800'>{analysisError}</p>
                  </div>
                )}

                <div className='flex gap-3'>
                  <button 
                    onClick={() => { 
                      setShowAssignmentModal(false)
                      setSelectedAssignment(null)
                      setAnalysisResult(null)
                      setAnalysisError(null)
                      setSubmittedCode('')
                    }}
                    className='flex-1 px-4 py-2 border-2 border-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-50 transition-all disabled:opacity-50'
                    disabled={isAnalyzing}
                  >
                    Back
                  </button>
                  <button 
                    onClick={async () => {
                      if (!submittedCode.trim()) {
                        setAnalysisError('Please write some code before submitting');
                        return;
                      }
                      
                      setIsAnalyzing(true);
                      setAnalysisError(null);
                      setAnalysisResult(null);
                      
                      const result = await analyzeCode(
                        submittedCode,
                        selectedAssignment.title,
                        selectedAssignment.description,
                        selectedLanguage,
                        selectedAssignment.difficulty
                      );
                      
                      setIsAnalyzing(false);
                      
                      if (result.success) {
                        setAnalysisResult(result.analysis);
                      } else {
                        setAnalysisError(result.error || 'Failed to analyze code');
                      }
                    }}
                    disabled={isAnalyzing || !submittedCode.trim()}
                    className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Submit & Get Feedback'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Party Modal */}
      {showPartyModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn'>
          <div className='bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-slideInUp max-h-[85vh] overflow-y-auto'>
            <button 
              onClick={() => setShowPartyModal(false)}
              className='float-right text-2xl text-slate-400 hover:text-slate-600'
            >
              ✕
            </button>

            <h2 className='text-3xl font-bold text-slate-800 mb-6'>Join a Party</h2>
            <p className='text-slate-600 mb-6'>Collaborate with other students on the same problem in real-time. Learn from each other's approaches!</p>

            <div className='space-y-4'>
              {partyRooms.map((room, idx) => (
                <div 
                  key={idx}
                  className='p-4 border-2 border-red-100 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <h3 className='font-bold text-slate-800 text-lg'>{room.name}</h3>
                      <p className='text-sm text-slate-600'>Challenge: {room.currentAssignment}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      room.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {room.status}
                    </span>
                  </div>

                  <div className='mb-3'>
                    <div className='flex items-center justify-between text-sm mb-2'>
                      <span className='text-slate-600'>Members: {room.members}/{room.maxMembers}</span>
                      <span className='text-slate-600'>Created {room.created}</span>
                    </div>
                    <div className='w-full h-2 bg-gray-200 rounded-full overflow-hidden'>
                      <div 
                        className='h-full bg-gradient-to-r from-red-500 to-red-600' 
                        style={{width: `${(room.members / room.maxMembers) * 100}%`}}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={room.members === room.maxMembers}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                      room.members === room.maxMembers 
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {room.members === room.maxMembers ? 'Room Full' : 'Join Room'}
                  </button>
                </div>
              ))}
            </div>

            <div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <h3 className='font-bold text-slate-800 mb-2'>Benefits of Party Mode</h3>
              <ul className='text-sm text-slate-600 space-y-1'>
                <li>✓ Real-time code collaboration with peers</li>
                <li>✓ Learn different approaches to the same problem</li>
                <li>✓ Share knowledge and explanations</li>
                <li>✓ Earn bonus points for participation</li>
                <li>✓ Build your peer network</li>
              </ul>
            </div>

            <button 
              onClick={() => setShowPartyModal(false)}
              className='w-full mt-4 px-4 py-2 border-2 border-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-50 transition-all'
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
