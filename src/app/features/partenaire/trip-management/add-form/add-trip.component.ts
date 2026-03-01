import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TripService } from '../../../../core/services/trip/trip.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.scss'],
})
export class AddTripComponent {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private authService = inject(AuthService); // Injecté pour récupérer le vrai ID
  private router = inject(Router);

  selectedFile: File | null = null;
  isLoading = signal(false);

  tripForm = this.fb.group({
    departureCity: ['', Validators.required],
    arrivalCity: ['', Validators.required],
    departureDateTime: ['', Validators.required],
    vehiculePlateNumber: ['', Validators.required],
    boardingPoint: ['', Validators.required],
    stops: [''],
    price: [null, [Validators.required, Validators.min(0)]],
    availableSeats: [null, [Validators.required, Validators.min(1)]],
    vehicleType: ['BUS_CLASSIQUE', Validators.required],
  });

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.tripForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const formData = new FormData();
    const formValue = this.tripForm.value;

    // Gestion de la date locale pour éviter les décalages UTC
    const dateInput = new Date(formValue.departureDateTime!);
    const offset = dateInput.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateInput.getTime() - offset).toISOString().slice(0, 19);

    // RÉCUPÉRATION DE L'ID RÉEL DU PARTENAIRE (Crucial pour éviter la 403)
    const currentUser = this.authService.currentUser();

    const tripPayload = {
      partnerId: currentUser?.id, // ID dynamique
      departureCity: formValue.departureCity,
      arrivalCity: formValue.arrivalCity,
      boardingPoint: formValue.boardingPoint,
      vehiculePlateNumber: formValue.vehiculePlateNumber,
      vehicleType: formValue.vehicleType,
      departureDateTime: localISOTime,
      price: formValue.price,
      availableSeats: formValue.availableSeats,
      moreInfo: formValue.stops,
    };

    // Construction du Multipart (JSON + IMAGE)
    const tripBlob = new Blob([JSON.stringify(tripPayload)], { type: 'application/json' });
    formData.append('trip', tripBlob);

    if (this.selectedFile) {
      formData.append('vehicleImage', this.selectedFile);
    }

    this.tripService.createTrip(formData).subscribe({
      next: () => {
        // Zéro message de succès : on laisse la navigation confirmer l'action
        this.router.navigate(['/partenaire/trips']);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Erreur Backend 403 ou autre :', err);
      },
    });
  }
}
