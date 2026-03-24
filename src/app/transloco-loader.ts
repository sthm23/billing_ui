import { inject, Injectable } from "@angular/core";
import { Translation, TranslocoLoader, TranslocoService } from "@ngneat/transloco";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}
