
export type Theme = 'light' | 'dark';

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isPurchased: boolean;
}

export interface HistoryEntry {
  id: string;
  date: string;
  items: GroceryItem[];
  totalSpent: number;
}

export interface AppState {
  currentList: GroceryItem[];
  monthlyBudget: number;
  history: HistoryEntry[];
  theme: Theme;
}

export enum Tab {
  Home = 'Home',
  Budget = 'Budget',
  History = 'History'
}

export const CATEGORIES = [
  'Dairy',
  'Vegetables',
  'Fruits',
  'Meat',
  'Bakery',
  'Pantry',
  'Household',
  'Personal Care',
  'Other'
];
