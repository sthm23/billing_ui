import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { PaymentType } from '../../../models/order.model';
import { RentalCleaning, RentalCleaningCheck, RentalErrorCode } from '../../../models/rental.model';
import { RentalService } from '../service/rental.service';
import { apiErrorMessage, rentalApiError, rentalLocalDate, toDateString } from '../rental-utils';

/** Must match MAX_CLEANING_DAYS of the backend DTO */
export const MAX_CLEANING_DAYS = 30;

export interface CleaningVariant {
  variantId: string;
  productName: string;
  sku: string;
}

/**
 * «В химчистку» (R13): one unit of a variant leaves for dry cleaning on the
 * chosen days. Whether it fits is asked from the backend (/check) as the user
 * types; saving writes the expense to the open cashbox (OWNER/MANAGER).
 */
@Component({
  selector: 'app-rental-cleaning-dialog',
  imports: [
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    TranslocoPipe,
  ],
  templateUrl: './rental-cleaning-dialog.html',
})
export class RentalCleaningDialog implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() warehouseId: string | null = null;
  @Input() variant: CleaningVariant | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<RentalCleaning>();

  private rentalService = inject(RentalService);
  private messageService = inject(MessageService);
  private transloco = inject(TranslocoService);

  readonly maxDays = MAX_CLEANING_DAYS;
  readonly paymentTypes = Object.values(PaymentType).map((value) => ({ value }));
  readonly today = this.startOfToday();

  date: Date = this.startOfToday();
  days = 1;
  amount: number | null = null;
  paymentType = PaymentType.CASH;
  comment = '';

  check = signal<RentalCleaningCheck | null>(null);
  checking = signal(false);
  checkFailed = signal(false);
  saving = signal(false);

  private checkTimer: ReturnType<typeof setTimeout> | null = null;
  private checkSub: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges) {
    const visible = changes['visible'];
    if (visible?.currentValue && !visible.previousValue) {
      // Fresh form on every opening; kept after a failed save
      this.date = this.startOfToday();
      this.days = 1;
      this.amount = null;
      this.paymentType = PaymentType.CASH;
      this.comment = '';
      this.check.set(null);
      this.scheduleCheck(0);
    }
  }

  ngOnDestroy() {
    this.stopCheck();
  }

  get validDays() {
    return Number.isInteger(this.days) && this.days >= 1 && this.days <= MAX_CLEANING_DAYS;
  }

  get canSubmit() {
    return (
      !!this.warehouseId &&
      !!this.variant &&
      !!this.date &&
      this.validDays &&
      (this.amount ?? 0) > 0 &&
      this.check()?.ok !== false &&
      !this.saving()
    );
  }

  changeDays(delta: number) {
    this.days = Math.min(MAX_CLEANING_DAYS, Math.max(1, (this.days || 1) + delta));
    this.scheduleCheck();
  }

  /** Re-ask the backend after the user stops changing date/days */
  scheduleCheck(delay = 300) {
    this.stopCheck();
    if (!this.warehouseId || !this.variant || !this.date || !this.validDays) {
      this.check.set(null);
      return;
    }
    this.checking.set(true);
    this.checkTimer = setTimeout(() => {
      this.checkSub = this.rentalService
        .checkCleaning({
          warehouseId: this.warehouseId!,
          variantId: this.variant!.variantId,
          startDate: toDateString(this.date),
          days: this.days,
        })
        .subscribe({
          next: (res) => {
            this.checking.set(false);
            this.checkFailed.set(false);
            this.check.set(res);
          },
          error: () => {
            this.checking.set(false);
            this.checkFailed.set(true);
            this.check.set(null);
          },
        });
    }, delay);
  }

  /** dd.MM of a backend instant, in the salon's calendar */
  shortDay(iso: string) {
    if (!iso) return '';
    const [, m, d] = rentalLocalDate(iso).split('-');
    return `${d}.${m}`;
  }

  /** dd.MM of a YYYY-MM-DD salon date */
  dayLabel(date: string) {
    const [, m, d] = date.split('-');
    return `${d}.${m}`;
  }

  /** Last day of a period ending at noon after it */
  lastDay(endIso: string) {
    return endIso ? new Date(new Date(endIso).getTime() - 86_400_000).toISOString() : '';
  }

  close() {
    this.visibleChange.emit(false);
  }

  submit() {
    if (!this.canSubmit) return;
    this.saving.set(true);
    const comment = this.comment.trim();
    this.rentalService
      .createCleaning({
        warehouseId: this.warehouseId!,
        variantId: this.variant!.variantId,
        startDate: toDateString(this.date),
        days: this.days,
        amount: this.amount!,
        paymentType: this.paymentType,
        ...(comment ? { comment } : {}),
      })
      .subscribe({
        next: (row) => {
          this.saving.set(false);
          this.saved.emit(row);
        },
        error: (err) => {
          this.saving.set(false);
          const body = rentalApiError(err);
          if (body.code === RentalErrorCode.NOT_AVAILABLE && body.conflicts) {
            // A booking appeared since the last check: show it
            const current = this.check();
            this.check.set({
              ok: false,
              owned: current?.owned ?? 0,
              available: body.available ?? 0,
              startDate: current?.startDate ?? '',
              endDate: current?.endDate ?? '',
              conflicts: body.conflicts,
            });
          }
          this.messageService.add({
            severity: 'error',
            summary: this.transloco.translate('rental.error'),
            detail:
              body.code === RentalErrorCode.NOT_AVAILABLE
                ? this.transloco.translate('rental.cleaning.notAvailable')
                : apiErrorMessage(err, this.transloco.translate('rental.saveFailed')),
          });
        },
      });
  }

  private stopCheck() {
    if (this.checkTimer) clearTimeout(this.checkTimer);
    this.checkTimer = null;
    this.checkSub?.unsubscribe();
    this.checkSub = null;
    this.checking.set(false);
  }

  private startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}
