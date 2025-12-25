
import React, { useState } from 'react';
import { CATEGORIES, GroceryItem } from '../types';
import { X } from 'lucide-react';

interface AddItemModalProps {
  onClose: () => void;
  currency: string;
  onSubmit: (data: Omit<GroceryItem, 'id' | 'isPurchased'>) => void;
  initialData?: GroceryItem | null;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, currency, onSubmit, initialData }) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(initialData?.price.toString() ?? '');
  const [category, setCategory] = useState(initialData?.category ?? CATEGORIES[0]);

  // Extract currency symbol
  const currencySymbol = new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: currency,
  }).format(0).replace(/[0-9.,\s]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;

    onSubmit({
      name: name.trim(),
      price: parseFloat(price) || 0,
      category
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 duration-300 border border-white/5 dark:border-zinc-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
              {initialData ? 'Edit Item' : 'New Item'}
            </h2>
            <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-full text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Item Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Almond Milk"
                className="w-full bg-gray-50 dark:bg-zinc-800/50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-gray-700 dark:text-zinc-200 font-medium placeholder-gray-400 dark:placeholder-zinc-600"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Estimated Price</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 font-bold">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border-none pl-9 pr-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-gray-700 dark:text-zinc-200 font-medium placeholder-gray-400 dark:placeholder-zinc-600"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800/50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none text-gray-700 dark:text-zinc-200 font-medium appearance-none transition-all"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {initialData ? 'Update Item' : 'Add to List'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
