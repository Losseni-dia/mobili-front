import { Component, OnInit, inject, signal } from '@angular/core';
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
  private tripService = inject(TripService);

  // 💡 Utilisation de Signals
  myTrips = signal<Trip[]>([]);
  isLoading = signal(false);

  readonly IMAGE_BASE_URL = 'http://localhost:8080/uploads/';

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.isLoading.set(true);
    this.tripService.getAllTrips().subscribe({
      next: (data: Trip[]) => {
        this.myTrips.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement trajets :', err);
        this.isLoading.set(false);
      },
    });
  }

  // Ajoute cette méthode dans ton export class
  formatVehicleType(type: string | undefined): string {
    if (!type) return '';
    
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onDelete(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
      this.tripService.deleteTrip(id).subscribe({
        next: () => {
          // 💡 Mise à jour réactive du signal sans recharger la page
          this.myTrips.update((trips) => trips.filter((t) => t.id !== id));
        },
        error: (err) => console.error('Erreur suppression :', err),
      });
    }
  }
}
