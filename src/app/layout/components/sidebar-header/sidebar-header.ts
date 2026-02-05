import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Divider } from "primeng/divider";
import { AuthService } from '../../../pages/auth/service/auth';
import { TitleCasePipe } from '@angular/common';
import { CurrentUserType } from '../../../models/auth.model';

@Component({
  selector: 'app-sidebar-header',
  imports: [
    AvatarModule,
    BadgeModule,
    MenuModule,
    RippleModule,
    ButtonModule,
    Divider,
    TitleCasePipe
  ],
  templateUrl: './sidebar-header.html',
  styleUrl: './sidebar-header.css',
})
export class SidebarHeader implements OnInit {
  items: MenuItem[] = [
    {
      label: 'Profile',
      items: [
        {
          label: 'Settings',
          icon: 'pi pi-cog',
          command: () => this.gotoProfile()
        },
        {
          label: 'Messages',
          icon: 'pi pi-inbox',
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          linkClass: '!text-red-500 dark:!text-red-400',
          command: () => this.logOut()
        }
      ]
    }
  ];
  currentUser: CurrentUserType | null = null;
  constructor(private authService: AuthService) { }
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  gotoProfile() {
    alert('Goto Profile');
  }

  logOut() {
    this.authService.logout({
      isAllDevices: false,
      sessionId: this.authService.getAccessToken() || ''
    }).subscribe(() => {
      this.authService.redirectToLogin();
    })
  }
}
