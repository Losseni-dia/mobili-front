import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../model/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly ENDPOINT = '/companies';

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.ENDPOINT);
  }

  getById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.ENDPOINT}/${id}`);
  }

  /**
   * Créer une nouvelle compagnie avec un logo (Multipart)
   * @param data L'objet FormData contenant le JSON 'company' et le fichier 'logo'
   */
  create(data: FormData): Observable<Company> {
    // Note: On ne précise pas le Content-Type, HttpClient le fait automatiquement pour le FormData
    return this.http.post<Company>(this.ENDPOINT, data);
  }

  /**
   * Mettre à jour une compagnie existante
   * @param id L'identifiant de la compagnie
   * @param data FormData contenant 'company' (JSON) et optionnellement 'logo' (File)
   */
  update(id: number, data: FormData): Observable<Company> {
    return this.http.put<Company>(`${this.ENDPOINT}/${id}`, data);
  }
}
