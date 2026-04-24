import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { startWith } from 'rxjs';

import { buildTripCityLabels, lastStopIndexFromLabels } from '../../../../core/utils/trip-city-labels.util';
import { AuthService } from '../../../../core/services/auth/auth.service';
import {
  isStationReadyForTrips,
  PartenaireService,
  Station,
} from '../../../../core/services/partners/partenaire.service';
import { TripLegFarePayload, TripService } from '../../../../core/services/trip/trip.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-trip',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-trip.component.html',
  styleUrls: ['./add-trip.component.scss'],
})
export class AddTripComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tripService = inject(TripService);
  private authService = inject(AuthService);
  private partenaireService = inject(PartenaireService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  selectedFile: File | null = null;
  isLoading = signal(false);

  cityLabelsPreview = signal<string[]>([]);
  /** Un prix par tronçon consécutif (0→1, 1→2, …). */
  legPrices = signal<number[]>([]);
  stations = signal<Station[]>([]);
  /** Gares validées par le dirigeant et actives (booléen `validated` côté API + actif). */
  operationalStations = computed(() => this.stations().filter((s) => isStationReadyForTrips(s)));
  showStationPicker = () =>
    this.authService.hasRole('PARTNER') && !this.authService.hasRole('GARE');

  legRows = computed(() => {
    const labs = this.cityLabelsPreview();
    const prices = this.legPrices();
    const rows: { index: number; fromLabel: string; toLabel: string; price: number }[] = [];
    for (let i = 0; i < labs.length - 1; i++) {
      rows.push({
        index: i,
        fromLabel: labs[i] || '—',
        toLabel: labs[i + 1] || '—',
        price: prices[i] ?? 0,
      });
    }
    return rows;
  });

  legsTotal = computed(() => this.legPrices().reduce((a, b) => a + b, 0));

  /** 2+ tronçons : tarif explicite départ (ville) → arrivée (ville) distinct de la somme des portions. */
  needsOriginDestinationPrice = computed(() => this.legRows().length > 1);
  firstCityLabel = computed(() => this.cityLabelsPreview()[0]?.trim() || 'Départ');
  lastCityLabel = computed(
    () => this.cityLabelsPreview()[this.cityLabelsPreview().length - 1]?.trim() || 'Arrivée',
  );

  tripForm = this.fb.group({
    departureCity: ['', Validators.required],
    arrivalCity: ['', Validators.required],
    departureDateTime: ['', Validators.required],
    vehiculePlateNumber: ['', Validators.required],
    boardingPoint: ['', Validators.required],
    stops: [''],
    /** Si aucun tronçon (itinéraire identique) ou saisie simple ; sinon voir `originDestinationPrice` si 2+ tronçons. */
    price: [null as number | null, [Validators.min(0)]],
    /** Premier → dernier arrêt, obligatoire quand 2+ tronçons. */
    originDestinationPrice: [null as number | null, [Validators.min(0)]],
    availableSeats: [18, [Validators.required, Validators.min(1)]],
    vehicleType: ['Massa normal', Validators.required],
    stationId: [null as number | null],
  });

  ngOnInit() {
    this.authService.fetchUserProfile().subscribe({
      next: (u) => {
        if (this.authService.hasRole('GARE') && u.gareOperationsEnabled === false) {
          void this.router.navigate(['/gare/accueil'], { replaceUrl: true });
          return;
        }
        this.initAddTripForm();
      },
      error: () => this.initAddTripForm(),
    });
  }

  private initAddTripForm() {
    if (this.showStationPicker()) {
      this.partenaireService.listStations().subscribe({
        next: (s) => {
          this.stations.set(s);
          const op = s.filter((st) => isStationReadyForTrips(st));
          if (op.length === 1) {
            this.tripForm.patchValue({ stationId: op[0].id });
          }
          this.applyBoardingFromStation();
        },
        error: () => this.stations.set([]),
      });
    } else {
      this.applyBoardingFromStation();
    }
    this.tripForm.get('stationId')?.valueChanges.subscribe(() => this.applyBoardingFromStation());
    this.tripForm.get('vehicleType')?.valueChanges.subscribe((type) => {
      this.updateCapacity(type);
    });

    this.syncLegPrices();
    this.tripForm.valueChanges.pipe(startWith(this.tripForm.value)).subscribe(() => this.syncLegPrices());
  }

  /** Lieu d’embarquement = nom de la gare (compte gare) ou gare choisie (partenaire). */
  applyBoardingFromStation(): void {
    const u = this.authService.currentUser();
    if (this.authService.hasRole('GARE') && u?.stationName?.trim()) {
      this.tripForm.patchValue({ boardingPoint: u.stationName.trim() }, { emitEvent: false });
      return;
    }
    if (this.showStationPicker()) {
      const sid = this.tripForm.get('stationId')?.value;
      if (sid != null) {
        const st = this.operationalStations().find((s) => s.id === sid);
        if (st) {
          this.tripForm.patchValue(
            { boardingPoint: `${st.city} — ${st.name}`.trim() },
            { emitEvent: false },
          );
        }
      }
    }
  }

  onLegPriceInput(legIndex: number, ev: Event) {
    const el = ev.target as HTMLInputElement;
    const v = Number(el.value);
    const next = [...this.legPrices()];
    next[legIndex] = Number.isNaN(v) || v < 0 ? 0 : v;
    this.legPrices.set(next);
  }

  private syncLegPrices() {
    const v = this.tripForm.getRawValue();
    const labels = buildTripCityLabels(
      v.departureCity ?? '',
      v.arrivalCity ?? '',
      v.stops ?? '',
    );
    this.cityLabelsPreview.set(labels);

    const last = lastStopIndexFromLabels(labels);

    if (last <= 0) {
      this.legPrices.set([]);
    } else if (this.legPrices().length !== last) {
      const prev = this.legPrices();
      this.legPrices.set(
        Array.from({ length: last }, (_, i) => (i < prev.length ? prev[i]! : 0)),
      );
    }
  }

  private updateCapacity(type: string | null) {
    const capacityMap: { [key: string]: number } = {
      'Car 70 places': 70,
      Minibus: 24,
      'Massa normal': 18,
      'Massa 6 roues': 22,
      'Bus Classique': 50,
      'Bus Climatisé': 50,
      Van: 8,
    };

    if (type && capacityMap[type]) {
      this.tripForm.patchValue({
        availableSeats: capacityMap[type],
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.selectedFile = file;
  }

  onSubmit() {
    if (this.tripForm.invalid || this.isLoading()) return;
    if (this.authService.hasRole('GARE') && this.authService.currentUser()?.gareOperationsEnabled === false) {
      this.notification.show('Votre gare doit être validée par le dirigeant avant publication de trajet.', 'error');
      return;
    }
    if (this.showStationPicker() && this.operationalStations().length === 0) {
      this.notification.show('Aucune gare validée : approuvez une gare dans Partenaire → Gares.', 'error');
      return;
    }

    const labels = buildTripCityLabels(
      this.tripForm.value.departureCity ?? '',
      this.tripForm.value.arrivalCity ?? '',
      this.tripForm.value.stops ?? '',
    );
    const last = lastStopIndexFromLabels(labels);
    const legs = this.legPrices();
    if (last > 0) {
      if (legs.length !== last || legs.some((p) => p == null || p <= 0 || Number.isNaN(p))) {
        this.notification.show('Indiquez un prix strictement positif pour chaque tronçon.', 'error');
        return;
      }
    } else {
      const p = Number(this.tripForm.value.price);
      if (p == null || p <= 0 || Number.isNaN(p)) {
        this.notification.show('Indiquez un prix valide pour le trajet.', 'error');
        return;
      }
    }
    if (last > 1) {
      const od = Number(this.tripForm.value.originDestinationPrice);
      if (od == null || od <= 0 || Number.isNaN(od)) {
        this.notification.show(
          `Indiquez le prix du trajet complet (${this.firstCityLabel()} → ${this.lastCityLabel()}), distinct des tronçons.`,
          'error',
        );
        return;
      }
    }

    this.isLoading.set(true);
    const formData = new FormData();
    const formValue = this.tripForm.value;

    const dateInput = new Date(formValue.departureDateTime!);
    const offset = dateInput.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateInput.getTime() - offset).toISOString().slice(0, 19);

    const currentUser = this.authService.currentUser();

    const partnerId = currentUser?.partnerId || currentUser?.id;

    const sumLegs =
      last > 0 && legs.length === last ? legs.reduce((a, b) => a + b, 0) : Number(formValue.price ?? 0);
    const legFares: TripLegFarePayload[] | undefined =
      last > 0 && legs.length === last
        ? legs.map((p, i) => ({ fromStopIndex: i, toStopIndex: i + 1, price: p }))
        : undefined;

    const mainTripPrice = last > 1 ? Number(formValue.originDestinationPrice) : sumLegs;

    const tripPayload: Record<string, unknown> = {
      partnerId: partnerId,
      departureCity: formValue.departureCity,
      arrivalCity: formValue.arrivalCity,
      boardingPoint: formValue.boardingPoint,
      vehiculePlateNumber: formValue.vehiculePlateNumber,
      vehicleType: formValue.vehicleType,
      departureDateTime: localISOTime,
      price: mainTripPrice,
      totalSeats: formValue.availableSeats,
      availableSeats: formValue.availableSeats,
      moreInfo: formValue.stops,
    };
    if (legFares != null) {
      tripPayload['legFares'] = legFares;
    }
    if (last > 1) {
      tripPayload['originDestinationPrice'] = Number(formValue.originDestinationPrice);
    }
    if (this.showStationPicker() && formValue.stationId != null) {
      tripPayload['stationId'] = formValue.stationId;
    }

    const tripBlob = new Blob([JSON.stringify(tripPayload)], { type: 'application/json' });
    formData.append('trip', tripBlob);

    if (this.selectedFile) {
      formData.append('vehicleImage', this.selectedFile);
    }

    this.tripService.createTrip(formData).subscribe({
      next: () => this.router.navigate(['/partenaire/trips']),
      error: (err) => {
        this.isLoading.set(false);
        console.error('Erreur création trajet :', err);
      },
    });
  }
}
