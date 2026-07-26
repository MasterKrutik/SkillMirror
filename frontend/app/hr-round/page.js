"use client"
import { useState } from 'react'
import Link from 'next/link'

export default function HRRound() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)

  const questions = [
    {
      id: 1,
      question: 'Can you effectively communicate complex ideas to team members?',
      correctAnswer: 'yes'
    },
    {
      id: 2,
      question: 'Do you actively listen to others during conversations?',
      correctAnswer: 'yes'
    },
    {
      id: 3,
      question: 'Is it important to provide regular feedback to your team?',
      correctAnswer: 'yes'
    },
    {
      id: 4,
      question: 'Do you avoid giving presentations to large groups?',
      correctAnswer: 'no'
    },
    {
      id: 5,
      question: 'Can you work effectively in a team environment?',
      correctAnswer: 'yes'
    },
    {
      id: 6,
      question: 'Do you tend to dominate conversations?',
      correctAnswer: 'no'
    },
    {
      id: 7,
      question: 'Is it necessary to understand non-verbal cues in communication?',
      correctAnswer: 'yes'
    },
    {
      id: 8,
      question: 'Do you prefer to work alone rather than in teams?',
      correctAnswer: 'no'
    }
  ]

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }))

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const getScore = () => {
    let correct = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correct++
      }
    })
    return { correct, total: questions.length }
  }

  const score = getScore()
  const percentage = Math.round((score.correct / score.total) * 100)

  const resetTest = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
  }

  if (showResults) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-white via-[#fff7f7] to-[#fff5f5] py-12 px-4'>
        <div className='max-w-2xl mx-auto'>
          {/* Results Card */}
          <div className='card-gradient rounded-2xl p-8 shadow-lg mb-8 animate-fadeInUp'>
            <div className='text-center mb-8'>
              <h1 className='text-4xl font-bold text-slate-800 mb-4'>Test Results</h1>
              <div className='text-6xl font-bold mb-4'>
                <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                  {percentage}%
                </span>
              </div>
              <p className='text-lg text-slate-600'>
                You got <span className='font-bold text-slate-800'>{score.correct}</span> out of <span className='font-bold text-slate-800'>{score.total}</span> correct
              </p>
              <div className='mt-4 text-sm'>
                {percentage >= 70 ? (
                  <p className='text-green-600 font-semibold'>✓ Great job! Your communication skills are strong.</p>
                ) : percentage >= 50 ? (
                  <p className='text-yellow-600 font-semibold'>→ Good effort! Keep practicing to improve.</p>
                ) : (
                  <p className='text-red-600 font-semibold'>↻ Keep practicing! Focus on communication fundamentals.</p>
                )}
              </div>
            </div>

            {/* Detailed Results */}
            <div className='space-y-4 mb-8'>
              <h2 className='text-xl font-bold text-slate-800 mb-4'>Question Review</h2>
              {questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.correctAnswer
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='font-semibold text-slate-800 mb-2'>Q{idx + 1}: {q.question}</div>
                        <div className='text-sm text-slate-600'>
                          Your answer: <span className='font-semibold'>{answers[idx] ? answers[idx].toUpperCase() : 'Not answered'}</span>
                          {!isCorrect && (
                            <div className='mt-1 text-xs text-slate-600'>Correct answer: <span className='font-semibold'>{q.correctAnswer.toUpperCase()}</span></div>
                          )}
                        </div>
                      </div>
                      <div className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? '✓' : '✕'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-4'>
              <button
                onClick={resetTest}
                className='flex-1 btn-primary py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg'
              >
                Retake Test
              </button>
              <Link
                href='/interview'
                className='flex-1 px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all text-center'
              >
                Back to Interview
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-[#fff7f7] to-[#fff5f5] py-12 px-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <div className='mb-8 animate-fadeInUp'>
          <h1 className='text-3xl font-bold text-slate-800 mb-2'>HR Round - Communication Skills</h1>
          <p className='text-slate-600'>Answer yes or no questions to assess your communication abilities</p>
        </div>

        {/* Progress Bar */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-semibold text-slate-600'>Question {currentQuestion + 1} of {questions.length}</span>
            <span className='text-sm font-semibold text-slate-600'>{Math.round(progress)}%</span>
          </div>
          <div className='w-full h-3 bg-indigo-100 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Test Board */}
        <div className='card-gradient rounded-2xl p-8 shadow-lg mb-8 animate-fadeInUp'>
          <div className='text-center mb-8'>
            <div className='text-5xl mb-6'>❓</div>
            <h2 className='text-2xl font-bold text-slate-800 leading-relaxed'>{currentQ.question}</h2>
          </div>

          {/* Answer Buttons */}
          <div className='grid grid-cols-2 gap-4'>
            <button
              onClick={() => handleAnswer('yes')}
              className='p-6 border-3 border-green-300 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105'
            >
              <div className='text-3xl mb-2'>✓</div>
              <div className='font-bold text-lg text-green-700'>YES</div>
            </button>
            <button
              onClick={() => handleAnswer('no')}
              className='p-6 border-3 border-red-300 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105'
            >
              <div className='text-3xl mb-2'>✕</div>
              <div className='font-bold text-lg text-red-700'>NO</div>
            </button>
          </div>
        </div>

        {/* Question Indicator */}
        <div className='flex gap-2 flex-wrap justify-center'>
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                idx === currentQuestion
                  ? 'bg-red-600 text-white scale-110'
                  : idx < currentQuestion
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {idx < currentQuestion && '✓'}
              {idx === currentQuestion && idx + 1}
              {idx > currentQuestion && idx + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
