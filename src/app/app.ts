import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { TranslateService } from './shared/services/translate.service';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class App implements OnInit {
  private translate = inject(TranslocoService);
  private translateService = inject(TranslateService);
  private config = inject(PrimeNG);
  ngOnInit() {
    this.translate.langChanges$.pipe().subscribe(lang => {
      this.translateService.currentLang$.next(lang || this.translate.getDefaultLang());
      this.translateService.setLocale(this.config, lang || this.translate.getDefaultLang());
    });
  }
}
