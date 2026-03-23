import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { CreateOrderPaymentPayload, OrderDetail, OrderDetailItem, OrderPayment, OrderPaymentPayload, PaymentType } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DialogComponent, DialogData } from '../../../shared/components/dialog/dialog';
import { UserService } from '../../user/service/user.service';
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Subject, takeUntil } from 'rxjs';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { FluidModule } from 'primeng/fluid';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';


type PaymentMethod = 'CASH' | 'CARD';
type PaymentMethodGroup = { [key in PaymentMethod]: FormControl<number> };

@Component({
  selector: 'app-create-order-payment',
  imports: [
    DividerModule,
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    DialogComponent,
    SelectButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    AutoCompleteModule,
    InputTextModule,
    InputNumberModule,
    ReactiveFormsModule,
    FluidModule,
    ToastModule,
    AccordionModule,
    BadgeModule
  ],
  templateUrl: './create-order-payment.html',
  styleUrl: './create-order-payment.css',
  providers: [MessageService]
})
export class CreateOrderPayment implements OnInit, OnDestroy {
  destroyed$ = new Subject<void>()
  totalAmount = signal<number>(0);
  saleAmount = signal<number>(0);
  paymentAmounts = signal<number>(0);
  orderItems = signal<OrderDetailItem[]>([]);

  currentOrder = signal<OrderDetail | null>(null);
  customer = signal<{ label: string, name: string, id: string, phone: string } | null>(null);

  userSearchResult = signal<{ name: string, id: string, phone: string }[]>([]);

  customerDialogVisible = false;
  customerData: DialogData = { name: '', phone: '' };

  paymentOptions = [
    { label: 'Cash', value: 'CASH', icon: 'pi pi-money-bill' },
    { label: 'Card', value: 'CARD', icon: 'pi pi-credit-card' },
  ];

  paymentForm = new FormGroup({
    paymentMethod: new FormControl<string[]>(['CASH'], { nonNullable: true }),
    method: new FormGroup<PaymentMethodGroup>({
      CASH: new FormControl<number>({ value: 0, disabled: false }, { nonNullable: true }),
      CARD: new FormControl<number>({ value: 0, disabled: true }, { nonNullable: true }),
    }),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private userService: UserService,
    private messageService: MessageService,
  ) { }


  ngOnInit() {
    const methodControls = this.paymentForm.get('method') as FormGroup<PaymentMethodGroup>;
    const validMethods: PaymentMethod[] = ['CASH', 'CARD'];
    this.paymentForm.get('paymentMethod')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((methods) => {
      validMethods.forEach(method => {
        methodControls.get(method)!.disable({ onlySelf: true });
      })
      methods.forEach(method => {
        methodControls.get(method as keyof PaymentMethodGroup)!.enable({ onlySelf: true });
      })
    });


    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No order ID provided in route' });
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/order/list']);
    }
  }

  private loadOrder(orderId: string) {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.currentOrder.set(res);
        this.orderItems.set(res.items);
        this.totalAmount.set(res.items.reduce((total, item) => total + (item.retailPrice * item.quantity), 0));
        if (res.customer && res.customer.id && res.customer.user) {
          this.customer.set({ label: res.customer.user.fullName + ' ' + this.formatPhoneNumber(res.customer.user.phone), name: res.customer.user.fullName, id: res.customer.id, phone: this.formatPhoneNumber(res.customer.user.phone) });
        }
        this.saleAmount.set(res.items.reduce((total, item) => total + (item.sale * item.quantity), 0));
        if (res.payments && res.payments.length > 0) {
          this.paymentAmounts.set(res.payments.reduce((total, payment) => total + +payment.amount, 0));
        }
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/pages/order/list']);
      }
    });
  }

  handleCustomerCreate(data: DialogData) {
    const phone = '+998' + data.phone?.replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '').trim()
    this.userService.createCustomer({ fullName: data.name, phone }).subscribe({
      next: (res) => {
        const phoneTemplate = this.formatPhoneNumber(res.phone);

        this.customer.set({ label: res.fullName + ' ' + phoneTemplate, name: res.fullName, id: res.customer!.id, phone: phoneTemplate });
        this.customerDialogVisible = false;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  private formatPhoneNumber(phone: string): string {
    const code = phone?.slice(4, 6);
    const prefix = phone?.slice(6, 9);
    const firstPart = phone?.slice(9, 11);
    const secondPart = phone?.slice(11, 13);
    return `+998 (${code}) ${prefix}-${firstPart}-${secondPart}`;
  }


  submit() {
    console.log(this.paymentForm.value);
    if (this.paymentForm.valid) {
      const order = this.currentOrder();
      if (!order) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order ID is missing' });
        console.error('Order ID is missing');
        return;
      }
      const { paymentMethod, method } = this.paymentForm.value;
      const customer = this.customer();
      const paymentData: CreateOrderPaymentPayload = {
        orderId: order.id,
        customerId: customer ? customer.id : null,
        payments: []
      }

      const payments = paymentMethod!.map(m => {
        const type = m === 'CASH' ? PaymentType.CASH : m === 'CARD' ? PaymentType.CARD : PaymentType.DEBT;
        const amount = method![m as keyof PaymentMethodGroup]!;
        const paymentPayload: OrderPaymentPayload = {
          type,
          amount
        }
        return paymentPayload;
      }).filter(p => p.type !== PaymentType.DEBT);
      paymentData.payments = payments;

      if (order.payments && order.payments.length > 0) {
        console.log(paymentData);

        this.orderService.addPaymentToOrder(order.id, paymentData).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
            this.router.navigate(['/pages/order/list']);
          },
          error: (err) => {
            console.error(err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to add payment to order' });
          }
        });
        return;
      }

      this.orderService.createOrderPayment(order.id, paymentData).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
          this.router.navigate(['/pages/order/list']);
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to create payment' });
        }
      })
    }
  }
  selectSearchOption(option: AutoCompleteSelectEvent) {
    const selectedUser = option.value;
    const customerList = this.userSearchResult();
    const matchedUser = customerList.find(user => user.id === selectedUser.id);
    const phoneTemplate = this.formatPhoneNumber(matchedUser!.phone);
    this.customer.set({ label: matchedUser?.name + ' ' + phoneTemplate, name: matchedUser?.name || selectedUser.name, id: selectedUser.id, phone: phoneTemplate });
  }
  search(event: AutoCompleteCompleteEvent) {
    const query = event.query;
    this.userService.searchCustomers(query).subscribe({
      next: (res) => {
        const users = res.data.map(user => ({ label: user.fullName + ' ' + this.formatPhoneNumber(user.phone), name: user.fullName, id: user.customer!.id, phone: user.phone }));
        this.userSearchResult.set(users);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  clearCustomer() {
    this.customer.set(null)
  }

  backOrderList() {
    this.router.navigate(['/pages/order/list']);
  }

  goToReturn(orderId: string) {
    this.router.navigate(['/pages/order/return', orderId]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
