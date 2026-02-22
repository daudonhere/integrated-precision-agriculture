import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Warehouse {
  id: number;
  name: string;
  capacity: number;
  elevation: number;
  location: string;
  lat: number;
  lng: number;
}

interface WarehouseState {
  data: Warehouse[];
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (id: number, warehouse: Partial<Warehouse>) => void;
  deleteWarehouse: (id: number) => void;
  setWarehouses: (warehouses: Warehouse[]) => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set) => ({
      data: [],
      addWarehouse: (warehouse) =>
        set((state) => ({
          data: [...state.data, warehouse],
        })),
      updateWarehouse: (id, warehouse) =>
        set((state) => ({
          data: state.data.map((item) =>
            item.id === id ? { ...item, ...warehouse } : item
          ),
        })),
      deleteWarehouse: (id) =>
        set((state) => ({
          data: state.data.filter((item) => item.id !== id),
        })),
      setWarehouses: (warehouses) => set({ data: warehouses }),
    }),
    {
      name: 'smartfarm-warehouse',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
