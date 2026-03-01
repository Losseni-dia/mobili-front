import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);

  ngOnInit(): void {
    // Récupère l'utilisateur actuel du Signal (chargé depuis le localStorage)
    const user = this.authService.currentUser();

    if (user && user.login) {
      // Force la récupération des données fraîches (firstname, lastname, email)
      // L'intercepteur ajoutera automatiquement le token et le préfixe /v1
      this.authService.fetchUserProfile(user.login).subscribe({
        error: (err) => console.error('Erreur de synchronisation du profil', err),
      });
    }
  }

  getAvatarUrl(path: string | undefined): string | null {
    if (!path || path === '' || path.includes('null')) return null;
    return `${this.authService.IMAGE_BASE_URL}${path}`;
  }
}
