import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { OrderService } from '../services/order-service';
import { CreateOrderPayload, Order, OrderChannel, OrderStatus } from '../../../models/order.model';
import { AuthService } from '../../auth/service/auth';
import { UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurrencyPipe } from '@angular/common';
import { TagModule } from "primeng/tag";
import { Menu, MenuModule } from 'primeng/menu';
import { delay } from 'rxjs';
import { OrderFilter } from './order-filter/order-filter';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-order-list',
  imports: [
    CurrencyPipe,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    MenuModule,
    OrderFilter,
    SelectButtonModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
  providers: [MessageService]
})
export class OrderList implements OnInit {
  menuItems: MenuItem[] = [
    {
      label: 'View', icon: 'pi pi-eye',
      command: () => {
        setTimeout(() => {
          // this.goToOrderView(this.selectedOrder()!);
        }, 350)
      }
    },
    {
      label: 'Edit', icon: 'pi pi-pencil', command: () => {
        setTimeout(() => {
          // this.goToEditOrder(this.selectedOrder()!);
        }, 350)
      }
    },
    {
      label: 'Delete', icon: 'pi pi-trash', command: () => {
        // this.deleteOrder(this.selectedOrder()!)
      }
    },
  ];
  orders = signal<Order[]>([])
  selectedOrder: Order | null = null;

  stateOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'On hold', value: 'ON_HOLD' },
    { label: 'Debt', value: 'DEPT' },
    { label: 'Canceled', value: 'CANCELED' }
  ];

  @ViewChild('menu') menu!: Menu;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadOrders()
  }

  private loadOrders() {
    this.orderService.getOrders().pipe(
      delay(500) // Simulate network delay
    ).subscribe({
      next: (res) => {
        this.orders.set(res.data)
      },
      error: (err) => {
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load orders' })
      }
    })
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
    const payload: CreateOrderPayload = {
      storeId: currentUser.staff.storeId,
      warehouseId: currentUser.staff.warehouse.id,
      channel: OrderChannel.POS,
    }
    this.orderService.createOrder(payload).subscribe({
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
