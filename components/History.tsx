
import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { Calendar, ChevronRight, ShoppingBag, Search } from 'lucide-react';

interface HistoryProps {
  history: HistoryEntry[];
}

const History: React.FC<HistoryProps> = ({ history }) => {
  const [filter, setFilter] = useState('');

  const filteredHistory = history.filter(entry => {
    const dateStr = new Date(entry.date).toLocaleDateString();
    return dateStr.includes(filter) || 
           entry.items.some(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={18} />
        <input 
          type="text"
          placeholder="Search items or dates..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 py-3 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm text-gray-700 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 transition-all"
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredHistory.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 gap-4 opacity-60">
            <ShoppingBag size={48} strokeWidth={1} />
            <p className="text-sm">No shopping history yet</p>
          </div>
        ) : (
          filteredHistory.map(entry => (
            <div 
              key={entry.id}
              className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm hover:border-emerald-100 dark:hover:border-emerald-900 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center transition-colors">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-zinc-100 transition-colors">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h4>
                  <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                    {entry.items.length} items • ${entry.totalSpent.toFixed(2)} spent
                  </p>
                </div>
              </div>
              <button className="text-gray-300 dark:text-zinc-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
