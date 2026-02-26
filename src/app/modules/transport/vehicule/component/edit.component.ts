import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../service/vehicle.service';
import { VehicleType } from '../model/vehicle-type.enum';

@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./register.component.scss'] // On réutilise le même style
})
export class VehicleEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicleForm!: FormGroup;
  vehicleTypes = Object.values(VehicleType);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentImageUrl: string | null = null;
  vehicleId!: number;

  ngOnInit() {
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadVehicle();
  }

  initForm() {
    this.vehicleForm = this.fb.group({
      id: [null],
      plateNumber: ['', [Validators.required]],
      model: ['', [Validators.required]],
      capacity: [null, [Validators.required, Validators.min(1)]],
      type: ['', [Validators.required]],
      available: [true],
      companyId: [null]
    });
  }

loadVehicle() {
  this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
  this.vehicleService.getById(this.vehicleId).subscribe({
    next: (vehicle) => {
      this.vehicleForm.patchValue(vehicle); // Remplit le formulaire
      if (vehicle.imageUrl) {
        this.currentImageUrl = vehicle.imageUrl; // Affiche l'image actuelle
      }
    },
    error: (err) => console.error("Impossible de charger le véhicule", err)
  });
}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      const formData = new FormData();
      formData.append('vehicle', new Blob([JSON.stringify(this.vehicleForm.value)], { type: 'application/json' }));
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.vehicleService.update(this.vehicleId, formData).subscribe({
        next: () => {
          this.router.navigate(['/transport-dashboard']);
        },
        error: (err) => console.error('Erreur update', err)
      });
    }
  }
}