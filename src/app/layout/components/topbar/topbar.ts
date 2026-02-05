import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../../pages/auth/service/auth';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    NgClass,
    StyleClassModule,
    ButtonModule
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {


  constructor(
    public layoutService: LayoutService,
    private authService: AuthService
  ) { }

  ngOnInit() {

  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  handleExit() {
    this.authService.logout({ isAllDevices: false, sessionId: this.authService.getAccessToken() || '' }).pipe(
      take(1)
    ).subscribe({
      next: () => {
        this.authService.redirectToLogin();
      },
      error: (err) => {
        this.authService.redirectToLogin();
      }
    });
  }
}
