import { Component, effect, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { OrderDetail, OrderItemCard, OrderPaymentPayload, OrderStatus, PaymentType, ReturnOrderItemPayload } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { OrderItem, OrderItemAmountChange } from '../../../shared/components/order-item/order-item';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FluidModule } from 'primeng/fluid';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslocoPipe } from '@ngneat/transloco';
import { ReturnPaymentData, ReturnPaymentDialog } from '../../../shared/components/return-payment-dialog/return-payment-dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TranslateService } from '../../../shared/services/translate.service';

@Component({
  selector: 'app-order-return',
  imports: [
    DividerModule,
    OrderItem,
    ButtonModule,
    CurrencyPipe,
    AutoCompleteModule,
    FluidModule,
    ToastModule,
    TranslocoPipe,
    ReturnPaymentDialog,
    ConfirmDialogModule,
    TagModule
  ],
  templateUrl: './order-return.html',
  styleUrl: './order-return.css',
  providers: [MessageService, ConfirmationService]
})
export class OrderReturn implements OnInit {

  totalAmount = signal<number>(0);
  customerPayment = signal<number>(0);
  cashierPayment = signal<number>(0);
  saleAmount = signal<number>(0);
  debt = signal<number>(0);
  orderItems = signal<OrderItemCard[]>([]);

  currentOrder = signal<OrderDetail | null>(null);
  returnPayments = signal<OrderPaymentPayload[]>([]);

  returnPaymentDialogVisible = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {
    effect(() => {
      this.totalAmount.set(this.orderItems().reduce((total, item) => total + (item.price * item.quantity), 0));
      this.saleAmount.set(this.orderItems().reduce((total, item) => total + (item.sale * item.quantity), 0));
      [this.orderItems()]
    });
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/order/list']);
    }
  }

  private loadOrder(orderId: string) {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.currentOrder.set(res);
        if (res.items && res.items.length > 0) {
          const items = res.items.map(item => ({
            itemId: item.id,
            id: item.variantId,
            name: `${item.variant.sku} - ${item.variant.barCode}`,
            stock: +item.quantity,
            price: +item.retailPrice,
            quantity: 0,
            sale: +item.sale,
            costAtSale: +item.costAtSale
          }));
          this.debt.set(res.totalAmount - res.paidAmount);
          this.orderItems.set(items)
        }
        if (res.payments && res.payments.length > 0) {
          const totalPayment = res.payments.reduce((total, payment) => total + +payment.amount, 0);
          this.customerPayment.set(totalPayment);
        }
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/pages/order/list']);
      }
    });
  }

  handleAmountChange({ quantity, type, sale = 0 }: OrderItemAmountChange, itemId: string) {
    if (type === 'decrement' || type === 'increment') {
      this.orderItems.update(items => items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      }));

    } else {
      this.orderItems.update(items => items.map(item => {
        if (item.id === itemId) {
          return { ...item, sale };
        }
        return item;
      }));
    }
  }

  submit() {
    const order = this.currentOrder();
    if (!order) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order not found' });
      return;
    }
    const payments = this.returnPayments();
    if (!payments) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid payment data' });
      return;
    }
    const returnItems = this.orderItems().filter(item => item.quantity > 0).map(item => ({
      itemId: item.itemId!,
      quantity: +item.quantity,
      sale: +item.sale,
      retailPrice: +item.price,
      costAtSale: +item.costAtSale
    }));

    this.confirmSave({
      orderId: order.id,
      items: returnItems,
      returnPayments: payments
    });


  }

  confirmSave(data: ReturnOrderItemPayload) {
    const translate = this.translate.translateObject('order');
    this.confirmationService.confirm({
      message: 'Are you confirm this order return?',
      header: translate['confirmTitle'],
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: translate['cancel'],
      rejectButtonProps: {
        label: translate['cancel'],
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: translate['return'],
        severity: 'danger'
      },
      accept: () => {
        this.orderService.returnOrder(data).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Return processed successfully' });
            this.router.navigate(['/pages/order/list']);
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to process return' });
          }
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: 'Return cancelled' });
      }
    });
  }

  setReturnPayment() {
    this.returnPaymentDialogVisible = true;
  }

  backToList() {
    this.router.navigate(['/pages/order/list']);
  }

  handleReturnPaymentDialogChange(event: ReturnPaymentData) {
    const payments = Object.entries(event).map(([method, amount]) => ({
      type: method as PaymentType,
      amount: +amount
    }));
    this.returnPayments.set(payments);
    const totalReturnPayment = payments.reduce((total, payment) => total + payment.amount, 0);
    this.cashierPayment.set(totalReturnPayment);
  }

  returnAmount() {
    const order = this.currentOrder()
    if (order && order.status === 'DEBT') {
      const returnAmount = this.totalAmount() - this.saleAmount() - this.debt();
      return returnAmount < 0 ? 0 : returnAmount;
    }
    return this.totalAmount() - this.saleAmount();
  }

  translateOrderText(translate: string, text: string) {
    if (translate.includes('.')) {
      return text
    }
    return translate
  }

  getSeverity(status: OrderStatus) {
    switch (status) {
      case OrderStatus.HOLD:
        return 'contrast';
      case OrderStatus.CREATED:
        return 'info';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.DEBT:
        return 'danger';
      case OrderStatus.REFUNDED:
        return 'warn';
      default:
        return null;
    }
  }
}
