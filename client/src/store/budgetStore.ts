import { create } from 'zustand';
import { useEntriesStore } from './entriesStore';

export interface Budget {
  id: string;
  type: string;
  category: string;
  amount: number;
  period: string;
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
    },
    {
      id: '2',
      type: 'expense',
      category: 'entertainment',
      amount: 6000,
      period: 'monthly',
    },
    {
      id: '3',
      type: 'expense',
      category: 'utilities',
      amount: 4000,
      period: 'monthly',
    },
    {
      id: '4',
      type: 'expense',
      category: 'transport',
      amount: 3500,
      period: 'monthly',
    },
    {
      id: '5',
      type: 'expense',
      category: 'shopping',
      amount: 8000,
      period: 'monthly',
    },
    {
      id: '6',
      type: 'expense',
      category: 'health',
      amount: 2500,
      period: 'monthly',
    },
    {
      id: '7',
      type: 'savings',
      category: 'emergency fund',
      amount: 12000,
      period: 'monthly',
    },
    {
      id: '8',
      type: 'savings',
      category: 'vacation',
      amount: 5000,
      period: 'monthly',
    },
    {
      id: '9',
      type: 'savings',
      category: 'retirement',
      amount: 7000,
      period: 'monthly',
    },
    {
      id: '10',
      type: 'savings',
      category: 'gifts',
      amount: 2000,
      period: 'monthly',
    },
    {
      id: '11',
      type: 'investment',
      category: 'stocks',
      amount: 15000,
      period: 'monthly',
    },
    {
      id: '12',
      type: 'investment',
      category: 'mutual funds',
      amount: 10000,
      period: 'monthly',
    },
    {
      id: '13',
      type: 'investment',
      category: 'crypto',
      amount: 3000,
      period: 'monthly',
    },
    {
      id: '14',
      type: 'investment',
      category: 'real estate',
      amount: 20000,
      period: 'quarterly',
    },
    {
      id: '15',
      type: 'expense',
      category: 'subscriptions',
      amount: 1200,
      period: 'monthly',
    },
    {
      id: '16',
      type: 'investment',
      category: 'bonds',
      amount: 8000,
      period: 'monthly',
    },
    {
      id: '17',
      type: 'investment',
      category: 'gold',
      amount: 5000,
      period: 'monthly',
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
  // Get all entries from the entries store
  const entries = useEntriesStore.getState().getEntries();

  // Filter entries by type and category that match the budget
  const relevantEntries = entries.filter(
    (entry) => entry.type === budget.type && entry.category === budget.category
  );

  // Calculate current period based on today and budget.period
  const currentDate = new Date();
  const periodStart = new Date(currentDate);
  let periodEnd = new Date(currentDate);

  if (budget.period === 'monthly') {
    periodStart.setDate(1);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else if (budget.period === 'quarterly') {
    const currentMonth = currentDate.getMonth();
    const quarterStartMonth = currentMonth - (currentMonth % 3);
    periodStart.setMonth(quarterStartMonth, 1);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 3);
  } else if (budget.period === 'yearly') {
    periodStart.setMonth(0, 1);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else if (budget.period === 'half-yearly') {
    const currentMonth = currentDate.getMonth();
    const halfStartMonth = currentMonth < 6 ? 0 : 6;
    periodStart.setMonth(halfStartMonth, 1);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 6);
  }

  // Filter entries by date range
  const entriesInPeriod = relevantEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= periodStart && entryDate < periodEnd;
  });

  // Calculate total spending for the period
  const currentSpending = entriesInPeriod.reduce(
    (total, entry) => total + entry.amount,
    0
  );

  // Calculate progress percentage
  const progress = Math.min(
    Math.round((currentSpending / budget.amount) * 100),
    100
  );

  // Calculate remaining amount
  const remaining = Math.max(budget.amount - currentSpending, 0);

  return { currentSpending, progress, remaining };
}
