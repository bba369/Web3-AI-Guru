
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Lesson, LessonProgress, CourseLevel, LessonContent, UserStats } from '../types';
import { PLAYLIST_LESSONS } from '../constants';
import { analyzeLessonSource } from '../services/geminiService';
import { getUserData, saveUserData } from '../databaseService';
import { speakText, stopSpeech } from '../services/ttsService';
import QuizModal from './QuizModal';
import SurveyModal from './SurveyModal';
import Login from './Login';
import LessonChat from './LessonChat';
import HighlightedText from './HighlightedText';

const translations = {
  ne: {
    dashboard: "ड्यासबोर्ड",
    profile: "तपाईंको प्रोफाइल",
    role: "स्तर",
    referrals: "रिफरलहरू",
    copyReferral: "लिङ्क कपि गर्नुहोस्",
    streak: "सक्रियता",
    days: "दिन",
    score: "कुल स्कोर",
    progress: "हालको प्रगति",
    completed: "सम्पन्नता",
    noLessons: "अहिलेसम्म कुनै पाठ पुरा गरिएको छैन।",
    logout: "लग-आउट",
    day: "दिन",
    prevLesson: "अघिल्लो पाठ",
    nextLesson: "अर्को पाठ",
    quizLocked: "प्रश्नोत्तरी पुरा गर्नुहोस्",
    startQuiz: "परीक्षा सुरु गर्नुहोस्",
    retakeQuiz: "फेरि परीक्षा दिनुहोस्",
    analysis: "गहिरो विश्लेषण",
    keyPoints: "मुख्य बुँदाहरू",
    vocab: "शब्दावली",
    listen: "सुन्नुहोस्",
    stop: "रोक्नुहोस्",
    loading: "पाठ सामग्री तयार हुँदैछ...",
    generating: "आवाज तयार हुँदैछ..."
  },
  en: {
    dashboard: "Dashboard",
    profile: "Your Profile",
    role: "Role",
    referrals: "Referrals",
    copyReferral: "Copy Link",
    streak: "Streak",
    days: "Days",
    score: "Total Score",
    progress: "Recent Progress",
    completed: "Completion",
    noLessons: "No lessons completed yet.",
    logout: "Log Out",
    day: "Day",
    prevLesson: "Previous",
    nextLesson: "Next Lesson",
    quizLocked: "Complete quiz",
    startQuiz: "Start Quiz",
    retakeQuiz: "Retake Quiz",
    analysis: "Deep Analysis",
    keyPoints: "Key Takeaways",
    vocab: "Vocabulary",
    listen: "Listen",
    stop: "Stop",
    loading: "Loading lesson...",
    generating: "Generating voice..."
  }
};

