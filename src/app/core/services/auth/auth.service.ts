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
  partnerId?: number;
}

export interface UserAdmin {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: any[]; // On peut mettre string[] ou any[] selon si le backend envoie des objets Role ou juste des noms
  enabled: boolean;
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
  fetchUserProfile(): Observable<AuthResponse> {
    // 💡 Plus besoin de passer le login en paramètre !
    return this.http.get<AuthResponse>(`/auth/me`).pipe(
      tap((fullProfile) => {
        const currentData = this.getUserFromStorage();
        // Crucial : On garde le token du login original car le /me ne le renvoie pas
        const updatedUser = { ...fullProfile, token: currentData?.token || '' };

        console.log('Profil synchronisé avec succès :', updatedUser);
        this.saveUser(updatedUser);
      }),
    );
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/auth/login', credentials).pipe(
      switchMap((authData) => {
        this.saveUser(authData); // Stocke le token reçu
        return this.fetchUserProfile(); // 💡 Appel sans argument
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

  // auth.service.ts

  hasRole(roleName: string): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) return false;

    // On nettoie le nom demandé pour enlever "ROLE_" s'il est présent
    const cleanRoleName = roleName.replace('ROLE_', '');

    // On vérifie si le tableau contient soit "PARTNER", soit "ROLE_PARTNER"
    return user.roles.some((role) => role === cleanRoleName || role === `ROLE_${cleanRoleName}`);
  }

  /**
   * Met à jour le profil de l'utilisateur (Infos + Avatar)
   */
  updateProfile(userId: number, formData: FormData): Observable<AuthResponse> {
    // 💡 L'intercepteur ajoutera /v1/users/${userId}
    return this.http.put<AuthResponse>(`/users/${userId}`, formData).pipe(
      tap(() => {
        // Une fois mis à jour, on rafraîchit les signaux globaux
        this.fetchUserProfile().subscribe();
      }),
    );
  }

 
}
