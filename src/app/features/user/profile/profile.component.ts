import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);

  ngOnInit(): void {
    // Récupère l'utilisateur actuel du Signal (chargé depuis le localStorage)
    const user = this.authService.currentUser();

    if (user) {
      // 💡 Appel sans argument : le backend utilise le Token JWT
      this.authService.fetchUserProfile().subscribe({
        error: (err) => console.error('Erreur de synchronisation du profil', err),
      });
    }
  }

  getAvatarUrl(path: string | undefined): string | null {
    if (!path || path === '' || path.includes('null')) return null;
    return `${this.authService.IMAGE_BASE_URL}${path}`;
  }
}
