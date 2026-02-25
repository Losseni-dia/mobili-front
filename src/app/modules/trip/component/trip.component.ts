import { Component, inject } from '@angular/core';
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
export class TripComponent {
  private tripService = inject(TripService);

  departure: string = '';
  arrival: string = '';
  results: Trip[] = [];
  loading: boolean = false;

  find() {
    if (!this.departure || !this.arrival) return;
    this.loading = true;
    this.tripService.search(this.departure, this.arrival).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}