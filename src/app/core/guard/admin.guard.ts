import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // On récupère l'utilisateur actuel via ton signal ou ta méthode
  const user = authService.currentUser();

  // On vérifie si l'utilisateur existe et si le tableau 'roles' contient 'ADMIN'
  // Note : Adapte 'roles' ou 'role' selon ce que ton AuthService/DTO renvoie exactement
  const isAdmin = user?.roles?.some((role: any) => role.name === 'ADMIN' || role === 'ADMIN');

  if (isAdmin) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
