import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { OrderService } from '../services/order-service';
import { CreateOrderPayload, Order, OrderChannel, OrderStatus } from '../../../models/order.model';
import { AuthService } from '../../auth/service/auth';
import { UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurrencyPipe } from '@angular/common';
import { TagModule } from "primeng/tag";
import { delay } from 'rxjs';
import { OrderFilter } from './order-filter/order-filter';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { Warehouse } from '../../../models/store.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-order-list',
  imports: [
    CurrencyPipe,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    OrderFilter,
    SelectButtonModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    DrawerModule,
    SelectModule,
    ConfirmDialogModule,
    TranslocoPipe
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
  providers: [MessageService, ConfirmationService]
})
export class OrderList implements OnInit {
  orders = signal<Order[]>([])
  visibleDrawer = signal(false);
  selectedOrder: Order | null = null;
  warehouseId: string = '';
  storeId: string = '';
  warehouse = signal<Warehouse[]>([])
  stateOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'On hold', value: 'ON_HOLD' },
    { label: 'Debt', value: 'DEPT' },
    { label: 'Canceled', value: 'CANCELED' }
  ];
  selectedStatus: string = 'ALL';

  loader = signal(false);
  first = signal(1);
  rows = 10;
  total = signal(0);


  @ViewChild('dt') dataTable!: Table;

  constructor(
    private orderService: OrderService,
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

  private loadOrders(page = 1, pageSize = 10) {
    this.orderService.getOrders(page, pageSize).pipe(
      delay(500) // Simulate network delay
    ).subscribe({
      next: (res) => {
        this.loader.set(false);
        this.orders.set(res.data)
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
    this.loadOrders(this.first() / this.rows + 1, this.rows);
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
    this.orderService.createOrder(payload).pipe(
      delay(500) // Simulate network delay
    ).subscribe({
      next: (res) => {
        console.log('Order created successfully', res)
        this.router.navigate(['/pages/order', res.id])
      },
      error: (err) => {
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
      case OrderStatus.CANCELLED:
        return 'danger';
      case OrderStatus.CREATED:
        return 'info';
      case OrderStatus.COMPLETED:
        return 'success';
      case OrderStatus.DEBT:
        return 'warn';
      default:
        return null;
    }
  }

  confirmDeleteOrder(event: Event, item: Order) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Disable Confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger'
      },

      accept: () => {
        this.deleteOrder(item);
      }
    });
  }

  deleteOrder(order: Order) {
    this.orderService.deleteOrder(order.id).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Order deleted successfully' });
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to delete order' });
      }
    })

  }

  selectOrder(order: Order) {

    if (order.status === OrderStatus.COMPLETED) {
      this.router.navigate(['/pages/order/return', order.id])
    } else if (order.status === OrderStatus.CANCELLED) {
      //view mode
    } else if (order.status === OrderStatus.DEBT) {
      this.router.navigate(['/pages/order/payment', order.id])
    } else if (order.status === OrderStatus.HOLD) {
      //edit mode
      this.router.navigate(['/pages/order', order.id])
    } else {
      this.router.navigate(['/pages/order', order.id])
    }

  }
}
