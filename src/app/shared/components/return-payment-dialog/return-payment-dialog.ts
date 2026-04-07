import { CurrencyPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageModule } from 'primeng/message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type PaymentMethod = 'CASH' | 'CARD';
type PaymentMethodGroup = { [key in PaymentMethod]: FormControl<number> };
type PaymentMethodControl = { value: PaymentMethod, disabled: boolean, label: string }

export interface PaymentDialogOutput {
  visible: boolean;
  price: number;
  saleType: PaymentMethod;
  prevPrice: number;
}
@Component({
  selector: 'app-return-payment-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    SelectButtonModule,
    ReactiveFormsModule,
    MessageModule
  ],
  templateUrl: './return-payment-dialog.html',
  styleUrl: './return-payment-dialog.css',
})
export class ReturnPaymentDialog implements OnChanges {
  stateOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' }
  ]

  paymentForm = new FormGroup({
    paymentMethod: new FormControl<string[]>(["CASH"], { nonNullable: true, validators: [Validators.required] }),
    method: new FormGroup<PaymentMethodGroup>({
      CASH: new FormControl<number>({ value: 0, disabled: false }, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      CARD: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    }),
  });


  @Input() returnAmount: number = 0;
  @Input() visible = false;
  @Output() close = new EventEmitter<boolean>();
  @Output() data = new EventEmitter<PaymentDialogOutput>();


  constructor() {
    const validMethods: PaymentMethod[] = ['CASH', 'CARD'];
    const methodControls = this.paymentForm.get('method') as FormGroup<PaymentMethodGroup>;

    this.paymentForm.get('paymentMethod')?.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((methods) => {
      validMethods.forEach(method => {
        methodControls.get(method)!.disable({ onlySelf: true });
      })
      methods.forEach(method => {
        methodControls.get(method as keyof PaymentMethodGroup)!.enable({ onlySelf: true });
      })
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const returnAmountChange = changes['returnAmount'];
    if (returnAmountChange) {
      this.paymentForm.get('method')?.get('CASH')?.setValue(this.returnAmount);
    }
  }

  closeModal(event: boolean) {
    this.close.emit(event);
  }

  save() {
    console.log(this.paymentForm.value);

    if (this.paymentForm.valid) {
      this.close.emit(false);
    }
  }

  isValid(method: PaymentMethod) {
    const control = this.paymentForm.get('method')?.get(method);
    return control?.invalid && (control.dirty || control.touched);
  }

}
