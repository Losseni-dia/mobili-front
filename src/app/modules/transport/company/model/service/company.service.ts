import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly ENDPOINT = '/companies'; // L'intercepteur ajoutera l'URL de base

  // Récupérer toutes les compagnies (ex: pour un filtre)
  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.ENDPOINT);
  }

  // Récupérer une compagnie par son ID
  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.ENDPOINT}/${id}`);
  }

  // Créer une nouvelle compagnie (Admin)
  create(company: Company): Observable<Company> {
    return this.http.post<Company>(this.ENDPOINT, company);
  }
}