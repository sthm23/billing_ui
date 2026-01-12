import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-sign-up',
  imports: [
    DividerModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    RouterLink
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {

}
