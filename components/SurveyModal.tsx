
import React, { useState } from 'react';
import { CourseLevel } from '../types';

interface SurveyModalProps {
  onComplete: (level: CourseLevel) => void;
  userEmail?: string;
  lang: 'ne' | 'en';
}

const SURVEY_DATA = {
  ne: {
    choiceTitle: "सिकाई यात्रा छान्नुहोस्",
    choiceDesc: "तपाईंको आवश्यकता अनुसार एउटा विकल्प छान्नुहोस्।",
    easyTitle: "सुरुवात देखि (Day 1)",
    easyDesc: "यदि तपाईं नयाँ हुनुहुन्छ भने डे-१ बाट सुरु गर्नुहोस्।",
    easyBtn: "सुरु गर्नुहोस्",
    expertTitle: "स्तर मापन परीक्षण",
    expertDesc: "१२ प्रश्नहरूको उत्तर दिएर आफ्नो उपयुक्त स्तर पत्ता लगाउनुहोस्।",
    expertBtn: "परीक्षण सुरु गर्नुहोस्",
    title: "Web3 ज्ञान मापन",
    subtitle: "१२ प्रश्नहरू",
    resultTitle: "परीक्षण सम्पन्न!",
    resultLevel: "हामीले तपाईंलाई यो स्तरमा राखेका छौं:",
    goBtn: "सिक्न सुरु गरौं",
    questions: [
      { question: "Web 3.0 को मुख्य विशेषता के हो?", options: ["केवल पढ्न मिल्ने", "विकेन्द्रीकरण र स्वामित्व", "कम्पनीको पूर्ण नियन्त्रण"], correctAnswer: 1, level: 'easy' },
      { question: "क्रिप्टो वालेट (Wallet) को मुख्य काम के हो?", options: ["फोटो भण्डारण गर्ने", "निजी साँचो (Private Key) सुरक्षित राख्ने", "भिडियो गेम खेल्ने"], correctAnswer: 1, level: 'easy' },
      { question: "ब्लकचेन (Blockchain) के हो?", options: ["केन्द्रीय सर्भर", "वितरित खाता (Distributed Ledger)", "सामाजिक सञ्जाल"], correctAnswer: 1, level: 'easy' },
      { question: "Bitcoin का संस्थापक को हुन्?", options: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin"], correctAnswer: 1, level: 'easy' },
      { question: "NFT को पूरा रूप के हो?", options: ["Non-Fungible Token", "New Financial Tool", "National Fund Transfer"], correctAnswer: 0, level: 'easy' },
      { question: "Smart Contract के मा चल्छ?", options: ["कागजमा", "ब्लकचेनमा", "बैंकको कम्प्युटरमा"], correctAnswer: 1, level: 'intermediate' },
      { question: "DAO को अर्थ के हो?", options: ["Digital Assets Office", "Decentralized Autonomous Organization", "Data Access Object"], correctAnswer: 1, level: 'intermediate' },
      { question: "Ethereum ब्लकचेनको मुख्य काम के हो?", options: ["केवल पैसा पठाउने", "स्मार्ट कन्ट्र्याक्ट र एप्स चलाउने", "इन्टरनेट ब्राउजिङ"], correctAnswer: 1, level: 'intermediate' },
      { question: "DeFi ले के बुझाउँछ?", options: ["Decentralized Finance", "Deep Finance", "Defined File"], correctAnswer: 0, level: 'intermediate' },
      { question: "Private Key हराएमा के हुन्छ?", options: ["नयाँ पासवर्ड माग्न मिल्छ", "आफ्नो सम्पत्ति सधैंको लागि हराउँछ", "बैंकमा गएर फिर्ता लिन मिल्छ"], correctAnswer: 1, level: 'hard' },
      { question: "Generative AI ले के गर्छ?", options: ["डाटा डिलिट गर्छ", "नयाँ सामग्री सिर्जना गर्छ", "कम्प्युटर बन्द गर्छ"], correctAnswer: 1, level: 'hard' },
      { question: "Gas Fee भनेको के हो?", options: ["पेट्रोलको पैसा", "नेटवर्क प्रयोग गरेबापत तिर्नुपर्ने शुल्क", "वालेटको मूल्य"], correctAnswer: 1, level: 'hard' }
    ]
  },
  en: {
    choiceTitle: "Select Your Path",
    choiceDesc: "Choose how you would like to start your learning journey.",
    easyTitle: "Start from Day 1",
    easyDesc: "Start from the very beginning with Day 1 lessons.",
    easyBtn: "Start Now",
    expertTitle: "Skill Assessment",
    expertDesc: "Take a 12-question quiz to find your ideal starting point.",
    expertBtn: "Take Assessment",
    title: "Web3 Proficiency Test",
    subtitle: "12 Questions",
    resultTitle: "Test Complete!",
    resultLevel: "We have assigned you to the following level:",
    goBtn: "Launch Learning",
    questions: [
      { question: "What is the core feature of Web 3.0?", options: ["Read-only access", "Decentralization & Ownership", "Total corporate control"], correctAnswer: 1, level: 'easy' },
      { question: "What is the primary function of a Crypto Wallet?", options: ["Storing photos", "Managing Private Keys securely", "Playing video games"], correctAnswer: 1, level: 'easy' },
      { question: "What is a Blockchain?", options: ["A central server", "A Distributed Ledger", "A social media platform"], correctAnswer: 1, level: 'easy' },
      { question: "Who founded Bitcoin?", options: ["Elon Musk", "Satoshi Nakamoto", "Vitalik Buterin"], correctAnswer: 1, level: 'easy' },
      { question: "What does NFT stand for?", options: ["Non-Fungible Token", "New Financial Tool", "National Fund Transfer"], correctAnswer: 0, level: 'easy' },
      { question: "Where do Smart Contracts execute?", options: ["On paper", "On a Blockchain", "On a bank's computer"], correctAnswer: 1, level: 'intermediate' },
      { question: "What does DAO stand for?", options: ["Digital Assets Office", "Decentralized Autonomous Organization", "Data Access Object"], correctAnswer: 1, level: 'intermediate' },
      { question: "What is the main purpose of Ethereum?", options: ["Just sending money", "Running Smart Contracts & Apps", "Web browsing"], correctAnswer: 1, level: 'intermediate' },
      { question: "What does DeFi mean?", options: ["Decentralized Finance", "Deep Finance", "Defined File"], correctAnswer: 0, level: 'intermediate' },
      { question: "What happens if you lose your Private Key?", options: ["You can reset your password", "Your assets are lost forever", "You can contact a bank"], correctAnswer: 1, level: 'hard' },
      { question: "What does Generative AI do?", options: ["Deletes data", "Creates new content", "Turns off computers"], correctAnswer: 1, level: 'hard' },
      { question: "What are Gas Fees?", options: ["Fuel prices", "Network transaction costs", "Wallet costs"], correctAnswer: 1, level: 'hard' }
    ]
  }
};

const SurveyModal: React.FC<SurveyModalProps> = ({ onComplete, userEmail, lang }) => {
  const [step, setStep] = useState<'choice' | 'survey' | 'result'>('choice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ easy: 0, intermediate: 0, hard: 0 });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const data = SURVEY_DATA[lang];

  const handleAnswer = (optionIndex: number) => {
    setSelectedIdx(optionIndex);
    const q = data.questions[currentIndex];
    
    setTimeout(() => {
      if (optionIndex === q.correctAnswer) {
        setScores(prev => ({ ...prev, [q.level]: (prev[q.level as keyof typeof prev] || 0) + 1 }));
      }
      
      setSelectedIdx(null);
      if (currentIndex < data.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setStep('result');
      }
    }, 300);
  };

  const determineLevel = (): CourseLevel => {
    const totalCorrect = scores.easy + scores.intermediate + scores.hard;
    if (totalCorrect >= 10) return 'hard';
    if (totalCorrect >= 5) return 'intermediate';
    return 'easy';
  };

  const currentLevel = determineLevel();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-2xl p-8 md:p-16 shadow-2xl relative my-4">
        {step === 'choice' && (
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">{data.choiceTitle}</h2>
            <p className="text-slate-500 font-bold text-2xl mb-12">{data.choiceDesc}</p>
            
            <div className="grid grid-cols-1 gap-6">
              <button 
                onClick={() => onComplete('easy')} 
                className="w-full text-left p-10 md:p-12 bg-white border-4 border-slate-100 rounded-[2.5rem] transition-all hover:border-slate-300 active:scale-[0.98]"
              >
                <div className="flex items-start gap-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl">🌱</div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-black text-3xl md:text-4xl mb-3">{data.easyTitle}</h3>
                    <p className="text-slate-500 text-lg md:text-2xl font-bold leading-relaxed mb-8">{data.easyDesc}</p>
                    <span className="inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-8 py-4 rounded-2xl">
                      {data.easyBtn} ➔
                    </span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setStep('survey')} 
                className="w-full text-left p-10 md:p-12 bg-white border-4 border-slate-100 rounded-[2.5rem] transition-all hover:border-slate-300 active:scale-[0.98]"
              >
                <div className="flex items-start gap-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-4xl shadow-sm">🧠</div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-black text-3xl md:text-4xl mb-3">{data.expertTitle}</h3>
                    <p className="text-slate-500 text-lg md:text-2xl font-bold leading-relaxed mb-8">{data.expertDesc}</p>
                    <span className="inline-flex items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-8 py-4 rounded-2xl">
                      {data.expertBtn} ➔
                    </span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'survey' && (
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-black text-slate-900 mb-2">{data.title}</h2>
                <p className="text-slate-400 text-sm font-black uppercase tracking-widest">{data.subtitle}</p>
              </div>
              <div className="text-2xl font-black text-slate-400">
                <span className="text-slate-900">{currentIndex + 1}</span> / {data.questions.length}
              </div>
            </div>
            
            <div className="mb-10 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-slate-900 transition-all duration-500" 
                style={{ width: `${((currentIndex + 1) / data.questions.length) * 100}%` }}
              ></div>
            </div>

            <h3 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-14">{data.questions[currentIndex].question}</h3>
            
            <div className="grid gap-6">
              {data.questions[currentIndex].options.map((option, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(idx)} 
                  className={`w-full text-left p-8 md:p-10 rounded-[2.5rem] border-4 transition-all font-black text-2xl md:text-4xl text-slate-700 shadow-sm ${selectedIdx === idx ? 'border-slate-900 bg-slate-50' : 'border-slate-50 hover:border-slate-200 bg-white'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="text-center py-10">
            <div className="w-40 h-40 bg-slate-50 text-slate-900 rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-10">🎓</div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-8">{data.resultTitle}</h3>
            <p className="text-slate-500 font-bold text-3xl mb-14 leading-relaxed">
              {data.resultLevel} <br/>
              <span className="text-slate-900 text-5xl font-black uppercase mt-6 block">{currentLevel}</span>
            </p>
            <button 
              onClick={() => onComplete(currentLevel)} 
              className="w-full py-10 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-base tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95"
            >
              {data.goBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyModal;
