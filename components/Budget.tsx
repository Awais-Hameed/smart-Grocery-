
import React, { useState } from 'react';
import { Target, TrendingUp, CircleDollarSign, BarChart3, PieChart } from 'lucide-react';
import { CATEGORIES, GroceryItem } from '../types';

interface BudgetProps {
  monthlyBudget: number;
  totalSpent: number;
  currency: string;
  countryCode: string | null;
  items: GroceryItem[];
  onSetBudget: (amount: number) => void;
  onUpdateCurrency: (currency: string) => void;
}

const Budget: React.FC<BudgetProps> = ({ 
  monthlyBudget, 
  totalSpent, 
  currency, 
  countryCode,
  items,
  onSetBudget, 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const remaining = monthlyBudget - totalSpent;
  const percentage = Math.min((totalSpent / monthlyBudget) * 100, 100);

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (e) {
      return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    }
  };

  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleBudgetUpdate = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onSetBudget(val);
      setIsEditing(false);
    }
  };

  // Category breakdown calculation
  const categorySpending = CATEGORIES.map(cat => {
    const total = items
      .filter(item => item.category === cat && item.isPurchased)
      .reduce((acc, item) => acc + item.price, 0);
    return { name: cat, total };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-8 transition-colors">
      {/* Main Budget Card */}
      <div className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <Target size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-semibold">Monthly Budget</span>
            </div>
            
            {countryCode && (
              <div className="flex items-center gap-2 mt-1 px-1">
                <img 
                  src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`} 
                  alt={countryCode}
                  className="w-5 h-3.5 object-cover rounded shadow-sm"
                />
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {currency}
                </span>
              </div>
            )}
          </div>

          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
            >
              Change
            </button>
          ) : (
            <button 
              onClick={handleBudgetUpdate}
              className="text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 px-4 py-2 rounded-2xl hover:bg-emerald-700 transition-all active:scale-95"
            >
              Save
            </button>
          )}
        </div>
        
        <div className="mt-2">
          {isEditing ? (
            <div className="relative">
              <input
                autoFocus
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="text-4xl font-bold text-gray-800 dark:text-zinc-100 border-b-2 border-emerald-600 dark:border-emerald-500 bg-transparent focus:outline-none w-full pb-2 transition-colors"
              />
            </div>
          ) : (
            <h3 className="text-4xl font-bold text-gray-800 dark:text-zinc-100 transition-colors tracking-tight">
              {formatCurrency(monthlyBudget)}
            </h3>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500 mb-2">
            <span>Progress</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div className="h-4 w-full bg-gray-100 dark:bg-zinc-700/50 rounded-full overflow-hidden p-1">
            <div 
              className={`h-full transition-all duration-700 ease-out rounded-full ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] flex flex-col gap-1 border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Spent</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-50 transition-colors">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        
        <div className={`${remaining < 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 shadow-red-500/5' : 'bg-white dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'} p-6 rounded-[2rem] flex flex-col gap-1 border transition-all shadow-sm`}>
          <div className={`flex items-center gap-2 ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'} mb-2`}>
            <CircleDollarSign size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Left</span>
          </div>
          <p className={`text-2xl font-bold ${remaining < 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-zinc-100'} transition-colors`}>
            {formatCurrency(Math.max(0, remaining))}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 p-6 rounded-[2.5rem] shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-800 dark:text-zinc-100">
            <BarChart3 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-bold text-sm">Spending by Category</h4>
          </div>
          <PieChart size={16} className="text-gray-400" />
        </div>

        {categorySpending.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-4 italic">No spending data to show yet</p>
        ) : (
          <div className="flex flex-col gap-4">
            {categorySpending.map(cat => (
              <div key={cat.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-600 dark:text-zinc-300">{cat.name}</span>
                  <span className="text-gray-900 dark:text-zinc-100">{formatCurrency(cat.total)}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(cat.total / totalSpent) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights Card */}
      <div className="bg-gray-900 dark:bg-zinc-800 text-white p-7 rounded-[2.5rem] shadow-xl flex flex-col gap-3 border border-white/5 dark:border-zinc-700 transition-colors">
        <h4 className="font-bold text-emerald-400 dark:text-emerald-400 text-sm flex items-center gap-2">
          Budget Insights
        </h4>
        {totalSpent > monthlyBudget ? (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            You've exceeded your budget by <span className="text-white font-bold">{formatCurrency(totalSpent - monthlyBudget)}</span>. Consider reviewing your spending patterns this month.
          </p>
        ) : percentage > 80 ? (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            Caution: You have used <span className="text-white font-bold">{Math.round(percentage)}%</span> of your budget. Only <span className="text-white font-bold">{formatCurrency(remaining)}</span> remains.
          </p>
        ) : (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            You're doing great! You've used <span className="text-white font-bold">{Math.round(percentage)}%</span> of your <span className="text-emerald-400 font-bold">{currency}</span> budget so far.
          </p>
        )}
      </div>
    </div>
  );
};

export default Budget;
