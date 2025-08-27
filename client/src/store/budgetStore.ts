import { create } from 'zustand';
import { useEntriesStore } from './entriesStore';

export interface Budget {
  id: string;
  type: 'expense' | 'savings' | 'investment';
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  name: string;
}

interface BudgetStore {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  removeBudget: (id: string) => void;
  updateBudget: (id: string, updatedBudget: Partial<Budget>) => void;
  getBudgets: () => Budget[];
  getBudgetsByType: (type: Budget['type']) => Budget[];
}

export const useBudgetStore = create<BudgetStore>((set, get) => {
  const initialBudgets: Budget[] = [
    {
      id: '1',
      type: 'expense',
      category: 'groceries',
      amount: 18000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Groceries',
    },
    {
      id: '2',
      type: 'expense',
      category: 'entertainment',
      amount: 6000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Entertainment',
    },
    {
      id: '3',
      type: 'expense',
      category: 'utilities',
      amount: 4000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Utilities',
    },
    {
      id: '4',
      type: 'expense',
      category: 'transport',
      amount: 3500,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Transport',
    },
    {
      id: '5',
      type: 'expense',
      category: 'shopping',
      amount: 8000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Shopping',
    },
    {
      id: '6',
      type: 'expense',
      category: 'health',
      amount: 2500,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Health',
    },
    {
      id: '7',
      type: 'savings',
      category: 'emergency fund',
      amount: 12000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Emergency Fund',
    },
    {
      id: '8',
      type: 'savings',
      category: 'vacation',
      amount: 5000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Vacation Savings',
    },
    {
      id: '9',
      type: 'savings',
      category: 'retirement',
      amount: 7000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Retirement Savings',
    },
    {
      id: '10',
      type: 'savings',
      category: 'gifts',
      amount: 2000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Gift Savings',
    },
    {
      id: '11',
      type: 'investment',
      category: 'stocks',
      amount: 15000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Stocks',
    },
    {
      id: '12',
      type: 'investment',
      category: 'mutual funds',
      amount: 10000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Mutual Funds',
    },
    {
      id: '13',
      type: 'investment',
      category: 'crypto',
      amount: 3000,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Crypto',
    },
    {
      id: '14',
      type: 'investment',
      category: 'real estate',
      amount: 20000,
      period: 'quarterly',
      startDate: '2024-04-01',
      name: 'Real Estate',
    },
    {
      id: '15',
      type: 'expense',
      category: 'subscriptions',
      amount: 1200,
      period: 'monthly',
      startDate: '2024-06-01',
      name: 'Subscriptions',
    },
  ];

  return {
    budgets: initialBudgets,

    addBudget: (budget) =>
      set((state) => ({
        budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }],
      })),

    removeBudget: (id) =>
      set((state) => ({
        budgets: state.budgets.filter((budget) => budget.id !== id),
      })),

    updateBudget: (id, updatedBudget) =>
      set((state) => ({
        budgets: state.budgets.map((budget) =>
          budget.id === id ? { ...budget, ...updatedBudget } : budget
        ),
      })),

    getBudgets: () => get().budgets,

    getBudgetsByType: (type) =>
      get().budgets.filter((budget) => budget.type === type),
  };
});

// Utility function to calculate progress for a specific budget
export function calculateBudgetProgress(budget: Budget): {
  currentSpending: number;
  progress: number;
  remaining: number;
} {
  const entries = useEntriesStore.getState().entries;

  // Get the current month, quarter, or year start/end dates
  const now = new Date();
  let periodStart: Date, periodEnd: Date;

  switch (budget.period) {
    case 'monthly':
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'quarterly': {
      const quarter = Math.floor(now.getMonth() / 3);
      periodStart = new Date(now.getFullYear(), quarter * 3, 1);
      periodEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
      break;
    }
    case 'yearly':
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31);
      break;
  }

  // Filter entries by type, category, and period
  const relevantEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entry.type === budget.type &&
      entry.category === budget.category &&
      entryDate >= periodStart &&
      entryDate <= periodEnd
    );
  });

  // Calculate current spending
  const currentSpending = relevantEntries.reduce(
    (total, entry) => total + entry.amount,
    0
  );

  // Calculate progress percentage (cap at 100%)
  const progress = Math.min(
    Math.round((currentSpending / budget.amount) * 100),
    100
  );

  // Calculate remaining amount
  const remaining = Math.max(budget.amount - currentSpending, 0);

  return { currentSpending, progress, remaining };
}
