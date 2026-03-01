import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<div style="padding: 40px; text-align: center;">
    <h1 style="color: #092990;">📊 Dashboard Partenaire</h1>
  </div>`,
})
export class DashboardComponent {}
