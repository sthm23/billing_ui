import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Order, OrderParams, OrderStatus } from '../../../models/order.model';
import { AuthService } from '../../auth/service/auth';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TagModule } from "primeng/tag";
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { TranslateService } from '../../../shared/services/translate.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { OrderService } from '../../order/services/order-service';

@Component({
  selector: 'app-debitor-list',
  imports: [
    CurrencyPipe,
    TableModule,
    ButtonModule,
    TagModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    ConfirmDialogModule,
    TranslocoPipe,
    DatePipe,
    AutoCompleteModule,
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
  providers: [ConfirmationService]
})
export class DebitorList implements OnInit {
  debitors = signal<Order[]>([])
  selectedOrder: Order | null = null;
  storeId: string = '';

  loader = signal(false);
  first = signal(1);
  rows = 10;
  total = signal(0);

  today = new Date();
  rangeDates: Date[] | null = null;

  debitorsSearchResult = signal<{ createdAt: string, id: string, total: string }[]>([]);

  @ViewChild('dt') dataTable!: Table;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmService: ConfirmationService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
    this.loader.set(true);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.staff) {
      this.storeId = currentUser.staff.storeId;
    }
    this.loadOrders()
  }

  private loadOrders(params: OrderParams = {}) {
    const {
      currentPage = this.first(),
      pageSize = this.rows,
      status = [OrderStatus.DEBT],
      fromDate,
      toDate,
      search
    } = params;
    this.orderService.getOrders({
      currentPage,
      pageSize,
      status,
      fromDate,
      toDate,
      search
    }).subscribe({
      next: (res) => {
        this.loader.set(false);
        this.debitors.set(res.data)
        this.total.set(+res.total);
      },
      error: (err) => {
        this.loader.set(false);
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to load orders' })
      }
    })
  }

  pageChange(event: TablePageEvent) {
    this.loader.set(true);
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    const params: OrderParams = {
      currentPage: this.first() / this.rows + 1,
      pageSize: this.rows
    }
    this.loadOrders(params);
  }

  getSeverity(status: OrderStatus) {
    switch (status) {
      case OrderStatus.HOLD:
        return 'contrast';
      case OrderStatus.CREATED:
        return 'info';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.DEBT:
        return 'danger';
      case OrderStatus.REFUNDED:
        return 'warn';
      default:
        return null;
    }
  }

  selectOrder(order: Order) {

    switch (order.status) {
      case OrderStatus.COMPLETED:
        this.router.navigate(['/pages/order/payment', order.id])
        return;
      case OrderStatus.CREATED:
        this.router.navigate(['/pages/order', order.id])
        return;
      case OrderStatus.DEBT:
        this.router.navigate(['/pages/order/payment', order.id])
        return;
      case OrderStatus.HOLD:
        this.router.navigate(['/pages/order', order.id])
        return;
      case OrderStatus.REFUNDED:
        this.router.navigate(['/pages/order/return', order.id])
        return;
      default:
        return;
    }
  }

  getTranslatedText(translate: string, value: string): string {
    if (translate.includes('.')) {
      return value
    }
    return translate
  }

  onRangeSelect() {
    if (this.rangeDates && this.rangeDates[0] && this.rangeDates[1]) {
      const [startDate, endDate] = this.rangeDates;
      this.loadOrders({
        status: [OrderStatus.DEBT],
        fromDate: new Date(startDate.setHours(0, 0, 0, 0)),
        toDate: new Date(endDate.setHours(23, 59, 59, 999))
      });
    }
  }

  selectSearchOption(option: AutoCompleteSelectEvent) {
    const selectedOrder = option.value;
    const orders = this.debitorsSearchResult();
    const matchedOrder = orders.find(order => order.id === selectedOrder.id);
    if (matchedOrder) {
      this.selectOrder(matchedOrder as unknown as Order);
    }
  }
  search(event: AutoCompleteCompleteEvent) {
    const search = event.query;
    this.orderService.searchOrders(
      search
    ).subscribe({
      next: (res) => {
        const orders = res.map((order, i) => {
          return {
            id: order.id,
            createdAt: order.createdAt,
            total: order.totalAmount.toLocaleString('en-US'),
            status: order.status,
            label: `${order.customer.user.fullName} - ${order.customer.user.phone} - ${new Date(order.createdAt).toLocaleDateString()} - ${(+order.totalAmount).toLocaleString(undefined, { compactDisplay: 'short' })}`
          }
        })
        this.debitorsSearchResult.set(orders);
      },
      error: (err) => {
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to load orders' })
      }
    })
  }

  clearFilter() {
    this.rangeDates = null;
    this.loadOrders({
      status: [OrderStatus.DEBT]
    });
  }
}
