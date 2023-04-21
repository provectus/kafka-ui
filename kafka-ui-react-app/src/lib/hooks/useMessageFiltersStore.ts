import { LOCAL_STORAGE_KEY_PREFIX } from 'lib/constants';
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AdvancedFilter {
  name: string;
  value: string;
}

interface MessageFiltersState {
  filters: AdvancedFilter[];
  activeFilter?: AdvancedFilter;
  save: (filter: AdvancedFilter) => void;
  apply: (filter: AdvancedFilter) => void;
  remove: (name: string) => void;
  update: (name: string, filter: AdvancedFilter) => void;
}

export const useMessageFiltersStore = create<MessageFiltersState>()(
  persist(
    (set) => ({
      filters: [],
      save: (filter) =>
        set((state) => ({
          filters: [...state.filters, filter],
        })),
      apply: (filter) => set(() => ({ activeFilter: filter })),
      remove: (name) =>
        set((state) => ({
          filters: state.filters.filter((f) => f.name !== name),
        })),
      update: (name, filter) =>
        set((state) => ({
          filters: state.filters.map((f) => (f.name === name ? filter : f)),
        })),
    }),
    {
      name: `${LOCAL_STORAGE_KEY_PREFIX}-message-filters`,
    }
  )
);
