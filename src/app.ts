import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../src/app/layout/header/header.component'; // L'erreur va disparaître !
import { FooterComponent } from '../src/app/layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: 'app.scss',
})
export class App {}
