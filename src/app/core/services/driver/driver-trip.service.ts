import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface TripStopRow {
  stopIndex: number;
  cityLabel: string;
  plannedDepartureAt: string;
}

export interface AlightingPassengerRow {
  ticketNumber: string;
  passengerName: string;
  seatNumber: string;
  ticketStatus: string;
  boardingStopIndex: number;
}

@Injectable({ providedIn: 'root' })
export class DriverTripService {
  private readonly http = inject(HttpClient);

  listStops(tripId: number): Observable<TripStopRow[]> {
    return this.http.get<TripStopRow[]>(`/trips/${tripId}/stops`);
  }

  listAlightings(tripId: number, stopIndex: number): Observable<AlightingPassengerRow[]> {
    return this.http.get<AlightingPassengerRow[]>(
      `/trips/${tripId}/driver/stops/${stopIndex}/alightings`,
    );
  }

  recordDeparture(tripId: number, stopIndex: number): Observable<void> {
    return this.http.post<void>(`/trips/${tripId}/driver/departures`, { stopIndex });
  }

  confirmAlighted(
    tripId: number,
    ticketNumber: string,
    stopIndex?: number | null,
  ): Observable<unknown> {
    const path = `/trips/${tripId}/driver/tickets/${encodeURIComponent(ticketNumber)}/alighted`;
    const hasStop = stopIndex != null && !Number.isNaN(Number(stopIndex));
    const body = hasStop ? { stopIndex: Number(stopIndex) } : {};
    return this.http.post(path, body);
  }
}
