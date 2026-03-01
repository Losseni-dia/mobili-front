import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; // Ajout de ActivatedRoute
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // On injecte pour lire l'URL de retour

  credentials = { login: '', password: '' };
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

 onSubmit() {
  this.isLoading.set(true);
  this.errorMessage.set(null);

  this.authService.login(this.credentials).subscribe({
    next: () => {
      // Redirection immédiate vers la page demandée ou l'accueil
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl); 
      // NOTE : Aucun toast ou message "Connexion réussie" n'est déclenché ici.
    },
    error: (err) => {
      this.isLoading.set(false);
      this.errorMessage.set('Identifiants incorrects.');
    }
  });
}
}


