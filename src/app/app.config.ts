import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Manquant !

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor'; // Manquant !

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),

    // C'est ICI que l'application devient sérieuse
    provideHttpClient(
      withInterceptors([apiInterceptor]), // On lie ton travail sur l'API ici
    ),
  ],
};
