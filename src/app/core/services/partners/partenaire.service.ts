import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PartenaireService {
  private http = inject(HttpClient);

  // Inscription du partenaire (Utilise /partners car l'intercepteur gère le /v1)
  registerPartner(formData: FormData): Observable<any> {
    return this.http.post('/partners', formData);
  }

  // Récupérer les infos de sa propre société
  getPartner(id: number): Observable<any> {
    return this.http.get(`/partners/${id}`);
  }
}
