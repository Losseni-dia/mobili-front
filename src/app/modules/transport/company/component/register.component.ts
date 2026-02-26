import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../service/company.service';
import { Company } from '../model/company.model';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-register.component.html',
  styleUrls: ['./company-register.component.scss']
})
export class CompanyRegisterComponent {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);

  // Définition du formulaire avec validations
  companyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
    businessNumber: ['', [Validators.required]],
    logoUrl: ['']
  });

  onSubmit() {
    if (this.companyForm.valid) {
      const newCompany: Company = this.companyForm.value;
      
      this.companyService.create(newCompany).subscribe({
        next: (response) => {
          console.log('Compagnie enregistrée avec succès', response);
          this.companyForm.reset();
        },
        error: (err) => console.error('Erreur lors de l’inscription', err)
      });
    }
  }
}