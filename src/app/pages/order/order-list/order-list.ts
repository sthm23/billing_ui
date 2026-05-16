import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { OrderService } from '../services/order-service';
import { CreateOrderPayload, Order, OrderChannel, OrderParams, OrderStatus } from '../../../models/order.model';
import { AuthService } from '../../auth/service/auth';
import { UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TagModule } from "primeng/tag";
import { delay } from 'rxjs';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { Warehouse } from '../../../models/store.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoPipe } from '@ngneat/transloco';
import { TranslateService } from '../../../shared/services/translate.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AppStore } from '../../../store/app.store';

@Component({
  selector: 'app-order-list',
  imports: [
    CurrencyPipe,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectButtonModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    DrawerModule,
    SelectModule,
    ConfirmDialogModule,
    TranslocoPipe,
    DatePipe,
    AutoCompleteModule,
    ToggleButtonModule,
    ReactiveFormsModule,
    DatePicker
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
  providers: [MessageService, ConfirmationService]
})
export class OrderList implements OnInit {
  appStore = inject(AppStore);
  orders = signal<Order[]>([])
  visibleDrawer = signal(false);
  selectedOrder: Order | null = null;
  warehouseId: string = '';
  storeId: string = '';
  warehouse = signal<Warehouse[]>([])
  first = signal(1);
  rows = 10;
  total = signal(0);

  today = new Date();
  rangeDates: Date[] | null = null;

  orderSearchResult = signal<{ createdAt: string, id: string, total: string }[]>([]);

  checked = new FormControl(false);

  @ViewChild('dt') dataTable!: Table;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmService: ConfirmationService,
    private translateService: TranslateService,
  ) {
    this.checked.valueChanges.subscribe(value => {
      if (value) {
        this.loadOrders({ status: [OrderStatus.COMPLETED] })
      } else {
        this.loadOrders({ status: [OrderStatus.CREATED, OrderStatus.HOLD] })
      }
    });
  }

  ngOnInit() {

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.staff) {
      const warehouses = currentUser.staff.warehouse.map(w => ({ ...w.warehouse }));
      this.warehouse.set(warehouses);
      this.storeId = currentUser.staff.storeId;
    }
    this.loadOrders()
  }

  private loadOrders(params: OrderParams = {}) {
    this.appStore.startLoader();
    const {
      currentPage = this.first(),
      pageSize = this.rows,
      status = [OrderStatus.CREATED, OrderStatus.HOLD],
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
        this.appStore.stopLoader();
        this.orders.set(res.data)
        this.total.set(+res.total);
      },
      error: (err) => {
        this.appStore.stopLoader();
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' })
      }
    })
  }

  pageChange(event: TablePageEvent) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    const status = this.checked.value ? [OrderStatus.COMPLETED] : [OrderStatus.CREATED, OrderStatus.HOLD];
    const params: OrderParams = {
      currentPage: this.first() / this.rows + 1,
      pageSize: this.rows,
      status
    }
    this.loadOrders(params);
  }

  createOrder() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not authenticated')
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not authenticated' })
      return
    }
    if (!currentUser.staff) {
      console.error('Only staff can create orders')
      this.messageService.add({ severity: 'error', summary: 'Permission', detail: 'Only staff can create orders' })
      return
    }
    if (currentUser.role === UserRole.ADMIN) {
      console.error('Admin cannot create orders')
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Admin cannot create orders' })
      return
    }
    if (currentUser.staff.warehouse.length === 1) {
      const warehouseId = currentUser.staff.warehouse[0].warehouseId;
      this.proceedCreatingOrder(this.storeId, warehouseId);
      return;
    } else {
      this.visibleDrawer.set(true);
      return;
    }
  }

  handleWarehouseChange() {
    if (this.warehouseId.length > 0) {
      this.visibleDrawer.set(false);
      this.proceedCreatingOrder(this.storeId, this.warehouseId);
    }
  }

  private proceedCreatingOrder(storeId: string, warehouseId: string) {
    const payload: CreateOrderPayload = {
      storeId,
      warehouseId,
      channel: OrderChannel.POS,
    }
    this.appStore.startLoader();
    this.orderService.createOrder(payload).subscribe({
      next: (res) => {
        this.appStore.stopLoader();
        console.log('Order created successfully', res)
        this.router.navigate(['/pages/order', res.id])
      },
      error: (err) => {
        this.appStore.stopLoader();
        console.error('Failed to create order', err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create order' })
      }
    })
  }

  createReturnOrder(id: string) {
    this.router.navigate(['/pages/order/return', id])
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

  confirmDeleteOrder(event: Event, item: Order) {
    const translate = this.translateService.translateObject('order');
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: translate['deleteText'],
      header: translate['deleteTitle'],
      icon: 'pi pi-info-circle',
      rejectLabel: translate['cancel'],
      rejectButtonProps: {
        label: translate['cancel'],
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: translate['delete'],
        severity: 'danger'
      },

      accept: () => {
        this.deleteOrder(item);
      }
    });
  }

  deleteOrder(order: Order) {
    this.appStore.startLoader();
    this.orderService.deleteOrder(order.id).subscribe({
      next: (res) => {
        this.appStore.stopLoader();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Order deleted successfully' });
        this.loadOrders();
      },
      error: (err) => {
        this.appStore.stopLoader();
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to delete order' });
      }
    })

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

  isDisable(order: Order, action: 'RETURN' | 'DELETE'): boolean {
    if (action === 'RETURN') {
      switch (order.status) {
        case OrderStatus.COMPLETED:
          return false;
        case OrderStatus.DEBT:
          return false;
        case OrderStatus.CANCELLED:
        case OrderStatus.HOLD:
        case OrderStatus.CREATED:
        default:
          return true;
      }
    }
    if (action === 'DELETE') {
      switch (order.status) {
        case OrderStatus.CREATED:
          return false;
        case OrderStatus.HOLD:
          return false;
        case OrderStatus.DEBT:
        case OrderStatus.COMPLETED:
        case OrderStatus.CANCELLED:
        default:
          return true;
      }
    }
    return false;
  }

  goToReturnPage(order: Order) {
    this.router.navigate(['/pages/order/return', order.id])
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
      const status = this.checked.value ? [OrderStatus.COMPLETED] : [OrderStatus.CREATED, OrderStatus.HOLD];
      this.loadOrders({
        fromDate: new Date(startDate.setHours(0, 0, 0, 0)),
        toDate: new Date(endDate.setHours(23, 59, 59, 999)),
        status: status
      });

    }
  }

  selectSearchOption(option: AutoCompleteSelectEvent) {
    const selectedOrder = option.value;
    const orders = this.orderSearchResult();
    const matchedOrder = orders.find(order => order.id === selectedOrder.id);
    if (matchedOrder) {
      this.selectOrder(matchedOrder as unknown as Order);
    }
  }
  search(event: AutoCompleteCompleteEvent) {
    this.appStore.startLoader();
    const search = event.query;
    this.orderService.searchOrders(
      search
    ).subscribe({
      next: (res) => {
        this.appStore.stopLoader();
        const orders = res.map((order, i) => {
          return {
            id: order.id,
            createdAt: order.createdAt,
            total: order.totalAmount.toLocaleString('en-US'),
            status: order.status,
            label: `${order.customer.user.fullName} - ${order.customer.user.phone} - ${new Date(order.createdAt).toLocaleDateString()} - ${(+order.totalAmount).toLocaleString(undefined, { compactDisplay: 'short' })}`
          }
        })
        this.orderSearchResult.set(orders);
      },
      error: (err) => {
        this.appStore.stopLoader();
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' })
      }
    })
  }
}
