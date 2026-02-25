import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../company/service/company.service';
import { VehicleService } from '../vehicule/service/vehicle.service';
import { Company } from '../company/model/company.model';
import { Vehicle } from '../vehicule/model/vehicle.model';

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

  companies: Company[] = [];
  selectedVehicles: Vehicle[] = [];
  selectedCompanyId: number | null = null;
  loading: boolean = false;

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  selectCompany(id: number) {
    this.selectedCompanyId = id;
    this.loading = true;
    this.vehicleService.getByCompany(id).subscribe({
      next: (data) => {
        this.selectedVehicles = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}