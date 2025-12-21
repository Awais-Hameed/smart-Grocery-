
import React, { useState, useRef } from 'react';
import { GroceryItem, CATEGORIES } from '../types';
import { Plus, Check, Trash2, Edit2, Save, ShoppingBasket } from 'lucide-react';
import AddItemModal from './AddItemModal';

interface HomeProps {
  items: GroceryItem[];
  onAddItem: (item: Omit<GroceryItem, 'id' | 'isPurchased'>) => void;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  onSaveList: () => void;
}

const Home: React.FC<HomeProps> = ({ items, onAddItem, onUpdateItem, onDeleteItem, onSaveList }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const touchStart = useRef<number | null>(null);

  const totalBill = items.reduce((acc, item) => acc + item.price, 0);
  const purchasedTotal = items
    .filter(item => item.isPurchased)
    .reduce((acc, item) => acc + item.price, 0);

  const handleEdit = (item: GroceryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setSwipedItemId(null);
  };

  const onTouchStart = (e: React.TouchEvent, id: string) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent, id: string) => {
    if (touchStart.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStart.current - currentX;

    if (diff > 50) {
      setSwipedItemId(id);
    } else if (diff < -50) {
      setSwipedItemId(null);
    }
  };

  const onTouchEnd = () => {
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">Planned</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">${totalBill.toFixed(2)}</h2>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
            setSwipedItemId(null);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 gap-4 opacity-60">
            <ShoppingBasket size={48} strokeWidth={1} />
            <p className="text-sm">Your list is empty</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id}
              className="relative overflow-hidden rounded-2xl"
              onTouchStart={(e) => onTouchStart(e, item.id)}
              onTouchMove={(e) => onTouchMove(e, item.id)}
              onTouchEnd={onTouchEnd}
            >
              <div 
                className={`absolute inset-0 bg-red-500 flex items-center justify-end px-6 transition-opacity duration-200 ${swipedItemId === item.id ? 'opacity-100' : 'opacity-0'}`}
                onClick={() => onDeleteItem(item.id)}
              >
                <Trash2 size={20} className="text-white" />
              </div>

              <div 
                className={`group flex items-center justify-between p-4 bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-2xl transition-all duration-300 relative z-10 ${item.isPurchased ? 'opacity-60 bg-gray-50 dark:bg-zinc-900' : 'hover:border-emerald-100 dark:hover:border-emerald-900 shadow-sm'} ${swipedItemId === item.id ? '-translate-x-16' : 'translate-x-0'}`}
                onClick={() => swipedItemId && setSwipedItemId(null)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateItem(item.id, { isPurchased: !item.isPurchased });
                      setSwipedItemId(null);
                    }}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${item.isPurchased ? 'bg-emerald-600 border-emerald-600' : 'border-gray-200 dark:border-zinc-700'}`}
                  >
                    {item.isPurchased && <Check size={14} className="text-white" />}
                  </button>
                  <div className="flex flex-col flex-1" onClick={() => handleEdit(item)}>
                    <span className={`text-sm font-semibold transition-all ${item.isPurchased ? 'line-through text-gray-400 dark:text-zinc-500' : 'text-gray-700 dark:text-zinc-200'}`}>
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-bold">
                      {item.category} • ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="hidden sm:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(item); }} 
                    className="p-2 text-gray-400 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }} 
                    className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20">
          <div className="bg-gray-900 dark:bg-zinc-800 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between border border-white/5 dark:border-zinc-700 transition-colors">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-zinc-400 uppercase font-bold tracking-widest">At Checkout</p>
              <p className="text-xl font-bold">${purchasedTotal.toFixed(2)}</p>
            </div>
            <button 
              onClick={onSaveList}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Save size={18} />
              Save List
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddItemModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data) => {
            if (editingItem) {
              onUpdateItem(editingItem.id, data);
            } else {
              onAddItem(data);
            }
            setIsModalOpen(false);
          }}
          initialData={editingItem}
        />
      )}
    </div>
  );
};

export default Home;
