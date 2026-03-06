import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UserAdmin } from '../../../core/services/admin/admin.service'; // On utilise le nouveau service

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  // ✅ Injection du nouveau service dédié à l'admin
  private adminService = inject(AdminService);

  users = signal<UserAdmin[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Utilisation de la méthode du AdminService
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement users via AdminService', err);
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(user: UserAdmin) {
    const newStatus = !user.enabled;
    // Utilisation de la méthode du AdminService
    this.adminService.toggleUserStatus(user.id, newStatus).subscribe({
      next: () => {
        // Mise à jour optimiste du signal
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, enabled: newStatus } : u)),
        );
      },
    });
  }
}
