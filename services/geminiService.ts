
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { LessonContent, CourseCategory, CourseLevel } from "../types";
import { getGlobalLessonContent, setGlobalLessonContent } from "../databaseService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const status = error?.status || (error?.message?.includes('429') ? 429 : error?.message?.includes('403') ? 403 : 500);
    if (status === 403) throw error;
    const isRetryable = status === 429 || status === 500 || status === 503 || error?.message?.includes('xhr error');
    if (retries > 0 && isRetryable) {
      const nextDelay = status === 429 ? delay * 2 : delay;
      await new Promise(resolve => setTimeout(resolve, nextDelay + Math.random() * 500));
      return withRetry(fn, retries - 1, nextDelay);
    }
    throw error;
  }
}

async function generateLessonImage(category: CourseCategory, title: string): Promise<string | undefined> {
  try {
    // Map categories to concise English visual keywords
    const visualKeywords: Record<string, string> = {
      'tech': 'Future AI, Web3, Blockchain',
      'entrepreneur': 'Business Strategy, Wealth, Growth',
      'abacus': 'Brain Power, Mental Math, Abacus',
      'digital-literacy': 'Cyber Security, Digital Safety'
    };

    const theme = visualKeywords[category] || 'Educational';
    
    // Using minimum text and only English for the prompt
    const prompt = `Minimal 3D icon: ${theme}. Professional educational style, clean background.`;

    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    }));

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  } catch (e) {
    console.error("Image generation skipped:", e);
  }
  return undefined;
}

async function fetchSources(query: string): Promise<{ title: string; url: string }[]> {
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 3 high-quality, reputable educational articles or guides about: ${query}. Focus on informative and safe links.`,
      config: { tools: [{ googleSearch: {} }] },
    }));
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) return chunks.map((c: any) => (c.web ? { title: c.web.title || "Reference", url: c.web.uri } : null)).filter(Boolean);
  } catch (e: any) {
    console.warn("Search tool restricted or failed.");
  }
  return [];
}

export async function analyzeLessonSource(
  lessonId: string, 
  title: string, 
  description: string, 
  language: 'ne' | 'en',
  category: CourseCategory = 'tech',
  level: CourseLevel = 'easy'
): Promise<LessonContent> {
  const cached = await getGlobalLessonContent(lessonId, language);
  if (cached && cached.script) return cached;

  const langLabel = language === 'ne' ? 'Nepali' : 'English';
  
  let pedagogicalContext = "";
  if (category === 'abacus') {
    pedagogicalContext = `Focus on Abacus pedagogy and Brain Development. 
    Explain the coordination between the Left Brain (logic) and Right Brain (visualization). 
    Discuss the history of Soroban/Suanpan, neuroplasticity, concentration benefits, and photographic memory. 
    Do NOT mention Tech/Business. Level: ${level}.`;
  } else if (category === 'digital-literacy') {
    pedagogicalContext = `Focus on Digital Literacy and Cyber Security in Nepal. 
    Reference eSewa/Khalti scams, Nepal Cyber Bureau, Electronic Transactions Act. 
    Topics: 2FA, password safety, social media privacy. Practical and local advice for ${level} level.`;
  } else if (category === 'entrepreneur') {
    pedagogicalContext = `Focus on Business Strategy, Financial Literacy, NEPSE, and entrepreneurship in Nepal for ${level} level.`;
  } else {
    pedagogicalContext = `Focus on Web3, AI, Blockchain, and the future of technology for ${level} level.`;
  }

  const prompt = `
    Role: Expert Educator.
    Lesson: "${title}" (${description})
    Target Language: ${langLabel}.
    Context: ${pedagogicalContext}
    
    Instruction: Generate a comprehensive lesson plan in JSON format.
    1. "story": A historical fact, research insight, or relevant scenario.
    2. "script": Full detailed pedagogical text in ${langLabel} (min 800 words).
    3. "vocabulary": 5 important keywords with meanings.
    4. "summary": Key takeaways.
    5. "quiz": 5 high-quality questions with explanations.
  `;

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING },
            script: { type: Type.STRING },
            vocabulary: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, meaning: { type: Type.STRING } }, required: ["word", "meaning"] }
            },
            summary: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.INTEGER }, explanation: { type: Type.STRING } }, required: ["question", "options", "correctAnswer", "explanation"] }
            }
          },
          required: ["script", "vocabulary", "summary", "quiz"]
        }
      }
    }));

    const data: LessonContent = JSON.parse(response.text);
    
    // Passing category and title (ensuring English keywords are used in the generator)
    data.imageUrl = await generateLessonImage(category, title);
    
    data.sources = await fetchSources(`${title} ${category} ${level} research info`);
    data.captions = []; // Default empty
    
    await setGlobalLessonContent(lessonId, language, data);
    return data;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return { script: language === 'ne' ? "सामग्री लोड गर्न सकिएन।" : "Failed to load content.", vocabulary: [], summary: "", captions: [], quiz: [] };
  }
}
