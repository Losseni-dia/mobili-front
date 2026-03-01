import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PartenaireService } from '../../../core/services/partners/partenaire.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register-partner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-partner.component.html',
  styleUrls: ['./register-partner.component.scss'],
})
export class RegisterPartnerComponent {
  private fb = inject(FormBuilder);
  private partenaireService = inject(PartenaireService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  selectedLogo: File | null = null;

  partnerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    businessNumber: ['', [Validators.required]],
  });

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogo = file;
    }
  }

  onSubmit() {
    if (this.partnerForm.invalid) return;
    this.isLoading.set(true);

    const formData = new FormData();

    // 1. Préparation du JSON pour le backend (@RequestPart("partner"))
    const partnerBlob = new Blob([JSON.stringify(this.partnerForm.value)], {
      type: 'application/json',
    });
    formData.append('partner', partnerBlob);

    // 2. Ajout du logo si sélectionné
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    this.partenaireService.registerPartner(formData).subscribe({
      next: () => {
        const login = this.authService.currentUser()?.login;

        if (login) {
          // 💡 CRUCIAL : On récupère le profil mis à jour pour obtenir le ROLE_PARTNER
          // Cela met à jour le Signal dans AuthService, ce qui rafraîchit le Header automatiquement.
          this.authService.fetchUserProfile(login).subscribe({
            next: () => {
              this.router.navigate(['/partenaire/dashboard']);
            },
            error: () => {
              // En cas d'erreur de rafraîchissement, on tente quand même la redirection
              this.router.navigate(['/partenaire/dashboard']);
            },
          });
        } else {
          this.router.navigate(['/partenaire/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erreur inscription partenaire :', err);
        this.isLoading.set(false);
      },
    });
  }
}
