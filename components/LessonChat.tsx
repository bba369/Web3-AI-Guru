
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    const systemInstruction = lang === 'ne' 
      ? `तपाईं Web3 AI गुरुको सहायक हुनुहुन्छ। पाठको सामग्री: ${content.script}. नियम: केवल नेपालीमा जवाफ दिनुहोस्। क्विजको उत्तर सिधै नदिनुहोस्। व्याख्या गर्नुहोस्।`
      : `You are the Web3 AI Guru assistant. Lesson context: ${content.script}. Rules: Respond only in English. Do not reveal quiz answers directly. Explain the concept instead.`;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { role: 'user', parts: [{ text: userMessage }] }],
        config: { systemInstruction }
      });

      const modelText = result.text || (lang === 'ne' ? "माफ गर्नुहोस्, नेटवर्कमा समस्या भयो।" : "Sorry, network issue.");
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: lang === 'ne' ? "सम्पर्क विच्छेद भयो।" : "Disconnected." }]);
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
    <div className="bg-white border-2 border-slate-100 rounded-[3rem] shadow-xl flex flex-col h-[650px] overflow-hidden">
      <div className="p-8 border-b-2 border-slate-50 bg-indigo-50/30 flex items-center justify-between">
        <h3 className="font-black text-slate-900 text-xl flex items-center gap-4">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
          {lang === 'ne' ? 'AI गुरु सहायक' : 'AI Guru Assistant'}
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-16 opacity-40">
            <div className="text-6xl mb-6">🤖</div>
            <p className="text-xl text-slate-500 font-black italic">
              {lang === 'ne' ? 'यो पाठको बारेमा मलाई केही सोध्नुहोस्।' : 'Ask me anything about this lesson.'}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group items-end gap-3`}>
            {m.role === 'model' && (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl shadow-inner shrink-0">
                🎓
              </div>
            )}
            <div className={`relative max-w-[85%] p-6 rounded-[2rem] text-xl md:text-2xl font-bold leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
              <HighlightedText 
                text={m.text} 
                progress={audioProgress} 
                active={readingMessageIdx === i}
              />
              {m.role === 'model' && (
                <button 
                  onClick={() => handleToggleVoice(i, m.text)}
                  className={`absolute -right-14 bottom-0 p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 shadow-lg transition-all opacity-0 group-hover:opacity-100 ${readingMessageIdx === i ? 'opacity-100 text-indigo-600 ring-2 ring-indigo-100' : ''}`}
                  title={lang === 'ne' ? 'सुन्नुहोस्' : 'Listen'}
                >
                  {readingMessageIdx === i ? '⏹' : '🔊'}
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-3 items-end">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl shrink-0">
              ⌛
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] rounded-tl-none flex gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce delay-100"></div>
              <div className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t-2 border-slate-100 flex gap-4">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={lang === 'ne' ? 'केही सोध्नुहोस्...' : 'Type a question...'}
          className="flex-1 bg-white border-2 border-slate-200 rounded-[2rem] px-8 py-5 text-xl font-bold focus:outline-none focus:border-indigo-600 transition-colors shadow-inner"
        />
        <button 
          onClick={handleSend} 
          disabled={isTyping} 
          className="bg-indigo-600 text-white w-16 h-16 rounded-[2rem] flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0 shadow-xl shadow-indigo-100 active:scale-90 disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9-7-9-7V9l7 3-7 3v4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LessonChat;
