import { create } from 'zustand';
import generatedEntries from '../json/generated_entries.json';

interface Entry {
  id: string;
  type: string;
  category: string;
  amount: number;
  date: string;
}

interface EntriesStore {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, updatedEntry: Partial<Entry>) => void;
  getEntries: () => Entry[];
  getEntriesByType: (type: Entry['type']) => Entry[];
}

export const useEntriesStore = create<
  EntriesStore & { mainEntries: Record<string, number> }
>((set, get) => {
  const initialMainEntries = generatedEntries.reduce(
    (acc: Record<string, number>, entry: Entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + entry.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    mainEntries: initialMainEntries,
    entries: generatedEntries,

    addEntry: (entry) =>
      set((state) => {
        const newEntry = { ...entry, id: crypto.randomUUID() };
        const newMainEntries = { ...state.mainEntries };
        newMainEntries[entry.type] =
          (newMainEntries[entry.type] || 0) + entry.amount;
        return {
          entries: [newEntry, ...state.entries],
          mainEntries: newMainEntries,
        };
      }),

    removeEntry: (id) =>
      set((state) => {
        const entryToRemove = state.entries.find((entry) => entry.id === id);
        if (!entryToRemove) return {};
        const newMainEntries = { ...state.mainEntries };
        newMainEntries[entryToRemove.type] -= entryToRemove.amount;
        return {
          entries: state.entries.filter((entry) => entry.id !== id),
          mainEntries: newMainEntries,
        };
      }),

    updateEntry: (id, updatedEntry) =>
      set((state) => {
        const oldEntry = state.entries.find((entry) => entry.id === id);
        if (!oldEntry) return {};
        const newEntry = { ...oldEntry, ...updatedEntry };
        const newEntries = state.entries.map((entry) =>
          entry.id === id ? newEntry : entry
        );

        const newMainEntries = { ...state.mainEntries };

        if (updatedEntry.type && updatedEntry.type !== oldEntry.type) {
          newMainEntries[oldEntry.type] -= oldEntry.amount;
          newMainEntries[updatedEntry.type] =
            (newMainEntries[updatedEntry.type] || 0) +
            (updatedEntry.amount ?? newEntry.amount);
        } else if (updatedEntry.amount) {
          const diff = updatedEntry.amount - oldEntry.amount;
          newMainEntries[oldEntry.type] += diff;
        }

        return {
          entries: newEntries,
          mainEntries: newMainEntries,
        };
      }),

    getEntries: () => get().entries,

    getEntriesByType: (type) =>
      get().entries.filter((entry) => entry.type === type),
  };
});
