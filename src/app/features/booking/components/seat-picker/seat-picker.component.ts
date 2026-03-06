import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seat-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-picker.component.html',
  styleUrl: './seat-picker.component.scss',
})
export class SeatPickerComponent implements OnChanges {
  @Input() occupiedSeats: string[] = [];
  @Input() totalSeats: number = 0;
  @Output() seatToggle = new EventEmitter<string[]>();

  selectedSeats = signal<string[]>([]);
  seatListSignal = signal<string[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalSeats']) {
      const val = changes['totalSeats'].currentValue;
      if (val && val > 0) {
        const seats = Array.from({ length: val }, (_, i) => (i + 1).toString());
        this.seatListSignal.set(seats);
        this.selectedSeats.set([]); // Reset si on change de bus
      }
    }
  }

  onSeatClick(seatId: string) {
    if (this.occupiedSeats.includes(seatId)) return;

    this.selectedSeats.update((current) => {
      const updated = current.includes(seatId)
        ? current.filter((s) => s !== seatId)
        : [...current, seatId];
      this.seatToggle.emit(updated);
      return updated;
    });
  }
}
