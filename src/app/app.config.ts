import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Manquant !

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor'; // Manquant !
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(
      withInterceptors([
        apiInterceptor, // 1. On prépare l'URL (ex: http://localhost:8080/v1/...)
        authInterceptor, // 2. On injecte le Token (Bearer eyJhbG...) 💡 AJOUTE-LE ICI
        
      ]),
    ),
  ],
};
