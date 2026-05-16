import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CashTransactionCategory, CashTransactionType, TransactionPayload } from '../../../../models/payment.model';
import { PaymentType } from '../../../../models/order.model';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslocoPipe } from '@ngneat/transloco';
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-incoming-expense-dialog',
  imports: [
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    InputNumberModule,
    TranslocoPipe,
    TagModule
  ],
  templateUrl: './incoming-expense-dialog.html',
  styleUrl: './incoming-expense-dialog.css',
})
export class IncomingExpenseDialog implements OnChanges {
  form = new FormGroup({
    amount: new FormControl(0, [Validators.required, Validators.min(1)]),
    comment: new FormControl('', [Validators.required]),
    type: new FormControl(CashTransactionType.EXPENSE, [Validators.required]),
    category: new FormControl(CashTransactionCategory.OTHER, [Validators.required]),
    paymentType: new FormControl(PaymentType.CASH, [Validators.required]),
    orderId: new FormControl('')
  })

  categories = [
    {
      label: CashTransactionCategory.SALE, value: CashTransactionCategory.SALE
    },
    {
      label: CashTransactionCategory.DEBT_PAYMENT, value: CashTransactionCategory.DEBT_PAYMENT
    },
    {
      label: CashTransactionCategory.RENT, value: CashTransactionCategory.RENT
    },
    {
      label: CashTransactionCategory.DELIVERY, value: CashTransactionCategory.DELIVERY
    },
    {
      label: CashTransactionCategory.SALARY, value: CashTransactionCategory.SALARY
    },
    {
      label: CashTransactionCategory.PURCHASE, value: CashTransactionCategory.PURCHASE
    },
    {
      label: CashTransactionCategory.RETURN, value: CashTransactionCategory.RETURN
    },
    {
      label: CashTransactionCategory.OTHER, value: CashTransactionCategory.OTHER
    }
  ]
  types = [
    {
      label: PaymentType.CASH, value: PaymentType.CASH
    },
    {
      label: PaymentType.CARD, value: PaymentType.CARD
    },
    {
      label: PaymentType.ONLINE, value: PaymentType.ONLINE
    },
    {
      label: PaymentType.TRANSFER, value: PaymentType.TRANSFER
    }
  ]


  @Input({ required: true }) type: CashTransactionType = CashTransactionType.EXPENSE;
  @Input() title: string = '';
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() data = new EventEmitter<TransactionPayload>();

  ngOnChanges(changes: SimpleChanges) {
    const typeChanged = changes['type'];
    if (typeChanged && typeChanged.currentValue) {
      const type = typeChanged.currentValue as CashTransactionType;
      this.form.patchValue({ type });
    }
  }

  toggleDialog(visible: boolean) {
    this.visibleChange.emit(visible);
    if (this.form.valid) {
      const payload: TransactionPayload = {
        type: this.form.value.type || CashTransactionType.EXPENSE,
        category: this.form.value.category || CashTransactionCategory.OTHER,
        paymentType: this.form.value.paymentType || PaymentType.CASH,
        amount: this.form.value.amount || 0,
        comment: this.form.value.comment || '',
        orderId: this.form.value.orderId || null
      }
      this.data.emit(payload);
    }

  }
}
