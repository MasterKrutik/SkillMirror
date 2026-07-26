export default function ResumePreview({ data }){
  const { atsScore = 0, skills = [], summary = 'No summary', gaps = [], name = 'Resume', score = 0 } = data || {}
  const displayScore = atsScore || score || 0

  return (
    <div className='card-gradient rounded-2xl p-8 shadow-lg border border-indigo-100'>
      {/* Header */}
      <div className='flex items-start justify-between mb-8 pb-8 border-b border-indigo-200'>
        <div>
          <h2 className='text-2xl font-bold text-slate-800'>{name}</h2>
          <p className='text-slate-600 mt-1'>Resume Analysis Report</p>
        </div>
        <div className='text-center'>
          <div className='relative w-20 h-20'>
            <svg className='w-full h-full transform -rotate-90' style={{filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.2))'}}>
              <circle cx='40' cy='40' r='35' fill='none' stroke='#e5e7eb' strokeWidth='3'/>
              <circle 
                cx='40' cy='40' r='35' fill='none' stroke='url(#scoreGrad)' strokeWidth='3'
                strokeDasharray={`${displayScore * 219.91 / 100} 219.91`}
                strokeLinecap='round'
              />
              <defs>
                <linearGradient id='scoreGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
                  <stop offset='0%' stopColor='#667eea'/>
                  <stop offset='100%' stopColor='#764ba2'/>
                </linearGradient>
              </defs>
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center'>
                <p className='font-bold text-indigo-600'>{displayScore}</p>
                <p className='text-xs text-slate-600'>/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className='mb-8'>
          <h3 className='font-bold text-slate-800 mb-3 flex items-center gap-2'>
            <span>📝</span> Summary
          </h3>
          <p className='text-slate-700 leading-relaxed'>{summary}</p>
        </div>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className='mb-8'>
          <h3 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
            <span>🔧</span> Detected Skills ({skills.length})
          </h3>
          <div className='flex flex-wrap gap-3'>
            {skills.map(skill => (
              <div 
                key={skill}
                className='px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300 text-indigo-700 rounded-lg text-sm font-semibold hover:shadow-md transition-all duration-300'
              >
                ✓ {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps / Improvements */}
      {gaps && gaps.length > 0 && (
        <div>
          <h3 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
            <span>🎯</span> Areas for Improvement
          </h3>
          <div className='space-y-3'>
            {gaps.map((gap, i) => (
              <div 
                key={i}
                className='flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-l-4 border-amber-400'
              >
                <span className='text-xl mt-0.5'>💡</span>
                <p className='text-slate-700 text-sm leading-relaxed'>{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className='mt-8 pt-8 border-t border-indigo-200'>
        <button className='w-full btn-primary py-3 rounded-lg font-semibold transition-all duration-300'>
          📊 Download Full Report
        </button>
      </div>
    </div>
  )
}