const LessonFrame = ({ lesson, content, isLoading, progress, onQuizOpen, onNavigate, lang, t }: any) => {
  const lessonProgress = progress.find((p: any) => p.lessonId === lesson.id);
  const isCompleted = !!lessonProgress?.completed;
  const [readingId, setReadingId] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const toggleRead = async (textId: string, text: string) => {
    if (readingId === textId) {
      stopSpeech();
      setReadingId(null);
      setAudioProgress(0);
      return;
    }
    
    try {
      setReadingId(textId);
      setIsGeneratingAudio(true);
      setAudioProgress(0);
      await speakText(text, lang, (p) => setAudioProgress(p));
    } catch (e) {
      console.error("Audio playback error", e);
    } finally {
      setIsGeneratingAudio(false);
      setReadingId(null);
      setAudioProgress(0);
    }
  };

  useEffect(() => () => stopSpeech(), []);

  if (isLoading || !content) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <div className="w-16 h-16 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse font-black text-slate-400 text-2xl uppercase tracking-widest">{t.loading}</p>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-14 space-y-12 md:space-y-16 pb-40">
      <div className="flex flex-col gap-8">
        <div>
          <span className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-black uppercase mb-5 inline-block tracking-widest">{t.day} {lesson.day}</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-4">{lesson.title}</h2>
          <p className="text-slate-400 font-bold text-2xl md:text-3xl italic leading-relaxed">"{lesson.description}"</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5">
          <button 
            onClick={onQuizOpen} 
            className="flex-1 sm:flex-none px-12 py-8 bg-indigo-600 text-white rounded-3xl font-black shadow-2xl shadow-indigo-100 uppercase tracking-widest text-base md:text-lg active:scale-95 transition-transform"
          >
            {isCompleted ? t.retakeQuiz : t.startQuiz}
          </button>
          <button 
            onClick={() => onNavigate(1)} 
            disabled={!isCompleted} 
            className={`flex-1 sm:flex-none px-12 py-8 rounded-3xl font-black shadow-2xl uppercase tracking-widest text-base md:text-lg transition-all active:scale-95 ${isCompleted ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200 shadow-none'}`}
          >
            {isCompleted ? t.nextLesson : t.quizLocked}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-14">
        <div className="lg:col-span-2 space-y-10 md:space-y-14">
          <section className="bg-white p-8 md:p-16 rounded-[3rem] shadow-xl border border-slate-50 relative group">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-4 h-10 bg-indigo-600 rounded-full"></span>
                {t.analysis}
              </h3>
              <button 
                onClick={() => toggleRead('script', content.script)} 
                disabled={isGeneratingAudio && readingId !== 'script'}
                className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors hover:bg-indigo-100"
              >
                {readingId === 'script' ? (isGeneratingAudio ? '...' : t.stop) : `🔊 ${t.listen}`}
              </button>
            </div>
            <HighlightedText 
              text={content.script} 
              progress={audioProgress} 
              active={readingId === 'script'}
              className="text-slate-700 text-2xl md:text-3xl leading-loose italic whitespace-pre-wrap font-medium"
            />
          </section>

          <section className="bg-slate-900 p-8 md:p-16 rounded-[3rem] text-white shadow-3xl relative">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl md:text-4xl font-black flex items-center gap-4">
                <span className="w-4 h-10 bg-white/20 rounded-full"></span>
                {t.keyPoints}
              </h3>
              <button 
                onClick={() => toggleRead('summary', content.summary)} 
                disabled={isGeneratingAudio && readingId !== 'summary'}
                className="bg-white/10 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-colors hover:bg-white/20"
              >
                {readingId === 'summary' ? (isGeneratingAudio ? '...' : t.stop) : `🔊 ${t.listen}`}
              </button>
            </div>
            <HighlightedText 
              text={content.summary} 
              progress={audioProgress} 
              active={readingId === 'summary'}
              className="text-slate-300 text-2xl md:text-3xl leading-loose font-medium"
            />
          </section>
        </div>

        <div className="space-y-10">
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-lg">
            <h3 className="text-3xl font-black text-slate-900 mb-8 border-b-2 border-slate-50 pb-4">{t.vocab}</h3>
            <div className="space-y-8">
              {content.vocabulary.map((v: any, i: number) => (
                <div key={i} className="group transition-transform hover:translate-x-2">
                  <h4 className="font-black text-slate-900 text-xl md:text-2xl group-hover:text-indigo-600 transition-colors">{v.word}</h4>
                  <p className="text-lg md:text-xl text-slate-500 font-bold leading-relaxed">{v.meaning}</p>
                </div>
              ))}
            </div>
          </section>
          <LessonChat lessonTitle={lesson.title} content={content} lang={lang} />
        </div>
      </div>

      <div className="flex flex-row justify-between items-center pt-14 border-t-2 border-slate-50">
        <button onClick={() => onNavigate(-1)} className="px-12 py-8 bg-white border-2 border-slate-100 rounded-3xl font-black text-sm md:text-base uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">{t.prevLesson}</button>
        <button onClick={() => onNavigate(1)} disabled={!isCompleted} className={`px-12 py-8 rounded-3xl font-black text-sm md:text-base uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${isCompleted ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'}`}>{isCompleted ? t.nextLesson : t.quizLocked}</button>
      </div>
    </div>
  );
};

