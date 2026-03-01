import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding: 40px; text-align: center;">
    <h1 style="color: #092990;">📲 Scanner de Tickets</h1>
  </div>`,
})
export class ScannerComponent {}
