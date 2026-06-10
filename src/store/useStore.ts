import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Vehicle, Receipt } from '../types';

export interface Rates {
  carro: number;
  moto: number;
  caminhonete: number;
}

interface AppState {
  user: User | null;
  registeredUsers: User[];
  rates: Rates;
  vehicles: Vehicle[];
  receipts: Receipt[];
  login: (email: string, password?: string) => boolean;
  register: (email: string, password?: string) => boolean;
  logout: () => void;
  setRates: (rates: Rates) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  checkoutVehicle: (vehicleId: string, exitTime: string, cost: number, durationMinutes: number) => Receipt | null;
  updateReceipt: (receiptId: string, updates: Partial<Receipt>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      registeredUsers: [],
      rates: { carro: 5, moto: 3, caminhonete: 6 },
      vehicles: [],
      receipts: [],
      login: (email, password) => {
        set((state) => {
          const validUser = state.registeredUsers.find(u => u.email === email && u.password === password);
          if (validUser) {
            return { user: validUser };
          }
          return state;
        });
        // We return true if user is set (meaning login succeeded)
        // Wait, returning from set doesn't return from the outer function easily.
        // Let's do it cleanly:
        let success = false;
        set((state) => {
          const validUser = state.registeredUsers.find(u => u.email === email && u.password === password);
          if (validUser) {
            success = true;
            return { user: validUser };
          }
          return state;
        });
        return success;
      },
      register: (email, password) => {
        let success = false;
        set((state) => {
          if (state.registeredUsers.some(u => u.email === email)) {
            return state; // user already exists
          }
          success = true;
          return { registeredUsers: [...state.registeredUsers, { email, password }] };
        });
        return success;
      },
      logout: () => set({ user: null }),
      setRates: (rates) => set({ rates }),
      addVehicle: (vehicle) => set((state) => ({
        vehicles: [...state.vehicles, { ...vehicle, id: crypto.randomUUID() }]
      })),
      checkoutVehicle: (vehicleId, exitTime, cost, durationMinutes) => {
        let generatedReceipt: Receipt | null = null;
        set((state) => {
          const vehicle = state.vehicles.find(v => v.id === vehicleId);
          if (!vehicle) return state;

          generatedReceipt = {
            id: crypto.randomUUID(),
            placa: vehicle.placa,
            modelo: vehicle.modelo,
            type: vehicle.type,
            entryTime: vehicle.entryTime,
            exitTime,
            durationMinutes,
            hourlyRate: state.rates[vehicle.type],
            totalCost: cost,
            date: new Date(exitTime).toISOString().split('T')[0]
          };

          return {
            vehicles: state.vehicles.filter(v => v.id !== vehicleId),
            receipts: [...state.receipts, generatedReceipt as Receipt]
          };
        });
        return generatedReceipt;
      },
      updateReceipt: (receiptId, updates) => set((state) => ({
        receipts: state.receipts.map(r =>
          r.id === receiptId ? { ...r, ...updates } : r
        )
      }))
    }),
    {
      name: 'parking-storage',
    }
  )
);
