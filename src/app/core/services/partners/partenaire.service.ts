import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

 
}
