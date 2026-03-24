import { Component } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-dashboard',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
