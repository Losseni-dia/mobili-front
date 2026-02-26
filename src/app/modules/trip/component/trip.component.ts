import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService } from '../service/trip.service';
import { Trip } from '../model/trip.model';

@Component({
  selector: 'app-trip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.scss']
})
export class TripComponent implements OnInit {
  private tripService = inject(TripService);
  private cdr = inject(ChangeDetectorRef);

  departure: string = '';
  arrival: string = '';
  travelDate: string = new Date().toISOString().split('T')[0];
  
  results: Trip[] = [];
  loading: boolean = false;
  hasSearched: boolean = false;

  ngOnInit() {
    // CHARGEMENT D'OFFICE : On affiche tout sans filtre au démarrage
    this.loadInitialTrips();
  }

  loadInitialTrips() {
    this.loading = true;
    this.tripService.findAll().subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement initial:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  find() {
    // Si l'utilisateur vide les champs et clique sur Rechercher, on recharge tout
    if (!this.departure && !this.arrival) {
      this.hasSearched = false;
      this.loadInitialTrips();
      return;
    }

    // SINON : Recherche filtrée
    this.loading = true;
    this.hasSearched = true;
    this.results = []; 

    this.tripService.search(this.departure, this.arrival, this.travelDate).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur recherche :', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}