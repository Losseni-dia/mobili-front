import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../service/company.service';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./register.component.scss'], // Réutilisation du style
})
export class CompanyEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  companyForm!: FormGroup;
  companyId!: number;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentLogoUrl: string | undefined = undefined;

  ngOnInit() {
    this.companyId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForm();
    this.loadCompany();
  }

  initForm() {
    this.companyForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      businessNumber: [''],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
    });
  }

  loadCompany() {
    this.companyService.getById(this.companyId).subscribe((company) => {
      this.companyForm.patchValue(company);
      this.currentLogoUrl = company.logoUrl;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      const formData = new FormData();
      // On envoie le JSON sous la clé "company" pour correspondre au @RequestPart Java
      formData.append(
        'company',
        new Blob([JSON.stringify(this.companyForm.value)], { type: 'application/json' }),
      );

      if (this.selectedFile) {
        formData.append('logo', this.selectedFile);
      }

      this.companyService.update(this.companyId, formData).subscribe({
        next: () => this.router.navigate(['/transport-dashboard']),
        error: (err) => console.error('Erreur lors de la mise à jour', err),
      });
    }
  }
}
