import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TranslocoPipe } from '@ngneat/transloco';
import { PaymentType } from '../../../models/order.model';
import {
  CleaningConflict,
  RentalDetail,
  RentalReturnPayload,
  RentalReturnPreview,
} from '../../../models/rental.model';
import { RentalService } from '../service/rental.service';
import { apiErrorMessage } from '../rental-utils';

interface ReturnLine {
  orderItemId: string;
  name: string;
  outstanding: number;
  quantity: number;
  cleaningDays: number;
}

/** Default dry cleaning offered to the seller (R7) */
const DEFAULT_CLEANING_DAYS = 1;

/**
 * Return of rented items (R4, R7, R8, R10): the seller checks cleaning
 * conflicts and the preview computed by the backend, then confirms.
 * Any change of the inputs asks for a new check.
 */
@Component({
  selector: 'app-rental-return-dialog',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TranslocoPipe,
  ],
  templateUrl: './rental-return-dialog.html',
})
export class RentalReturnDialog implements OnChanges {
  private rentalService = inject(RentalService);

  @Input() visible = false;
  @Input({ required: true }) rental!: RentalDetail;
  @Input() canManage = false;
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<RentalReturnPayload>();

  readonly paymentTypes = Object.values(PaymentType);
  readonly paymentTypeOptions = this.paymentTypes.map((value) => ({ value }));
  readonly now = new Date();

  lines: ReturnLine[] = [];
  returnedAt: Date | null = null;
  penaltyAmount = 0;
  penaltyComment = '';
  earlyReturnRefund = 0;
  refundPaymentType: PaymentType | null = null;
  amounts: Record<PaymentType, number> = this.emptyAmounts();

  checking = signal(false);
  checkError = signal<string | null>(null);
  preview = signal<RentalReturnPreview | null>(null);
  conflicts = signal<CleaningConflict[]>([]);

  ngOnChanges(changes: SimpleChanges) {
    const visible = changes['visible'];
    if (visible?.currentValue && !visible.previousValue) this.reset();
  }

  private reset() {
    this.lines = this.rental.order.items
      .filter((item) => item.quantity > item.returnedQuantity)
      .map((item) => ({
        orderItemId: item.id,
        name: `${item.variant.product.name} · ${item.variant.sku}`,
        outstanding: item.quantity - item.returnedQuantity,
        quantity: item.quantity - item.returnedQuantity,
        cleaningDays: DEFAULT_CLEANING_DAYS,
      }));
    this.returnedAt = null;
    this.penaltyAmount = 0;
    this.penaltyComment = '';
    this.earlyReturnRefund = 0;
    this.refundPaymentType = null;
    this.amounts = this.emptyAmounts();
    this.invalidate();
  }

  /** Inputs changed: the preview no longer matches */
  invalidate() {
    this.preview.set(null);
    this.conflicts.set([]);
    this.checkError.set(null);
  }

  get conflictCount() {
    return this.conflicts().reduce((s, c) => s + c.conflicts.length, 0);
  }

  get needsRefundType() {
    return +(this.preview()?.cashOutAmount ?? 0) > 0;
  }

  private payload(): RentalReturnPayload | null {
    const items = this.lines
      .filter((l) => l.quantity > 0)
      .map((l) => ({ orderItemId: l.orderItemId, quantity: l.quantity, cleaningDays: l.cleaningDays ?? 0 }));
    if (!items.length) return null;
    const payments = this.paymentTypes
      .filter((type) => (this.amounts[type] || 0) > 0)
      .map((type) => ({ type, amount: this.amounts[type] }));
    return {
      items,
      ...(this.returnedAt ? { returnedAt: this.returnedAt.toISOString() } : {}),
      ...(this.penaltyAmount > 0
        ? { penaltyAmount: this.penaltyAmount, penaltyComment: this.penaltyComment.trim() }
        : {}),
      ...(this.earlyReturnRefund > 0 ? { earlyReturnRefund: this.earlyReturnRefund } : {}),
      ...(this.refundPaymentType ? { refundPaymentType: this.refundPaymentType } : {}),
      ...(payments.length ? { payments } : {}),
    };
  }

  /** Backend preview + cleaning conflicts; nothing is saved */
  check() {
    const payload = this.payload();
    if (!payload) return;
    this.checking.set(true);
    this.checkError.set(null);
    forkJoin({
      preview: this.rentalService.previewReturn(this.rental.id, payload),
      conflicts: this.rentalService.getCleaningConflicts(this.rental.id, payload.items, payload.returnedAt),
    }).subscribe({
      next: ({ preview, conflicts }) => {
        this.checking.set(false);
        this.preview.set(preview);
        this.conflicts.set(conflicts.filter((c) => c.conflicts.length > 0));
      },
      error: (err) => {
        this.checking.set(false);
        this.checkError.set(apiErrorMessage(err, 'Error'));
      },
    });
  }

  confirm() {
    const payload = this.payload();
    if (!payload || !this.preview()) return;
    if (this.needsRefundType && !this.refundPaymentType) return;
    this.submitted.emit(payload);
  }

  close() {
    this.visibleChange.emit(false);
  }

  itemName(orderItemId: string) {
    return this.lines.find((l) => l.orderItemId === orderItemId)?.name ?? orderItemId;
  }

  private emptyAmounts(): Record<PaymentType, number> {
    return {
      [PaymentType.CASH]: 0,
      [PaymentType.CARD]: 0,
      [PaymentType.ONLINE]: 0,
      [PaymentType.TRANSFER]: 0,
    };
  }
}
