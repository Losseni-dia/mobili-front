import { Injectable } from '@angular/core';
import { CONFIGURATION_DATA } from '../../../app.env.config';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationService {
    private currentConfig: any;

    constructor() {
        const host = window.location.host;
        const envMatch = CONFIGURATION_DATA.environments.find(e =>
            e.domain.some(d => host.includes(d))
        );
        const envName = (envMatch ? envMatch.env : 'local') as keyof typeof CONFIGURATION_DATA.variables;
        this.currentConfig = CONFIGURATION_DATA.variables[envName];
        console.log(`[Mobili Config] Mode détecté : ${envName}`);
    }

   getEnvironmentVariable(key: string): string | null {
    return this.currentConfig ? this.currentConfig[key] : null;
}
}