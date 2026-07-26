export async function POST(req){
  return new Response(JSON.stringify({
    clarity: 'Good',
    fillers: 2,
    pace: 120,
    suggestions: ['Reduce filler words', 'Pause slightly between points'],
    notes: 'Strong clarity and confident tone'
  }), { status: 200 })
}
