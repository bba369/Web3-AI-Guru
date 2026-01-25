
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Lesson, LessonProgress, CourseLevel, LessonContent, UserStats, CourseCategory } from '../types';
import { PLAYLIST_LESSONS } from '../constants';
import { analyzeLessonSource } from '../services/geminiService';
import { getUserData, updateProgress, setGlobalLessonContent } from '../databaseService';
import { awardPoints, POINT_VALUES } from '../services/pointsService';
import { speakText, stopSpeech } from '../services/ttsService';
import { supabase } from '../supabaseClient';
import QuizModal from './QuizModal';
import SurveyModal from './SurveyModal';
import Login from './Login';
import LessonChat from './LessonChat';
import HighlightedText from './HighlightedText';
import AbacusPractice from './AbacusPractice';

const translations = {
  ne: {
    dashboard: "ड्यासबोर्ड",
    referrals: "सिफारिस (Referrals)",
    mentor: "मेन्टर मोड",
    points: "पोइन्ट्स",
    referralCode: "तपाईंको कोड",
    becomeMentor: "मेन्टर बन्नुहोस्",
    loginWelcome: "Tech Guru मा स्वागत छ",
    loginSub: "आफ्नो सिकाई यात्रा सुरु गर्न लग-इन गर्नुहोस्।",
    loginBtn: "Gmail मार्फत लग-इन गर्नुहोस्",
    tech: "Web3 (प्रविधि)",
    entrepreneur: "व्यवसाय (Business)",
    abacus: "एबाकस",
    digitalLiteracy: "डिजिटल साक्षरता",
    langIcon: "🌐",
    switchLang: "English",
    logout: "लग-आउट",
    day: "दिन",
    startNow: "सुरु गर्नुहोस्",
    score: "स्कोर",
    streak: "सक्रियता",
    completed: "सम्पन्न",
    quizLocked: "ताला लगाइएको",
    startQuiz: "परीक्षा",
    retakeQuiz: "पुनः परीक्षा",
    lessonMission: "मिशन",
    analysis: "पाठ योजना",
    overview: "अवलोकन",
    vocab: "शब्दावली",
    aiHelp: "AI च्याट",
    resources: "स्रोतहरू",
    listen: "सुन्नुहोस्",
    stop: "रोक्नुहोस्",
    loading: "लोड हुँदैछ...",
    copied: "कपी गरियो!",
    choiceTitle: "के सिक्न चाहनुहुन्छ?",
    choiceSub: "मार्ग रोज्नुहोस्",
    select: "चयन गर्नुहोस्",
    coursePath: "पाठक्रम",
    practiceMode: "अभ्यास",
    savedLocal: "सुरक्षित छ",
    saving: "सेभ हुँदैछ...",
    nextLesson: "अर्को पाठ",
    save: "सेभ गर्नुहोस्",
    saved: "सुरक्षित भयो"
  },
  en: {
    dashboard: "Dashboard",
    referrals: "Referrals",
    mentor: "Mentor Mode",
    points: "Points",
    referralCode: "Your Code",
    becomeMentor: "Become Mentor",
    loginWelcome: "Welcome to Tech Guru",
    loginSub: "Login to start your journey.",
    loginBtn: "Login with Google",
    tech: "Web3 (Tech)",
    entrepreneur: "Business",
    abacus: "Abacus",
    digitalLiteracy: "Safe Web",
    langIcon: "🌐",
    switchLang: "नेपाली",
    logout: "Logout",
    day: "Day",
    startNow: "Start Lesson",
    score: "Score",
    streak: "Streak",
    completed: "Completed",
    quizLocked: "Locked",
    startQuiz: "Quiz",
    retakeQuiz: "Retake",
    lessonMission: "Mission",
    analysis: "Lesson Plan",
    overview: "Overview",
    vocab: "Word Bank",
    aiHelp: "AI Chat",
    resources: "Resources",
    listen: "Listen",
    stop: "Stop",
    loading: "Loading...",
    copied: "Copied!",
    choiceTitle: "What's next?",
    choiceSub: "Pick a track",
    select: "Select Track",
    coursePath: "Pathway",
    practiceMode: "Practice",
    savedLocal: "Synced",
    saving: "Syncing...",
    nextLesson: "Next Lesson",
    save: "Save Lesson",
    saved: "Saved"
  }
};

