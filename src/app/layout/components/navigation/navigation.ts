import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { AuthService } from '../../../pages/auth/service/auth';
import { TranslocoPipe } from '@ngneat/transloco';
import { Router } from '@angular/router';
import { TranslateService } from '../../../shared/services/translate.service';

@Component({
  selector: 'app-navigation',
  imports: [
    ButtonModule, SpeedDialModule,
    TranslocoPipe
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation implements OnInit {
  items: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.selectTranslateObject('sidebar').subscribe((res) => {
      this.items = [
        {
          label: res['dashboard'],
          icon: 'pi pi-fw pi-home',
          visible: this.authService.isAdmin() || this.authService.isOwner(),
          command: () => this.goTo('dashboard')
        },
        {
          label: res['profile'],
          icon: 'pi pi-fw pi-user',
          command: () => this.goTo('profile')
        },
        {
          label: res['organization'],
          icon: 'pi pi-fw pi-sitemap',
          visible: this.authService.isAdmin(),
          command: () => this.goTo('organization')
        },
        {
          label: res['user'],
          icon: 'pi pi-fw pi-users',
          visible: this.authService.isOwner() || this.authService.isAdmin(),
          command: () => this.goTo('user')
        },
        {
          label: res['attribute'],
          icon: 'pi pi-fw pi-tag',
          visible: this.authService.isAdmin(),
          command: () => this.goTo('attribute')
        }
      ];
    });
  }

  goTo(key: string) {
    switch (key) {
      case 'product':
        this.router.navigate(['/pages/product/list'])
        break;
      case 'payment':
        this.router.navigate(['/pages/payments/list'])
        break;
      case 'order':
        this.router.navigate(['/pages/order/list'])
        break;
      case 'debitor':
        this.router.navigate(['/pages/debitor/list'])
        break;
      case 'dashboard':
        this.router.navigate([''])
        break;
      case 'user':
        this.router.navigate(['/pages/user/list'])
        break;
      case 'profile':
        this.router.navigate(['/pages/profile'])
        break;

      case 'attribute':
        this.router.navigate(['/pages/settings/attribute/list'])
        break;
      case 'organization':
        this.router.navigate(['/pages/organization/list'])
        break;

      default:
        break;
    }
  }
}
