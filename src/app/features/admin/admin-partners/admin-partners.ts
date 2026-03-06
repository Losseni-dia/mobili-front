import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin/admin.service'; // Import de ton nouveau service
import { Partner } from '../../../core/services/partners/partenaire.service'; // On garde l'interface pour le typage

@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-partners.html',
  styleUrl: './admin-partners.scss',
})
export class AdminPartners implements OnInit {
  // ✅ On injecte le service Admin centralisé
  private adminService = inject(AdminService);

  readonly IMAGE_BASE_URL = this.adminService.IMAGE_BASE_URL;

  partners = signal<Partner[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadPartners();
  }

  loadPartners() {
    // Appel via AdminService
    this.adminService.getAllPartnersForAdmin().subscribe({
      next: (data) => {
        this.partners.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement partenaires', err);
        this.isLoading.set(false);
      },
    });
  }

  togglePartner(id: number) {
    // Appel via AdminService
    this.adminService.togglePartnerStatus(id).subscribe({
      next: () => {
        this.partners.update((list) =>
          list.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
        );
      },
      error: (err) => console.error('Erreur lors du switch de statut', err),
    });
  }
}
