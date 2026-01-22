
import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent } from "../types";
import { getGlobalLessonContent, setGlobalLessonContent } from "../databaseService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeLessonSource(lessonId: string, title: string, description: string, language: 'ne' | 'en'): Promise<LessonContent> {
  // 1. Check Cache First
  const cached = await getGlobalLessonContent(lessonId, language);
  if (cached) {
    return cached;
  }

  // 2. Generate with Gemini
  const langLabel = language === 'ne' ? 'Nepali' : 'English';
  const prompt = `
    Role: Senior Web3 & AI Teacher.
    Objective: Create a comprehensive and high-quality lesson on "${title}" (${description}) for learners in ${langLabel}.
    Instruction: Strictly valid JSON. All text must be in ${langLabel}.
    Requirement: You MUST provide exactly 5 (five) quiz questions. Each question must have 3 options and a clear explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                },
                required: ["word", "meaning"]
              }
            },
            summary: { type: Type.STRING },
            captions: { type: Type.ARRAY, items: { type: Type.STRING } },
            quiz: {
              type: Type.ARRAY,
              minItems: 5,
              maxItems: 5,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 3, maxItems: 3 },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["script", "vocabulary", "summary", "captions", "quiz"]
        }
      }
    });

    const data: LessonContent = JSON.parse(response.text);

    // Attach sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      data.sources = groundingChunks
        .map((chunk: any) => chunk.web ? { title: chunk.web.title || "Web Source", url: chunk.web.uri } : null)
        .filter(Boolean);
    }

    // 3. Save to Global Cache
    await setGlobalLessonContent(lessonId, language, data);

    return data;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    
    return {
      script: language === 'ne' ? "सामग्री लोड गर्न सकिएन। कृपया फेरि प्रयास गर्नुहोस्।" : "Failed to load content. Please try again.",
      vocabulary: [{ word: "Error", meaning: language === 'ne' ? "डाटा प्राप्त गर्दा समस्या भयो।" : "Issue fetching data." }],
      summary: language === 'ne' ? "कृपया पुन: लोड गर्नुहोस्।" : "Please reload.",
      captions: ["Error"],
      quiz: []
    };
  }
}
