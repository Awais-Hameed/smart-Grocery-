
import React, { useState, useRef } from 'react';
import { GroceryItem, CATEGORIES } from '../types';
import { Plus, Check, Trash2, Edit2, Save, ShoppingBasket, Bell, BellOff, X, Clock } from 'lucide-react';
import AddItemModal from './AddItemModal';

interface HomeProps {
  items: GroceryItem[];
  currency: string;
  reminderTime: string | null;
  onAddItem: (item: Omit<GroceryItem, 'id' | 'isPurchased'>) => void;
  onUpdateItem: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteItem: (id: string) => void;
  onSetReminder: (time: string | null) => void;
  onSaveList: () => void;
}

const SetReminderModal: React.FC<{
  onClose: () => void;
  onSave: (time: string) => void;
  initialTime: string | null;
}> = ({ onClose, onSave, initialTime }) => {
  const [date, setDate] = useState(initialTime ? initialTime.split('T')[0] : '');
  const [time, setTime] = useState(initialTime ? initialTime.split('T')[1].substring(0, 5) : '');

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl relative z-10 animate-in slide-in-from-bottom-10 duration-300 border border-white/5 dark:border-zinc-800 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Bell size={24} className="text-emerald-500" /> Reminder
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-zinc-800 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Pick Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-gray-700 dark:text-zinc-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Pick Time</label>
            <input 
              type="time" 
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800/50 border-none px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-gray-700 dark:text-zinc-200"
            />
          </div>
          <button 
            disabled={!date || !time}
            onClick={() => onSave(`${date}T${time}:00`)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ items, currency, reminderTime, onAddItem, onUpdateItem, onDeleteItem, onSetReminder, onSaveList }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const touchStart = useRef<number | null>(null);

  const totalBill = items.reduce((acc, item) => acc + item.price, 0);
  const purchasedTotal = items
    .filter(item => item.isPurchased)
    .reduce((acc, item) => acc + item.price, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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

  const formattedReminder = reminderTime 
    ? new Date(reminderTime).toLocaleString(navigator.language, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 dark:text-zinc-500 font-medium">Planned</p>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{formatCurrency(totalBill)}</h2>
          
          {/* Reminder Trigger */}
          <button 
            onClick={() => setIsReminderModalOpen(true)}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all ${reminderTime ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-emerald-500'}`}
          >
            {reminderTime ? <Clock size={12} className="animate-pulse" /> : <Bell size={12} />}
            {formattedReminder || 'Set Reminder'}
            {reminderTime && (
              <X 
                size={12} 
                className="ml-1 hover:text-red-500" 
                onClick={(e) => { e.stopPropagation(); onSetReminder(null); }} 
              />
            )}
          </button>
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
                      {item.category} • {formatCurrency(item.price)}
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
              <p className="text-xl font-bold">{formatCurrency(purchasedTotal)}</p>
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
          currency={currency}
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

      {isReminderModalOpen && (
        <SetReminderModal 
          onClose={() => setIsReminderModalOpen(false)}
          onSave={(time) => {
            onSetReminder(time);
            setIsReminderModalOpen(false);
            // Request permission for native notifications if supported
            if ("Notification" in window && Notification.permission === "default") {
              Notification.requestPermission();
            }
          }}
          initialTime={reminderTime}
        />
      )}
    </div>
  );
};

export default Home;
