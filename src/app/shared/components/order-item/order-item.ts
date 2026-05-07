import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { type OrderItemCard } from '../../../models/order.model';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { Counter } from '../counter/counter';
import { CurrencyPipe, NgClass } from '@angular/common';
import { SaleDialog, SaleDialogOutput } from '../sale-dialog/sale-dialog';
import { TagModule } from 'primeng/tag';

export interface OrderItemAmountChange { price: number, quantity: number, sale: number, prevSale?: number, type?: 'increment' | 'decrement' }
@Component({
  selector: 'app-order-item',
  imports: [
    DividerModule,
    Counter,
    ButtonModule,
    InputNumberModule,
    FluidModule,
    FormsModule,
    CurrencyPipe,
    SaleDialog,
    TagModule,
    NgClass
  ],
  templateUrl: './order-item.html',
  styleUrl: './order-item.css',
})
export class OrderItem implements OnChanges {
  isPriceChangeDialogVisible = false;
  counter = signal(0);
  price = signal(0);
  sale = signal(0);

  @Input() type: 'RETURN' | 'SALE' = 'SALE';
  @Input() orderItem?: OrderItemCard;
  @Output() delete = new EventEmitter<void>();
  @Output() amountChange = new EventEmitter<OrderItemAmountChange>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    const orderItemChange = changes['orderItem'];
    if (orderItemChange && orderItemChange.currentValue) {
      const orderItem = orderItemChange.currentValue as OrderItemCard;
      this.counter.set(orderItem.quantity);
      this.price.set(orderItem.price);
      this.sale.set(orderItem.sale);
    }
  }

  removeItem() {
    this.delete.emit();
  }

  handleCounter({ type, count }: { type: 'increment' | 'decrement', count: number }) {
    this.counter.set(count);
    this.amountChange.emit({ type, price: this.price(), quantity: this.counter(), sale: this.sale() });
  }

  handlePrice(event: SaleDialogOutput) {
    this.isPriceChangeDialogVisible = event.visible;
    if (event.prevSale) {
      this.sale.set(event.sale);
      this.amountChange.emit({
        price: event.price,
        quantity: this.counter(),
        sale: this.sale(),
        prevSale: event.prevSale
      });
      return
    }
    if (event.sale) {
      this.sale.set(event.sale);
      this.amountChange.emit({ price: event.price, quantity: this.counter(), sale: this.sale() });
    }
  }
}
