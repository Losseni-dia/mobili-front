import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TripService} from '../../../../core/services/trip/trip.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-trip-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './trip-edit.component.html',
  styleUrls: ['./trip-edit.component.scss'],
})
export class TripEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tripId!: number;
  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isLoading = signal(false);

  tripForm = this.fb.group({
    departureCity: ['', Validators.required],
    arrivalCity: ['', Validators.required],
    departureDateTime: ['', Validators.required],
    vehiculePlateNumber: ['', Validators.required],
    boardingPoint: ['', Validators.required],
    stops: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    availableSeats: [null as number | null, [Validators.required, Validators.min(1)]],
    vehicleType: ['Bus classique', Validators.required],
  });

  ngOnInit() {
    this.tripId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTripData();
  }

  loadTripData() {
    this.tripService.getTripById(this.tripId).subscribe({
      next: (trip: any) => {
        // On utilise any temporairement pour debugger
        console.log('Réponse complète du trajet:', trip);

        this.tripForm.patchValue({
          departureCity: trip.departureCity,
          arrivalCity: trip.arrivalCity,
          departureDateTime: trip.departureDateTime?.slice(0, 16),
          vehiculePlateNumber: trip.vehiculePlateNumber,
          boardingPoint: trip.boardingPoint,
          stops: trip.moreInfo,
          price: trip.price,
          availableSeats: trip.availableSeats,
          vehicleType: trip.vehicleType || trip.type,
        });

        if (trip.vehicleImageUrl) {
          this.imagePreview.set(`${this.authService.IMAGE_BASE_URL}${trip.vehicleImageUrl}`);
        }
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.tripForm.invalid || this.isLoading()) return;
    this.isLoading.set(true);

    const formData = new FormData();
    const formValue = this.tripForm.value;
    const currentUser = this.authService.currentUser();

    const tripPayload = {
      id: this.tripId, // Très important pour l'update
      partnerId: currentUser?.partnerId,
      ...formValue,
      moreInfo: formValue.stops,
      // Date gérée comme dans AddTrip
      departureDateTime: new Date(formValue.departureDateTime!).toISOString().slice(0, 19),
    };

    formData.append('trip', new Blob([JSON.stringify(tripPayload)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('vehicleImage', this.selectedFile);
    }

    this.tripService.updateTrip(this.tripId, formData).subscribe({
      next: () => this.router.navigate(['/partenaire/trips']),
      error: (err) => {
        this.isLoading.set(false);
        console.error('Erreur Update :', err);
      },
    });
  }
}
