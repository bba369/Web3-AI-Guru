
import React, { useState, useEffect, useCallback } from 'react';
import { CourseLevel } from '../types';

interface AbacusPracticeProps {
  level: CourseLevel;
  lang: 'ne' | 'en';
  onClose: () => void;
  onComplete: (score: number) => void;
}

const AbacusPractice: React.FC<AbacusPracticeProps> = ({ level, lang, onClose, onComplete }) => {
  const [problem, setProblem] = useState<{ numbers: number[], answer: number }>({ numbers: [], answer: 0 });
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);

  const generateProblem = useCallback(() => {
    let count = 3;
    let min = 1;
    let max = 9;

    if (level === 'intermediate' || level === 'teens') {
      count = 4;
      max = 50;
    } else if (level === 'hard' || level === 'youth') {
      count = 5;
      max = 99;
    }

    const numbers: number[] = [];
    let sum = 0;
    for (let i = 0; i < count; i++) {
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      // 30% chance of subtraction if not the first number
      if (i > 0 && Math.random() > 0.7 && sum - num > 0) {
        num = -num;
      }
      numbers.push(num);
      sum += num;
    }
    setProblem({ numbers, answer: sum });
    setUserInput('');
    setFeedback(null);
  }, [level]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
  }, [isActive, timeLeft]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput) return;

    if (parseInt(userInput) === problem.answer) {
      setFeedback('correct');
      setScore(s => s + 10);
      setStreak(st => st + 1);
      setTimeout(generateProblem, 600);
    } else {
      setFeedback('wrong');
      setStreak(0);
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const startPractice = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setIsActive(true);
    generateProblem();
  };

  const t = {
    ne: {
      title: "एबाकस अभ्यास",
      start: "सुरु गर्नुहोस्",
      score: "अंक",
      time: "समय",
      streak: "लगातार",
      answer: "उत्तर लेख्नुहोस्",
      check: "जाँच गर्नुहोस्",
      finish: "समाप्त",
      junior: "जुनियर तह",
      inter: "मध्यम तह",
      senior: "सिनियर तह",
      gameOver: "समय सकियो!"
    },
    en: {
      title: "Abacus Practice",
      start: "Start Practice",
      score: "Score",
      time: "Time",
      streak: "Streak",
      answer: "Type answer",
      check: "Check",
      finish: "Finish",
      junior: "Junior Level",
      inter: "Intermediate Level",
      senior: "Senior Level",
      gameOver: "Time's Up!"
    }
  }[lang];

  return (
    <div className="fixed inset-0 z-[300] bg-white flex flex-col p-6 md:p-12 overflow-y-auto">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-12">
          <button onClick={onClose} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{t.title}</h2>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg">
              {level === 'easy' || level === 'kids' ? t.junior : (level === 'intermediate' || level === 'teens' ? t.inter : t.senior)}
            </span>
          </div>
          <div className="w-14"></div>
        </div>

        {!isActive && timeLeft === 60 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 fade-in-up">
            <div className="text-9xl mb-4">🧮</div>
            <button 
              onClick={startPractice}
              className="px-12 py-6 bg-rose-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-rose-200 active:scale-95 transition-all"
            >
              {t.start}
            </button>
          </div>
        ) : !isActive && timeLeft === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 fade-in-up text-center">
            <div className="text-8xl mb-4">🎉</div>
            <h3 className="text-5xl font-black text-slate-900">{t.gameOver}</h3>
            <div className="space-y-2">
              <p className="text-slate-400 font-bold uppercase tracking-widest">{t.score}</p>
              <p className="text-7xl font-black text-rose-600">{score}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={startPractice} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Retry</button>
              <button onClick={() => onComplete(score)} className="px-10 py-5 bg-rose-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest">Finish</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 fade-in-up">
            <div className="grid grid-cols-3 gap-8 w-full max-w-2xl">
              <div className="bg-slate-50 p-6 rounded-3xl text-center border-2 border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.time}</p>
                <p className={`text-3xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>{timeLeft}s</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl text-center shadow-xl">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t.score}</p>
                <p className="text-3xl font-black text-white">{score}</p>
              </div>
              <div className="bg-rose-50 p-6 rounded-3xl text-center border-2 border-rose-100">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">{t.streak}</p>
                <p className="text-3xl font-black text-rose-600">{streak}🔥</p>
              </div>
            </div>

            <div className={`p-12 md:p-20 bg-white rounded-[4rem] border-4 transition-all duration-300 w-full max-w-2xl shadow-sm flex flex-wrap justify-center gap-6 items-center ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-100'}`}>
              {problem.numbers.map((num, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={`text-5xl md:text-7xl font-black tracking-tighter ${num < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {num > 0 && i > 0 ? '+' : ''}{num}
                  </span>
                </div>
              ))}
              <span className="text-5xl md:text-7xl font-black text-slate-300">=</span>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md flex gap-4">
              <input 
                type="number"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                autoFocus
                placeholder={t.answer}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-3xl px-8 py-6 text-2xl font-black focus:outline-none focus:border-rose-600 transition-all text-center"
              />
              <button 
                type="submit"
                className="bg-slate-900 text-white px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl"
              >
                {t.check}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbacusPractice;
