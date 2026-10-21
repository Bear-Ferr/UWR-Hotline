import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import type { UserAccount } from '../services/storageService';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  LogIn, 
  UserPlus, 
  Heart, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserAccount) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Roseburg');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSubmitted, setRegSubmitted] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }

    const res = storageService.loginUser(loginEmail.trim(), loginPassword.trim());
    if (res.success && res.user) {
      onLogin(res.user);
    } else {
      setLoginError(res.error || 'Login failed. Please verify credentials.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError('Please provide your name, email, and phone number.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('Please choose a password with at least 4 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify.');
      return;
    }

    const res = storageService.registerUser(
      regName.trim(),
      regEmail.trim(),
      regPhone.trim(),
      regPassword.trim(),
      regCity.trim() || 'Roseburg',
      false // Requires admin approval!
    );

    if (res.success) {
      setRegSubmitted(true);
    } else {
      setRegError(res.error || 'Could not complete registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-gray-100">
      {/* Background Graphic Accents */}
      <div className="relative overflow-hidden flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo & Branding Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-block relative">
              <img
                src="/uwr-logo.jpg"
                alt="Umpqua Wildlife Rescue"
                className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-4 border-amber-400 shadow-xl object-cover mb-3"
              />
              <span className="absolute bottom-1 right-1 bg-amber-500 text-emerald-950 p-1.5 rounded-full shadow">
                <Heart className="w-3.5 h-3.5 fill-current" />
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Umpqua Wildlife Rescue
            </h1>
            <p className="text-emerald-300 font-medium text-sm mt-1">
              Hotline Dispatch & Volunteer Portal
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Douglas County, Oregon • Serving Native Wildlife
            </p>
          </div>

          {/* Main Auth Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700/40 text-gray-800">
            {/* Tab Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setLoginError(''); setRegSubmitted(false); }}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === 'login'
                    ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Volunteer Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setRegError(''); }}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition ${
                  activeTab === 'register'
                    ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>New Volunteer</span>
              </button>
            </div>

            {/* Tab 1: SIGN IN */}
            {activeTab === 'login' && (
              <div className="p-6 sm:p-7 space-y-5">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Email (Gmail, Yahoo, iCloud, etc.)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Enter Dispatch Portal</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: VOLUNTEER REGISTRATION */}
            {activeTab === 'register' && (
              <div className="p-6 sm:p-7">
                {regSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Application Submitted!</h3>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                        Thank you for applying to volunteer with Umpqua Wildlife Rescue! Your account has been registered and is currently <span className="font-bold text-amber-700">pending approval by Coordinator Syndi Michael</span>.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Once Syndi approves your account, you will be able to log in with your email and password.
                      </p>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRegSubmitted(false);
                          setActiveTab('login');
                        }}
                        className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow transition"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {regError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Jessica Hayes"
                          className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Personal Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="e.g. jessica@gmail.com"
                          className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            placeholder="541-555-0123"
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          City / Area
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={regCity}
                            onChange={e => setRegCity(e.target.value)}
                            placeholder="Roseburg"
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Create Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            placeholder="Min 4 chars"
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            value={regConfirmPassword}
                            onChange={e => setRegConfirmPassword(e.target.value)}
                            placeholder="Repeat"
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2 mt-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Submit Application for Approval</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Public Caller Notice */}
          <div className="mt-6 text-center text-xs text-slate-400 max-w-sm mx-auto">
            <p className="font-semibold text-slate-300 mb-1">Found an injured wild animal?</p>
            <p>
              Please call UWR Emergency Hotline: <a href="tel:503-358-2348" className="text-amber-400 font-bold hover:underline">503-358-2348</a> or <a href="tel:541-679-0000" className="text-amber-400 font-bold hover:underline">541-679-0000</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-slate-500 text-xs py-4 border-t border-slate-800">
        Umpqua Wildlife Rescue • Confidential Volunteer Dispatch System
      </footer>
    </div>
  );
};
