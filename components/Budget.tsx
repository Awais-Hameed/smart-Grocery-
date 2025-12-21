
import React, { useState } from 'react';
import { Target, TrendingUp, CircleDollarSign } from 'lucide-react';

interface BudgetProps {
  monthlyBudget: number;
  totalSpent: number;
  onSetBudget: (amount: number) => void;
}

const Budget: React.FC<BudgetProps> = ({ monthlyBudget, totalSpent, onSetBudget }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  const remaining = monthlyBudget - totalSpent;
  const percentage = Math.min((totalSpent / monthlyBudget) * 100, 100);

  const getProgressColor = () => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleUpdate = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onSetBudget(val);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 transition-colors">
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400 flex items-center gap-2">
              <Target size={16} className="text-emerald-600 dark:text-emerald-400" />
              Monthly Budget
            </span>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                Change
              </button>
            ) : (
              <button 
                onClick={handleUpdate}
                className="text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 px-3 py-1 rounded-full hover:bg-emerald-700 transition-colors"
              >
                Save
              </button>
            )}
          </div>
          
          {isEditing ? (
            <input
              autoFocus
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="text-3xl font-bold text-gray-800 dark:text-zinc-100 border-b-2 border-emerald-600 dark:border-emerald-500 bg-transparent focus:outline-none w-full pb-1 transition-colors"
            />
          ) : (
            <h3 className="text-3xl font-bold text-gray-800 dark:text-zinc-100 transition-colors">${monthlyBudget.toFixed(2)}</h3>
          )}

          <div className="mt-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${getProgressColor()}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl flex flex-col gap-1 border border-emerald-100/50 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Spent</span>
            </div>
            <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100 transition-colors">${totalSpent.toFixed(2)}</p>
          </div>
          <div className={`${remaining < 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'} p-6 rounded-3xl flex flex-col gap-1 border transition-colors`}>
            <div className={`flex items-center gap-2 ${remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-zinc-400'} mb-2`}>
              <CircleDollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Left</span>
            </div>
            <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-zinc-100'} transition-colors`}>
              ${Math.max(0, remaining).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 dark:bg-zinc-800 text-white p-6 rounded-3xl shadow-xl flex flex-col gap-3 border border-white/5 dark:border-zinc-700 transition-colors">
        <h4 className="font-bold text-emerald-400 dark:text-emerald-400 text-sm">Budget Insights</h4>
        {totalSpent > monthlyBudget ? (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            You've exceeded your budget by <span className="text-white dark:text-emerald-100 font-bold">${(totalSpent - monthlyBudget).toFixed(2)}</span>. Consider reviewing your "Other" category items to save next month.
          </p>
        ) : percentage > 80 ? (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            Approaching limit! You have <span className="text-white dark:text-emerald-100 font-bold">${remaining.toFixed(2)}</span> left for the rest of the month.
          </p>
        ) : (
          <p className="text-xs text-gray-300 dark:text-zinc-300 leading-relaxed">
            Great job! You're pacing well. You've only used <span className="text-white dark:text-emerald-100 font-bold">{Math.round(percentage)}%</span> of your set budget.
          </p>
        )}
      </div>
    </div>
  );
};

export default Budget;
