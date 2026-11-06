import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { switchMap } from 'rxjs';
import { AuthService } from '../auth/service/auth';
import { StoreService } from '../organization/service/store';
import { Store } from '../../models/store.model';

/**
 * Store modes (OWNER): sales and/or rental. At least one stays on — the
 * backend rejects turning both off. The menu follows the flags after a reload.
 */
@Component({
  selector: 'app-store-settings',
  imports: [FormsModule, ButtonModule, MessageModule, ToggleSwitchModule, TranslocoPipe],
  templateUrl: './store-settings.html',
})
export class StoreSettings implements OnInit {
  private authService = inject(AuthService);
  private storeService = inject(StoreService);
  private messageService = inject(MessageService);
  private transloco = inject(TranslocoService);

  store = signal<Store | null>(null);
  salesEnabled = true;
  rentalEnabled = false;
  saving = signal(false);

  ngOnInit() {
    const storeId = this.authService.getCurrentUser()?.staff?.storeId;
    if (!storeId) return;
    this.storeService.getStoreById(storeId).subscribe({
      next: (store) => {
        this.store.set(store);
        this.salesEnabled = store.salesEnabled ?? true;
        this.rentalEnabled = store.rentalEnabled ?? false;
      },
      error: (err) => this.error(err),
    });
  }

  get valid() {
    return this.salesEnabled || this.rentalEnabled;
  }

  save() {
    const store = this.store();
    if (!store || !this.valid) return;
    this.saving.set(true);
    this.storeService
      .updateStoreFlags(store.id, {
        salesEnabled: this.salesEnabled,
        rentalEnabled: this.rentalEnabled,
        // Required by PUT /store/:id: keep the current ones
        attributeIds: store.attributes.map((a) => a.attributeId),
        brandIds: store.brands.map((b) => b.brandId),
      })
      .pipe(switchMap(() => this.authService.profile()))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.transloco.translate('rental.success'),
            detail: this.transloco.translate('storeSettings.saved'),
          });
          // Menu and routes read the flags of the current user
          setTimeout(() => window.location.reload(), 800);
        },
        error: (err) => {
          this.saving.set(false);
          this.error(err);
        },
      });
  }

  private error(err: { error?: { message?: string } }) {
    this.messageService.add({
      severity: 'error',
      summary: this.transloco.translate('rental.error'),
      detail: err.error?.message ?? this.transloco.translate('rental.saveFailed'),
    });
  }
}
