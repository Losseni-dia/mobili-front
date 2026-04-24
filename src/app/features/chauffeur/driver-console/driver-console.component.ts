import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import {
  AlightingPassengerRow,
  DriverTripService,
  TripStopRow,
} from '../../../core/services/driver/driver-trip.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

const STORAGE_KEY = 'mobili.driver.lastTripId';

@Component({
  selector: 'app-driver-console',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './driver-console.component.html',
  styleUrl: './driver-console.component.scss',
})
export class DriverConsoleComponent {
  private readonly driverTrip = inject(DriverTripService);
  private readonly notify = inject(NotificationService);
  authService = inject(AuthService);

  // ====== ÉTAT ======
  // NB : `<input type="number">` peut renvoyer un nombre, on accepte string|number et on normalise.
  tripIdInput = signal<string | number>(this.readStoredTripId());
  ticketInput = signal<string>('');

  loadedTripId = signal<number | null>(null);
  stops = signal<TripStopRow[] | null>(null);
  selectedStop = signal<number>(0);
  alightings = signal<AlightingPassengerRow[]>([]);

  isLoadingStops = signal<boolean>(false);
  isLoadingAlightings = signal<boolean>(false);
  busyAction = signal<string | null>(null);

  error = signal<string>('');
  successFlash = signal<string>('');

  // ====== DÉRIVÉ ======
  selectedStopLabel = computed(() => {
    const idx = this.selectedStop();
    return this.stops()?.find((s) => s.stopIndex === idx)?.cityLabel ?? '—';
  });

  totalAlightings = computed(() => this.alightings().length);

  alightedDone = computed(
    () => this.alightings().filter((a) => a.ticketStatus === 'USED').length,
  );

  alightedRemaining = computed(() => Math.max(0, this.totalAlightings() - this.alightedDone()));

  isLastStop = computed(() => {
    const stops = this.stops();
    if (!stops || stops.length === 0) return false;
    const last = Math.max(...stops.map((s) => s.stopIndex));
    return this.selectedStop() === last;
  });

  constructor() {
    effect(() => {
      const tripId = this.loadedTripId();
      const idx = this.selectedStop();
      if (tripId != null) {
        this.fetchAlightings(tripId, idx);
      }
    });
  }

  // ====== ACTIONS ======
  parsedTripId(): number | null {
    const raw = this.tripIdInput();
    const value = raw == null ? '' : String(raw).trim();
    if (value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
  }

  loadTrip() {
    const id = this.parsedTripId();
    if (id == null) {
      this.error.set('Identifiant de voyage invalide.');
      return;
    }

    this.error.set('');
    this.isLoadingStops.set(true);
    this.driverTrip.listStops(id).subscribe({
      next: (rows) => {
        this.isLoadingStops.set(false);
        const sorted = [...(rows ?? [])].sort((a, b) => a.stopIndex - b.stopIndex);
        this.stops.set(sorted);
        this.loadedTripId.set(id);
        this.selectedStop.set(sorted.length > 0 ? sorted[0].stopIndex : 0);
        this.persistTripId(id);
        this.flashSuccess(`Voyage #${id} chargé (${sorted.length} arrêts).`);
      },
      error: (e) => {
        this.isLoadingStops.set(false);
        this.error.set(e?.error?.message || 'Impossible de charger ce voyage.');
      },
    });
  }

  selectStop(stopIndex: number) {
    this.selectedStop.set(stopIndex);
  }

  refreshAlightings() {
    const id = this.loadedTripId();
    if (id == null) return;
    this.fetchAlightings(id, this.selectedStop());
  }

  private fetchAlightings(tripId: number, stopIndex: number) {
    this.isLoadingAlightings.set(true);
    this.driverTrip.listAlightings(tripId, stopIndex).subscribe({
      next: (rows) => {
        this.alightings.set(rows ?? []);
        this.isLoadingAlightings.set(false);
      },
      error: () => {
        this.alightings.set([]);
        this.isLoadingAlightings.set(false);
      },
    });
  }

  recordDeparture() {
    const id = this.loadedTripId();
    if (id == null) return;
    const stopIndex = this.selectedStop();
    this.busyAction.set(`departure-${stopIndex}`);
    this.driverTrip.recordDeparture(id, stopIndex).subscribe({
      next: () => {
        this.busyAction.set(null);
        this.flashSuccess(`Départ enregistré depuis « ${this.selectedStopLabel()} ».`);
      },
      error: (e) => {
        this.busyAction.set(null);
        this.error.set(e?.error?.message || 'Impossible d\'enregistrer le départ.');
      },
    });
  }

  markAlighted(ticketNumber: string) {
    const id = this.loadedTripId();
    if (id == null || !ticketNumber.trim()) return;
    this.busyAction.set(`ticket-${ticketNumber}`);
    this.driverTrip.confirmAlighted(id, ticketNumber, this.selectedStop()).subscribe({
      next: () => {
        this.busyAction.set(null);
        this.flashSuccess(`Passager ${ticketNumber} marqué descendu.`);
        this.fetchAlightings(id, this.selectedStop());
      },
      error: (e) => {
        this.busyAction.set(null);
        this.error.set(e?.error?.message || 'Échec de la confirmation.');
      },
    });
  }

  markManualTicket() {
    const raw = this.ticketInput();
    const ticket = raw == null ? '' : String(raw).trim();
    if (!ticket) {
      this.error.set('Numéro de ticket requis.');
      return;
    }
    this.markAlighted(ticket);
    this.ticketInput.set('');
  }

  resetTrip() {
    this.loadedTripId.set(null);
    this.stops.set(null);
    this.alightings.set([]);
    this.selectedStop.set(0);
    this.error.set('');
  }

  // ====== HELPERS ======
  isBusy(action: string): boolean {
    return this.busyAction() === action;
  }

  private flashSuccess(msg: string) {
    this.successFlash.set(msg);
    this.notify.show(msg, 'success');
    setTimeout(() => this.successFlash.set(''), 3000);
  }

  private readStoredTripId(): string {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  }

  private persistTripId(id: number) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      /* noop */
    }
  }
}
