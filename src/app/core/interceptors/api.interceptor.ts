import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigurationService } from '../servives/configuration/configuration.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. On injecte ton nouveau service de configuration
  const configService = inject(ConfigurationService);
  
  // 2. On récupère l'URL de base (ex: http://localhost:8080/v1)
  const apiUrl = configService.getEnvironmentVariable('apiUrl');

  // 3. On clone la requête originale pour lui ajouter l'URL de base
  // On peut aussi en profiter pour ajouter des headers globaux
  const apiReq = req.clone({
    url: `${apiUrl}${req.url}`,
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  console.log(`[Mobili API] Requête vers : ${apiReq.url}`);

  // 4. On envoie la requête modifiée au suivant
  return next(apiReq);
};