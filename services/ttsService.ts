
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let progressInterval: number | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioCtx;
}

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function speakText(
  text: string, 
  language: 'ne' | 'en', 
  onProgress?: (progress: number) => void
): Promise<void> {
  stopSpeech();

  const ctx = getAudioContext();
  const voiceName = language === 'ne' ? 'Kore' : 'Zephyr';
  const prompt = language === 'ne' 
    ? `तपाईं एक स्पष्ट र मित्रवत शिक्षक हुनुहुन्छ। यो पाठ पढ्नुहोस्: ${text}`
    : `Read this lesson content clearly and professionally: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioBytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, ctx);
    
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    
    const startTime = ctx.currentTime;
    const duration = audioBuffer.duration;

    if (onProgress) {
      progressInterval = window.setInterval(() => {
        const elapsed = ctx.currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        onProgress(progress);
        if (progress >= 1) {
          if (progressInterval) clearInterval(progressInterval);
        }
      }, 50);
    }

    return new Promise((resolve) => {
      source.onended = () => {
        if (progressInterval) clearInterval(progressInterval);
        currentSource = null;
        if (onProgress) onProgress(1);
        resolve();
      };
      currentSource = source;
      source.start();
    });
  } catch (error) {
    if (progressInterval) clearInterval(progressInterval);
    console.error("TTS generation failed:", error);
    throw error;
  }
}

export function stopSpeech() {
  if (currentSource) {
    // Fix: Change 'source.stop()' to 'currentSource.stop()' to reference the tracked node.
    try { currentSource.stop(); } catch(e) {}
    currentSource = null;
  }
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}
