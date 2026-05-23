import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { CreateOrderPaymentPayload, OrderDetail, OrderDetailItem, OrderStatus } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TranslocoPipe } from '@ngneat/transloco';
import { SearchCustomer } from "../../../shared/components/customer-search/customer-search";
import { PaymentOperation } from '../../../shared/components/payment-operation/payment-operation';

@Component({
  selector: 'app-create-order-payment',
  imports: [
    DividerModule,
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    TranslocoPipe,
    PaymentOperation
  ],
  templateUrl: './create-order-payment.html',
  styleUrl: './create-order-payment.css',
  providers: []
})
export class CreateOrderPayment implements OnInit {
  orderItems = signal<OrderDetailItem[]>([]);
  currentOrder = signal<OrderDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No order ID provided in route' });
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/order/list']);
    }
  }

  private loadOrder(orderId: string) {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.currentOrder.set(res);
        this.orderItems.set(res.items);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to load order' });
        this.router.navigate(['/pages/order/list']);
      }
    });
  }

  addPaymentToOrder(id: string, data: CreateOrderPaymentPayload) {
    this.orderService.addPaymentToOrder(id, data).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        this.router.navigate(['/pages/order/list']);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to add payment to order' });
      }
    });
  }

  createOrderPayment(id: string, data: CreateOrderPaymentPayload) {
    this.orderService.createOrderPayment(id, data).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        this.router.navigate(['/pages/order/list']);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create payment' });
      }
    })
  }

  clearCustomerFromOrder(orderId: string) {
    this.orderService.clearCustomerFromOrder(orderId).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Customer cleared from order' });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to clear customer from order' });
      },
    });
  }

  setCustomerToOrder(orderId: string, customer: SearchCustomer) {
    this.orderService.setCustomerToOrder({ orderId, customerId: customer.id }).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to set customer to order' });
      }
    })
  }

  backOrderList() {
    this.router.navigate(['/pages/order/list']);
  }

  goToReturn(orderId: string) {
    this.router.navigate(['/pages/order/return', orderId]);
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
}
