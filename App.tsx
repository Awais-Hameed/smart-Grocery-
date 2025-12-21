
import React, { useState, useEffect, useMemo } from 'react';
import { Tab, GroceryItem, HistoryEntry, AppState, Theme } from './types';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Budget from './components/Budget';
import History from './components/History';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'smart_grocery_budget_data';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load state", e);
    }
    return {
      currentList: [],
      monthlyBudget: 500,
      history: [],
      theme: 'light'
    };
  });

  // Sync dark mode class with state
  useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  // Persist state whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalSpentInActiveList = useMemo(() => {
    return state.currentList
      .filter(item => item.isPurchased)
      .reduce((acc, item) => acc + item.price, 0);
  }, [state.currentList]);

  const totalSpentHistoryThisMonth = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return state.history
      .filter(entry => {
        const d = new Date(entry.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, entry) => acc + entry.totalSpent, 0);
  }, [state.history]);

  const totalMonthlySpend = totalSpentInActiveList + totalSpentHistoryThisMonth;

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const addItem = (item: Omit<GroceryItem, 'id' | 'isPurchased'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: crypto.randomUUID(),
      isPurchased: false,
    };
    setState(prev => ({
      ...prev,
      currentList: [newItem, ...prev.currentList]
    }));
  };

  const updateItem = (id: string, updates: Partial<GroceryItem>) => {
    setState(prev => ({
      ...prev,
      currentList: prev.currentList.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const deleteItem = (id: string) => {
    setState(prev => ({
      ...prev,
      currentList: prev.currentList.filter(item => item.id !== id)
    }));
  };

  const setBudget = (amount: number) => {
    setState(prev => ({ ...prev, monthlyBudget: amount }));
  };

  const saveListToHistory = () => {
    if (state.currentList.length === 0) return;
    
    const purchasedItems = state.currentList.filter(item => item.isPurchased);
    const totalSpent = purchasedItems.reduce((acc, item) => acc + item.price, 0);

    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: [...state.currentList],
      totalSpent: totalSpent
    };

    setState(prev => ({
      ...prev,
      history: [newEntry, ...prev.history],
      currentList: []
    }));
    setActiveTab(Tab.History);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.Home:
        return (
          <Home 
            items={state.currentList} 
            onAddItem={addItem} 
            onUpdateItem={updateItem} 
            onDeleteItem={deleteItem}
            onSaveList={saveListToHistory}
          />
        );
      case Tab.Budget:
        return (
          <Budget 
            monthlyBudget={state.monthlyBudget} 
            totalSpent={totalMonthlySpend} 
            onSetBudget={setBudget} 
          />
        );
      case Tab.History:
        return (
          <History 
            history={state.history} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 min-h-screen shadow-sm relative border-x border-gray-100 dark:border-zinc-800 transition-colors duration-300">
        <header className="px-6 py-4 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between transition-colors duration-300">
          <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100">{activeTab}</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all active:scale-90 border border-transparent dark:border-zinc-700/50"
              aria-label="Toggle Theme"
            >
              {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm shadow-emerald-500/5">
              ${totalMonthlySpend.toFixed(2)}
            </div>
          </div>
        </header>

        <main className="p-6">
          {renderContent()}
        </main>

        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
