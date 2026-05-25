import { Component, inject, OnInit, signal } from '@angular/core';
import { Payment, CashboxTransaction, CashTransactionType, TransactionPayload, CashTransactionCategory } from '../../../models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../payment-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Tag } from "primeng/tag";
import { Button } from "primeng/button";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppStore } from '../../../store/app.store';
import { TableModule, TablePageEvent } from 'primeng/table';
import { Divider } from "primeng/divider";
import { PaymentType } from '../../../models/order.model';
import { IncomingExpenseDialog } from './incoming-expense-dialog/incoming-expense-dialog';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '../../../shared/services/translate.service';


@Component({
  selector: 'app-payment-by-id',
  imports: [
    Tag,
    Button,
    CurrencyPipe,
    TranslocoPipe,
    ConfirmDialogModule,
    DatePipe,
    TableModule,
    Divider,
    IncomingExpenseDialog,
    FormsModule
  ],
  templateUrl: './payment-by-id.html',
  styleUrl: './payment-by-id.css',
  providers: [ConfirmationService]
})
export class PaymentById implements OnInit {
  first = signal(0);
  rows = 10;
  total = signal(0);

  currentCashbox = signal<Payment | null>(null);
  transactions = signal<CashboxTransaction[]>([]);
  outgoingTransactions = signal<CashboxTransaction[]>([]);
  incomingTransactions = signal<CashboxTransaction[]>([]);

  appStore = inject(AppStore)

  visibleExpenseDialog = false;
  transactionType: CashTransactionType = CashTransactionType.EXPENSE;
  paymentMethodTypes = PaymentType;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
    const cashboxId = this.route.snapshot.paramMap.get('id');
    if (cashboxId) {
      this.loadCashbox(cashboxId);
    } else {
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/payments/list']);
    }
  }

  private loadCashbox(cashboxId: string) {
    this.appStore.startLoader();
    this.paymentService.getCashboxById(cashboxId).subscribe({
      next: (res) => {
        this.appStore.stopLoader();
        this.currentCashbox.set(res);
        this.transactions.set(res.transactions);
        this.total.set(res.transactions.length);
        this.outgoingTransactions.set(res.transactions.filter(t => t.type === CashTransactionType.EXPENSE));
        this.incomingTransactions.set(res.transactions.filter(t => t.type === CashTransactionType.INCOME));
      },
      error: (err) => {
        this.appStore.stopLoader();
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error?.message || 'Kassa ma\'lumotlarini olishda xatolik yuz berdi' });
        this.router.navigate(['/pages/payments/list']);
      }
    });
  }

  outgoTotal() {
    return this.outgoingTransactions().reduce((total, t) => total + +t.amount, 0);
  }

  incomeTotal() {
    return this.incomingTransactions().filter(t => t.type === CashTransactionType.INCOME).reduce((total, t) => total + +t.amount, 0);
  }

  incomeTypeTotal(type: PaymentType) {
    return this.incomingTransactions().filter(t => t.paymentType === type).reduce((total, t) => total + +t.amount, 0);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getSeverity(paymentType: string) {
    switch (paymentType) {
      case 'CASH':
        return 'secondary';
      case 'CARD':
        return 'contrast';
      case 'ONLINE':
        return 'info';
      case 'TRANSFER':
        return 'warn';
      default:
        return 'danger';
    }
  }
  goBack() {
    this.router.navigate(['/pages/payments/list']);
  }

  pageChange(event: TablePageEvent) {
    const cashboxTransactions = this.currentCashbox()!.transactions;
    this.first.set(event.first);
    const paginatedTransactions = cashboxTransactions.slice(event.first, event.first + event.rows);
    this.transactions.set(paginatedTransactions);
  }

  getTranslatedText(key: string): string {
    // Implement your translation logic here, for example using Transloco
    return key; // Placeholder, replace with actual translation
  }

  confirmClose(event: Event) {
    const translate = this.translate.translateObject('payment.closeCashboxConfirmation');
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: translate['message'],
      header: translate['title'],
      icon: 'pi pi-info-circle',
      rejectLabel: translate['cancelButton'],
      rejectButtonProps: {
        label: translate['cancelButton'],
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: translate['confirmButton'],
        severity: 'danger'
      },

      accept: () => {
        this.paymentService.closeCashbox(this.currentCashbox()!.id).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'info', summary: 'Tasdiqlandi', detail: 'Kassa yopildi' });
            this.loadCashbox(this.currentCashbox()!.id);
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error?.message || 'Kassani yopishda xatolik yuz berdi' });
          }
        })
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Bekor qilindi', detail: 'Siz bekor qildingiz' });
      }
    });
  }

  createExpense() {
    this.transactionType = CashTransactionType.EXPENSE;
    this.visibleExpenseDialog = true;
  }

  createIncome() {
    this.transactionType = CashTransactionType.INCOME;
    this.visibleExpenseDialog = true;
  }

  handlePaymentTransaction(payload: TransactionPayload) {
    const cashboxId = this.currentCashbox()!.id;
    this.paymentService.addTransaction(cashboxId, payload).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tranzaksiya muvaffaqiyatli qo\'shildi' });
        this.loadCashbox(cashboxId);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Tranzaksiyani qo\'shishda xatolik yuz berdi' });
      }
    });
  }

}
