import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface RouteHistory {
  id: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  fromWarehouseName: string;
  toWarehouseName: string;
  vehicle: 'motorcycle' | 'car' | 'truck';
  distance: number;
  duration: number;
  createdAt: number;
  coordinates: [number, number][];
  isFarm?: boolean;
}

interface RouteHistoryState {
  data: RouteHistory[];
  addRoute: (route: RouteHistory) => void;
  getRoute: (fromId: number, toId: number, vehicle: string) => RouteHistory | undefined;
  getRoutesFromWarehouse: (warehouseId: number) => RouteHistory[];
  clearRoutes: () => void;
}

export const useRouteHistoryStore = create<RouteHistoryState>()(
  persist(
    (set, get) => ({
      data: [],
      addRoute: (route) =>
        set((state) => {
          const existingIndex = state.data.findIndex(
            (r) =>
              r.fromWarehouseId === route.fromWarehouseId &&
              r.toWarehouseId === route.toWarehouseId &&
              r.vehicle === route.vehicle
          );

          let newData;
          if (existingIndex >= 0) {
            newData = [...state.data];
            newData[existingIndex] = route;
          } else {
            newData = [...state.data, route];
          }

          return { data: newData };
        }),
      getRoute: (fromId, toId, vehicle) => {
        const state = get();
        return state.data.find(
          (r) =>
            r.fromWarehouseId === fromId &&
            r.toWarehouseId === toId &&
            r.vehicle === vehicle
        );
      },
      getRoutesFromWarehouse: (warehouseId) => {
        const state = get();
        return state.data.filter(
          (r) => r.fromWarehouseId === warehouseId || r.toWarehouseId === warehouseId
        );
      },
      clearRoutes: () => set({ data: [] }),
    }),
    {
      name: 'smartfarm-route-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
