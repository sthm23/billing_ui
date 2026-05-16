import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoPipe } from '@ngneat/transloco';

export interface VariantData {
  quantity: number;
  price: number;
  costPrice: number;
  variantId: string;
}

@Component({
  selector: 'app-variant-dialog',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    TranslocoPipe,
    ReactiveFormsModule
  ],
  templateUrl: './variant-dialog.html',
  styleUrl: './variant-dialog.css',
})
export class VariantDialog implements OnChanges {

  @Input() visible: boolean = false;

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() variantId: string = '';
  @Input() price: string = '';
  @Input() costPrice: number = 0;

  formData = new FormGroup({
    quantity: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(1)] }),
    price: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(1)] }),
    costPrice: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(1)] }),
  })

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<VariantData>();

  ngOnChanges(changes: SimpleChanges) {
    const { price, costPrice } = changes;
    if (price && price.currentValue) {
      this.formData.get('price')?.setValue(+price.currentValue);
    }
    if (costPrice && costPrice.currentValue) {
      this.formData.get('costPrice')?.setValue(+costPrice.currentValue);
    }
  }

  hideDialog() {
    this.visibleChange.emit(!this.visible);
  }

  submit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }
    this.dataChange.emit({ ...this.formData.value, variantId: this.variantId } as VariantData);
    this.hideDialog();
  }

  isValid(controlName: string): string {
    const control = this.formData.get(controlName);
    return control && control.touched && control.invalid ? 'ng-dirty ng-invalid' : '';
  }
}