const Dashboard = ({ stats, progress, lessons, onSelectLesson, onCopyReferral, t }: any) => {
  const completedCount = progress.filter((p: any) => p.completed).length;
  const recentProgress = progress.slice(-4).reverse().map(p => {
    const lesson = lessons.find((l: any) => l.id === p.lessonId);
    return { ...p, title: lesson?.title || 'Unknown', day: lesson?.day };
  });

  return (
    <div className="p-6 md:p-16 space-y-12 md:space-y-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
        <div className="bg-indigo-600 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl shadow-indigo-100">
          <p className="text-xs font-black uppercase tracking-widest mb-6 opacity-70">{t.streak}</p>
          <h3 className="text-6xl md:text-8xl font-black">{stats.streak} <span className="text-lg font-bold opacity-70 uppercase">{t.days}</span></h3>
        </div>
        <div className="bg-white p-10 md:p-14 rounded-[3rem] border-2 border-slate-50 shadow-xl">
          <p className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">{t.score}</p>
          <h3 className="text-6xl md:text-8xl font-black text-slate-900">{stats.totalScore.toFixed(0)}</h3>
        </div>
        <div className="bg-slate-900 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-widest mb-6 opacity-70">{t.completed}</p>
          <h3 className="text-6xl md:text-8xl font-black">{completedCount} <span className="text-lg font-bold opacity-70 uppercase">/ {lessons.length}</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
        <section>
          <h3 className="text-4xl font-black text-slate-900 mb-10 flex items-center gap-4">
            <span className="w-4 h-12 bg-indigo-600 rounded-full"></span>
            {t.progress}
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {recentProgress.length > 0 ? recentProgress.map((p, i) => (
              <button key={i} onClick={() => onSelectLesson(p.lessonId)} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 flex items-center justify-between shadow-lg hover:border-indigo-100 hover:shadow-2xl transition-all text-left group">
                <div>
                  <p className="text-sm font-black text-indigo-500 uppercase mb-2 tracking-widest">{t.day} {p.day}</p>
                  <h4 className="font-black text-slate-900 text-2xl md:text-3xl mb-2">{p.title}</h4>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{t.score}: {p.score.toFixed(0)}/10</p>
                </div>
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-inner">➔</div>
              </button>
            )) : <p className="text-slate-400 font-bold text-2xl p-16 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-200">{t.noLessons}</p>}
          </div>
        </section>

        <section className="bg-indigo-50/50 p-10 md:p-16 rounded-[3rem] border-2 border-indigo-100 flex flex-col justify-between">
          <div>
            <h3 className="text-4xl font-black text-indigo-900 mb-10">{t.profile}</h3>
            <div className="space-y-8">
              <div className="flex justify-between items-center py-6 border-b-2 border-indigo-100/50">
                <span className="text-sm font-black text-indigo-600/50 uppercase tracking-widest">{t.role}</span>
                <span className="font-black text-indigo-900 text-2xl">{stats.role}</span>
              </div>
              <div className="flex justify-between items-center py-6 border-b-2 border-indigo-100/50">
                <span className="text-sm font-black text-indigo-600/50 uppercase tracking-widest">{t.referrals}</span>
                <span className="font-black text-indigo-900 text-2xl">{stats.referralCount}</span>
              </div>
            </div>
          </div>
          <button onClick={onCopyReferral} className="mt-12 w-full py-8 bg-white text-indigo-600 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all active:scale-95 border-2 border-indigo-100">
            {t.copyReferral}
          </button>
        </section>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<{name: string, email: string, photo: string} | null>(() => {
    const saved = localStorage.getItem('guru_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [lang, setLang] = useState<'ne' | 'en'>(() => (localStorage.getItem('guru_lang') as 'ne' | 'en') || 'ne');
  const t = translations[lang];

  const [lessons] = useState<Lesson[]>(PLAYLIST_LESSONS);
  const [activeLevel, setActiveLevel] = useState<CourseLevel>('easy');
  
  const [currentLessonId, setCurrentLessonId] = useState<string | 'dashboard'>(() => {
    const savedData = localStorage.getItem('guru_last_lesson');
    if (savedData) return savedData;
    const firstLesson = PLAYLIST_LESSONS.find(l => l.level === 'easy');
    return firstLesson ? firstLesson.id : 'dashboard';
  });

  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [stats, setStats] = useState<UserStats>({ 
    totalScore: 0, streak: 0, lastLoginDate: new Date().toISOString(), completedLessonsCount: 0, role: 'New Leader', referralCount: 0 
  });

  const [contentCache, setContentCache] = useState<Record<string, Record<'ne'|'en', LessonContent>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);

  const currentLesson = useMemo(() => lessons.find(l => l.id === currentLessonId), [lessons, currentLessonId]);
  const currentContent = useMemo(() => (currentLesson && contentCache[currentLesson.id]) ? contentCache[currentLesson.id][lang] : null, [currentLesson, contentCache, lang]);

  useEffect(() => {
    if (currentLessonId !== 'dashboard') {
      localStorage.setItem('guru_last_lesson', currentLessonId);
    }
  }, [currentLessonId]);

  // INITIAL SYNC
  useEffect(() => {
    if (user) {
      const loadUser = async () => {
        const data: any = await getUserData(user.email);
        if (data) {
          if (data.surveyCompleted !== undefined) setHasCompletedSurvey(data.surveyCompleted);
          if (data.activeLevel) setActiveLevel(data.activeLevel);
          if (data.currentLessonId && data.currentLessonId !== 'dashboard') setCurrentLessonId(data.currentLessonId);
          if (data.progress) setProgress(data.progress);
          if (data.stats) setStats(data.stats);
        }
      };
      loadUser();
    }
  }, [user]);

  // AUTO-SAVE
  const saveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!user) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveUserData(user.email, {
        surveyCompleted: hasCompletedSurvey,
        activeLevel,
        currentLessonId,
        progress,
        stats,
        lastSynced: new Date().toISOString()
      });
    }, 2000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [user, hasCompletedSurvey, activeLevel, currentLessonId, progress, stats]);

  useEffect(() => { localStorage.setItem('guru_lang', lang); }, [lang]);

  useEffect(() => {
    if (!currentLesson || contentCache[currentLesson.id]?.[lang] || currentLessonId === 'dashboard') return;
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await analyzeLessonSource(currentLesson.id, currentLesson.title, currentLesson.description, lang);
        if (isMounted) setContentCache(prev => ({ ...prev, [currentLesson!.id]: { ...prev[currentLesson!.id], [lang]: data } }));
      } catch (e) { console.error(e); } finally { if (isMounted) setIsLoading(false); }
    };
    load();
    return () => { isMounted = false; };
  }, [currentLessonId, lang, currentLesson, contentCache]);

  const handleQuizPass = (score: number) => {
    if (!currentLesson) return;
    const existingIdx = progress.findIndex(p => p.lessonId === currentLesson.id);
    const newEntry: LessonProgress = { lessonId: currentLesson.id, completed: true, quizPassed: true, score };
    let newProgress = [...progress];
    if (existingIdx > -1) { if (score >= newProgress[existingIdx].score) newProgress[existingIdx] = newEntry; } 
    else { newProgress.push(newEntry); }
    
    // Update Stats
    const totalScore = newProgress.reduce((sum, p) => sum + p.score, 0);
    setStats(prev => ({ ...prev, totalScore, completedLessonsCount: newProgress.length }));
    setProgress(newProgress);
    setShowQuiz(false);
  };

  const handleNavigate = (direction: number) => {
    const filtered = lessons.filter(l => l.level === activeLevel).sort((a,b) => a.day - b.day);
    const currentIndex = filtered.findIndex(l => l.id === currentLessonId);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < filtered.length) setCurrentLessonId(filtered[nextIndex].id);
    else if (nextIndex === filtered.length) setCurrentLessonId('dashboard');
  };

  if (!user) return <Login onLogin={setUser} />;
  
  if (!hasCompletedSurvey) return (
    <SurveyModal 
      userEmail={user.email} 
      lang={lang} 
      onComplete={(level) => { 
        setActiveLevel(level); 
        setHasCompletedSurvey(true);
        const first = PLAYLIST_LESSONS.find(l => l.level === level);
        if (first) setCurrentLessonId(first.id);
      }} 
    />
  );

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex flex-col md:flex-row font-sans overflow-hidden">
      <div className="md:hidden flex items-center justify-between p-6 bg-white border-b-2 border-slate-50 sticky top-0 z-50 shadow-sm">
        <h1 className="text-3xl font-black text-indigo-600">Web3 गुरु</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 active:scale-95 transition-transform shadow-sm">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>
      </div>

      <aside className={`fixed inset-0 z-[60] md:relative md:flex w-full md:w-[380px] bg-white border-r-2 border-slate-50 flex-col h-screen transform transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 border-b-2 border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-6 mb-10">
            <img src={user.photo} className="w-20 h-20 rounded-[2rem] border-4 border-white bg-slate-100 shadow-xl" alt="Profile" />
            <div className="flex-1 overflow-hidden">
              <h1 className="text-xl font-black text-slate-900 truncate">{user.name}</h1>
              <span className="text-xs font-black text-indigo-500 uppercase bg-indigo-50 px-3 py-1.5 rounded-xl shadow-inner">{stats.role}</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-300 hover:text-slate-900">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-3 p-2 bg-white border-2 border-slate-100 rounded-[2rem] mb-8 shadow-inner">
            <button onClick={() => setLang('ne')} className={`flex-1 py-4 px-4 rounded-[1.5rem] text-sm font-black transition-all ${lang === 'ne' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>🇳🇵 NE</button>
            <button onClick={() => setLang('en')} className={`flex-1 py-4 px-4 rounded-[1.5rem] text-sm font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>🇺🇸 EN</button>
          </div>
          
          <button 
            onClick={() => { setCurrentLessonId('dashboard'); setIsSidebarOpen(false); }} 
            className={`w-full flex items-center gap-6 p-6 rounded-3xl transition-all duration-300 shadow-md ${currentLessonId === 'dashboard' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border-2 border-slate-50 hover:bg-slate-50'}`}
          >
            <span className="text-3xl">📊</span> <span className="font-black text-sm uppercase tracking-[0.2em]">{t.dashboard}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {lessons.filter(l => l.level === activeLevel).sort((a,b) => a.day - b.day).map((lesson) => {
            const isActive = currentLessonId === lesson.id;
            const p = progress.find(pr => pr.lessonId === lesson.id);
            return (
              <button key={lesson.id} onClick={() => { setCurrentLessonId(lesson.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-5 p-6 rounded-[2rem] text-left transition-all border-2 ${isActive ? 'bg-white border-indigo-600 shadow-xl' : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${p?.completed ? 'bg-emerald-100 text-emerald-600 shadow-inner' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                  {p?.completed ? '✓' : lesson.day}
                </div>
                <div className={`flex-1 min-w-0 font-black truncate leading-tight text-lg ${isActive ? 'text-slate-900' : ''}`}>{lesson.title}</div>
              </button>
            );
          })}
        </div>

        <div className="p-10 border-t-2 border-slate-50 bg-slate-50/30">
          <button onClick={() => { localStorage.removeItem('guru_user'); setUser(null); window.location.reload(); }} className="w-full text-xs font-black text-slate-400 uppercase tracking-[0.25em] hover:text-red-500 transition-colors text-center block">
            {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white relative scroll-smooth">
        {currentLessonId === 'dashboard' ? (
          <Dashboard stats={stats} progress={progress} lessons={lessons} onSelectLesson={setCurrentLessonId} onCopyReferral={() => alert("Copied!")} t={t} />
        ) : (
          <LessonFrame lesson={currentLesson} content={currentContent} isLoading={isLoading} progress={progress} onQuizOpen={() => setShowQuiz(true)} onNavigate={handleNavigate} lang={lang} t={t} />
        )}
      </main>

      {showQuiz && currentContent && (
        <QuizModal questions={currentContent.quiz} lang={lang} onPass={handleQuizPass} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
};

export default App;
