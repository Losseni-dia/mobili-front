import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';

export interface AuthResponse {
  token: string;
  login: string;
  id: number; // Aligné avec ProfileDTO Java
  firstname: string; // Aligné avec ProfileDTO Java
  lastname: string; // Aligné avec ProfileDTO Java
  email: string;
  avatarUrl: string; // Aligné avec ProfileDTO Java
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // URL pour les images (ne passe pas par l'intercepteur car c'est du contenu statique)
  public readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  currentUser = signal<AuthResponse | null>(this.getUserFromStorage());
  isLoggedIn = computed(() => !!this.currentUser());

  /**
   * Récupère les détails complets de l'utilisateur.
   * L'intercepteur ajoutera le préfixe /v1 automatique.
   */
  fetchUserProfile(login: string): Observable<AuthResponse> {
    return this.http
      .get<AuthResponse>(`/auth/me`, {
        params: { login },
      })
      .pipe(
        tap((fullProfile) => {
          const currentData = this.getUserFromStorage();
          // On fusionne les nouvelles données avec le token existant
          const updatedUser = { ...fullProfile, token: currentData?.token || '' };

          console.log('Données profil récupérées :', updatedUser);
          this.saveUser(updatedUser);
        }),
      );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials).pipe(
      // On utilise switchMap pour enchaîner le login et la récupération du profil
      switchMap((authData) => {
        this.saveUser(authData);
        // On va chercher le profil complet immédiatement
        return this.fetchUserProfile(authData.login);
      }),
    );
  }

  logout() {
    localStorage.removeItem('mobili_user');
    this.currentUser.set(null);
  }

  private saveUser(user: AuthResponse) {
    localStorage.setItem('mobili_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private getUserFromStorage(): AuthResponse | null {
    const data = localStorage.getItem('mobili_user');
    return data ? JSON.parse(data) : null;
  }

  register(user: any, avatar?: File): Observable<any> {
    const formData = new FormData();
    const userBlob = new Blob([JSON.stringify(user)], { type: 'application/json' });
    formData.append('user', userBlob);
    if (avatar) formData.append('avatar', avatar);

    return this.http.post('/auth/register', formData);
  }

  // Dans auth.service.ts

  hasRole(roleName: string): boolean {
    const user = this.currentUser(); // Récupère ton signal d'utilisateur
    if (!user || !user.roles) {
      return false;
    }
    // On vérifie si le tableau des rôles contient le rôle (ex: 'ROLE_PARTNER')
    return user.roles.includes(roleName);
  }
}
