import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { type OrderItemCard } from '../../../models/order.model';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { FormsModule } from '@angular/forms';
import { Counter } from '../counter/counter';
import { CurrencyPipe } from '@angular/common';
import { SaleDialog, SaleDialogOutput } from '../sale-dialog/sale-dialog';


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
    SaleDialog
  ],
  templateUrl: './order-item.html',
  styleUrl: './order-item.css',
})
export class OrderItem {
  isPriceChangeDialogVisible = false;

  @Input() orderItem?: OrderItemCard;
  @Output() delete = new EventEmitter<void>();

  constructor() { }

  removeItem() {
    this.delete.emit();
  }

  handleSale(event: SaleDialogOutput) {
    this.isPriceChangeDialogVisible = event.visible;
    if (event.sale) {
      // apply sale logic here
      // this.orderItem = {
      //   ...this.orderItem,
      //   price: event.price,
      //   sale: event.sale
      // };
    }
  }
}
