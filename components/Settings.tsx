
import React, { useState, useRef } from 'react';
import { AppState, UserProfile } from '../types';
import { Shield, Lock, Fingerprint, Trash2, LogOut, Moon, Sun, Globe, Camera, ShieldCheck, KeyRound, ChevronRight, Search, X, Coins, Volume2, Smartphone } from 'lucide-react';
import { COUNTRY_DATA } from '../App';

interface SettingsProps {
  state: AppState;
  onUpdateState: (updates: Partial<AppState>) => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
}

const CountrySelectorModal: React.FC<{ 
  onClose: () => void, 
  onSelect: (code: string) => void 
}> = ({ onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  
  const filteredCountries = Object.entries(COUNTRY_DATA).filter(([code, data]) => 
    data.name.toLowerCase().includes(search.toLowerCase()) || 
    code.toLowerCase().includes(search.toLowerCase()) ||
    data.currency.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg">Select Country</h3>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              autoFocus
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 pl-10 pr-4 py-3 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
        <div className="overflow-y-auto p-2 pb-6 space-y-1">
          {filteredCountries.map(([code, data]) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} className="w-8 h-5 rounded object-cover shadow-sm" alt={data.name} />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800 dark:text-zinc-100">{data.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{data.currency}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC<SettingsProps> = ({ state, onUpdateState, onDeleteAccount, onLogout }) => {
  const [pinInput, setPinInput] = useState('');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetPin = () => {
    if (pinInput.length === 4) {
      onUpdateState({ securityPin: pinInput, isAuthenticated: true });
      setPinInput('');
      alert("Security PIN established! Your data is now protected.");
    } else {
      alert("Please enter exactly 4 digits for your PIN.");
    }
  };

  const removePin = () => {
    if (confirm("Disable security lock? This will make your data accessible to anyone using this device.")) {
      onUpdateState({ securityPin: null, useBiometrics: false });
      alert("Security PIN removed.");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (state.user) {
          onUpdateState({ 
            user: { ...state.user, avatar: base64String } 
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerLock = () => {
    if (!state.securityPin) {
      alert("Set a PIN first to enable the lock feature.");
      return;
    }
    onUpdateState({ isAuthenticated: false });
  };

  const selectCountry = (code: string) => {
    const data = COUNTRY_DATA[code];
    if (data) {
      onUpdateState({ 
        countryCode: code, 
        currency: data.currency 
      });
      setIsCountryModalOpen(false);
    }
  };

  const uniqueCurrencies = Array.from(new Set(Object.values(COUNTRY_DATA).map(d => d.currency))).sort();

  const currentCountryName = state.countryCode ? COUNTRY_DATA[state.countryCode]?.name : 'Not Set';

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Profile Section */}
      <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-3xl flex items-center justify-center text-emerald-600 text-3xl font-bold overflow-hidden border-4 border-white dark:border-zinc-800 shadow-md">
              {state.user?.avatar ? (
                <img src={state.user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                state.user?.name.charAt(0)
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-2 bg-emerald-600 text-white rounded-xl shadow-lg border-2 border-white dark:border-zinc-900 hover:bg-emerald-700 transition-colors active:scale-90"
            >
              <Camera size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100 leading-tight">{state.user?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">{state.user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 text-gray-600 dark:text-zinc-400 font-bold text-xs bg-gray-50 dark:bg-zinc-900 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-100 dark:border-zinc-800"
          >
            <LogOut size={16} /> Sign Out
          </button>
          <button 
            onClick={triggerLock}
            disabled={!state.securityPin}
            className={`flex items-center justify-center gap-2 font-bold text-xs py-3.5 rounded-2xl transition-all border ${state.securityPin ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent opacity-50'}`}
          >
            <Lock size={16} /> Lock Now
          </button>
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" /> Security & Privacy
        </h3>
        
        <div className="bg-white dark:bg-zinc-800/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">PIN Protection</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status: {state.securityPin ? 'Active' : 'Not Set'}</p>
                  </div>
                </div>
                {state.securityPin ? (
                  <button onClick={removePin} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Disable</button>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="PIN"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-16 px-2 py-1 bg-transparent text-xs text-center outline-none font-bold"
                    />
                    <button 
                      onClick={handleSetPin} 
                      className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-lg shadow-sm hover:bg-emerald-700 active:scale-95"
                    >
                      Set
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${state.useBiometrics ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-gray-50 dark:bg-zinc-900 text-gray-400'}`}>
                  <Fingerprint size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Biometric Login</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unlock with Device</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!state.securityPin) {
                    alert("Please set a PIN before enabling Biometrics.");
                    return;
                  }
                  onUpdateState({ useBiometrics: !state.useBiometrics });
                }}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${state.useBiometrics ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${state.useBiometrics ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-start gap-3">
              <ShieldCheck className="text-emerald-500 mt-0.5 shrink-0" size={18} />
              <div>
                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-100">Client-Side Encryption</h5>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed mt-1">
                  Your PIN hash and data are stored locally in your device's secure sandbox. No cloud syncing ensures zero risk of remote leaks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Settings */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-2">App Preferences</h3>
        <div className="bg-white dark:bg-zinc-800/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-400">
                {state.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Appearance</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{state.theme} mode</p>
              </div>
            </div>
            <button 
              onClick={() => onUpdateState({ theme: state.theme === 'light' ? 'dark' : 'light' })}
              className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-xl active:scale-95"
            >
              Toggle
            </button>
          </div>

          <div 
            onClick={() => setIsCountryModalOpen(true)}
            className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-6 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-600 transition-colors">
                <Globe size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Localization</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  {currentCountryName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {state.countryCode && (
                <img src={`https://flagcdn.com/w40/${state.countryCode.toLowerCase()}.png`} className="w-7 h-5 rounded-md shadow-sm border border-gray-100 dark:border-zinc-700" alt="Flag" />
              )}
              <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-50 dark:border-zinc-800 pt-6">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-zinc-400">
                  <Coins size={18} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Currency</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active: {state.currency}</p>
                </div>
                <select 
                  value={state.currency}
                  onChange={(e) => onUpdateState({ currency: e.target.value })}
                  className="bg-gray-50 dark:bg-zinc-900 text-xs font-bold px-3 py-2 rounded-xl outline-none border border-transparent focus:border-emerald-500 transition-all"
                >
                  {uniqueCurrencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* New Sound & Vibration Toggles */}
          <div className="flex flex-col gap-6 border-t border-gray-50 dark:border-zinc-800 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${state.soundEnabled ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-gray-50 dark:bg-zinc-900 text-gray-400'}`}>
                  <Volume2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Reminder Song</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Audible alerts</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdateState({ soundEnabled: !state.soundEnabled })}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${state.soundEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${state.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 dark:border-zinc-800 pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${state.vibrationEnabled ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-gray-50 dark:bg-zinc-900 text-gray-400'}`}>
                  <Smartphone size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">Vibrate</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Haptic alerts</p>
                </div>
              </div>
              <button 
                onClick={() => onUpdateState({ vibrationEnabled: !state.vibrationEnabled })}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${state.vibrationEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-zinc-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${state.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Account Deletion */}
      <div className="pt-4">
        <button 
          onClick={onDeleteAccount}
          className="w-full bg-white dark:bg-zinc-800/50 p-6 rounded-[2.5rem] border border-red-50 dark:border-red-900/10 shadow-sm flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-red-500">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold">Wipe App Data</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Permanent removal</p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="text-center flex flex-col gap-1 py-4">
        <p className="text-[10px] text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-[0.25em]">Smart Grocery v2.7.0</p>
        <p className="text-[9px] text-gray-300 dark:text-zinc-700 uppercase font-semibold">Privacy-First Architecture</p>
      </div>

      {isCountryModalOpen && (
        <CountrySelectorModal 
          onClose={() => setIsCountryModalOpen(false)} 
          onSelect={selectCountry} 
        />
      )}
    </div>
  );
};

export default Settings;
