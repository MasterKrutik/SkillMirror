export async function GET(){
  return new Response(JSON.stringify({
    score: 76,
    components: { resume:78, audio:72, video:70, writing:85, technical:65 }
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

