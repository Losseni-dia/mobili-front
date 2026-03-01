import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding: 40px; text-align: center;">
    <h1 style="color: #092990;">🎟️ Mes Réservations</h1>
  </div>`,
})
export class MyBookingsComponent {}
