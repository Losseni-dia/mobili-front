import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { SeatPickerComponent } from '../../booking/components/seat-picker/seat-picker.component';
import {
  BookingService,
  BookingRequest,
  SeatSelection,
} from '../../../core/services/booking/booking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../../core/services/trip/trip.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-booking-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeatPickerComponent],
  templateUrl: './booking-trip.component.html',
  styleUrl: './booking-trip.component.scss',
})
export class BookingTripComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // --- State avec Signals (La clé de la solution) ---
  tripDetails = signal<any>(null);
  tripPrice = signal<number>(0);
  occupiedSeats = signal<string[]>([]);

  bookingForm: FormGroup;
  tripId: number = 0;

  constructor() {
    this.bookingForm = this.fb.group({
      passengerNames: this.fb.array([]),
      selectedSeats: this.fb.control([]),
    });
  }

  ngOnInit() {
    // Écoute dynamique de l'ID dans l'URL
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.tripId = +id;
        this.loadData();
      }
    });
  }

  private loadData() {
    this.tripDetails.set(null); // Force le loader entre deux trajets

    this.tripService.getTripById(this.tripId).subscribe({
      next: (trip) => {
        console.log('JSON Reçu avec succès :', trip);
        this.tripDetails.set(trip); // ✅ Déclenche l'affichage du bus
        this.tripPrice.set(trip.price);
      },
      error: (err) => console.error('Erreur API Trip:', err),
    });

    this.bookingService.getOccupiedSeats(this.tripId).subscribe({
      next: (seats) => this.occupiedSeats.set(seats || []),
      error: () => this.occupiedSeats.set([]),
    });
  }

  get passengerArray() {
    return this.bookingForm.get('passengerNames') as FormArray;
  }

  onSeatToggle(seats: string[]) {
    this.bookingForm.patchValue({ selectedSeats: seats });
    const currentCount = this.passengerArray.length;
    const nextCount = seats.length;

    if (nextCount > currentCount) {
      for (let i = 0; i < nextCount - currentCount; i++) {
        this.passengerArray.push(this.fb.control('', Validators.required));
      }
    } else {
      for (let i = 0; i < currentCount - nextCount; i++) {
        this.passengerArray.removeAt(this.passengerArray.length - 1);
      }
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const { selectedSeats, passengerNames } = this.bookingForm.value;
      const user = this.authService.currentUser();

      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }

      const selections: SeatSelection[] = selectedSeats.map((seat: string, index: number) => ({
        passengerName: passengerNames[index],
        seatNumber: seat,
      }));

      const payload: BookingRequest = {
        tripId: this.tripId,
        userId: user.id,
        numberOfSeats: selectedSeats.length,
        selections: selections,
      };

      this.bookingService.createBooking(payload).subscribe({
        next: (res) => this.router.navigate(['/booking/confirmation', res.id]),
        error: (err) => alert(err.error?.message || 'Erreur de réservation'),
      });
    }
  }
}
