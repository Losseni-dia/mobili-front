import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  private router = inject(Router);
  authService = inject(AuthService);

  private currentUrl = signal<string>(this.router.url);
  collapsed = signal<boolean>(false);

  navItems: NavItem[] = [
    { label: 'Vue d’ensemble', icon: '📊', path: '/admin/dashboard' },
    { label: 'Analyse app & journal', icon: '🔍', path: '/admin/analyse-app' },
    { label: 'Statistiques métier', icon: '📈', path: '/admin/metier' },
    { label: 'Utilisateurs', icon: '👥', path: '/admin/users' },
    { label: 'Partenaires', icon: '🏢', path: '/admin/partners' },
  ];

  pageTitle = computed(() => {
    const url = this.currentUrl();
    if (url.includes('analyse-app')) return 'Analyse de l’app & journal';
    if (url.includes('/admin/metier')) return 'Statistiques métier';
    if (url.includes('users')) return 'Utilisateurs';
    if (url.includes('partners')) return 'Partenaires';
    return 'Vue d’ensemble';
  });

  pageDescription = computed(() => {
    const url = this.currentUrl();
    if (url.includes('analyse-app')) {
      return 'Logs, connexions, métadonnées d’événements, journal technique pour l’analyse d’usage.';
    }
    if (url.includes('/admin/metier')) {
      return 'Très rentables, volumes, période jour / semaine / mois, graphiques et méthodologie commerciale.';
    }
    if (url.includes('users')) return 'Gère les comptes et leurs statuts.';
    if (url.includes('partners')) return 'Valide et supervise les compagnies partenaires.';
    return 'Aperçu : indicateurs figés + accès aux analyses détaillées.';
  });

  userInitials = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return 'A';
    const f = (u.firstname || '').trim();
    const l = (u.lastname || '').trim();
    if (f && l) return (f[0] + l[0]).toUpperCase();
    if (f) return f[0].toUpperCase();
    return (u.login || 'A')[0].toUpperCase();
  });

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      }
    });
  }

  toggleSidebar() {
    this.collapsed.update((v) => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
