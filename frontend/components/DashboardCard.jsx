import Link from 'next/link'

export default function DashboardCard({href, title, children, icon = '📌'}){
  return (
  <Link href={href} className='block card-gradient rounded-2xl hover:shadow-2xl transition-all duration-300 p-8 text-center hover:-translate-y-2 border border-red-100 hover:border-red-300 group'>
      <div className='text-4xl mb-4 group-hover:scale-110 transition-transform duration-300'>{icon}</div>
  <div className='text-xl font-bold text-slate-800 mb-3 group-hover:text-red-600 transition-colors'>{title}</div>
      <div className='text-sm text-slate-600 group-hover:text-slate-700'>{children}</div>
      <div className='mt-4 inline-flex items-center gap-2 text-red-600 font-semibold group-hover:gap-3 transition-all'>
        <span>Explore</span>
        <span className='group-hover:translate-x-1 transition-transform'>→</span>
      </div>
    </Link>
  )
}
