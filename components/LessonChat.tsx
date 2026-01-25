
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LessonContent, ChatMessage } from '../types';
import { speakText, stopSpeech } from '../services/ttsService';
import HighlightedText from './HighlightedText';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface LessonChatProps {
  lessonTitle: string;
  content: LessonContent;
  lang: 'ne' | 'en';
}

const LessonChat: React.FC<LessonChatProps> = ({ lessonTitle, content, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [readingMessageIdx, setReadingMessageIdx] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const systemInstruction = lang === 'ne' 
      ? `तपाईं एक विशेषज्ञ शिक्षक र सहायक हुनुहुन्छ। हालको पाठ: "${lessonTitle}"। पाठको मुख्य सामग्री: "${content.script}"। 
         नियमहरू:
         १. केवल नेपाली भाषामा र मित्रवत व्यवहारमा जवाफ दिनुहोस्।
         २. व्याख्या गर्दा पाठको सन्दर्भ प्रयोग गर्नुहोस् (RAG)।
         ३. क्विजका उत्तरहरू सिधै नदिनुहोस्, बरु विद्यार्थीलाई सोच्न लगाउनुहोस्।`
      : `You are an expert tutor and AI assistant. Current lesson: "${lessonTitle}". Lesson content: "${content.script}".
         Rules:
         1. Respond only in English in a friendly, pedagogical tone.
         2. Use the provided lesson context for explanations (RAG).
         3. Never reveal quiz answers directly; instead, guide the user to the correct concept.`;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), 
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: { systemInstruction }
      });

      const modelText = result.text || (lang === 'ne' ? "माफ गर्नुहोस्, नेटवर्कमा समस्या भयो।" : "Sorry, I encountered a network issue.");
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: lang === 'ne' ? "सम्पर्क विच्छेद भयो। कृपया फेरि प्रयास गर्नुहोस्।" : "Connection lost. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoice = async (index: number, text: string) => {
    if (readingMessageIdx === index) {
      stopSpeech();
      setReadingMessageIdx(null);
      setAudioProgress(0);
      return;
    }

    try {
      setReadingMessageIdx(index);
      setAudioProgress(0);
      await speakText(text, lang, (p) => setAudioProgress(p));
    } catch (error) {
      console.error("Audio playback error:", error);
    } finally {
      setReadingMessageIdx(null);
      setAudioProgress(0);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-lg flex flex-col h-[500px] overflow-hidden group/chat relative">
      <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm">🎓</div>
          <div>
            <h3 className="font-black text-slate-900 text-sm leading-tight">
              {lang === 'ne' ? 'AI सहायक' : 'AI Assistant'}
            </h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</p>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="text-4xl opacity-20">🤖</div>
            <p className="text-sm text-slate-400 font-bold px-4">
              {lang === 'ne' ? 'पाठको बारेमा मलाई सोध्नुहोस्।' : 'Ask me anything about this lesson.'}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group items-end gap-2`}>
            {m.role === 'model' && (
              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs shrink-0">🎓</div>
            )}
            <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              <HighlightedText 
                text={m.text} 
                progress={audioProgress} 
                active={readingMessageIdx === i}
              />
              {m.role === 'model' && (
                <button 
                  onClick={() => handleToggleVoice(i, m.text)}
                  className={`absolute -right-10 bottom-0 w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${readingMessageIdx === i ? 'opacity-100 text-indigo-600' : ''}`}
                >
                  <span className="text-sm">{readingMessageIdx === i ? '⏹' : '🔊'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-2 items-end">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-xs shrink-0">⌛</div>
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none flex gap-1 shadow-inner">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-50 flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={lang === 'ne' ? 'सोध्नुहोस्...' : 'Ask...'}
          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 transition-all"
        />
        <button 
          onClick={handleSend} 
          disabled={isTyping || !input.trim()} 
          className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 disabled:opacity-30"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9-7-9-7V9l7 3-7 3v4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LessonChat;
