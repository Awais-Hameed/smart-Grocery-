
import React from 'react';
import { Tab } from '../types';
import { ShoppingBasket, Wallet, History as HistoryIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none z-40">
      <div className="w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-100 dark:border-zinc-800 px-6 py-3 flex justify-around items-center pointer-events-auto shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors duration-300">
        <button
          onClick={() => onTabChange(Tab.Home)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.Home ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400'}`}
        >
          <ShoppingBasket size={24} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>
        <button
          onClick={() => onTabChange(Tab.Budget)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.Budget ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400'}`}
        >
          <Wallet size={24} />
          <span className="text-[10px] font-bold tracking-tight">Budget</span>
        </button>
        <button
          onClick={() => onTabChange(Tab.History)}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === Tab.History ? 'text-emerald-600 dark:text-emerald-400 scale-105' : 'text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400'}`}
        >
          <HistoryIcon size={24} />
          <span className="text-[10px] font-bold tracking-tight">History</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
