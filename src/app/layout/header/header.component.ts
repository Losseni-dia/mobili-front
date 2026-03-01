import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public authService = inject(AuthService);
  private router = inject(Router);

  // URL pointant vers ton dossier .uploads via Spring Boot
  private readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  getAvatarUrl(avatarPath: string | undefined): string | null {
    if (!avatarPath || avatarPath === '' || avatarPath.includes('null')) {
      return null;
    }
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${this.IMAGE_BASE_URL}${avatarPath}`;
  }

  getInitials(firstname: string | undefined, lastname: string | undefined): string {
    if (firstname && lastname) {
      return (firstname[0] + lastname[0]).toUpperCase();
    } else if (firstname) {
      return firstname[0].toUpperCase();
    }

    // Recours au login si les noms sont absents (ex: juste après le login)
    const login = this.authService.currentUser()?.login;
    return login ? login[0].toUpperCase() : 'M';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
