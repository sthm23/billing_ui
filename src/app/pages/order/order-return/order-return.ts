import { Component, effect, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { OrderDetail, OrderItemCard } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { OrderItem, OrderItemAmountChange } from '../../../shared/components/order-item/order-item';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { ProductVariant } from '../../../models/product.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormControl, FormGroup, FormsModule } from "@angular/forms";
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslocoPipe } from '@ngneat/transloco';
import { ReturnPaymentDialog } from '../../../shared/components/return-payment-dialog/return-payment-dialog';


type PaymentMethod = 'CASH' | 'CARD';
type PaymentMethodGroup = { [key in PaymentMethod]: FormControl<number> };
@Component({
  selector: 'app-order-return',
  imports: [
    DividerModule,
    OrderItem,
    ButtonModule,
    CurrencyPipe,
    AutoCompleteModule,
    FluidModule,
    FormsModule,
    ToastModule,
    TranslocoPipe,
    ReturnPaymentDialog
  ],
  templateUrl: './order-return.html',
  styleUrl: './order-return.css',
  providers: [MessageService]
})
export class OrderReturn implements OnInit {
  searchResults = signal<ProductVariant[]>([]);
  searchValue = '';

  totalAmount = signal<number>(0);
  totalPayment = signal<number>(0);
  saleAmount = signal<number>(0);
  orderItems = signal<OrderItemCard[]>([]);

  currentOrder = signal<OrderDetail | null>(null);

  returnPaymentDialogVisible = false;

  paymentForm = new FormGroup({
    paymentMethod: new FormControl<string[]>(['CASH'], { nonNullable: true }),
    method: new FormGroup<PaymentMethodGroup>({
      CASH: new FormControl<number>({ value: 0, disabled: false }, { nonNullable: true }),
      CARD: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
    }),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private messageService: MessageService
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
            stock: +item.quantity, //+item.variant.quantity,
            price: +item.retailPrice,
            quantity: 0,
            sale: +item.sale,
            costAtSale: +item.costAtSale
          }));
          this.orderItems.set(items)
        }
        if (res.payments && res.payments.length > 0) {
          const totalPayment = res.payments.reduce((total, payment) => total + +payment.amount, 0);
          this.totalPayment.set(totalPayment);
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

  }

  setReturnPayment() {
    this.returnPaymentDialogVisible = true;
  }

  backToList() {
    this.router.navigate(['/pages/order/list']);
  }

  handleReturnPaymentDialogChange(event: any) {
    console.log(event);
  }
}
