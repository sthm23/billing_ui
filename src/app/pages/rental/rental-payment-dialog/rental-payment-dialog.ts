import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslocoPipe } from '@ngneat/transloco';
import { PaymentType } from '../../../models/order.model';
import { CollateralType, RentalPaymentPayload } from '../../../models/rental.model';

/**
 * PAYMENT — prepayment / extra payment (+ collateral), ISSUE — hand over
 * (+ collateral, optional payment), DEBT — repay a returned rental (POST /payment).
 */
export type RentalPaymentMode = 'PAYMENT' | 'ISSUE' | 'DEBT';

@Component({
  selector: 'app-rental-payment-dialog',
  imports: [
    CurrencyPipe,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TranslocoPipe,
  ],
  templateUrl: './rental-payment-dialog.html',
})
export class RentalPaymentDialog implements OnChanges {
  @Input() visible = false;
  @Input() mode: RentalPaymentMode = 'PAYMENT';
  /** Still owed by the customer */
  @Input() dueAmount = 0;
  @Input() loading = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<RentalPaymentPayload>();

  readonly paymentTypes = Object.values(PaymentType);
  readonly collateralTypes = Object.values(CollateralType).map((value) => ({ value }));

  amounts: Record<PaymentType, number> = this.emptyAmounts();
  collaterals: { type: CollateralType; description: string }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    const visible = changes['visible'];
    if (visible?.currentValue && !visible.previousValue) {
      // Fresh form on every opening; kept after a failed submit
      this.amounts = this.emptyAmounts();
      this.collaterals = [];
    }
  }

  get paymentsTotal() {
    return this.paymentTypes.reduce((s, t) => s + (this.amounts[t] || 0), 0);
  }

  get overpaid() {
    return this.paymentsTotal > this.dueAmount;
  }

  get canSubmit() {
    if (this.overpaid) return false;
    if (this.collaterals.some((c) => !c.description.trim())) return false;
    if (this.mode === 'ISSUE') return true;
    if (this.mode === 'DEBT') return this.paymentsTotal > 0;
    return this.paymentsTotal > 0 || this.collaterals.length > 0;
  }

  addCollateral() {
    this.collaterals = [...this.collaterals, { type: CollateralType.PASSPORT, description: '' }];
  }

  removeCollateral(index: number) {
    this.collaterals = this.collaterals.filter((_, i) => i !== index);
  }

  close() {
    this.visibleChange.emit(false);
  }

  submit() {
    if (!this.canSubmit) return;
    const payments = this.paymentTypes
      .filter((type) => (this.amounts[type] || 0) > 0)
      .map((type) => ({ type, amount: this.amounts[type] }));
    const collaterals = this.collaterals.map((c) => ({
      type: c.type,
      description: c.description.trim(),
    }));
    this.submitted.emit({
      ...(payments.length ? { payments } : {}),
      ...(collaterals.length ? { collaterals } : {}),
    });
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
