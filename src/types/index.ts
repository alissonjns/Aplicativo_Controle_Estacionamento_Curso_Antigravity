export interface User {
  email: string;
  password?: string;
}

export type VehicleType = 'carro' | 'moto' | 'caminhonete';

export interface Vehicle {
  id: string;
  placa: string;
  modelo?: string;
  type: VehicleType;
  entryTime: string; // ISO string
}

export interface Receipt {
  id: string;
  placa: string;
  modelo?: string;
  type: VehicleType;
  entryTime: string;
  exitTime: string;
  durationMinutes: number;
  hourlyRate: number;
  totalCost: number;
  date: string; // YYYY-MM-DD for grouping
}
