
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Tab, GroceryItem, HistoryEntry, AppState, Theme, UserProfile } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Budget from './components/Budget';
import History from './components/History';
import Settings from './components/Settings';
import { Sun, Moon, MapPin, Loader2, Sparkles, Navigation, Lock, Fingerprint, ShieldCheck, Trash2, LogOut, User as UserIcon, BellRing, Volume2, Smartphone, VolumeX } from 'lucide-react';

const STORAGE_KEY = 'smart_grocery_budget_data';

export const COUNTRY_DATA: Record<string, { currency: string, name: string }> = {
  'US': { currency: 'USD', name: 'United States' },
  'PK': { currency: 'PKR', name: 'Pakistan' },
  'GB': { currency: 'GBP', name: 'United Kingdom' },
  'CA': { currency: 'CAD', name: 'Canada' },
  'AU': { currency: 'AUD', name: 'Australia' },
  'DE': { currency: 'EUR', name: 'Germany' },
  'FR': { currency: 'EUR', name: 'France' },
  'IT': { currency: 'EUR', name: 'Italy' },
  'ES': { currency: 'EUR', name: 'Spain' },
  'JP': { currency: 'JPY', name: 'Japan' },
  'CN': { currency: 'CNY', name: 'China' },
  'IN': { currency: 'INR', name: 'India' },
  'BR': { currency: 'BRL', name: 'Brazil' },
  'MX': { currency: 'MXN', name: 'Mexico' },
  'RU': { currency: 'RUB', name: 'Russia' },
  'KR': { currency: 'KRW', name: 'South Korea' },
  'ZA': { currency: 'ZAR', name: 'South Africa' },
  'CH': { currency: 'CHF', name: 'Switzerland' },
  'SE': { currency: 'SEK', name: 'Sweden' },
  'NO': { currency: 'NOK', name: 'Norway' },
  'DK': { currency: 'DKK', name: 'Denmark' },
  'PL': { currency: 'PLN', name: 'Poland' },
  'TR': { currency: 'TRY', name: 'Turkey' },
  'AE': { currency: 'AED', name: 'United Arab Emirates' },
  'SG': { currency: 'SGD', name: 'Singapore' },
  'NZ': { currency: 'NZD', name: 'New Zealand' }
};

