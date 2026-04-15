import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, provideAppInitializer, inject, provideEnvironmentInitializer } from '@angular/core';

import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { PrimeNG, providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { Noir } from './custom-theme';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { TokenInterceptor } from './shared/interceptors/token.interceptor';
import { BaseUrlInterceptor } from './shared/interceptors/url.interceptor';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { TranslateService } from './shared/services/translate.service';

const storedLang = localStorage.getItem('my_billing_lang');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    providePrimeNG({
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },

    provideTransloco({
      config: {
        availableLangs: ['en', 'ru', 'uz'],
        defaultLang: storedLang || 'ru',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          logMissingKey: false,
        },
      },
      loader: TranslocoHttpLoader
    }),
    provideEnvironmentInitializer(() => {
      const translate = inject(TranslocoService);
      const translateService = inject(TranslateService);
      const config = inject(PrimeNG);

      translate.langChanges$.pipe().subscribe(lang => {
        translateService.setLocale(config, lang || translate.getDefaultLang());
      });

    })
  ]
};
