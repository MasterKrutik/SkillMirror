import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { concept, category } = await req.json();

    if (!concept || !concept.trim()) {
      return Response.json(
        { error: "Concept is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a technical concept explainer. Explain the concept "${concept}" in the category "${category}".

Provide a comprehensive explanation in JSON format:
{
  "title": "${concept}",
  "simple": "Simple one-sentence explanation suitable for beginners",
  "detailed": "Detailed explanation with technical depth",
  "analogy": "Real-world analogy to help understand the concept",
  "useCases": ["use case 1", "use case 2", "use case 3", "use case 4"],
  "examples": [
    {
      "language": "JavaScript or Python",
      "code": "practical code example"
    }
  ],
  "relatedConcepts": ["related concept 1", "related concept 2", "related concept 3"]
}

Make it educational, clear, and practical. Include a working code example.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from response
    let explanation;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      explanation = JSON.parse(cleanText);
    } catch (parseError) {
      // If JSON parsing fails, create structured response
      explanation = {
        title: concept,
        simple: `${concept} is a fundamental concept in ${category}.`,
        detailed: text,
        analogy: `Understanding ${concept} is like learning a new skill - it takes practice and patience.`,
        useCases: [
          "Building scalable applications",
          "Optimizing performance",
          "Solving complex problems",
          "Improving code quality"
        ],
        examples: [
          {
            language: "JavaScript",
            code: `// Example of ${concept}\nfunction example() {\n  // Implementation\n  return result;\n}`
          }
        ],
        relatedConcepts: ["Related Topic 1", "Related Topic 2", "Related Topic 3"]
      };
    }

    return Response.json(
      { 
        ...explanation,
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Concept Explainer API Error:", error);
    
    return Response.json(
      { 
        error: "Failed to explain concept",
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
