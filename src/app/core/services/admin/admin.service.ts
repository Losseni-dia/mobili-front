import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Partner } from '../partners/partenaire.service';

// Interface pour les statistiques du Dashboard
export interface AdminStats {
  totalUsers: number;
  totalPartners: number;
  totalTrips: number;
  activeBookings: number;
  totalRevenue: number;
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
