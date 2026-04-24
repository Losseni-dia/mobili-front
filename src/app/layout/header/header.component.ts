import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { MobiliInboxService } from '../../core/services/inbox/mobili-inbox.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],

})
export class HeaderComponent {
  public authService = inject(AuthService);
  mobiliInbox = inject(MobiliInboxService);
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

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mobiliInbox.refreshUnreadCount(!!this.authService.currentUser());
      }
    });
    this.mobiliInbox.refreshUnreadCount(!!this.authService.currentUser());
  }

  /** Espace compagnie dans le header : rôle partenaire (ou staff y accédant), pas le seul rôle gare. */
  showPartenaireEspaceLink(): boolean {
    return (
      this.authService.hasRole('PARTNER') ||
      this.authService.hasRole('CHAUFFEUR') ||
      this.authService.hasRole('ADMIN')
    );
  }

  /**
   * CTA « Devenir partenaire » : voyageurs sans rôle pro ; pas proposé aux comptes gare seuls
   * (ils sont déjà rattachés à une compagnie).
   */
  showDevenirPartenaireCta(): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }
    if (this.showPartenaireEspaceLink()) {
      return false;
    }
    if (this.authService.hasRole('GARE')) {
      return false;
    }
    return true;
  }

  /** Page inbox : compagnie seulement si vrai accès partenaire / chauffeur, sinon gare, sinon voyageur. */
  notificationsPath(): string {
    if (!this.authService.isLoggedIn()) {
      return '/my-account/notifications';
    }
    if (this.showPartenaireEspaceLink()) {
      return '/partenaire/notifications';
    }
    if (this.authService.hasRole('GARE')) {
      return '/gare/notifications';
    }
    return '/my-account/notifications';
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
    this.authService.logout(); // Suppression immédiate du token/signal
    this.router.navigate(['/'], {
      replaceUrl: true, // ✅ Empêche de revenir en arrière avec le bouton "Précédent"
      skipLocationChange: false,
    });
  }
}
