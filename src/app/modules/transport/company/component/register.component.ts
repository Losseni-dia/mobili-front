import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Ajout pour la redirection
import { CompanyService } from '../service/company.service';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class CompanyRegisterComponent {
  private fb = inject(FormBuilder);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  selectedFile: File | null = null;
  logoPreview: string | null = null;

  companyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
    businessNumber: ['', [Validators.required]]
    // On retire logoUrl du formGroup car le fichier est géré à part
  });

  // Capturer le fichier sélectionné et générer l'aperçu
  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let file: File | null = element.files ? element.files[0] : null;

    if (file) {
      this.selectedFile = file;

      // Génération de la prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      // Comme on envoie un fichier, on utilise FormData
      const formData = new FormData();
      
      // On ajoute les données texte (on les transforme en Blob JSON pour le Backend)
      const companyData = JSON.stringify(this.companyForm.value);
      formData.append('company', new Blob([companyData], { type: 'application/json' }));

      // On ajoute le fichier image
      if (this.selectedFile) {
        formData.append('logo', this.selectedFile);
      }

      this.companyService.create(formData).subscribe({
        next: (response) => {
          console.log('Compagnie enregistrée !', response);
          // Petit bonus : redirection vers le dashboard après succès
          this.router.navigate(['/transport-dashboard']);
        },
        error: (err) => {
          console.error('Erreur lors de l’inscription', err);
          alert('Une erreur est survenue lors de l\'enregistrement.');
        }
      });
    }
  }
}