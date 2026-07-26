export async function POST(req){
  const body = await req.json().catch(()=>({}));
  const q = body.q || ''
  return new Response(JSON.stringify({
    answer: `Demo AI-alumni answer to: ${q}`
  }))
}
