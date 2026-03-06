import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { PartenaireService, Partner } from '../../../core/services/partners/partenaire.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private partenaireService = inject(PartenaireService);

  // Signal pour stocker les infos de YALLA TRANSPORT
  companyInfo = signal<Partner | null>(null);

  stats = [
    { label: 'Voyages actifs', value: 12, color: '#092990' },
    { label: 'Réservations', value: 48, color: '#27ae60' },
    { label: 'Revenus (CFA)', value: '450.000', color: '#f39c12' },
    { label: 'Avis Clients', value: '4.8/5', color: '#e74c3c' },
  ];

  ngOnInit() {
    this.partenaireService.getMyPartnerInfo().subscribe({
      next: (data) => {
        console.log('Données reçues du serveur :', data); // 👈 Ajoute ce log pour voir ce qui arrive
        this.companyInfo.set(data);
      },
      error: (err) => {
        console.error('Erreur de récupération :', err);
      },
    });
  }

  getLogoUrl(path: string | undefined): string | null {
    // On ne rajoute pas "partners/" ici non plus
    return `${this.authService.IMAGE_BASE_URL}${path}`;
  }
}
