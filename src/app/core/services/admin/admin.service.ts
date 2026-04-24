import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../partners/partenaire.service';

export interface AdminStats {
  totalUsers: number;
  totalPartners: number;
  totalTrips: number;
  activeBookings: number;
  totalRevenue: number;
}

export interface DayLoginEntry {
  date: string;
  totalLogins: number;
  uniqueUsers: number;
}

export interface DailyLoginStats {
  todayTotalLogins: number;
  todayUniqueUsers: number;
  history: DayLoginEntry[];
}

export interface AnalyticsCountByType {
  type: string;
  count: number;
}

export interface AnalyticsSummary {
  from: string;
  days: number;
  byType: AnalyticsCountByType[];
}

export interface AnalyticsRecentEvent {
  id: number;
  occurredAt: string;
  eventType: string;
  detail: string;
}

export type TripStatsPeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface TripStatEntry {
  rank: number;
  tripId: number;
  route: string;
  partnerName: string;
  bookingCount: number;
  revenueFcfa: number;
}

export interface RevenueDonutSlice {
  label: string;
  revenueFcfa: number;
  percentOfTotal: number;
}

export interface VolumeDonutSlice {
  label: string;
  bookingCount: number;
  percentOfTotal: number;
}

/** Aligné sur le record Java AdminTripStatsResponse (sérialisation JSON). */
export interface AdminTripStats {
  period: TripStatsPeriod;
  fromInclusive: string;
  toExclusive: string;
  totalBookings: number;
  totalRevenueFcfa: number;
  activeTripCount: number;
  avgRevenuePerBooking: number;
  top10ByBookings: TripStatEntry[];
  top10ByRevenue: TripStatEntry[];
  revenueByTripDonut: RevenueDonutSlice[];
  volumeByTripDonut: VolumeDonutSlice[];
}

// Interface pour les utilisateurs (si tu ne l'as pas déjà exportée ailleurs)
export interface UserAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  enabled: boolean;
  partnerName?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  public readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  /**
   * Récupère les compteurs globaux pour le Dashboard
   * L'intercepteur ajoutera /v1/admin/stats
   */
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>('/admin/stats');
  }

  getDailyLoginStats(days = 30): Observable<DailyLoginStats> {
    return this.http.get<DailyLoginStats>(`/admin/stats/daily-logins?days=${days}`);
  }

  getAnalyticsSummary(days = 7): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`/admin/analytics/summary?days=${days}`);
  }

  getRecentAnalyticsEvents(limit = 50): Observable<AnalyticsRecentEvent[]> {
    return this.http.get<AnalyticsRecentEvent[]>(`/admin/analytics/recent-events?limit=${limit}`);
  }

  getTripAnalytics(period: TripStatsPeriod): Observable<AdminTripStats> {
    return this.http.get<AdminTripStats>(`/admin/stats/trip-analytics?period=${period}`);
  }

  /**
   * Récupère la liste complète des utilisateurs
   */
  getAllUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>('/admin/users');
  }

  /**
   * Active ou désactive un compte utilisateur (Bannissement)
   */
  toggleUserStatus(id: number, enabled: boolean): Observable<void> {
    return this.http.patch<void>(`/admin/users/${id}/status?enabled=${enabled}`, {});
  }

  /**
   * Active ou désactive un partenaire (Droit de publication)
   */
  togglePartnerStatus(id: number): Observable<void> {
    return this.http.patch<void>(`/admin/partners/${id}/toggle`, {});
  }

  getAllPartnersForAdmin(): Observable<Partner[]> {
    return this.http.get<Partner[]>('/admin/partners');
  }

  // Pour l'admin : Activer/Désactiver
  toggleStatus(id: number): Observable<void> {
    return this.http.patch<void>(`/admin/partners/${id}/toggle`, {});
  }
}
