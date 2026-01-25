
import React from 'react';
import { CourseLevel, CourseCategory } from '../types';

interface SurveyModalProps {
  onComplete: (level: CourseLevel) => void;
  category: CourseCategory;
  lang: 'ne' | 'en';
}

const SURVEY_DATA = {
  ne: {
    title: "आफ्नो सिकाई स्तर रोज्नुहोस्",
    subtitle: "तपाईंको अनुभव अनुसार एउटा तह चयन गर्नुहोस्",
    techLevels: [
      { id: 'easy', title: "सुरुवात (Beginner)", desc: "यदि तपाईं Web3 र AI मा नयाँ हुनुहुन्छ भने।", icon: "🌱" },
      { id: 'intermediate', title: "मध्यम (Intermediate)", desc: "यदि तपाईंलाई ब्लकचेनको केही ज्ञान छ भने।", icon: "🚀" },
      { id: 'hard', title: "विज्ञ (Expert)", desc: "चुनौतीपूर्ण र एडभान्स्ड विषयहरूको लागि।", icon: "🔥" }
    ],
    entLevels: [
      { id: 'kids', title: "बालबालिका (Phase 1)", desc: "आधारभूत व्यापारिक सोच र सानो लगानी।", icon: "🧸" },
      { id: 'teens', title: "किशोर (Phase 2)", desc: "सम्पत्ति र दायित्वको बुझाइ र सेयर बजार।", icon: "📈" },
      { id: 'youth', title: "युवा (Phase 3)", desc: "ठूलो व्यापार र समृद्धिको मानसिकता।", icon: "💎" }
    ],
    abaLevels: [
      { id: 'easy', title: "जुनियर (Level 1-3)", desc: "आधारभूत एबाकस र औंला गणना।", icon: "🧮" },
      { id: 'intermediate', title: "मध्यम (Level 4-6)", desc: "जटिल गणना र दृश्य विधि।", icon: "🧠" },
      { id: 'hard', title: "सिनियर (Level 7+)", desc: "उच्च गतिको मानसिक गणित।", icon: "⚡" }
    ],
    digLevels: [
      { id: 'easy', title: "आधारभूत (Basics)", desc: "मोबाइल र इन्टरनेटको आधारभूत सुरक्षा।", icon: "📱" },
      { id: 'intermediate', title: "सचेत (Aware)", desc: "अनलाइन ठगी र फिसिङबाट बच्ने उपाय।", icon: "🛡️" },
      { id: 'hard', title: "सुरक्षित (Advanced)", desc: "जटिल साइबर सुरक्षा र डाटा गोपनीयता।", icon: "🔐" }
    ],
    footer: "तपाईं पछि सेटिङमा स्तर परिवर्तन गर्न सक्नुहुन्छ।"
  },
  en: {
    title: "Choose Your Learning Level",
    subtitle: "Select the stage that best fits your experience",
    techLevels: [
      { id: 'easy', title: "Beginner", desc: "Start here if you are new to Web3 and AI.", icon: "🌱" },
      { id: 'intermediate', title: "Intermediate", desc: "If you have some blockchain knowledge already.", icon: "🚀" },
      { id: 'hard', title: "Expert", desc: "Ready for advanced technical deep-dives.", icon: "🔥" }
    ],
    entLevels: [
      { id: 'kids', title: "Foundation (Phase 1)", desc: "Basic entrepreneurial thinking.", icon: "🧸" },
      { id: 'teens', title: "Financial Literacy (Phase 2)", desc: "Assets vs Liabilities and Stocks.", icon: "📈" },
      { id: 'youth', title: "Wealth Mindset (Phase 3)", desc: "Advanced business scale and psychology.", icon: "💎" }
    ],
    abaLevels: [
      { id: 'easy', title: "Junior (Level 1-3)", desc: "Basics of abacus and counting.", icon: "🧮" },
      { id: 'intermediate', title: "Intermediate (Level 4-6)", desc: "Complex arithmetic and visualization.", icon: "🧠" },
      { id: 'hard', title: "Senior (Level 7+)", desc: "High-speed mental math mastery.", icon: "⚡" }
    ],
    digLevels: [
      { id: 'easy', title: "Basics", desc: "Smartphone and basic internet safety.", icon: "📱" },
      { id: 'intermediate', title: "Aware", desc: "Avoiding online scams and phishing.", icon: "🛡️" },
      { id: 'hard', title: "Advanced", desc: "Complex cyber security and data privacy.", icon: "🔐" }
    ],
    footer: "You can change your level later in settings."
  }
};

const SurveyModal: React.FC<SurveyModalProps> = ({ onComplete, category, lang }) => {
  const data = SURVEY_DATA[lang];
  
  const getActiveLevels = () => {
    switch (category) {
      case 'tech':
        return data.techLevels;
      case 'entrepreneur':
        return data.entLevels;
      case 'abacus':
        return data.abaLevels;
      case 'digital-literacy':
        return data.digLevels;
      default:
        return data.techLevels;
    }
  };

  const activeLevels = getActiveLevels();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-[3rem] w-full max-w-xl p-8 md:p-12 shadow-2xl relative my-8 border-2 border-slate-900">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">
            TG
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{data.title}</h2>
          <p className="text-slate-500 font-bold text-base md:text-lg">{data.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {activeLevels.map((level: any) => (
            <button 
              key={level.id}
              onClick={() => onComplete(level.id as CourseLevel)} 
              className="w-full text-left p-6 bg-white border border-slate-100 rounded-2xl transition-all hover:bg-slate-50 group active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {level.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 font-black text-lg md:text-xl mb-0.5">{level.title}</h3>
                  <p className="text-slate-500 text-xs md:text-sm font-bold leading-relaxed">{level.desc}</p>
                </div>
                <div className="text-slate-300 font-black">→</div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
          {data.footer}
        </p>
      </div>
    </div>
  );
};

export default SurveyModal;
