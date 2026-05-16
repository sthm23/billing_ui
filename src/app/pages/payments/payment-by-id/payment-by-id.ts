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
import { ToastModule } from 'primeng/toast';
import { AppStore } from '../../../store/app.store';
import { TableModule } from 'primeng/table';
import { Divider } from "primeng/divider";
import { PaymentType } from '../../../models/order.model';
import { IncomingExpenseDialog } from './incoming-expense-dialog/incoming-expense-dialog';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-payment-by-id',
  imports: [
    Tag,
    Button,
    CurrencyPipe,
    TranslocoPipe,
    ConfirmDialogModule,
    ToastModule,
    DatePipe,
    TableModule,
    Divider,
    ToastModule,
    IncomingExpenseDialog,
    FormsModule
  ],
  templateUrl: './payment-by-id.html',
  styleUrl: './payment-by-id.css',
  providers: [MessageService, ConfirmationService]
})
export class PaymentById implements OnInit {
  total = signal<number>(1);
  rows = signal<number>(10);
  currentCashbox = signal<Payment | null>(null);
  outgoingTransactions = signal<CashboxTransaction[]>([]);
  incomingTransactions = signal<CashboxTransaction[]>([]);

  appStore = inject(AppStore)

  visibleExpenseDialog = false;
  transactionType: CashTransactionType = CashTransactionType.EXPENSE;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {

  }

  ngOnInit() {
    const cashboxId = this.route.snapshot.paramMap.get('id');
    if (cashboxId) {
      this.loadOrder(cashboxId);
    } else {
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/order/list']);
    }
  }

  private loadOrder(cashboxId: string) {
    this.paymentService.getCashboxById(cashboxId).subscribe({
      next: (res) => {
        this.currentCashbox.set(res);
        this.outgoingTransactions.set(res.transactions.filter(t => t.type === CashTransactionType.EXPENSE));
        this.incomingTransactions.set(res.transactions.filter(t => t.type === CashTransactionType.INCOME));
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/pages/order/list']);
      }
    });
  }

  outgoTotal() {
    return this.outgoingTransactions().reduce((total, t) => total + +t.amount, 0);
  }

  incomeTotal() {
    return this.incomingTransactions().reduce((total, t) => total + +t.amount, 0);
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

  pageChange(event: any) {
    // Handle pagination change if needed
  }

  getTranslatedText(key: string): string {
    // Implement your translation logic here, for example using Transloco
    return key; // Placeholder, replace with actual translation
  }

  confirmClose(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Kassani yopishni hohlaysizmi?',
      header: 'Kassani yopish',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Bekor qilish',
      rejectButtonProps: {
        label: 'Bekor qilish',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Kassani yopish',
        severity: 'danger'
      },

      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Tasdiqlandi', detail: 'Kassa yopildi' });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Bekor qilindi', detail: 'Siz bekor qildingiz' });
      }
    });
  }

  createExpense() {
    this.transactionType = CashTransactionType.EXPENSE;
    this.visibleExpenseDialog = true;
    console.log(this.visibleExpenseDialog);

  }

  createIncome() {
    this.transactionType = CashTransactionType.INCOME;
    this.visibleExpenseDialog = true;
  }

}
