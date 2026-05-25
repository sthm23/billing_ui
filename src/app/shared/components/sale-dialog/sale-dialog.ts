import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';

export type SaleType = 'PRICE' | 'UPGRADE';
export interface SaleDialogOutput {
  visible: boolean;
  price: number;
  sale: number;
  saleType: SaleType;
}

interface SaleDialogForm {
  value: FormControl<SaleType>;
  currentSale: FormControl<number>;
  newPrice: FormControl<number>;
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
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './sale-dialog.html',
  styleUrl: './sale-dialog.css',
})
export class SaleDialog implements OnChanges, OnInit {
  stateOptions = [
    { label: 'UZS', value: 'PRICE', icon: 'pi pi-arrow-down', color: 'color: var(--p-red-500)' },
    { label: 'UZS', value: 'UPGRADE', icon: 'pi pi-arrow-up', color: 'color: var(--p-green-500)' },
  ]
  error: string | null = null;

  form = new FormGroup<SaleDialogForm>({
    value: new FormControl<SaleType>('PRICE', { nonNullable: true, validators: [Validators.required] }),
    currentSale: new FormControl<number>(0, {
      nonNullable: true, validators: [Validators.required, Validators.min(0)]
    }),
    newPrice: new FormControl<number>(0, {
      nonNullable: true, validators: [Validators.required, Validators.min(0)]
    })
  })

  @Input() price: number = 0;
  @Input() sale: number = 0;
  @Input() visible = false;
  @Input() mode: 'ALL' | 'ONE' = 'ALL';

  @Output() visibleChange = new EventEmitter<SaleDialogOutput>();

  constructor() { }

  ngOnInit() {
    this.form.get('value')!.valueChanges.subscribe((value) => {
      const currentSale = this.form.get('currentSale')!.value;
      this.handleSale(value!, currentSale!);
    });
    this.form.get('currentSale')!.valueChanges.subscribe((currentSale) => {
      const value = this.form.get('value')!.value;
      this.handleSale(value, currentSale!);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const priceChange = changes['price'];
    const saleChange = changes['sale'];
    const modeChange = changes['mode'];
    this.form.reset({ value: 'PRICE', currentSale: this.sale, newPrice: this.price });

    if (priceChange && priceChange.currentValue) {
      const newPrice = priceChange.currentValue as number;
      const formPrice = this.form.get('newPrice');
      formPrice!.setValue(newPrice);
    }

    if (saleChange && saleChange.currentValue) {
      const newSale = saleChange.currentValue as number;
      const formSale = this.form.get('currentSale');
      formSale!.setValue(newSale);
    }

    if (modeChange && modeChange.currentValue) {
      const newMode = modeChange.currentValue as 'ALL' | 'ONE';
      this.stateOptions = this.makeSelectValue(newMode);
    }
  }

  closeModal(event: boolean) {
    const formValue = this.form.value;
    this.visibleChange.emit({ visible: event, price: 0, sale: 0, saleType: formValue.value! });
  }

  save() {
    if (this.form.valid) {
      const { value, currentSale, newPrice } = this.form.value;
      this.visibleChange.emit({
        visible: false,
        price: newPrice!,
        sale: currentSale!,
        saleType: value!
      })
    }
  }

  handleSale(value: SaleType, currentSale: number) {
    switch (value) {
      case 'PRICE':
        const newPrice = this.price - currentSale!;
        this.form.get('newPrice')!.setValue(newPrice);
        break;

      case 'UPGRADE':
        const newPriceUpgrade = +this.price + +currentSale!;
        this.form.get('newPrice')!.setValue(newPriceUpgrade);
        break;

    }
  }

  private makeSelectValue(mode: 'ALL' | 'ONE') {
    if (mode === 'ALL') {
      return this.stateOptions;
    } else {
      return this.stateOptions.filter(option => option.value === 'PRICE');
    }
  }

  get selectValue() {
    return this.form.get('value')!.value;
  }

  get currentSale() {
    return this.form.get('currentSale')!.value;
  }

  get newPrice() {
    return +this.form.get('newPrice')!.value;
  }
}
