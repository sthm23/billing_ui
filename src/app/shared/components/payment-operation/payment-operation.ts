import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CreateOrderPaymentPayload, OrderDetail, OrderDetailItem, OrderPaymentPayload, OrderStatus, PaymentType } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject, takeUntil } from 'rxjs';
import { FluidModule } from 'primeng/fluid';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { TranslocoPipe } from '@ngneat/transloco';
import { CustomerSearch, SearchCustomer } from '../customer-search/customer-search';

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE' | 'TRANSFER';
export type PaymentMethodGroup = { [key in PaymentMethod]: FormControl<number> };

@Component({
  selector: 'app-payment-operation',
  imports: [
    DividerModule,
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    SelectButtonModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    FluidModule,
    AccordionModule,
    BadgeModule,
    TranslocoPipe,
    CustomerSearch
  ],
  templateUrl: './payment-operation.html',
  styleUrl: './payment-operation.css',
})
export class PaymentOperation implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>()
  totalAmount = signal<number>(0);
  saleAmount = signal<number>(0);
  paymentAmounts = signal<number>(0);
  orderItems = signal<OrderDetailItem[]>([]);

  currentOrder = signal<OrderDetail | null>(null);
  customer = signal<SearchCustomer | null>(null);

  paymentOptions = [
    { label: 'CASH', value: 'CASH', icon: 'pi pi-money-bill' },
    { label: 'CARD', value: 'CARD', icon: 'pi pi-credit-card' },
    { label: 'CLICK', value: 'ONLINE', icon: 'pi pi-credit-card' },
    { label: 'PEREVOD', value: 'TRANSFER', icon: 'pi pi-calculator' },
  ]

  paymentForm = new FormGroup({
    paymentMethod: new FormControl<string[]>(['CASH'], { nonNullable: true }),
    method: new FormGroup<PaymentMethodGroup>({
      CASH: new FormControl<number>({ value: 0, disabled: false }, { nonNullable: true }),
      CARD: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
      ONLINE: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
      TRANSFER: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
    }),
  });

  @Input() mode: 'PAYMENT' | 'ORDER' = 'PAYMENT';
  @Input() isClearable: boolean = false;
  @Input() order: OrderDetail | null = null;

  @Output() addPaymentToOrder = new EventEmitter<CreateOrderPaymentPayload>();
  @Output() createOrderPayment = new EventEmitter<CreateOrderPaymentPayload>();
  @Output() clearCustomerFromOrder = new EventEmitter<void>();
  @Output() setCustomerToOrder = new EventEmitter<SearchCustomer>();

  constructor(
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    this.paymentChanged()
  }

  ngOnChanges(changes: SimpleChanges) {
    const orderChange = changes['order'];
    if (orderChange && orderChange.currentValue) {
      this.loadOrder(orderChange.currentValue);
    }
  }

  private loadOrder(res: OrderDetail) {
    this.currentOrder.set(res);
    if (this.mode === 'ORDER') {
      this.orderItems.set(res.items);
      this.totalAmount.set(res.items.reduce((total, item) => total + (item.retailPrice * item.quantity), 0));
    } else {
      this.totalAmount.set(res.totalAmount);
    }
    if (res.customer && res.customer.id && res.customer.user) {
      this.customer.set({ label: res.customer.user.fullName + ' ' + this.formatPhoneNumber(res.customer.user.phone), name: res.customer.user.fullName, id: res.customer.id, phone: this.formatPhoneNumber(res.customer.user.phone) });
    }
    if (this.mode === 'ORDER') {
      this.saleAmount.set(res.items.reduce((total, item) => total + (item.sale * item.quantity), 0));
    }
    if (res.payments && res.payments.length > 0) {
      this.paymentAmounts.set(res.payments.reduce((total, payment) => total + +payment.amount, 0));
    }
  }

  private paymentChanged() {
    const methodControls = this.paymentForm.get('method') as FormGroup<PaymentMethodGroup>;
    const validMethods: PaymentMethod[] = ['CASH', 'CARD', 'ONLINE', 'TRANSFER'];
    this.paymentForm.get('paymentMethod')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((methods) => {
      validMethods.forEach(method => {
        methodControls.get(method)!.disable({ onlySelf: true });
      })
      methods.forEach(method => {
        methodControls.get(method as keyof PaymentMethodGroup)!.enable({ onlySelf: true });
      })
    });
  }

  private formatPhoneNumber(phone: string): string {
    const code = phone?.slice(4, 6);
    const prefix = phone?.slice(6, 9);
    const firstPart = phone?.slice(9, 11);
    const secondPart = phone?.slice(11, 13);
    return `+998 (${code}) ${prefix}-${firstPart}-${secondPart}`;
  }


  submit() {
    if (this.paymentForm.valid) {
      const order = this.currentOrder();
      if (!order) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order ID is missing' });
        console.error('Order ID is missing');
        return;
      }
      const { paymentMethod, method } = this.paymentForm.value;
      const customer = this.customer();
      const paymentData: CreateOrderPaymentPayload = {
        orderId: order.id,
        customerId: customer ? customer.id : null,
        payments: []
      }

      const payments = paymentMethod!.map(m => {
        const type = m === 'CASH' ? PaymentType.CASH : m === 'CARD' ? PaymentType.CARD : m === 'TRANSFER' ? PaymentType.TRANSFER : PaymentType.ONLINE;
        const amount = method![m as keyof PaymentMethodGroup]!;
        const paymentPayload: OrderPaymentPayload = {
          type,
          amount
        }
        return paymentPayload;
      }).filter(p => p.amount > 0);
      paymentData.payments = payments;

      if (order.payments && order.payments.length > 0) {
        this.addPaymentToOrder.emit(paymentData);
        this.paymentForm.reset({ paymentMethod: ['CASH'], method: { CASH: 0, CARD: 0, ONLINE: 0, TRANSFER: 0 } });
        return;
      }
      this.paymentForm.reset({ paymentMethod: ['CASH'], method: { CASH: 0, CARD: 0, ONLINE: 0, TRANSFER: 0 } });
      this.createOrderPayment.emit(paymentData);
    }
  }

  getTranslateText(translate: string, value: string): string {
    if (translate.includes('.')) {
      return value
    }
    return translate
  }

  hasAccess(order: OrderDetail, action: 'RETURN' | 'CREATE' | 'DELETE'): boolean {
    if (action === 'RETURN') {
      if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.DEBT) {
        return true;
      }
    }
    return false;
  }

  handleCustomerSelect(customer: SearchCustomer | null) {
    if (!customer) {
      this.clearCustomerFromOrder.emit();
      return;
    }
    this.customer.set(customer);
    this.setCustomerToOrder.emit(customer);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
