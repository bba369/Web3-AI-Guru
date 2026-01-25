
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (user: any) => void;
  lang: 'ne' | 'en';
  onToggleLang: () => void;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, onToggleLang, t }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to map mobile to a unique email format for Supabase Auth
  const getEmailFromMobile = (num: string) => `${num}@techguru.app`;

  const getFriendlyErrorMessage = (error: any) => {
    const msg = (error.message || error.msg || "").toLowerCase();
    
    if (msg.includes("invalid login credentials")) {
      return lang === 'ne' ? "मोबाइल नम्बर वा पासवर्ड मिलेन।" : "Incorrect mobile number or password.";
    }
    if (msg.includes("user already registered")) {
      return lang === 'ne' ? "यो मोबाइल नम्बर पहिले नै दर्ता छ। कृपया लग-इन गर्नुहोस्।" : "Mobile number already registered. Please login.";
    }
    if (msg.includes("password")) {
      return lang === 'ne' ? "पासवर्ड कम्तिमा ६ अंकको हुनुपर्छ।" : "Password must be at least 6 characters.";
    }
    if (msg.includes("rate limit") || msg.includes("email rate limit") || msg.includes("too many requests")) {
      return lang === 'ne' 
        ? "धेरै प्रयास भयो। यो नम्बर पहिले नै दर्ता भएको हुन सक्छ। कृपया लग-इन प्रयास गर्नुहोस्।" 
        : "Too many attempts. Account might already exist. Please try logging in.";
    }
    if (msg.includes("email not confirmed")) {
      return lang === 'ne'
        ? "खाता सक्रिय भएको छैन। (Admin: Please disable email confirmation in Supabase)"
        : "Account not activated. (Admin: Please disable email confirmation in Supabase)";
    }
    return lang === 'ne' ? "केही समस्या आयो। (" + msg + ")" : error.message;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg(lang === 'ne' ? "कृपया १० अंकको सही मोबाइल नम्बर राख्नुहोस्।" : "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg(lang === 'ne' ? "पासवर्ड कम्तिमा ६ अंकको हुनुपर्छ।" : "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const email = getEmailFromMobile(mobile);

    try {
      if (isSignUp) {
        // 1. Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              mobile_number: mobile
            }
          }
        });
        if (error) throw error;
        
        // Auto login handling if session is missing
        if (data.user && !data.session) {
          setErrorMsg(lang === 'ne' 
            ? "खाता सिर्जना भयो! यदि लग-इन भएन भने सिस्टम सेटिङ जाँच गर्नुहोस् (Email Confirm)।" 
            : "Account created! Please login now (Check Supabase Email Confirm settings).");
          setIsSignUp(false);
        }

      } else {
        // 2. Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      const errorMsgLower = (error.message || "").toLowerCase();

      // AUTO-RECOVERY: If rate limit on signup, try logging in.
      // Often "rate limit" means "User exists, sent too many 'You exist' emails".
      if (isSignUp && (errorMsgLower.includes("rate limit") || errorMsgLower.includes("email rate limit") || errorMsgLower.includes("too many requests"))) {
         try {
            console.log("Rate limit hit. Attempting fallback login...");
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (!loginError && loginData.session) {
               return; // Success! Let App.tsx handle state update via subscription.
            }
            
            // If fallback login failed
            if (loginError) {
                 setIsSignUp(false); // Switch to login view for better UX
                 if (loginError.message.includes("Invalid login credentials")) {
                    setErrorMsg(lang === 'ne' 
                        ? "यो नम्बर दर्ता भइसकेको जस्तो देखिन्छ, तर पासवर्ड मिलेन। कृपया लग-इन गर्नुहोस्।" 
                        : "Account likely exists, but password was incorrect. Please Login.");
                 } else {
                    setErrorMsg(getFriendlyErrorMessage(error)); // Show original rate limit error
                 }
                 setLoading(false);
                 return;
            }
         } catch (e) {
            // Fallback crashed, proceed to standard error display
         }
      }

      setErrorMsg(getFriendlyErrorMessage(error));
      
      // Auto-switch to login if user already exists
      if (isSignUp && errorMsgLower.includes("already registered")) {
        setTimeout(() => setIsSignUp(false), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>

      {/* Language Switch */}
      <div className="absolute top-8 right-8 z-20">
        <button 
          onClick={onToggleLang} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          <span>{t.langIcon}</span> {t.switchLang}
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200 transform -rotate-6">
            <span className="text-3xl font-black">TG</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {isSignUp 
              ? (lang === 'ne' ? 'नयाँ खाता' : 'Create Account') 
              : (lang === 'ne' ? 'स्वागत छ' : 'Welcome Back')}
          </h1>
          <p className="text-slate-400 font-bold text-sm">
            {isSignUp 
              ? (lang === 'ne' ? 'सुरु गर्न आफ्नो विवरण भरनुहोस्' : 'Enter details to get started') 
              : (lang === 'ne' ? 'लग-इन गर्न आफ्नो विवरण राख्नुहोस्' : 'Enter details to login')}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-2xl animate-pulse flex items-start gap-2 text-left">
            <span className="text-lg">⚠️</span>
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                {lang === 'ne' ? 'पूरा नाम' : 'Full Name'}
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                placeholder="Ex: Ram Sharma"
                required={isSignUp}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              {lang === 'ne' ? 'मोबाइल नम्बर' : 'Mobile Number'}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 flex items-center">
                 <span className="text-slate-400 font-bold text-sm mr-2 border-r border-slate-200 pr-2">🇳🇵 +977</span>
              </div>
              <input 
                type="tel" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full p-4 pl-28 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all tracking-widest text-lg"
                placeholder="98XXXXXXXX"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
              {lang === 'ne' ? 'पासवर्ड' : 'Password'}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:hover:scale-100 mt-4"
          >
            {loading 
              ? (lang === 'ne' ? 'प्रक्रिया हुँदैछ...' : 'Processing...') 
              : (isSignUp 
                  ? (lang === 'ne' ? 'खाता बनाउनुहोस्' : 'Create Account') 
                  : (lang === 'ne' ? 'लग-इन गर्नुहोस्' : 'Login Now')
                )
            }
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center pt-6 border-t border-slate-50">
          <p className="text-xs font-bold text-slate-400 mb-2">
            {isSignUp 
              ? (lang === 'ne' ? 'पहिले नै खाता छ?' : 'Already have an account?') 
              : (lang === 'ne' ? 'नयाँ हुनुहुन्छ?' : 'New here?')}
          </p>
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
            className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-800 transition-colors"
          >
            {isSignUp 
              ? (lang === 'ne' ? 'लग-इन गर्नुहोस्' : 'Login Here') 
              : (lang === 'ne' ? 'नयाँ खाता बनाउनुहोस्' : 'Create New Account')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
