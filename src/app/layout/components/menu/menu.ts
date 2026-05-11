import { Component, DestroyRef, inject } from '@angular/core';
import { MenuItems } from '../menu-item/menu-item';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../pages/auth/service/auth';
import { TranslocoService } from '@ngneat/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '../../../shared/services/translate.service';
@Component({
  selector: 'app-menu',
  imports: [CommonModule, MenuItems, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  model: MenuItem[] = [];
  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    this.translate.selectTranslateObject('sidebar').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res) => {
      this.model = [
        {
          label: res['home'],
          items: [
            { label: res['dashboard'], icon: 'pi pi-fw pi-home', routerLink: ['/'], visible: this.authService.isOwner() || this.authService.isAdmin() },
            {
              label: res['profile'],
              icon: 'pi pi-fw pi-user',
              routerLink: ['/pages/profile'],
            },
          ]
        },
        {
          label: res['pages'],
          icon: 'pi pi-fw pi-briefcase',
          routerLink: ['/pages'],
          items: [
            {
              label: res['organization'],
              icon: 'pi pi-fw pi-sitemap',
              visible: this.authService.isAdmin(),
              items: [
                {
                  label: res['list'],
                  icon: 'pi pi-fw pi-list',
                  routerLink: ['/pages/organization/list']
                },
                {
                  label: res['create'],
                  icon: 'pi pi-fw pi-plus-circle',
                  routerLink: ['/pages/organization/create']
                },
              ]
            },
            {
              label: res['product'],
              icon: 'pi pi-fw pi-box',
              routerLink: ['/pages/product/list'],
              visible: this.authService.isOwner() || this.authService.isAdmin() || this.authService.isManager(),
            },
            {
              label: res['user'],
              icon: 'pi pi-fw pi-users',
              visible: this.authService.isOwner() || this.authService.isAdmin(),
              routerLink: ['/pages/user/list']
            },
            {
              label: res['order'],
              icon: 'pi pi-fw pi-shopping-cart',
              routerLink: ['/pages/order/list']
            },
            {
              label: res['debitor'],
              icon: 'pi pi-fw pi-user-minus',
              routerLink: ['/pages/debitor/list']
            },
            {
              label: res['payments'],
              icon: 'pi pi-fw pi-money-bill',
              routerLink: ['/pages/payments/list']
            },
          ]
        },
        {
          label: res['settings'],
          visible: this.authService.isAdmin(),
          items: [

            {
              label: res['attribute'],
              icon: 'pi pi-fw pi-tag',
              routerLink: ['/pages/settings/attribute/list'],
              items: [
                {
                  label: res['list'],
                  icon: 'pi pi-fw pi-list',
                  routerLink: ['/pages/settings/attribute/list']
                },
                {
                  label: res['create'],
                  icon: 'pi pi-fw pi-plus-circle',
                  routerLink: ['/pages/settings/attribute/create']
                }
              ]
            },
          ]
        }
      ];
    });


  }
}
