
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuizModalProps {
  questions: Question[];
  onPass: (score: number) => void;
  onClose: () => void;
  lang: 'ne' | 'en';
}

interface ShuffledQuestion extends Question {
  shuffledOptions: string[];
  newCorrectIndex: number;
}

const QuizModal: React.FC<QuizModalProps> = ({ questions, onPass, onClose, lang }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const shuffled = questions.map(q => {
      const optionsWithMetadata = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.correctAnswer }));
      for (let i = optionsWithMetadata.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithMetadata[i], optionsWithMetadata[j]] = [optionsWithMetadata[j], optionsWithMetadata[i]];
      }
      return {
        ...q,
        shuffledOptions: optionsWithMetadata.map(o => o.text),
        newCorrectIndex: optionsWithMetadata.findIndex(o => o.isCorrect)
      };
    });
    setShuffledQuestions(shuffled);
  }, [questions]);

  const handleSelect = (index: number) => {
    if (selectedIdx !== null || !shuffledQuestions[currentQuestionIndex]) return;
    
    setSelectedIdx(index);
    const currentQ = shuffledQuestions[currentQuestionIndex];
    const isCorrect = index === currentQ.newCorrectIndex;

    if (isCorrect) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedIdx(null);
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  if (!shuffledQuestions.length) return null;

  const isCorrectChoice = selectedIdx === currentQuestion?.newCorrectIndex;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden p-8 md:p-14 my-4">
        {!isFinished ? (
          <>
            <div className="flex justify-between items-center mb-10">
              <span className="text-sm font-black text-slate-400 bg-slate-50 px-5 py-2.5 rounded-full uppercase tracking-widest">
                {lang === 'ne' ? 'प्रश्न' : 'Question'} {currentQuestionIndex + 1} / {shuffledQuestions.length}
              </span>
              <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition-colors p-2">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <h3 className="text-3xl md:text-5xl font-black text-slate-800 mb-12 leading-tight">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-4 mb-10">
              {currentQuestion.shuffledOptions.map((option, idx) => {
                const isSelected = selectedIdx === idx;
                const isCorrect = idx === currentQuestion.newCorrectIndex;
                
                let buttonStyle = 'border-slate-50 bg-white text-slate-600 hover:border-slate-200';
                if (showFeedback) {
                  if (isCorrect) buttonStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
                  else if (isSelected) buttonStyle = 'border-red-500 bg-red-50 text-red-900';
                  else buttonStyle = 'border-slate-50 bg-white text-slate-300 opacity-50';
                } else if (isSelected) {
                  buttonStyle = 'border-slate-900 bg-slate-50 text-slate-900';
                }

                return (
                  <button 
                    key={idx} 
                    onClick={() => handleSelect(idx)} 
                    disabled={selectedIdx !== null} 
                    className={`w-full text-left p-6 md:p-8 rounded-[2rem] border-4 font-black text-xl md:text-3xl transition-all flex justify-between items-center ${buttonStyle}`}
                  >
                    <span>{option}</span>
                    {showFeedback && isCorrect && <span className="text-2xl">✓</span>}
                    {showFeedback && isSelected && !isCorrect && <span className="text-2xl">✕</span>}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className={`p-8 rounded-[2rem] mb-10 ${isCorrectChoice ? 'bg-emerald-50 border-2 border-emerald-100' : 'bg-red-50 border-2 border-red-100'}`}>
                  <h4 className={`text-xl font-black uppercase tracking-widest mb-3 ${isCorrectChoice ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isCorrectChoice 
                      ? (lang === 'ne' ? 'सही जवाफ!' : 'Correct!') 
                      : (lang === 'ne' ? 'गलत जवाफ' : 'Incorrect')}
                  </h4>
                  <p className="text-lg md:text-2xl font-bold text-slate-700 leading-relaxed italic">
                    {currentQuestion.explanation}
                  </p>
                </div>
                <button 
                  onClick={handleNext} 
                  className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl uppercase text-sm tracking-widest transition-transform active:scale-95"
                >
                  {lang === 'ne' ? 'अर्को प्रश्न' : 'Next Question'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-7xl mb-8">🏆</div>
            <h3 className="text-5xl md:text-6xl font-black text-slate-900 mb-6">
              {lang === 'ne' ? 'नतिजा' : 'Result'}
            </h3>
            <p className="text-2xl md:text-3xl font-bold text-slate-500 mb-12">
              {lang === 'ne' ? `तपाईंले ${score} अंक प्राप्त गर्नुभयो।` : `You scored ${score} points.`}
            </p>
            <button 
              onClick={() => onPass((score / shuffledQuestions.length) * 10)} 
              className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl uppercase text-sm tracking-widest transition-transform active:scale-95"
            >
              {lang === 'ne' ? 'सिकाई जारी राख्नुहोस्' : 'Continue Learning'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;
