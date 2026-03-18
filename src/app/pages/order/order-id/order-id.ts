import { Component, effect, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../services/order-service';
import { CreateOrderItemPayload, OrderDetail, OrderItemCard, OrderItemPayload } from '../../../models/order.model';
import { DividerModule } from 'primeng/divider';
import { OrderItem, OrderItemAmountChange } from '../../../shared/components/order-item/order-item';
import { ButtonModule } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../product/service/product.service';
import { ProductVariant } from '../../../models/product.model';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/types/autocomplete';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from "@angular/forms";
import { FluidModule } from 'primeng/fluid';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SaleDialog, SaleDialogOutput } from '../../../shared/components/sale-dialog/sale-dialog';



@Component({
  selector: 'app-order-id',
  imports: [
    DividerModule,
    OrderItem,
    ButtonModule,
    CurrencyPipe,
    AutoCompleteModule,
    FluidModule,
    FormsModule,
    ToastModule,
    SaleDialog
  ],
  templateUrl: './order-id.html',
  styleUrl: './order-id.css',
  providers: [MessageService]
})
export class OrderId implements OnInit {
  searchResults = signal<ProductVariant[]>([]);
  searchValue = '';

  totalAmount = signal<number>(0);
  saleAmount = signal<number>(0);
  orderItems = signal<OrderItemCard[]>([]);

  currentOrder = signal<OrderDetail | null>(null);

  saleDialogVisible = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private messageService: MessageService
  ) {
    effect(() => {
      this.totalAmount.set(this.orderItems().reduce((total, item) => total + (item.price * item.quantity), 0));
      this.saleAmount.set(this.orderItems().reduce((total, item) => total + (item.sale * item.quantity), 0));
      [this.orderItems()]
    });
  }

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      console.error('No order ID provided in route');
      this.router.navigate(['/pages/order/list']);
    }
  }

  private loadOrder(orderId: string) {
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.currentOrder.set(res);
        if (res.items && res.items.length > 0) {
          const items = res.items.map(item => ({
            itemId: item.id,
            id: item.variantId,
            name: `${item.variant.sku} - ${item.variant.barCode}`,
            stock: +item.variant.quantity,
            price: +item.retailPrice - item.sale,
            quantity: +item.quantity,
            sale: +item.sale,
            costAtSale: +item.costAtSale
          }));
          this.orderItems.set(items)
        }
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/pages/order/list']);
      }
    });
  }

  search(event: AutoCompleteCompleteEvent) {
    const text = event.query
    if (text && text.length > 3) {
      this.productService.searchProducts(text).subscribe({
        next: (res) => {
          const searchResults = res.data.map(variant => {
            return {
              ...variant,
              name: `${variant.sku} - ${variant.barCode} - ${variant.quantity} in stock - SUM${variant.price}`
            };
          }).filter(variant => variant.name.toLowerCase().includes(text.toLowerCase()));

          this.searchResults.set(searchResults);
        },
        error: (err) => {
          console.error(err);
        }
      })
    }
  }

  selectSearchOption(option: AutoCompleteSelectEvent) {
    const variant = option.value as ProductVariant & { name: string };
    const orderItem: OrderItemCard = {
      stock: variant.quantity,
      quantity: 1,
      name: variant.name,
      price: variant.price,
      costAtSale: +variant.stockMovements.filter(movement => movement.type === 'IN')[0]?.unitCost || 0,
      id: variant.id,
      sale: 0
    }
    const added = this.handleAddItem(orderItem);
    if (added) {
      this.orderItems.update(items => [...items, orderItem]);
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Item already added' });
    }
    this.searchValue = '';
    this.searchResults.set([]);
  }

  removeItem(itemId: string) {
    this.orderItems.update(items => items.filter(item => item.id !== itemId));
  }

  handleAddItem(orderItem: OrderItemCard) {
    const items = this.orderItems();
    if (items.some(item => item.id === orderItem.id)) {
      return false;
    }
    return true;
  }

  handleAmountChange({ quantity, type, sale = 0 }: OrderItemAmountChange, itemId: string) {
    if (type === 'decrement' || type === 'increment') {
      this.orderItems.update(items => items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      }));

    } else {
      this.orderItems.update(items => items.map(item => {
        if (item.id === itemId) {
          return { ...item, sale };
        }
        return item;
      }));
    }
  }

  holdOrder() {
    const result$ = this.saveOrderItems();
    if (!result$) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save order items' });
      return;
    }
    result$.subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Proceed to payment' });
        this.router.navigate(['/pages/order/list']);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to proceed to payment' });
      },
    });
  }

  goToPayment() {
    const order = this.currentOrder();
    if (!order) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Order not found' });
      return;
    }
    const result$ = this.saveOrderItems();
    if (!result$) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save order items' });
      return;
    }
    result$.subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Proceed to payment' });
        this.router.navigate(['/pages/order/payment', order.id]);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message || 'Failed to proceed to payment' });
      },
    });
  }

  setPriceSale() {
    this.saleDialogVisible = true;
  }

  private saveOrderItems() {
    const order = this.currentOrder();
    if (!order) {
      return;
    }
    const orderItems: OrderItemPayload[] = this.orderItems().map(item => ({
      itemId: item.itemId || undefined,
      variantId: item.id,
      quantity: item.quantity,
      retailPrice: +item.price,
      sale: item.sale,
      costAtSale: item.costAtSale
    }));
    if (orderItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No items in the order' });
      return;
    }
    const payload: CreateOrderItemPayload = {
      orderId: order.id,
      customerId: null,
      items: orderItems
    }
    return this.orderService.createOrderItems(payload);
  }

  handleSaleDialogChange(event: SaleDialogOutput) {
    this.saleDialogVisible = event.visible;
    if (event.price > 0 && event.sale > 0 && event.prevSale === 0) {
      const currentOrderItems = this.orderItems();
      const updatedItems = currentOrderItems.map(item => {
        return {
          ...item,
          sale: (event.sale / currentOrderItems.length) / item.quantity
        };
      });
      this.orderItems.set(updatedItems);

    } else if (event.price > 0 && event.sale > 0 && event.prevSale > 0) {
      const currentOrderItems = this.orderItems();
      const updatedItems = currentOrderItems.map(item => {
        return {
          ...item,
          sale: (event.sale / currentOrderItems.length) / item.quantity
        };
      });
      this.orderItems.set(updatedItems);
    }
  }

  backToList() {
    this.router.navigate(['/pages/order/list']);
  }

  resetDiscount() {
    const items = this.orderItems().map(item => ({ ...item, sale: 0 }));
    this.orderItems.set(items);
  }
}
