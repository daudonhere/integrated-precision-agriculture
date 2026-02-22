import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FarmArea {
  id: number;
  name: string;
  varieties: string;
  harvest: string;
  area: number;
  elevation: number;
  location: string;
  points: [number, number][];
  color: string;
}

interface FarmState {
  data: FarmArea[];
  addArea: (area: FarmArea) => void;
  updateArea: (id: number, area: Partial<FarmArea>) => void;
  deleteArea: (id: number) => void;
  setAreas: (areas: FarmArea[]) => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      data: [],
      addArea: (area) =>
        set((state) => ({
          data: [...state.data, area],
        })),
      updateArea: (id, area) =>
        set((state) => ({
          data: state.data.map((item) =>
            item.id === id ? { ...item, ...area } : item
          ),
        })),
      deleteArea: (id) =>
        set((state) => ({
          data: state.data.filter((item) => item.id !== id),
        })),
      setAreas: (areas) => set({ data: areas }),
    }),
    {
      name: 'smartfarm-land',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
