import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';

export type SaleType = 'PRICE' | 'SALE';
export interface SaleDialogOutput {
  visible: boolean;
  price: number;
  sale: number;
}

@Component({
  selector: 'app-sale-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectButtonModule,
    CurrencyPipe,
    FormsModule,
    NgClass,
    TagModule
  ],
  templateUrl: './sale-dialog.html',
  styleUrl: './sale-dialog.css',
})
export class SaleDialog {
  stateOptions = [
    { label: 'UZS', value: 'PRICE' },
    { label: '%', value: 'SALE' }
  ]
  value: SaleType = 'PRICE';

  salePrice: number = 0;
  newPrice: number = 0;
  salePricePercentage: number = 0;
  error: string | null = null;

  @Input() price: number = 0;
  @Input() sale: number = 0;
  @Input() visible = false;

  @Output() visibleChange = new EventEmitter<SaleDialogOutput>();

  constructor() { }

  closeModal(event: boolean) {
    this.visibleChange.emit({ visible: event, price: 0, sale: 0 });
  }

  save() {
    if (this.newPrice > 0) {
      this.visibleChange.emit({
        visible: false,
        price: this.newPrice,
        sale: this.salePrice
      });
    } else {
      this.error = 'New price must be greater than 0';
    }
  }

  handleSale() {
    if (this.value === 'PRICE') {
      this.newPrice = this.price - this.salePrice;
      const discount = (this.salePrice / this.price) * 100;;
      this.salePricePercentage = Number.parseFloat(discount.toFixed(2));
    } else {
      this.newPrice = Math.round(this.price - (this.price * (this.salePrice / 100)));
      this.salePricePercentage = this.salePrice;
    }
  }
}
