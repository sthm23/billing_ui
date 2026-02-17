import { Component } from '@angular/core';
import { MenuItems } from '../menu-item/menu-item';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../pages/auth/service/auth';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, MenuItems, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  model: MenuItem[] = [];

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.model = [
      {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
      },
      {
        separator: true
      },
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        routerLink: ['/pages'],
        items: [
          {
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            routerLink: ['/landing']
          },
          {
            label: 'Organization',
            icon: 'pi pi-fw pi-sitemap',
            visible: this.authService.isAdmin(),
            items: [
              {
                label: 'Store List',
                icon: 'pi pi-fw pi-globe',
                routerLink: ['/pages/organization/list']
              },
              {
                label: 'Create Store',
                icon: 'pi pi-fw pi-globe',
                routerLink: ['/pages/organization/create']
              },
            ]
          },
          {
            label: 'Auth',
            icon: 'pi pi-fw pi-user',
            items: [
              {
                label: 'Login',
                icon: 'pi pi-fw pi-sign-in',
                routerLink: ['/auth/login']
              },
              {
                label: 'Sign Up',
                icon: 'pi pi-fw pi-lock',
                routerLink: ['/auth/sign-up']
              }
            ]
          },
          {
            label: 'Product',
            icon: 'pi pi-fw pi-tag',
            items: [
              {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                routerLink: ['/pages/product/list']
              },
              {
                label: 'Create',
                icon: 'pi pi-fw pi-plus-circle',
                routerLink: ['/pages/product/create']
              }
            ]
          },
          {
            label: 'User',
            icon: 'pi pi-fw pi-users',
            items: [
              {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                routerLink: ['/pages/user/list']
              },
              {
                label: 'Create',
                icon: 'pi pi-fw pi-plus-circle',
                routerLink: ['/pages/user/create']
              }
            ]
          },
          {
            label: 'Not Found',
            icon: 'pi pi-fw pi-exclamation-circle',
            routerLink: ['/pages/notfound']
          },
          {
            label: 'Empty',
            icon: 'pi pi-fw pi-circle-off',
            routerLink: ['/pages/empty']
          }
        ]
      }
    ];
  }
}
