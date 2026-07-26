import Link from 'next/link'

export default function AuthCard({children, title='Sign in'}){
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-[#ef4444] to-[#fb7185] p-4'>
      <div className='w-full max-w-md card-gradient rounded-2xl shadow-2xl p-8 animate-fadeInUp'>
        {/* Logo Section */}
        <div className='text-center mb-8'>
          <div className='mx-auto w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark text-white font-bold mb-3'>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M4 12h16M12 4v16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className='text-3xl font-bold gradient-text mb-1'>SkillMirror</h2>
          <p className='text-slate-600 text-sm'>Your AI Career Companion</p>
        </div>

        {/* Title */}
        <h3 className='text-2xl font-bold text-center text-slate-800 mb-6'>{title}</h3>

        {/* Form */}
        <div className='mb-6'>
          {children}
        </div>

        {/* Divider */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-red-200'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-slate-500'>Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <div className='grid grid-cols-2 gap-4 mb-6'>
          <button className='w-full p-2 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-300 text-center font-semibold text-sm text-slate-700'>
            Sign in with Google
          </button>
          <button className='w-full p-2 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-300 text-center font-semibold text-sm text-slate-700'>
            Sign in with LinkedIn
          </button>
        </div>

        {/* Links */}
        <div className='text-center'>
          <p className='text-slate-600 text-sm mb-3'>
            {title === 'Login' ? "Don't have an account? " : "Already have an account? "}
            <Link 
              href={title === 'Login' ? '/register' : '/login'} 
              className='text-red-600 font-semibold hover:text-red-700 transition-colors'
            >
              {title === 'Login' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className='mt-6 pt-6 border-t border-red-100 text-center text-xs text-slate-500'>
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
