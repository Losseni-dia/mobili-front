import { VehicleType } from './vehicle-type.enum';

export interface Vehicle {
    id?: number;
    plateNumber: string;
    model: string;
    capacity: number;
    available: boolean;
    type: VehicleType; // Utilisation de l'Enum ici
    companyId: number;
    companyName?: string;
}