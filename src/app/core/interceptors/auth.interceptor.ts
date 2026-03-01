import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

export interface AuthResponse {
  token: string;
  login: string;
  userId: number;
  firstName: string; // Ajouté pour matcher le Backend
  lastName: string; // Ajouté pour matcher le Backend
  name?: string; // Optionnel si tu gardes la concaténation
  avatar: string; // C'est ton avatarUrl
  roles: string[];
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.currentUser();

  // On ne modifie la requête QUE si on a un token en mémoire
  if (user && user.token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    return next(authReq);
  }

  // Si pas de token (ex: login, recherche publique), on laisse passer la requête telle quelle
  return next(req);
};
