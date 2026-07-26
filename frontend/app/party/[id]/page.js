'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function PartyRoom() {
  const params = useParams()
  const roomId = params.id

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)

  const questions = [
    {
      id: 1,
      title: 'Fibonacci Sequence',
      difficulty: 'Medium',
      points: 25,
      description: 'Generate the nth Fibonacci number',
      problem: 'Write a function that takes an integer n and returns the nth Fibonacci number. Handle edge cases for n < 0.',
      timeLimit: '30 mins',
      tags: ['Recursion', 'Math']
    },
    {
      id: 2,
      title: 'Two Sum',
      difficulty: 'Easy',
      points: 15,
      description: 'Find two numbers that add up to target',
      problem: 'Given an array of integers and a target, find the two numbers that add up to the target.',
      timeLimit: '20 mins',
      tags: ['Array', 'Hash Table']
    },
    {
      id: 3,
      title: 'Binary Tree Traversal',
      difficulty: 'Hard',
      points: 50,
      description: 'Traverse binary tree in-order',
      problem: 'Implement in-order traversal of a binary tree.',
      timeLimit: '45 mins',
      tags: ['Tree', 'Recursion']
    }
  ]

  const partyMembers = [
    { id: 1, name: 'priyanshu', status: 'Online', isYou: true },
    { id: 2, name: 'rahul_dev', status: 'Online', isYou: false },
    { id: 3, name: 'sneha_code', status: 'Offline', isYou: false }
  ]

  const currentQuestion = questions[currentQuestionIndex]

  const analyzeCode = () => {
    if (!code.trim()) {
      alert('Please write some code first!')
      return
    }

    // Simulate code analysis
    const feedback = {
      status: 'Accepted',
      message: 'Great solution!',
      passedTests: 5,
      totalTests: 5,
      performance: 'O(n) time complexity',
      suggestions: [
        'Consider edge cases for negative numbers',
        'Add input validation',
        'Code is clean and readable'
      ]
    }

    setResult(feedback)
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCode('')
      setShowResult(false)
      setResult(null)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold text-slate-900'>Data Structures Pro</h1>
          <button 
            onClick={() => window.history.back()}
            className='text-slate-600 hover:text-slate-900 text-2xl'
          >
            ✕
          </button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content - Left Side */}
          <div className='lg:col-span-2'>
            {/* Question Card */}
            <div className='bg-white rounded-2xl shadow-md p-6 mb-6'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <h2 className='text-sm text-slate-600 mb-2'>Question {currentQuestionIndex + 1} of {questions.length}</h2>
                  <h3 className='text-2xl font-bold text-slate-900'>{currentQuestion.title}</h3>
                </div>
                <button className='text-slate-400 hover:text-slate-600 text-xl'>✕</button>
              </div>

              <div className='flex gap-3 mb-4'>
                <span className='px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded'>
                  {currentQuestion.difficulty}
                </span>
                <span className='px-3 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded'>
                  {currentQuestion.points} pts
                </span>
              </div>

              <p className='text-slate-600 mb-3'>{currentQuestion.description}</p>

              <p className='text-slate-700 mb-4'>{currentQuestion.problem}</p>

              <div className='flex gap-6 text-sm text-slate-600 mb-4'>
                <div className='flex items-center gap-2'>
                  <span>⏱️</span>
                  <span>Time Limit: {currentQuestion.timeLimit}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span>🏷️</span>
                  <span>Tags: {currentQuestion.tags.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Solution Section */}
            <div className='bg-white rounded-2xl shadow-md p-6'>
              <h3 className='text-xl font-bold text-slate-900 mb-4'>Your Solution</h3>

              {/* Language Selector */}
              <div className='mb-4'>
                <label className='text-slate-700 font-medium text-sm mb-2 block'>Language</label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='javascript'>JavaScript</option>
                  <option value='python'>Python</option>
                  <option value='java'>Java</option>
                  <option value='cpp'>C++</option>
                  <option value='golang'>Go</option>
                </select>
              </div>

              {/* Code Editor */}
              <textarea 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder='Write your code here...'
                className='w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              />

              {/* Action Buttons */}
              <div className='flex gap-3 mt-4'>
                <button 
                  onClick={analyzeCode}
                  className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <span>✨</span>
                  Submit Solution
                </button>
                <button 
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex >= questions.length - 1}
                  className='px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next →
                </button>
              </div>

              {/* Result Section */}
              {showResult && result && (
                <div className='mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg'>
                  <h4 className='text-lg font-bold text-green-800 mb-3'>✅ {result.status}</h4>
                  <p className='text-green-700 mb-3'>{result.message}</p>
                  <div className='space-y-2 mb-3 text-sm text-green-700'>
                    <p><strong>Tests Passed:</strong> {result.passedTests}/{result.totalTests}</p>
                    <p><strong>Time Complexity:</strong> {result.performance}</p>
                  </div>
                  <div>
                    <strong className='text-green-800 block mb-2'>Suggestions:</strong>
                    <ul className='space-y-1 text-green-700'>
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className='text-sm'>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='space-y-6'>
            {/* Party Members */}
            <div className='bg-white rounded-2xl shadow-md p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <span>👥</span> Party Members
              </h3>
              <div className='space-y-3'>
                {partyMembers.map((member) => (
                  <div key={member.id} className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                    <div className='w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold'>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium text-slate-900'>
                        {member.isYou ? 'You' : member.name}
                      </p>
                      <div className='flex items-center gap-1 text-xs text-slate-600'>
                        <span className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {member.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Progress */}
            <div className='bg-white rounded-2xl shadow-md p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4 flex items-center gap-2'>
                <span>📊</span> Your Progress
              </h3>
              <div className='space-y-4'>
                <div>
                  <p className='text-slate-700 font-medium text-sm mb-2'>Questions Solved</p>
                  <p className='text-2xl font-bold text-orange-500'>{currentQuestionIndex + 1}/{questions.length}</p>
                </div>
                <button className='w-full px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors text-sm'>
                  📈 Score Breakdown
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
