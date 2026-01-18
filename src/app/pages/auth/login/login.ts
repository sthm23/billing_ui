import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../service/auth';

@Component({
  selector: 'app-login',
  imports: [
    DividerModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({
    login: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
  })
  constructor(private authService: AuthService, private router: Router) { }

  login() {
    if (this.loginForm.valid) {
      const { login, password } = this.loginForm.value;

      this.authService.login({ login: login!, password: password! }).subscribe({
        next: (res) => {
          this.authService.saveToken(res.accessToken);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login failed', err);
        }
      })
    }
  }
}
