import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { Noir } from './custom-theme';
import { AuthInterceptor } from './shared/service/auth.interceptor';
import { TokenInterceptor } from './shared/service/token.interceptor';
import { BaseUrlInterceptor } from './shared/service/url.interceptor';

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
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ]
};
