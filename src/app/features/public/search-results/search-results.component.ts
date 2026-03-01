import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Trip {
  id: number;
  partnerName: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsLeft: number;
  vehicleType: string;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);

  searchParams = { from: '', to: '', date: '' };

  // Simulation de données (on connectera ton API juste après)
  trips: Trip[] = [
    {
      id: 1,
      partnerName: 'Express Dakar',
      departureTime: '08:00',
      arrivalTime: '12:30',
      price: 5000,
      seatsLeft: 12,
      vehicleType: 'Bus',
    },
    {
      id: 2,
      partnerName: 'Baol Trans',
      departureTime: '14:30',
      arrivalTime: '18:45',
      price: 4500,
      seatsLeft: 4,
      vehicleType: 'Minibus',
    },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.searchParams.from = params['from'];
      this.searchParams.to = params['to'];
      this.searchParams.date = params['date'];
    });
  }
}
