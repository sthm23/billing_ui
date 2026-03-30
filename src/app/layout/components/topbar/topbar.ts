import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, Scroll } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../../pages/auth/service/auth';
import { filter, Subject, take, takeUntil, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ListboxModule } from 'primeng/listbox';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    NgClass,
    StyleClassModule,
    ButtonModule,
    DividerModule,
    BreadcrumbModule,
    TitleCasePipe,
    MenuModule,
    ListboxModule
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit, OnDestroy {
  breadcrumbItems: MenuItem[] = []
  destroyer$ = new Subject<void>();
  selectedLanguage: MenuItem = { name: 'Rus', value: 'ru' };
  languages: MenuItem[] = [
    {
      name: 'Eng', value: 'en', command: (event) => {
        this.selectedLanguage = event.item as MenuItem;
        this.setActiveLang(this.selectedLanguage['value']);
      },
    },
    {
      name: 'Rus', value: 'ru', command: (event) => {
        this.selectedLanguage = event.item as MenuItem;
        this.setActiveLang(this.selectedLanguage['value']);
      },
    },
    {
      name: 'Uzb', value: 'uz', command: (event) => {
        this.selectedLanguage = event.item as MenuItem;
        this.setActiveLang(this.selectedLanguage['value']);
      },
    },
  ]
  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private translocoService: TranslocoService
  ) { }

  ngOnInit() {
    const currentLang = localStorage.getItem('my_billing_lang') || 'ru';
    this.selectedLanguage = this.languages.find(lang => lang['value'] === currentLang) || this.selectedLanguage;
    this.setActiveLang(this.selectedLanguage['value']);

    this.breadcrumbItems = this.makeBreadcrumbLabel(this.router.routerState.snapshot.url)

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyer$)
    ).subscribe((e: NavigationEnd) => {
      const result = this.makeBreadcrumbLabel(e.urlAfterRedirects);

      this.breadcrumbItems = result;
    });
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  handleExit() {
    this.authService.logout({
      isAllDevices: false,
      sessionId: this.authService.getAccessToken() || ''
    }).pipe(
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

  private makeBreadcrumbLabel(label: string) {
    const segments = label.split('/').splice(1)
      .map((segment, ind) =>
      (ind ?
        { label: segment.length > 20 && segment.length < (ind + 1) ? 'create' : segment } :
        { icon: 'pi pi-home' }
      )
      );

    const lastSegment = segments[segments.length - 1];
    if (lastSegment.label && lastSegment.label.includes('-') && lastSegment.label.length >= 28) {
      lastSegment.label = 'detail';
    }
    return segments;
  }

  setActiveLang(lang: string) {
    localStorage.setItem('my_billing_lang', lang);
    document.documentElement.lang = lang;
    this.translocoService.setActiveLang(lang)
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
