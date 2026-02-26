import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../service/vehicle.service';
import { VehicleType } from '../model/vehicle-type.enum';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vehicle-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class VehicleRegisterComponent {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  vehicleTypes = Object.values(VehicleType);
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // On récupère l'ID de la compagnie via l'URL (ex: /register-vehicle/1)
  companyId = Number(this.route.snapshot.paramMap.get('companyId'));

  vehicleForm: FormGroup = this.fb.group({
    plateNumber: ['', [Validators.required]],
    model: ['', [Validators.required]],
    capacity: [null, [Validators.required, Validators.min(1)]],
    type: [VehicleType.BUS, [Validators.required]],
    available: [true]
  });

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
    if (this.vehicleForm.valid && this.companyId) {
      const formData = new FormData();
      
      // On prépare l'objet DTO avec le companyId
      const vehicleData = {
        ...this.vehicleForm.value,
        companyId: this.companyId
      };

      formData.append('vehicle', new Blob([JSON.stringify(vehicleData)], { type: 'application/json' }));
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.vehicleService.create(formData).subscribe({
        next: () => {
          alert('Véhicule ajouté !');
          this.router.navigate(['/transport-dashboard']);
        },
        error: (err) => console.error(err)
      });
    }
  }
}