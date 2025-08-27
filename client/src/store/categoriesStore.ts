import { create } from 'zustand';
interface Categories {
  income: string[];
  expense: string[];
  investment: string[];
  savings: string[];
}

interface CategoriesStore {
  categories: Categories;
  addCategory: (categoryType: keyof Categories, category: string) => void;
  removeCategory: (categoryType: keyof Categories, category: string) => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: {
    income: [
      'salary',
      'freelance',
      'business revenue',
      'interest earned',
      'dividends',
      'other',
      'bonus',
      'commission',
    ],
    expense: [
      'rent',
      'groceries',
      'dining out',
      'transportation',
      'entertainment',
      'healthcare',
      'utilities',
      'subscriptions',
      'miscellaneous',
      'insurance',
      'travel',
    ],
    investment: [
      'stocks',
      'mutual funds',
      'real estate',
      'cryptocurrency',
      'gold',
      'commodities',
      'other investments',
      'bonds',
      'ETFs',
    ],
    savings: [
      'emergency fund',
      'retirement fund',
      'fixed deposits',
      'high-interest savings',
      'travel savings',
      'college fund',
      'vacation fund',
    ],
  },

  addCategory: (categoryType: keyof Categories, category: string) =>
    set((state) => ({
      categories: {
        ...state.categories,
        [categoryType]: [...state.categories[categoryType], category],
      },
    })),

  removeCategory: (categoryType: keyof Categories, category: string) =>
    set((state) => ({
      categories: {
        ...state.categories,
        [categoryType]: state.categories[categoryType].filter(
          (c) => c !== category
        ),
      },
    })),
}));
