
import React from 'react';

interface LoginProps {
  onLogin: (user: { name: string; email: string; photo: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Simulating Google OAuth flow
    const mockUser = {
      name: 'Web3 Learner',
      email: 'learner@gmail.com',
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
    };
    
    // Save to local storage for persistence
    localStorage.setItem('guru_user', JSON.stringify(mockUser));
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
      
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-indigo-100/50 relative z-10 border border-slate-100">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-200">
            <span className="text-3xl font-black">WG</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Web3 AI गुरु मा स्वागत छ</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            तपाईको सिकाई यात्रा सुरु गर्न गुगल मार्फत लग-इन गर्नुहोस्।
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 py-5 px-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-indigo-600 hover:shadow-lg transition-all duration-300 group"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.096,35.077,44,30.569,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
          </svg>
          <span className="font-black text-slate-700 uppercase tracking-widest text-xs group-hover:text-indigo-600 transition-colors">Gmail मार्फत लग-इन गर्नुहोस्</span>
        </button>

        <p className="mt-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
          तपाईंको डेटा सुरक्षित छ र हामी केवल तपाईंको सिकाई अनुभव सुधार गर्न यसलाई प्रयोग गर्छौं।
        </p>
      </div>
    </div>
  );
};

export default Login;
