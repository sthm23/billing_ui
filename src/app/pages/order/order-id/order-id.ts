import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { OrderChannel, OrderDetail2, OrderStatus } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { OrderItem } from '../../../shared/components/order-item/order-item';
import { InputText } from "primeng/inputtext";
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-order-id',
  imports: [
    DividerModule,
    OrderItem,
    InputText,
    ButtonModule,
    CurrencyPipe,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './order-id.html',
  styleUrl: './order-id.css',
})
export class OrderId implements OnInit {
  currentOrder = signal<OrderDetail2 | null>({
    id: '',
    channel: OrderChannel.POS,
    status: OrderStatus.CREATED,
    totalAmount: 520000,
    totalSale: 200000,
    createdAt: '',
    items: [
      {
        quantity: 2,
        variantId: 'variant-123',
        price: 100000,
        id: 'order-item-123',
        sale: 0
      },
      {
        id: 'order-item-1323',
        quantity: 32,
        variantId: 'variant-1323',
        price: 210000,
        sale: 0
      },
      {
        quantity: 12,
        variantId: 'variant-1223',
        price: 110000,
        sale: 0,
        id: 'order-item-1223',
      }
    ]
  } as any);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
  ) { }

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
        // this.currentOrder.set(res);
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/pages/order/list']);
      }
    });
  }
}
