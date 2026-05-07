import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MessageModule } from 'primeng/message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslocoPipe } from '@ngneat/transloco';

type PaymentMethod = 'CASH' | 'CARD';
type PaymentMethodGroup = { [key in PaymentMethod]: FormControl<number> };
export type ReturnPaymentData = { [key in PaymentMethod]: number };

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
    MessageModule,
    FloatLabelModule,
    TranslocoPipe
  ],
  templateUrl: './return-payment-dialog.html',
  styleUrl: './return-payment-dialog.css',
})
export class ReturnPaymentDialog implements OnChanges {
  private readonly validMethods: PaymentMethod[] = ['CASH', 'CARD'];

  stateOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' }
  ]

  paymentForm = new FormGroup({
    paymentMethod: new FormControl<PaymentMethod[]>(['CASH'], { nonNullable: true, validators: [Validators.required] }),
    method: new FormGroup<PaymentMethodGroup>({
      CASH: new FormControl<number>({ value: 0, disabled: false }, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
      CARD: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    }),
  });


  @Input() returnAmount: number = 0;
  @Input() visible = false;
  @Output() close = new EventEmitter<boolean>();
  @Output() data = new EventEmitter<ReturnPaymentData>();


  constructor() {
    this.methodGroup.setValidators(this.totalAmountValidator());
    this.updateAmountValidators();
    this.applyMethodState(this.selectedMethodsControl.value);

    this.selectedMethodsControl.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((methods) => {
      this.applyMethodState(methods);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const returnAmountChange = changes['returnAmount'];
    if (returnAmountChange) {
      this.updateAmountValidators();
      this.paymentForm.get('method')?.get('CASH')?.setValue(this.returnAmount);
      this.paymentForm.get('method')?.get('CARD')?.setValue(0);
      this.methodGroup.updateValueAndValidity();
    }
  }

  closeModal(event: boolean) {
    this.close.emit(event);
  }

  save() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const paymentData = this.paymentForm.get('method')?.value;
    if (paymentData) {
      this.data.emit(paymentData);
    }
    this.close.emit(false);
  }

  isValid(method: PaymentMethod) {
    const control = this.paymentForm.get('method')?.get(method);
    return control?.invalid && (control.dirty || control.touched);
  }

  getControlError(method: PaymentMethod): string {
    const control = this.methodGroup.get(method);
    if (!control || !this.isValid(method)) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Поле обязательно';
    }
    if (control.hasError('min')) {
      return 'Сумма должна быть больше 0';
    }
    if (control.hasError('max')) {
      return `Сумма не должна превышать ${this.returnAmount}`;
    }

    return 'Некорректное значение';
  }

  getTotalError(): string {
    const errors = this.methodGroup.errors;
    if (!errors) {
      return '';
    }

    if (errors['totalExceeded']) {
      return `Общая сумма не должна превышать ${this.returnAmount}`;
    }

    return '';
  }

  showTotalError(): boolean {
    return !!this.methodGroup.errors && (this.methodGroup.dirty || this.methodGroup.touched);
  }

  private get selectedMethodsControl(): FormControl<PaymentMethod[]> {
    return this.paymentForm.controls.paymentMethod;
  }

  private get methodGroup(): FormGroup<PaymentMethodGroup> {
    return this.paymentForm.controls.method;
  }

  private applyMethodState(methods: PaymentMethod[]): void {
    this.validMethods.forEach((method) => {
      this.methodGroup.get(method)?.disable({ onlySelf: true });
    });

    methods.forEach((method) => {
      this.methodGroup.get(method)?.enable({ onlySelf: true });
    });

    this.methodGroup.updateValueAndValidity();
  }

  private updateAmountValidators(): void {
    this.validMethods.forEach((method) => {
      const control = this.methodGroup.get(method);
      control?.setValidators([Validators.required, Validators.min(1), Validators.max(this.returnAmount)]);
      control?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });
  }

  private totalAmountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup<PaymentMethodGroup>;
      const selectedMethods = this.selectedMethodsControl.value;

      if (!selectedMethods?.length) {
        return { totalMismatch: true };
      }

      const total = selectedMethods.reduce((sum, method) => {
        return sum + (group.get(method)?.value ?? 0);
      }, 0);

      if (total > this.returnAmount) {
        return { totalExceeded: true };
      }

      return null;
    };
  }

}
