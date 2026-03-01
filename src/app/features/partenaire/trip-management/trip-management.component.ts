import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripService, Trip } from '../../../core/services/trip/trip.service';

@Component({
  selector: 'app-trip-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trip-management.component.html',
  styleUrls: ['./trip-management.component.scss'],
})
export class TripManagementComponent implements OnInit {
  // Injection des services via la nouvelle syntaxe inject()
  private tripService = inject(TripService);
  private cdr = inject(ChangeDetectorRef);

  // Initialisation du tableau pour éviter les erreurs "undefined" dans le template
  myTrips: Trip[] = [];

  readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  ngOnInit(): void {
    this.loadTrips();
  }

  /**
   * Charge la liste des trajets du partenaire
   */
  loadTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data: Trip[]) => {
        this.myTrips = data;

        // On force la détection des changements pour s'assurer que le
        // template réagit immédiatement à l'arrivée des données asynchrones
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des trajets :', err);
      },
    });
  }

  /**
   * Optionnel : Ajoute ici une méthode pour supprimer un trajet plus tard
   */
  /**
   * Gère la suppression d'un trajet
   */
  onDelete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est irréversible.')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          // Option 1 : Recharger toute la liste depuis le serveur
          this.loadTrips();

          // Option 2 (Plus rapide) : Filtrer localement le tableau
          // this.myTrips = this.myTrips.filter(t => t.id !== id);

          console.log('Trajet supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression :', err);
          alert('Une erreur est survenue lors de la suppression.');
        },
      });
    }
  }
}
