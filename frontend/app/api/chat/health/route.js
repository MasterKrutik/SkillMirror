export async function GET() {
  return Response.json({
    status: "operational",
    project: "SkillMirror",
    sdk: "google-genai",
    active_fallback_chain: [
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash"
    ],
    primary_model: "gemini-3.6-flash",
    streaming: true,
    transport: "Server-Sent Events (SSE)"
  }, { status: 200 });
}
