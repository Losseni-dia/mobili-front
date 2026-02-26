export interface Trip {
  id: number;
  departureCityName: string;
  arrivalCityName: string;
  companyName: string;
  companyLogo?: string;
  departureDateTime: string; 
  price: number;
  availableSeats: number;
  vehicleType: string;
  status: 'SCHEDULED' | 'ON_GOING' | 'COMPLETED' | 'CANCELLED'; // Ajout du statut
}

// On prépare aussi l'interface pour l'envoi (Admin/Create)
export interface TripRequest {
  routeId: number;
  vehicleId: number;
  departureDateTime: string;
  price: number;
  availableSeats: number;
}