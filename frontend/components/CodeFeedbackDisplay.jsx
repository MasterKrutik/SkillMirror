'use client';

import React from 'react';
import { 
  getScoreColor, 
  getVerdictDetails, 
  getLanguageIcon,
  generatePointsReward,
  formatCodeSnippet
} from '@/utils/codeAnalysisUtils';

export default function CodeFeedbackDisplay({ analysis, problemTitle, difficulty, onClose }) {
  if (!analysis) return null;

  const scoreColor = getScoreColor(analysis.score || 0);
  const verdictInfo = getVerdictDetails(analysis.verdict || 'NEEDS_WORK');
  const pointsEarned = generatePointsReward(analysis.score || 0, difficulty);

  return (
    <div className='space-y-6'>
      {/* Score Overview */}
      <div className={`${scoreColor.bg} border-l-4 ${scoreColor.badge} p-6 rounded-lg`}>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className={`text-3xl font-bold ${scoreColor.text}`}>
              {analysis.score || 0}
            </div>
            <div className='flex-1'>
              <h3 className={`font-bold text-lg ${scoreColor.text}`}>
                {verdictInfo.title}
              </h3>
              <p className='text-sm opacity-90'>{verdictInfo.message}</p>
            </div>
          </div>
          <div className='text-right'>
            <div className={`text-3xl font-bold ${scoreColor.text}`}>+{pointsEarned}</div>
            <div className='text-sm opacity-75'>points earned</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {analysis.summary && (
        <div className='bg-slate-50 p-4 rounded-lg border border-slate-200'>
          <h3 className='font-bold text-slate-800 mb-2'>Summary</h3>
          <p className='text-slate-700'>{analysis.summary}</p>
        </div>
      )}

      {/* Correctness */}
      {analysis.correctness && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-2 flex items-center gap-2'>
            {analysis.correctness.status === 'CORRECT' ? '✓' : '⚠'} Correctness Analysis
          </h3>
          <p className='text-slate-700 mb-2'>{analysis.correctness.feedback}</p>
          {analysis.correctness.issuesFound && analysis.correctness.issuesFound.length > 0 && (
            <div className='bg-red-50 border border-red-200 rounded p-3 mt-2'>
              <p className='font-semibold text-red-900 text-sm mb-2'>Issues Found:</p>
              <ul className='space-y-1'>
                {analysis.correctness.issuesFound.map((issue, idx) => (
                  <li key={idx} className='text-sm text-red-800'>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Complexity Analysis */}
      {analysis.efficiency && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-3'>⚡ Complexity Analysis</h3>
          <div className='grid grid-cols-2 gap-4 mb-3'>
            <div className='bg-blue-50 p-3 rounded'>
              <div className='text-xs text-slate-600 uppercase font-semibold'>Time Complexity</div>
              <div className='text-lg font-bold text-blue-600 font-mono'>
                {analysis.efficiency.timeComplexity || 'Unknown'}
              </div>
              {analysis.efficiency.isOptimal === false && (
                <div className='text-xs text-orange-600 mt-1'>Can be optimized</div>
              )}
            </div>
            <div className='bg-green-50 p-3 rounded'>
              <div className='text-xs text-slate-600 uppercase font-semibold'>Space Complexity</div>
              <div className='text-lg font-bold text-green-600 font-mono'>
                {analysis.efficiency.spaceComplexity || 'Unknown'}
              </div>
            </div>
          </div>
          {analysis.efficiency.suggestions && (
            <p className='text-slate-700 text-sm bg-yellow-50 p-3 rounded border border-yellow-200'>
              💡 {analysis.efficiency.suggestions}
            </p>
          )}
        </div>
      )}

      {/* Code Quality */}
      {analysis.codeQuality && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-3'>📝 Code Quality</h3>
          <div className='space-y-2 mb-3'>
            {analysis.codeQuality.readability && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-700'>Readability:</span>
                <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-xs'>
                  {analysis.codeQuality.readability}
                </span>
              </div>
            )}
            {analysis.codeQuality.structure && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-700'>Structure:</span>
                <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-xs'>
                  {analysis.codeQuality.structure}
                </span>
              </div>
            )}
            {analysis.codeQuality.naming && (
              <div className='flex items-center justify-between text-sm'>
                <span className='text-slate-700'>Variable Naming:</span>
                <span className='text-slate-600 text-xs'>{analysis.codeQuality.naming}</span>
              </div>
            )}
          </div>
          {analysis.codeQuality.issues && analysis.codeQuality.issues.length > 0 && (
            <div className='bg-amber-50 border border-amber-200 rounded p-3'>
              <p className='font-semibold text-amber-900 text-sm mb-2'>Areas to Improve:</p>
              <ul className='space-y-1'>
                {analysis.codeQuality.issues.map((issue, idx) => (
                  <li key={idx} className='text-sm text-amber-800'>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Best Practices */}
      {analysis.bestPractices && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-3'>✅ Best Practices</h3>
          {analysis.bestPractices.follows && analysis.bestPractices.follows.length > 0 && (
            <div className='mb-3'>
              <p className='text-sm text-slate-600 mb-2 font-semibold'>Practices You Followed:</p>
              <div className='space-y-1'>
                {analysis.bestPractices.follows.map((practice, idx) => (
                  <div key={idx} className='text-sm text-green-700 flex items-center gap-2'>
                    <span>✓</span> {practice}
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.bestPractices.missing && analysis.bestPractices.missing.length > 0 && (
            <div>
              <p className='text-sm text-slate-600 mb-2 font-semibold'>Practices to Learn:</p>
              <div className='space-y-1'>
                {analysis.bestPractices.missing.map((practice, idx) => (
                  <div key={idx} className='text-sm text-orange-700 flex items-center gap-2'>
                    <span>→</span> {practice}
                  </div>
                ))}
              </div>
            </div>
          )}
          {analysis.bestPractices.suggestions && (
            <p className='text-slate-700 text-sm mt-3 bg-blue-50 p-3 rounded border border-blue-200'>
              {analysis.bestPractices.suggestions}
            </p>
          )}
        </div>
      )}

      {/* Edge Cases */}
      {analysis.edgeCases && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-3'>🎯 Edge Cases</h3>
          {analysis.edgeCases.handled && analysis.edgeCases.handled.length > 0 && (
            <div className='mb-3'>
              <p className='text-sm text-green-700 font-semibold mb-2'>Properly Handled:</p>
              <div className='space-y-1'>
                {analysis.edgeCases.handled.map((edge, idx) => (
                  <div key={idx} className='text-sm text-green-700'>• {edge}</div>
                ))}
              </div>
            </div>
          )}
          {analysis.edgeCases.missing && analysis.edgeCases.missing.length > 0 && (
            <div className='bg-red-50 border border-red-200 rounded p-3'>
              <p className='text-sm text-red-900 font-semibold mb-2'>Missing Edge Cases:</p>
              <ul className='space-y-1'>
                {analysis.edgeCases.missing.map((edge, idx) => (
                  <li key={idx} className='text-sm text-red-800'>• {edge}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Code Improvements */}
      {analysis.improvements && analysis.improvements.length > 0 && (
        <div className='border border-slate-200 rounded-lg p-4'>
          <h3 className='font-bold text-slate-800 mb-4'>💡 Suggested Improvements</h3>
          <div className='space-y-4'>
            {analysis.improvements.map((improvement, idx) => (
              <div key={idx} className='border border-slate-300 rounded-lg p-4 bg-slate-50'>
                <h4 className='font-bold text-slate-800 mb-3'>{idx + 1}. {improvement.title}</h4>
                
                <div className='mb-3'>
                  <p className='text-xs text-slate-600 font-semibold mb-1'>Current:</p>
                  <div className='bg-red-50 border border-red-200 rounded p-2 font-mono text-xs overflow-x-auto'>
                    <pre>{formatCodeSnippet(improvement.current)}</pre>
                  </div>
                </div>

                <div className='mb-3'>
                  <p className='text-xs text-slate-600 font-semibold mb-1'>Suggested:</p>
                  <div className='bg-green-50 border border-green-200 rounded p-2 font-mono text-xs overflow-x-auto'>
                    <pre>{formatCodeSnippet(improvement.suggested)}</pre>
                  </div>
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded p-3'>
                  <p className='text-sm text-blue-900'>{improvement.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Points */}
      {analysis.learningPoints && analysis.learningPoints.length > 0 && (
        <div className='border border-slate-200 rounded-lg p-4 bg-purple-50'>
          <h3 className='font-bold text-slate-800 mb-3'>📚 Key Learning Points</h3>
          <ul className='space-y-2'>
            {analysis.learningPoints.map((point, idx) => (
              <li key={idx} className='flex items-start gap-3 text-slate-700'>
                <span className='text-purple-600 font-bold mt-0.5'>→</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {analysis.nextSteps && analysis.nextSteps.length > 0 && (
        <div className='border border-slate-200 rounded-lg p-4 bg-green-50'>
          <h3 className='font-bold text-slate-800 mb-3'>🚀 Next Steps</h3>
          <ol className='space-y-2 list-decimal list-inside'>
            {analysis.nextSteps.map((step, idx) => (
              <li key={idx} className='text-slate-700'>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Encouragement */}
      {analysis.encouragement && (
        <div className='bg-gradient-to-r from-purple-100 to-pink-100 border-l-4 border-purple-500 p-4 rounded-lg'>
          <p className='text-slate-800 italic'>💪 {analysis.encouragement}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-4 border-t border-slate-200'>
        <button
          onClick={onClose}
          className='flex-1 px-4 py-2 border-2 border-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-50 transition-all'
        >
          ← Back to Editor
        </button>
        <button
          onClick={() => {
            // TODO: Implement try-again functionality
            window.location.reload();
          }}
          className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all'
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
