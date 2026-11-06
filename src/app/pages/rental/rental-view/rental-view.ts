import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { AuthService } from '../../auth/service/auth';
import { OrderService } from '../../order/services/order-service';
import { PaymentType } from '../../../models/order.model';
import {
  RentalCollateral,
  RentalDetail,
  RentalPaymentPayload,
  RentalReturnPayload,
  RentalStatus,
} from '../../../models/rental.model';
import { AppStore } from '../../../store/app.store';
import { RentalService } from '../service/rental.service';
import { RentalPaymentDialog, RentalPaymentMode } from '../rental-payment-dialog/rental-payment-dialog';
import { RentalReturnDialog } from '../rental-return-dialog/rental-return-dialog';
import { apiErrorMessage, rentalStatusSeverity } from '../rental-utils';

@Component({
  selector: 'app-rental-view',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TranslocoPipe,
    RentalPaymentDialog,
    RentalReturnDialog,
  ],
  templateUrl: './rental-view.html',
  providers: [ConfirmationService],
})
export class RentalView implements OnInit {
  appStore = inject(AppStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private rentalService = inject(RentalService);
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private transloco = inject(TranslocoService);

  readonly canManage = this.authService.canManageStore();
  readonly paymentTypeOptions = Object.values(PaymentType).map((value) => ({ value }));
  readonly statusSeverity = rentalStatusSeverity;
  readonly Status = RentalStatus;

  rental = signal<RentalDetail | null>(null);
  busy = signal(false);

  paymentVisible = false;
  paymentMode: RentalPaymentMode = 'PAYMENT';
  returnVisible = false;
  cancelVisible = false;
  cancelForm: { refundAmount: number; refundPaymentType: PaymentType | null; reason: string } = {
    refundAmount: 0,
    refundPaymentType: null,
    reason: '',
  };

  due = computed(() => {
    const r = this.rental();
    return r ? +r.order.dueAmount : 0;
  });
  isPaid = computed(() => {
    const r = this.rental();
    return !!r && +r.order.paidAmount >= +r.order.totalAmount;
  });
  itemsOut = computed(() => {
    const r = this.rental();
    if (!r || (r.status !== RentalStatus.ISSUED && r.status !== RentalStatus.PARTIALLY_RETURNED)) return false;
    return r.order.items.some((i) => i.quantity > i.returnedQuantity);
  });
  servicesTotal = computed(() =>
    (this.rental()?.order.services ?? []).reduce((s, x) => s + +x.price - +x.sale, 0),
  );

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/pages/rental/list']);
      return;
    }
    this.load(id, () => {
      // Right after booking: prepayment and collateral (scenario 1)
      if (this.route.snapshot.queryParamMap.get('pay') && this.rental()?.status === RentalStatus.BOOKED) {
        this.openPayment('PAYMENT');
      }
    });
  }

  private load(id: string, after?: () => void) {
    this.appStore.startLoader();
    this.rentalService.getRentalById(id).subscribe({
      next: (rental) => {
        this.appStore.stopLoader();
        this.rental.set(rental);
        after?.();
      },
      error: (err) => {
        this.appStore.stopLoader();
        this.notifyError(err, 'rental.loadFailed');
        this.router.navigate(['/pages/rental/list']);
      },
    });
  }

  lineTotal(item: { retailPrice: string | number; sale: string | number; quantity: number }) {
    return (+item.retailPrice - +item.sale) * item.quantity;
  }

  attributes(item: RentalDetail['order']['items'][number]) {
    return item.variant.attributes.map((a) => a.value.value).join(' · ');
  }

  // ------------------------------------------------------------- actions

  back() {
    this.router.navigate(['/pages/rental/list']);
  }

  edit() {
    this.router.navigate(['/pages/rental', this.rental()!.id, 'edit']);
  }

  openPayment(mode: RentalPaymentMode) {
    this.paymentMode = mode;
    this.paymentVisible = true;
  }

  onPaymentSubmitted(payload: RentalPaymentPayload) {
    const rental = this.rental()!;
    if (this.paymentMode === 'DEBT') {
      // A returned rental in DEBT is repaid like any debt (POST /payment)
      this.busy.set(true);
      this.orderService
        .addPaymentToOrder(rental.orderId, {
          orderId: rental.orderId,
          customerId: null,
          payments: payload.payments ?? [],
        })
        .subscribe({
          next: () => {
            this.busy.set(false);
            this.paymentVisible = false;
            this.notify('rental.paymentSaved');
            this.load(rental.id);
          },
          error: (err) => {
            this.busy.set(false);
            this.notifyError(err, 'rental.saveFailed');
          },
        });
      return;
    }
    const request$ =
      this.paymentMode === 'ISSUE'
        ? this.rentalService.issue(rental.id, payload)
        : this.rentalService.addPayments(rental.id, payload);
    this.run(request$, this.paymentMode === 'ISSUE' ? 'rental.issued' : 'rental.paymentSaved', () => {
      this.paymentVisible = false;
    });
  }

  onReturnSubmitted(payload: RentalReturnPayload) {
    this.run(this.rentalService.createReturn(this.rental()!.id, payload), 'rental.returned', () => {
      this.returnVisible = false;
    });
  }

  openCancel() {
    this.cancelForm = { refundAmount: 0, refundPaymentType: null, reason: '' };
    this.cancelVisible = true;
  }

  get cancelValid() {
    const paid = +(this.rental()?.order.paidAmount ?? 0);
    const { refundAmount, refundPaymentType } = this.cancelForm;
    return refundAmount >= 0 && refundAmount <= paid && (refundAmount === 0 || !!refundPaymentType);
  }

  submitCancel() {
    if (!this.cancelValid) return;
    const { refundAmount, refundPaymentType, reason } = this.cancelForm;
    this.run(
      this.rentalService.cancel(this.rental()!.id, {
        refundAmount,
        ...(refundAmount > 0 && refundPaymentType ? { refundPaymentType } : {}),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }),
      'rental.cancelled',
      () => {
        this.cancelVisible = false;
      },
    );
  }

  returnCollateral(event: Event, collateral: RentalCollateral) {
    const send = () =>
      this.run(this.rentalService.returnCollateral(this.rental()!.id, collateral.id), 'rental.collateralReturned');
    if (!this.itemsOut()) {
      send();
      return;
    }
    // R5: allowed, but the items are still with the customer
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: this.transloco.translate('rental.collateralWarningTitle'),
      message: this.transloco.translate('rental.collateralWarning'),
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: this.transloco.translate('rental.cancelAction'), severity: 'secondary', outlined: true },
      acceptButtonProps: { label: this.transloco.translate('rental.returnCollateral'), severity: 'warn' },
      accept: send,
    });
  }

  private run(request$: Observable<RentalDetail>, successKey: string, onSuccess?: () => void) {
    this.busy.set(true);
    request$.subscribe({
      next: (rental) => {
        this.busy.set(false);
        this.rental.set(rental);
        onSuccess?.();
        this.notify(successKey);
      },
      error: (err) => {
        this.busy.set(false);
        this.notifyError(err, 'rental.saveFailed');
      },
    });
  }

  private notify(key: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.transloco.translate('rental.success'),
      detail: this.transloco.translate(key),
    });
  }

  private notifyError(err: unknown, fallbackKey: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.transloco.translate('rental.error'),
      detail: apiErrorMessage(err, this.transloco.translate(fallbackKey)),
    });
  }
}
