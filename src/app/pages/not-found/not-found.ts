import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from "@angular/router";
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-not-found',
  imports: [
    ButtonModule,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {

}
