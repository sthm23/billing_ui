import { Component, signal, ViewChild } from '@angular/core';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { Warehouse } from '../../../models/store.model';
import { AuthService } from '../../auth/service/auth';
import { PaymentService } from '../payment-service';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CashboxStatus, Payment } from '../../../models/payment.model';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-payment-list',
  imports: [
    TableModule,
    FormsModule,
    TranslocoPipe,
    AutoCompleteModule,
    InputGroupModule,
    InputTextModule,
    DatePickerModule,
    DrawerModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    CurrencyPipe,
    SelectModule,
    ToastModule,
    DatePipe
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
  providers: [MessageService, ConfirmationService]
})
export class PaymentList {

  payments = signal<Payment[]>([])

  visibleDrawer = signal(false);
  selectedPayment: Payment | null = null;
  warehouseId: string = '';
  storeId: string = '';
  warehouse = signal<Warehouse[]>([])

  loader = signal(false);
  first = signal(1);
  rows = 10;
  total = signal(0);

  today = new Date();
  rangeDates: Date[] | null = null;

  debitorsSearchResult = signal<{ createdAt: string, id: string, total: string }[]>([]);

  @ViewChild('dt') dataTable!: Table;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmService: ConfirmationService
  ) { }


  ngOnInit() {
    this.loader.set(true);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.staff) {
      const warehouses = currentUser.staff.warehouse.map(w => ({ ...w.warehouse }));
      this.warehouse.set(warehouses);
      this.storeId = currentUser.staff.storeId;
    }
    this.loadOrders()
  }


  private loadOrders(params: any = {}) {
    const {
      currentPage = this.first(),
      pageSize = this.rows,
      // status = [Payments],
      fromDate,
      toDate,
      search
    } = params;
    this.paymentService.getPayments({
      currentPage,
      pageSize,
      // status,
      fromDate,
      toDate,
      search
    }).subscribe({
      next: (res) => {
        this.loader.set(false);
        this.payments.set(res.data)
        this.total.set(+res.total);
      },
      error: (err) => {
        this.loader.set(false);
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' })
      }
    })
  }

  pageChange(event: TablePageEvent) {
    this.loader.set(true);
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    const params = {
      currentPage: this.first() / this.rows + 1,
      pageSize: this.rows
    }
    this.loadOrders(params);
  }

  getTranslatedText(translate: string, value: string): string {
    if (translate.includes('.')) {
      return value
    }
    return translate
  }

  getSeverity(status: CashboxStatus) {
    switch (status) {
      case CashboxStatus.OPEN:
        return 'success';
      case CashboxStatus.CLOSED:
        return 'secondary';
      default:
        return null;
    }
  }

  clearFilter() {
    this.rangeDates = null;
    this.debitorsSearchResult.set([]);
    this.loadOrders();
  }

  selectPayment(event: Payment) {
    this.router.navigate(['pages/payments', event.id])
  }

  openCashbox() {
    this.paymentService.openCashbox({
      balance: 0,
      storeId: this.storeId,
      warehouseId: this.warehouseId,
      status: CashboxStatus.OPEN
    }).subscribe({
      next: (res) => {
        this.router.navigate(['pages/payments', res.id])
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to open cashbox' });
      }
    });
  }
}