const WelcomeScreen: React.FC<{ onComplete: (user: UserProfile) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleStart = () => {
    if (name.trim() && email.trim()) {
      onComplete({ name: name.trim(), email: email.trim() });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in slide-in-from-bottom-10">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 dark:shadow-none">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-100">Welcome</h1>
        <p className="text-sm text-gray-500 mb-8">Securely manage your groceries and budget.</p>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Display Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border-none outline-none text-sm transition-all focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-emerald-500/20"
          />
          <input 
            type="email" 
            placeholder="Email (Local reference)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border-none outline-none text-sm transition-all focus:bg-white dark:focus:bg-zinc-700 focus:ring-2 focus:ring-emerald-500/20"
          />
          <button 
            onClick={handleStart}
            disabled={!name.trim() || !email.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98] mt-2"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [isLocating, setIsLocating] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [showReminderAlert, setShowReminderAlert] = useState(false);
  const loopIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const defaultCurrency = Intl.NumberFormat().resolvedOptions().currency || 'USD';
      
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isAuthenticated: parsed.securityPin ? false : true,
          encryptionKey: parsed.encryptionKey || null,
          reminderTime: parsed.reminderTime || null,
          soundEnabled: parsed.soundEnabled ?? true,
          vibrationEnabled: parsed.vibrationEnabled ?? true
        };
      }
      
      return {
        currentList: [],
        monthlyBudget: 500,
        history: [],
        theme: 'light',
        currency: defaultCurrency,
        countryCode: null,
        locationConfigured: false,
        isGDPRAccepted: false,
        isLocked: false,
        securityPin: null,
        useBiometrics: false,
        isAuthenticated: false,
        user: null,
        encryptionKey: null,
        reminderTime: null,
        soundEnabled: true,
        vibrationEnabled: true
      };
    } catch (e) {
      console.error("Failed to load state", e);
      return {
        currentList: [], monthlyBudget: 500, history: [], theme: 'light', currency: 'USD',
        countryCode: null, locationConfigured: false, isGDPRAccepted: false, isLocked: false,
        securityPin: null, useBiometrics: false, isAuthenticated: false, user: null, encryptionKey: null,
        reminderTime: null, soundEnabled: true, vibrationEnabled: true
      };
    }
  });

  useEffect(() => {
    const { isAuthenticated, ...persistenceState } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistenceState));
  }, [state]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [state.theme]);

  // Stop Loop Function
  const stopReminderAlert = useCallback(() => {
    setShowReminderAlert(false);
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Melodic Song (Synthesized)
  const playReminderSong = useCallback(() => {
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = audioCtx.currentTime;
      playNote(523.25, now, 0.4);    // C5
      playNote(659.25, now + 0.25, 0.4); // E5
      playNote(783.99, now + 0.5, 0.4); // G5
      playNote(1046.50, now + 0.75, 0.6); // C6
    } catch (e) {
      console.error("Audio failed", e);
    }
  }, []);

  // Vibration logic
  const triggerVibrate = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  }, []);

  // Start Alert Loop
  const startReminderAlert = useCallback(() => {
    setShowReminderAlert(true);
    
    // Initial triggers
    if (state.soundEnabled) playReminderSong();
    if (state.vibrationEnabled) triggerVibrate();

    // Set loop
    loopIntervalRef.current = window.setInterval(() => {
      if (state.soundEnabled) playReminderSong();
      if (state.vibrationEnabled) triggerVibrate();
    }, 3000); // Repeat every 3 seconds

  }, [state.soundEnabled, state.vibrationEnabled, playReminderSong, triggerVibrate]);

  // Reminder Logic Check
  useEffect(() => {
    if (!state.reminderTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const reminderDate = new Date(state.reminderTime!);
      
      if (now >= reminderDate) {
        setState(prev => ({ ...prev, reminderTime: null }));
        startReminderAlert();

        // Also try native notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Grocery Reminder", {
            body: `It's time to shop! You have ${state.currentList.length} items on your list.`,
          });
        }
      }
    }, 1000); // Check every second for more precision

    return () => clearInterval(interval);
  }, [state.reminderTime, state.currentList.length, startReminderAlert]);

  const unlockApp = () => {
    if (pinInput === state.securityPin) {
      setState(prev => ({ ...prev, isAuthenticated: true }));
      setPinInput('');
    } else {
      alert("Incorrect PIN code. Please try again.");
      setPinInput('');
    }
  };

  const handleBiometricUnlock = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setState(prev => ({ ...prev, isAuthenticated: true }));
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: state.currency }).format(amount);
    } catch (e) {
      return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD' }).format(amount);
    }
  };

  const deleteAccount = () => {
    if (confirm("Permanently wipe all data? This cannot be undone and your grocery history will be lost.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const toggleGDPR = () => setState(prev => ({ ...prev, isGDPRAccepted: true }));

  const totalSpentInActiveList = useMemo(() => state.currentList.filter(item => item.isPurchased).reduce((acc, item) => acc + item.price, 0), [state.currentList]);
  const totalSpentHistoryThisMonth = useMemo(() => {
    const now = new Date();
    return state.history.filter(entry => {
      const d = new Date(entry.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((acc, entry) => acc + entry.totalSpent, 0);
  }, [state.history]);
  const totalMonthlySpend = totalSpentInActiveList + totalSpentHistoryThisMonth;

  if (!state.isGDPRAccepted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 text-center animate-in fade-in zoom-in">
          <ShieldCheck className="mx-auto text-emerald-500 mb-6" size={48} />
          <h1 className="text-2xl font-bold mb-4">Privacy & Security</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
            We value your privacy. All your data is encrypted and stored locally on your device. By continuing, you agree to our local-only data processing policy.
          </p>
          <button onClick={toggleGDPR} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95">
            I Understand & Accept
          </button>
        </div>
      </div>
    );
  }

  if (!state.user && !state.isAuthenticated) {
    return <WelcomeScreen onComplete={(user) => setState(prev => ({ ...prev, user, isAuthenticated: true }))} />;
  }

  if (state.securityPin && !state.isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-zinc-950">
        <div className="w-full max-w-xs text-center flex flex-col items-center gap-8">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner relative overflow-hidden">
             {isBiometricScanning && <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />}
             {isBiometricScanning ? <Loader2 className="animate-spin" size={32} /> : <Lock size={32} />}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">App Protected</h1>
            <p className="text-sm text-gray-400">Enter your security credentials</p>
          </div>
          
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-emerald-500 transition-all duration-200 ${pinInput.length > i ? 'bg-emerald-500 scale-110' : 'bg-transparent'}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '✓'].map(val => (
              <button 
                key={val.toString()}
                onClick={() => {
                  if (val === 'C') setPinInput('');
                  else if (val === '✓') unlockApp();
                  else if (pinInput.length < 4) setPinInput(p => p + val);
                }}
                className={`w-full aspect-square rounded-2xl text-xl font-bold flex items-center justify-center active:scale-90 transition-all border ${val === '✓' ? 'bg-emerald-600 text-white border-transparent' : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 border-gray-100 dark:border-zinc-800 shadow-sm'}`}
              >
                {val}
              </button>
            ))}
          </div>

          {state.useBiometrics && (
            <button 
              onClick={handleBiometricUnlock}
              disabled={isBiometricScanning}
              className="flex items-center gap-2 text-emerald-600 font-bold text-sm mt-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-6 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              <Fingerprint size={20} /> 
              {isBiometricScanning ? 'Scanning...' : 'Unlock with Biometrics'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Home: return <Home reminderTime={state.reminderTime} items={state.currentList} currency={state.currency} onAddItem={(item) => setState(prev => ({ ...prev, currentList: [{ ...item, id: crypto.randomUUID(), isPurchased: false }, ...prev.currentList] }))} onUpdateItem={(id, updates) => setState(prev => ({ ...prev, currentList: prev.currentList.map(item => item.id === id ? { ...item, ...updates } : item) }))} onDeleteItem={(id) => setState(prev => ({ ...prev, currentList: prev.currentList.filter(item => item.id !== id) }))} onSetReminder={(time) => setState(prev => ({ ...prev, reminderTime: time }))} onSaveList={() => {
        if (state.currentList.length === 0) return;
        const entry: HistoryEntry = { id: crypto.randomUUID(), date: new Date().toISOString(), items: [...state.currentList], totalSpent: state.currentList.filter(i => i.isPurchased).reduce((a, b) => a + b.price, 0) };
        setState(prev => ({ ...prev, history: [entry, ...prev.history], currentList: [] }));
        setActiveTab(Tab.History);
      }} />;
      case Tab.Budget: return <Budget monthlyBudget={state.monthlyBudget} totalSpent={totalMonthlySpend} currency={state.currency} countryCode={state.countryCode} items={state.currentList} onSetBudget={(amount) => setState(prev => ({ ...prev, monthlyBudget: amount }))} onUpdateCurrency={(c) => setState(prev => ({ ...prev, currency: c.toUpperCase() }))} />;
      case Tab.History: return <History history={state.history} currency={state.currency} />;
      case Tab.Settings: return <Settings state={state} onUpdateState={(updates) => setState(prev => ({ ...prev, ...updates }))} onDeleteAccount={deleteAccount} onLogout={() => setState(prev => ({ ...prev, isAuthenticated: false, user: null }))} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 min-h-screen shadow-sm relative border-x border-gray-100 dark:border-zinc-800 transition-colors duration-300">
        <header className="px-6 py-4 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100 tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
              {formatCurrency(totalMonthlySpend)}
            </div>
            {state.user && (
              <div 
                onClick={() => setActiveTab(Tab.Settings)}
                className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-700 font-bold text-sm cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden border-2 border-white dark:border-zinc-800"
              >
                {state.user.avatar ? (
                  <img src={state.user.avatar} className="w-full h-full object-cover" alt="User" />
                ) : (
                  state.user.name.charAt(0)
                )}
              </div>
            )}
          </div>
        </header>
        <main className="p-6">{renderContent()}</main>
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Global Reminder Overlay Alert */}
      {showReminderAlert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-emerald-900/30 text-center scale-up-center ring-4 ring-emerald-500/20">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <BellRing size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-zinc-100">Grocery Time!</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">
              Your scheduled shopping alert is active. Tap below to stop the reminder and view your list.
            </p>
            <button 
              onClick={() => {
                stopReminderAlert();
                setActiveTab(Tab.Home);
              }}
              className="w-full bg-emerald-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <VolumeX size={20} />
              Stop & Go Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
