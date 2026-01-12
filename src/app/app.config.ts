import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { Noir } from './custom-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
    provideHttpClient(withFetch()),
    providePrimeNG({
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    })
  ]
};