// ... (TrackSelection and LessonFrame interfaces and components remain identical)
// Repeating TrackSelection to ensure full file integrity
interface TrackSelectionProps {
  lang: 'ne' | 'en';
  onSelect: (cat: CourseCategory) => void;
  t: any;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({ lang, onSelect, t }) => {
  const tracks: { id: CourseCategory; title: string; icon: string; color: string }[] = [
    { id: 'tech', title: t.tech, icon: '🚀', color: 'indigo' },
    { id: 'entrepreneur', title: t.entrepreneur, icon: '💰', color: 'emerald' },
    { id: 'abacus', title: t.abacus, icon: '🧮', color: 'rose' },
    { id: 'digital-literacy', title: t.digitalLiteracy, icon: '🛡️', color: 'sky' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">{t.choiceTitle}</h1>
          <p className="text-slate-500 text-xl font-bold">{t.choiceSub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => onSelect(track.id)}
              className="p-10 bg-white border border-slate-100 rounded-[3rem] text-left transition-all hover:scale-[1.02] hover:shadow-2xl group active:scale-95"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
                {track.icon}
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">{track.title}</h2>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t.select}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Repeating LessonFrame to ensure full file integrity
interface LessonFrameProps {
  lesson: Lesson;
  content?: LessonContent;
  isLoading: boolean;
  progress: LessonProgress[];
  onQuizOpen: () => void;
  onNavigate: (dir: number) => void;
  onGoHome: () => void;
  lang: 'ne' | 'en';
  onToggleLang: () => void;
  t: any;
}

const LessonFrame: React.FC<LessonFrameProps> = ({ lesson, content, isLoading, progress, onQuizOpen, onNavigate, onGoHome, lang, onToggleLang, t }) => {
  const [audioProgress, setAudioProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'chat' | 'practice'>('content');
  const [showAbacusPractice, setShowAbacusPractice] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setActiveTab('content'); // Reset tab on lesson change
    setSaveStatus('idle');
  }, [lesson.id]);

  const handleListen = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      setAudioProgress(0);
      return;
    }
    if (!content?.script) return;
    setIsPlaying(true);
    try {
      await speakText(content.script, lang, (p) => setAudioProgress(p));
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlaying(false);
      setAudioProgress(0);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setSaveStatus('saving');
    try {
      await setGlobalLessonContent(lesson.id, lang, content);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('idle');
    }
  };

  const hasPassed = progress.find(p => p.lessonId === lesson.id)?.completed;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="p-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={onGoHome} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">←</button>
          <div>
            <h2 className="text-sm font-black text-slate-900 leading-none mb-1">{lesson.title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.day} {lesson.day}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={!content || saveStatus !== 'idle'}
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-900 text-white shadow-lg hover:bg-slate-800 disabled:opacity-50'}`}
          >
            {saveStatus === 'saving' ? t.saving : saveStatus === 'saved' ? '✓ ' + t.saved : '💾 ' + t.save}
          </button>
          
          <button onClick={onToggleLang} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest">{t.switchLang}</button>
          {hasPassed && <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest">✅ {t.completed}</span>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{t.loading}</p>
          </div>
        ) : content ? (
          <div className="max-w-4xl mx-auto space-y-12">
            {content.imageUrl && (
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100">
                <img src={content.imageUrl} alt={lesson.title} className="w-full aspect-video object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('content')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>📖 {t.analysis}</button>
              <button onClick={() => setActiveTab('chat')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>💬 {t.aiHelp}</button>
              {lesson.category === 'abacus' && (
                <button onClick={() => setActiveTab('practice')} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'practice' ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>🧮 {t.practiceMode}</button>
              )}
            </div>

            {activeTab === 'content' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-slate-900">{t.overview}</h3>
                    <button onClick={handleListen} className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isPlaying ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>{isPlaying ? '⏹ ' + t.stop : '🔊 ' + t.listen}</button>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <HighlightedText text={content.script} progress={audioProgress} active={isPlaying} className="text-lg text-slate-600 leading-relaxed font-bold" />
                  </div>
                </div>

                {content.story && (
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">✨ {t.lessonMission}</h4>
                    <p className="text-xl font-bold text-slate-800 leading-relaxed italic">"{content.story}"</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-xl font-black text-slate-900">{t.vocab}</h4>
                    <div className="space-y-3">
                      {content.vocabulary.map((v, i) => (
                        <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <p className="font-black text-indigo-600 mb-1">{v.word}</p>
                          <p className="text-xs text-slate-500 font-bold">{v.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-xl font-black text-slate-900">{t.summary}</h4>
                    <p className="text-slate-600 font-bold leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">{content.summary}</p>
                  </div>
                </div>

                {content.sources && content.sources.length > 0 && (
                  <div className="pt-8 border-t border-slate-50">
                    <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-4">{t.resources}</h4>
                    <div className="flex flex-wrap gap-3">
                      {content.sources.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-indigo-600 hover:border-indigo-600 transition-colors shadow-sm">🔗 {s.title}</a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-10">
                  <button onClick={onQuizOpen} className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-slate-200 hover:scale-[1.01] active:scale-95 transition-all">🎯 {hasPassed ? t.retakeQuiz : t.startQuiz}</button>
                </div>
              </div>
            )}

            {activeTab === 'chat' && <LessonChat lessonTitle={lesson.title} content={content} lang={lang} />}
            
            {activeTab === 'practice' && lesson.category === 'abacus' && (
              <div className="bg-rose-50 p-10 rounded-[3rem] text-center space-y-6 border border-rose-100">
                <div className="text-7xl mb-4">🧮</div>
                <h3 className="text-3xl font-black text-rose-900">{t.practiceMode}</h3>
                <p className="text-rose-600 font-bold text-lg">Master your mental visualization skills!</p>
                <button onClick={() => setShowAbacusPractice(true)} className="px-12 py-6 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-rose-700 transition-colors">Launch Simulator</button>
                {showAbacusPractice && (
                   <AbacusPractice level={lesson.level} lang={lang} onClose={() => setShowAbacusPractice(false)} onComplete={() => setShowAbacusPractice(false)} />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 font-black">
            <span className="text-6xl mb-4">⚠️</span>
            <p>Failed to load lesson content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [lang, setLang] = useState<'ne' | 'en'>(() => (localStorage.getItem('guru_lang') as 'ne' | 'en') || 'ne');
  const t = translations[lang];

  const [activeCategory, setActiveCategory] = useState<CourseCategory | null>(null);
  const [activeLevel, setActiveLevel] = useState<CourseLevel | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | 'dashboard' | 'referrals' | 'mentor'>('dashboard');
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [isLessonLoading, setIsLessonLoading] = useState(false);
  const [contentCache, setContentCache] = useState<any>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync Supabase Auth & DB
  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleUserSync(session.user);
    }).catch(err => console.error("Session check failed (likely network)", err));

    // 2. Listen for auth changes (redirects, sign-ins)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserSync(session.user);
      else {
        setUser(null);
        setDbUser(null);
        setActiveCategory(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSync = async (authUser: any) => {
    try {
      // 1. Check existence in DB
      const { data: existingUser, error: fetchError } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "Not Found"
        console.error("Database Connection Error:", fetchError.message);
        // Fallback: Just use auth user to let them into the app, even if DB sync fails
        setUser(authUser);
        return;
      }

      if (existingUser) {
        setUser({ ...authUser, ...existingUser });
        setDbUser(existingUser);
        
        // Sync progress from DB
        const { data: userProgress } = await supabase.from('user_progress').select('*').eq('user_id', authUser.id);
        if (userProgress) {
          setProgress(userProgress.map((p: any) => ({
             lessonId: p.lesson_id,
             completed: p.status === 'completed',
             quizPassed: !!p.quiz_score,
             score: p.quiz_score || 0
          })));
        }
      } else {
        // Create New User
        // Handle mobile-based email to extract proper username
        const cleanUsername = authUser.user_metadata?.full_name || 
                             (authUser.email?.endsWith('@techguru.app') ? authUser.email.split('@')[0] : authUser.email?.split('@')[0]);

        const refCode = 'GURU' + Math.random().toString(36).substring(7).toUpperCase();
        const newUserData = {
          id: authUser.id,
          email: authUser.email,
          username: cleanUsername,
          referral_code: refCode,
          role: 'student'
        };
        
        const { error: insertError } = await supabase.from('users').insert(newUserData);
        
        if (insertError) {
          console.error("User Creation Error:", insertError.message);
           // Fallback: Let them in, but features might be limited
           setUser(authUser);
        } else {
           // Handle Referral Tracking
           const urlParams = new URLSearchParams(window.location.search);
           const ref = urlParams.get('ref');
           if (ref) {
             const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', ref).single();
             if (referrer) {
               await supabase.from('referral_tree').insert({
                 user_id: authUser.id,
                 referrer_id: referrer.id
               });
             }
           }
           setUser({ ...authUser, ...newUserData });
           setDbUser(newUserData);
        }
      }
    } catch (err) {
      console.error("Sync Critical Error", err);
      // Ultimate fallback
      setUser(authUser);
    }
  };

  useEffect(() => {
    if (dbUser?.role === 'mentor') setHasCompletedSurvey(true);
  }, [dbUser]);

  const lessons = useMemo(() => PLAYLIST_LESSONS, []);
  const filteredLessonsList = useMemo(() => 
    lessons.filter(l => l.category === activeCategory && l.level === activeLevel).sort((a,b) => a.day - b.day),
  [lessons, activeCategory, activeLevel]);

  const currentLesson = useMemo(() => lessons.find(l => l.id === currentLessonId), [lessons, currentLessonId]);
  const currentContent = useMemo(() => currentLesson ? contentCache[currentLesson.id]?.[lang] : null, [currentLesson, contentCache, lang]);

  useEffect(() => {
    if (!currentLesson || ['dashboard', 'referrals', 'mentor'].includes(currentLessonId)) return;
    if (contentCache[currentLesson.id]?.[lang]) return;
    const load = async () => {
      setIsLessonLoading(true);
      try {
        const data = await analyzeLessonSource(currentLesson.id, currentLesson.title, currentLesson.description, lang, currentLesson.category, currentLesson.level);
        setContentCache((prev: any) => ({ ...prev, [currentLesson.id]: { ...(prev[currentLesson.id] || {}), [lang]: data } }));
      } catch (e) { console.error(e); } finally { setIsLessonLoading(false); }
    };
    load();
  }, [currentLessonId, lang, currentLesson, contentCache]);

  const handleQuizPass = async (score: number) => {
    if (!currentLesson || !user) return;
    
    // Only save to DB if not guest
    if (!user.is_guest) {
        await updateProgress(user.id, currentLesson.id, activeCategory!, 'completed', score);
        await awardPoints(user.id, POINT_VALUES.QUIZ_PASS, `Passed quiz: ${currentLesson.title}`);
    }
    
    setShowQuiz(false);
    setProgress(prev => [...prev, { lessonId: currentLesson.id, completed: true, quizPassed: true, score }]);
  };

  if (!user) return <Login 
    onLogin={(guestUser) => {
      // Compatibility if needed, though real auth handles this now
      setUser(guestUser);
    }} 
    lang={lang} 
    onToggleLang={() => setLang(l => (l === 'ne' ? 'en' : 'ne'))} 
    t={t} 
  />;

  if (!activeCategory) return <TrackSelection lang={lang} onSelect={setActiveCategory} t={t} />;
  if (!hasCompletedSurvey || !activeLevel) return <SurveyModal lang={lang} category={activeCategory} onComplete={(level) => { setActiveLevel(level); setHasCompletedSurvey(true); }} />;

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center font-black">{isSidebarOpen ? '✕' : '☰'}</button>

      <aside className={`fixed inset-0 z-[60] md:relative md:flex w-full md:w-[300px] bg-white border-r border-slate-100 flex-col h-screen transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-10 h-10 rounded-xl" alt="P" />
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-slate-900 truncate">{dbUser?.username || user.email?.split('@')[0]}</h1>
            <span className="text-[7px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">{dbUser?.points || 0} {t.points}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setCurrentLessonId('dashboard'); setIsSidebarOpen(false); }} className={`w-full p-4 rounded-2xl flex items-center gap-3 font-black text-[9px] uppercase tracking-widest transition-all ${currentLessonId === 'dashboard' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-50'}`}>📊 {t.dashboard}</button>
          {!user.is_guest && <button onClick={() => { setCurrentLessonId('referrals'); setIsSidebarOpen(false); }} className={`w-full p-4 rounded-2xl flex items-center gap-3 font-black text-[9px] uppercase tracking-widest transition-all ${currentLessonId === 'referrals' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-50'}`}>👥 {t.referrals}</button>}
          {dbUser?.is_mentor && <button onClick={() => { setCurrentLessonId('mentor'); setIsSidebarOpen(false); }} className={`w-full p-4 rounded-2xl flex items-center gap-3 font-black text-[9px] uppercase tracking-widest transition-all ${currentLessonId === 'mentor' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-50'}`}>🚀 {t.mentor}</button>}
          
          <div className="pt-6 pb-2 text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">{t.coursePath}</div>
          {filteredLessonsList.map(l => (
            <button key={l.id} onClick={() => { setCurrentLessonId(l.id); setIsSidebarOpen(false); }} className={`w-full p-3 rounded-xl flex items-center gap-3 text-left font-black text-[10px] transition-all ${currentLessonId === l.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
              <span className={`w-5 h-5 flex items-center justify-center bg-white rounded border transition-colors ${currentLessonId === l.id ? 'border-slate-900' : 'border-slate-100'}`}>{l.day}</span>
              <span className="truncate">{l.title}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button onClick={() => { supabase.auth.signOut(); }} className="w-full py-3 text-[9px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors">{t.logout}</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-white">
        {currentLessonId === 'dashboard' && (
          <div className="p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
             <div className="flex justify-between items-end gap-4">
               <div>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{t.dashboard}</h2>
                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Welcome back!</p>
               </div>
               <button onClick={() => setLang(l => l === 'en' ? 'ne' : 'en')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">{t.switchLang}</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
                  <p className="text-[10px] font-black text-white/40 uppercase mb-2">{t.points}</p>
                  <p className="text-5xl font-black tracking-tighter">{dbUser?.points || 0}</p>
                </div>
                <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 shadow-sm">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">{t.completed}</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{dbUser?.courses_completed || 0}</p>
                </div>
                {!user.is_guest && (
                <div className="bg-white border-2 border-slate-50 p-10 rounded-[3rem] shadow-sm">
                  <p className="text-[10px] font-black text-slate-300 uppercase mb-2">{t.referralCode}</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{dbUser?.referral_code || '---'}</p>
                </div>
                )}
             </div>
             {!dbUser?.is_mentor && !user.is_guest && (
               <div className="bg-indigo-50 border-2 border-indigo-100 p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                 <div>
                   <h3 className="text-2xl font-black text-indigo-900 mb-2">{t.becomeMentor}</h3>
                   <p className="text-indigo-600 text-sm font-bold">Share your knowledge and earn extra points. Complete your track to unlock!</p>
                 </div>
                 <button className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-95">Check Progress</button>
               </div>
             )}
          </div>
        )}

        {currentLessonId === 'referrals' && !user.is_guest && (
          <div className="p-8 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{t.referrals}</h2>
            <div className="bg-white border-2 border-slate-50 p-10 md:p-16 rounded-[4rem] shadow-sm space-y-8">
              <div className="text-center space-y-4">
                <div className="text-6xl">💸</div>
                <p className="text-slate-500 font-bold text-xl max-w-xl mx-auto">Invite your friends and earn <span className="text-emerald-600 font-black px-2 bg-emerald-50 rounded-lg">15% commission</span> on all their learning rewards!</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <input readOnly value={`https://techguru.ai/?ref=${dbUser?.referral_code}`} className="flex-1 bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] font-black text-sm text-slate-600" />
                <button onClick={() => { navigator.clipboard.writeText(`https://techguru.ai/?ref=${dbUser?.referral_code}`); alert('Link Copied!'); }} className="px-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95">Copy Referral Link</button>
              </div>
            </div>
          </div>
        )}

        {['dashboard', 'referrals', 'mentor'].indexOf(currentLessonId) === -1 && currentLesson && (
          <LessonFrame 
            lesson={currentLesson} 
            content={currentContent} 
            isLoading={isLessonLoading} 
            progress={progress} 
            onQuizOpen={() => setShowQuiz(true)} 
            onNavigate={(dir: number) => {}} 
            onGoHome={() => setCurrentLessonId('dashboard')} 
            lang={lang} 
            onToggleLang={() => setLang(l => l === 'en' ? 'ne' : 'en')} 
            t={t} 
          />
        )}
      </main>
      {showQuiz && currentContent?.quiz && <QuizModal questions={currentContent.quiz} lang={lang} onPass={handleQuizPass} onClose={() => setShowQuiz(false)} />}
    </div>
  );
};

export default App;
