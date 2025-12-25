
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

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  currentList: GroceryItem[];
  monthlyBudget: number;
  history: HistoryEntry[];
  theme: Theme;
  currency: string;
  countryCode: string | null;
  locationConfigured: boolean;
  // Security & Compliance
  isGDPRAccepted: boolean;
  isLocked: boolean;
  securityPin: string | null;
  useBiometrics: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  encryptionKey: string | null;
  // Reminder Feature
  reminderTime: string | null;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export enum Tab {
  Home = 'Home',
  Budget = 'Budget',
  History = 'History',
  Settings = 'Settings'
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
