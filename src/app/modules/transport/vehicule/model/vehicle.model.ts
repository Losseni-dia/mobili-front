import { VehicleType } from './vehicle-type.enum';

export interface Vehicle {
    id?: number;
    plateNumber: string;
    model: string;
    capacity: number;
    imageUrl?: string;
    available: boolean;
    type: VehicleType; // Utilisation de l'Enum ici
    companyId: number;
    companyName?: string;
}