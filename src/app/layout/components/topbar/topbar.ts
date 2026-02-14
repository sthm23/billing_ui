import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, Scroll } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../../pages/auth/service/auth';
import { filter, Subject, take, takeUntil, tap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    NgClass,
    StyleClassModule,
    ButtonModule,
    DividerModule,
    BreadcrumbModule,
    TitleCasePipe
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit, OnDestroy {
  breadcrumbItems: MenuItem[] = []
  destroyer$ = new Subject<void>();
  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
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
        { label: segment } :
        { icon: 'pi pi-home' }
      )
      );
    const lastSegment = segments[segments.length - 1];
    if (lastSegment.label && lastSegment.label.includes('-') && lastSegment.label.length >= 28) {
      lastSegment.label = 'detail';
    }
    return segments;
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
