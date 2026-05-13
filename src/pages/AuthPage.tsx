import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Loader2,
  User as UserIcon
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { user, setProfile } = useAuthStore();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" />;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    playSound('tap');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      playSound('success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show an error
        return;
      }
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    playSound('click');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Manually create the Firestore profile to ensure the username is saved correctly immediately
        const newProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: name || user.displayName || 'Seeker',
          username: name.toLowerCase().replace(/\s+/g, '_') || user.email?.split('@')[0] || 'seeker',
          photoURL: user.photoURL,
          avatarIcon: 'User',
          avatarColor: '#10B981',
          notificationsEnabled: true,
          bio: '',
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setProfile(newProfile as any);
      }
      playSound('success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase Console. Please enable it in the Auth tab of your Firebase project.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white dark:bg-brand-black">
      {/* ... prev left pane ... */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-brand-emerald text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
             <path d="M0 0L100 100M100 0L0 100" stroke="currentColor" strokeWidth="0.1" />
          </svg>
        </div>
        
        <Link to="/" onClick={() => playSound('tap')} className="flex items-center gap-2 relative z-10">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-6 italic font-serif">"And Allah invites to the Home of Peace..."</h2>
          <p className="text-xl text-emerald-100/80">Experience peace and spiritual clarity with DeenFlow.</p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <span className="text-sm text-emerald-100/60 font-medium ml-2">Joined by thousands of seekers</span>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 overflow-hidden mx-auto mb-6">
              <img src="/favicon.svg" alt="DeenFlow Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Join DeenFlow'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? 'Continue your spiritual journey' : 'Start your spiritual journey today'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold mb-6 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
            <span className="text-xs font-bold text-slate-400 uppercase">Or continue with email</span>
            <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-sm mb-6 border border-red-100 dark:border-red-900/50"
            >
              {error}
              {error.includes('Firebase Console') && (
                <a 
                  href="https://console.firebase.google.com/project/gen-lang-client-0712055241/authentication/providers" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block mt-2 font-bold underline decoration-2"
                >
                  Click here to open Console
                </a>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Display Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="DeenSeeker"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium"
                  />
                  <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400", !loading && "hidden")}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  {!loading && <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 ml-1 text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-emerald/50 transition-all font-medium"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-emerald text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-emerald font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
