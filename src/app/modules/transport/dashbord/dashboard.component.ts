import { Component, inject, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../company/service/company.service';
import { VehicleService } from '../vehicule/service/vehicle.service';

@Component({
  selector: 'app-transport-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class TransportDashboardComponent implements OnInit {
  private companyService = inject(CompanyService);
  private vehicleService = inject(VehicleService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone); 

  companies: any[] = [];
  selectedVehicles: any[] = [];
  selectedCompanyId: number | null = null;

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.companies = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Erreur chargement compagnies', err)
    });
  }

  selectCompany(id: number) {
    this.selectedCompanyId = id;
    this.vehicleService.getByCompany(id).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.selectedVehicles = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Erreur chargement véhicules', err)
    });
  }
}