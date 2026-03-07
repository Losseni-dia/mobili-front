import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // ✅ Ajouté pour le bouton retour
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library'; // ✅ Importation cruciale
import { TicketService } from '../../../core/services/ticket/ticket.service';

@Component({
  selector: 'app-ticket-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, RouterModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
})
export class TicketScannerComponent {
  private ticketService = inject(TicketService);

  // ✅ On définit le format attendu pour éviter l'erreur TS2322
  allowedFormats = [BarcodeFormat.QR_CODE];

  scanResult = signal<any>(null);
  isScanning = signal(true);
  errorMessage = signal('');

  onCodeResult(resultString: string) {
    this.isScanning.set(false);
    this.validateTicket(resultString);
  }

  validateTicket(ticketNumber: string) {
    this.ticketService.verifyTicket(ticketNumber).subscribe({
      next: (ticket) => {
        this.scanResult.set(ticket);
        this.errorMessage.set('');
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Ticket invalide ou déjà utilisé');
        this.scanResult.set(null);
      },
    });
  }

  resetScanner() {
    this.scanResult.set(null);
    this.errorMessage.set('');
    this.isScanning.set(true);
  }
}
