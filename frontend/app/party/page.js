'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Party() {
  const router = useRouter()
  const [parties, setParties] = useState([
    {
      id: 1,
      title: 'Algorithm Mastery',
      challenge: 'Binary Tree & Recursion',
      members: { current: 3, total: 8 },
      status: 'Active',
      createdTime: '2 hours ago'
    },
    {
      id: 2,
      title: 'Data Structures Pro',
      challenge: 'Hash Tables & Arrays',
      members: { current: 5, total: 8 },
      status: 'Active',
      createdTime: '1 hour ago'
    },
    {
      id: 3,
      title: 'Full Stack Challenge',
      challenge: 'Design Scalable Architecture',
      members: { current: 2, total: 6 },
      status: 'Active',
      createdTime: '30 mins ago'
    }
  ])

  const handleJoinRoom = (partyId) => {
    router.push(`/party/${partyId}`)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-4xl'>🎉</span>
            <h1 className='text-4xl font-bold text-slate-900'>Party Interview Mode</h1>
          </div>
          <p className='text-slate-600 text-lg'>Solve problems collaboratively and get AI-powered feedback</p>
        </div>

        {/* Available Parties Section */}
        <div>
          <h2 className='text-2xl font-bold text-slate-900 mb-8'>Available Parties</h2>
          
          {/* Party Cards Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {parties.map((party) => (
              <div key={party.id} className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6'>
                {/* Title and Status */}
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='text-xl font-bold text-slate-900'>{party.title}</h3>
                  <span className='px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full'>
                    {party.status}
                  </span>
                </div>

                {/* Challenge Description */}
                <p className='text-slate-600 text-sm mb-4'>
                  Challenge: {party.challenge}
                </p>

                {/* Members Info */}
                <div className='mb-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-slate-700 text-sm'>👥 Members: {party.members.current}/{party.members.total}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className='w-full bg-slate-200 rounded-full h-2'>
                    <div 
                      className='bg-orange-500 h-2 rounded-full transition-all'
                      style={{ width: `${(party.members.current / party.members.total) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Created Time */}
                <p className='text-slate-500 text-xs mb-4'>Created {party.createdTime}</p>

                {/* Join Room Button */}
                <button 
                  onClick={() => handleJoinRoom(party.id)}
                  className='w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  <span>🎧</span>
                  Join Room
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
