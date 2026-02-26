import { City } from './city.model';

export interface Route {
  id?: number;
  departureCity: City; // Reçu en entier grâce au FetchType.EAGER
  arrivalCity: City;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
}