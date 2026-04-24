import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Partner {
  // 💡 N'oublie pas le "export" ici !
  id: number;
  name: string;
  email: string;
  phone: string;
  businessNumber: string;
  logoUrl: string;
  enabled: boolean;
  /** Code unique pour l’auto-inscription des responsables gare (API / partenaire). */
  registrationCode?: string | null;
}

export interface PartnerDashboard {
  activeTripsCount: number;
  totalBookingsCount: number;
  totalRevenue: number;
  recentBookings: {
    id: number;
    customerName: string;
    tripRoute: string;
    date: string;
    amount: number;
    status: string;
  }[];
}

export interface Station {
  id: number;
  name: string;
  city: string;
  code?: string | null;
  active: boolean;
  partnerId: number;
  /** PENDING | APPROVED (absent = rétrocompat, traité comme APPROVED) */
  approvalStatus?: string | null;
  /**
   * Faux à la création, vrai seulement après validation par le dirigeant.
   * Si absent, se fier à {@link approvalStatus} + {@link active}.
   */
  validated?: boolean | null;
  /** Premier compte gare (nom affichage) */
  responsibleName?: string | null;
}

/** Gare autorisée pour trajets, scanner, etc. (aligné sur le backend) */
export function isStationReadyForTrips(s: Station): boolean {
  if (s.validated === false) {
    return false;
  }
  if (s.validated === true) {
    return s.active;
  }
  if (s.approvalStatus === 'PENDING') {
    return false;
  }
  return s.active;
}

@Injectable({ providedIn: 'root' })
export class PartenaireService {
  private http = inject(HttpClient);

  public readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  // Inscription du partenaire (Utilise /partners car l'intercepteur gère le /v1)
  registerPartner(formData: FormData): Observable<any> {
    return this.http.post('/partners', formData);
  }

  // Récupérer les infos de sa propre société
  getPartners(id: number): Observable<any> {
    return this.http.get(`/partners/${id}`);
  }

  getPartner(id: number): Observable<Partner> {
    return this.http.get<Partner>(`/partners/${id}`);
  }

  // partenaire.service.ts
  getMyPartnerInfo(): Observable<Partner> {
    return this.http.get<Partner>(`/partners/my-company`);
  }

  // On utilise l'ID pour le PUT, et FormData pour le logo
  updatePartner(id: number, formData: FormData): Observable<Partner> {
    return this.http.put<Partner>(`/partners/${id}`, formData);
  }

  getDashboardStats(stationId?: number | null): Observable<PartnerDashboard> {
    let params = new HttpParams();
    if (stationId != null && stationId > 0) {
      params = params.set('stationId', String(stationId));
    }
    return this.http.get<PartnerDashboard>('/partenaire/dashboard/stats', { params });
  }

  listStations(): Observable<Station[]> {
    return this.http.get<Station[]>('/partenaire/stations');
  }

  createStation(body: { name: string; city: string; active?: boolean }): Observable<Station> {
    return this.http.post<Station>('/partenaire/stations', body);
  }

  updateStation(id: number, body: { name: string; city: string; active?: boolean }): Observable<Station> {
    return this.http.put<Station>(`/partenaire/stations/${id}`, body);
  }

  approveStation(id: number): Observable<Station> {
    return this.http.post<Station>(`/partenaire/stations/${id}/approve`, {});
  }

  deleteStation(id: number): Observable<void> {
    return this.http.delete<void>(`/partenaire/stations/${id}`);
  }

  createGareAccount(body: {
    stationId: number;
    login: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
  }): Observable<void> {
    return this.http.post<void>('/partenaire/stations/gare-accounts', body);
  }
}
