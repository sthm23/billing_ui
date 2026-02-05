import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../service/auth';
import { switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-login',
  imports: [
    DividerModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService]
})
export class Login implements OnInit {
  loginForm = new FormGroup({
    login: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(3)]),
  })
  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    const isLoggedIn = this.authService.getAccessToken() !== null;
    if (isLoggedIn) {
      this.router.navigate(['/']);
    }

  }

  login() {
    if (this.loginForm.valid) {
      const { login, password } = this.loginForm.value;

      this.authService.login({ login: login!, password: password! })
        .pipe(
          switchMap((res) => {
            this.authService.saveToken(res.accessToken);
            return this.authService.profile();
          })
        )
        .subscribe({
          next: (res) => {
            this.authService.setCurrentUser(res);
            this.router.navigate(['/']);
            this.cd.markForCheck();
          },
          error: (err) => {
            console.error('Login failed', err);
            this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: 'Invalid login or password' });
          }
        })
    }
  }
}
