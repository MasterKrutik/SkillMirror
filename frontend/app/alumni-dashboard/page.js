'use client'
import { useState } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'
import ChatBox from '@/components/ChatbotWidget'

export default function AlumniDashboard(){
  const [connectedMentors, setConnectedMentors] = useState({})

  const mentors = [
    { name: 'Sarah Johnson', role: 'Senior Product Manager', company: 'Google', rating: 4.9, mentees: 45, gender: 'female' },
    { name: 'Raj Kumar', role: 'DevOps Engineer', company: 'AWS', rating: 4.8, mentees: 32, gender: 'male' },
    { name: 'Lisa Wong', role: 'Data Scientist', company: 'Meta', rating: 4.7, mentees: 28, gender: 'female' },
    { name: 'Michael Chen', role: 'Full Stack Developer', company: 'Microsoft', rating: 4.8, mentees: 41, gender: 'male' },
  ]

  const successStories = [
    { name: 'Priya Sharma', position: 'SDE at Google', year: '2023' },
    { name: 'Amit Patel', position: 'PM at Amazon', year: '2023' },
    { name: 'Neha Gupta', position: 'AI Engineer at OpenAI', year: '2024' },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-12 animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-2 text-slate-800'>
            <span className='gradient-text'>Alumni Network</span>
          </h1>
          <p className='text-slate-600'>Connect with experienced professionals, get mentorship, and accelerate your career</p>
        </div>

        {/* Featured Mentors */}
        <h2 className='text-2xl font-bold text-slate-800 mb-6'>Featured Mentors</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {mentors.map((mentor, idx) => (
            <div 
              key={idx}
              className='card-gradient rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-indigo-100 hover:border-indigo-300 animate-slideInLeft group'
              style={{animationDelay: `${idx * 0.1}s`}}
            >
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mb-4'>
                {mentor.gender === 'male' ? (
                  <span className='text-xl'>👨‍💼</span>
                ) : (
                  <span className='text-xl'>👩‍💼</span>
                )}
              </div>
              <h3 className='font-bold text-slate-800 mb-1'>{mentor.name}</h3>
              <p className='text-sm text-indigo-600 font-semibold mb-3'>{mentor.role}</p>
              <p className='text-xs text-slate-600 mb-4'>@ {mentor.company}</p>
              
              <div className='flex items-center gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='text-yellow-400 text-sm'>★</span>
                ))}
                <span className='text-xs text-slate-600 ml-1'>({mentor.rating})</span>
              </div>

              <div className='text-xs text-slate-600 mb-4 pb-4 border-b border-indigo-200'>
                {mentor.mentees} students mentored
              </div>

              <button 
                onClick={() => setConnectedMentors(prev => ({...prev, [idx]: true}))}
                className={`w-full py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  connectedMentors[idx] 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'btn-primary group-hover:shadow-lg'
                }`}
              >
                {connectedMentors[idx] ? '✓ Request Sent' : 'Connect'}
              </button>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <h2 className='text-2xl font-bold text-slate-800 mb-6'>Success Stories</h2>
        <div className='card-gradient rounded-2xl p-8 shadow-lg mb-12 animate-slideInRight'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {successStories.map((story, idx) => (
              <div key={idx} className='text-center'>
                <div className='w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold'>
                  {story.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <h3 className='font-bold text-slate-800 text-lg mb-1'>{story.name}</h3>
                <p className='text-indigo-600 font-semibold text-sm mb-2'>{story.position}</p>
                <p className='text-xs text-slate-500'>Placed in {story.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Chat Section */}
          <div className='lg:col-span-2'>
            <div className='animate-slideInLeft'>
              <ChatBox />
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className='space-y-6 animate-slideInRight'>
            {/* Statistics */}
            <div className='card-gradient rounded-2xl p-6 shadow-lg'>
              <h3 className='font-bold text-slate-800 mb-6'>Network Stats</h3>
              <div className='space-y-4'>
                {[
                  { label: 'Active Mentors', value: '234' },
                  { label: 'Success Placements', value: '1,200+' },
                  { label: 'Avg Salary Growth', value: '35%' },
                ].map((stat, idx) => (
                  <div key={idx} className='p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200'>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-700 text-sm'>{stat.label}</span>
                      <span className='text-2xl' aria-hidden>•</span>
                    </div>
                    <p className='font-bold text-indigo-600 text-lg mt-1'>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className='card-gradient rounded-2xl p-6 shadow-lg'>
              <h3 className='font-bold text-slate-800 mb-4'>Quick Links</h3>
              <div className='space-y-2'>
                {[
                  { label: 'Browse Mentors' },
                  { label: 'Ask Questions' },
                  { label: 'Join Groups' },
                  { label: 'View Resources' },
                ].map((link, idx) => (
                  <button
                    key={idx}
                    className='w-full text-left p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-300 text-slate-700 font-semibold text-sm flex items-center gap-2'
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className='bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white text-center shadow-lg'>
              <div className='text-3xl mb-3'>🎯</div>
              <h3 className='font-bold mb-2'>Ready to Excel?</h3>
              <p className='text-sm text-indigo-100 mb-4'>Schedule a mentoring session with one of our alumni experts</p>
              <button className='w-full bg-white text-indigo-600 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-300'>
                Book a Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

