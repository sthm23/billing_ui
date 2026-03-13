import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { delay } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductService } from '../service/product.service';
import { Product } from '../../../models/product.model';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    BadgeModule,
    ImageModule,
    ConfirmDialogModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService]
})
export class ProductList implements OnInit, OnDestroy {
  selectedProduct!: Product;
  products = signal<Product[]>([]);
  first = signal(0);
  rows = 10;
  total = signal(0);

  @ViewChild('dt') dataTable!: Table;

  private productService = inject(ProductService)
  public appStore = inject(AppStore);
  public messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);


  constructor(private router: Router) { }

  ngOnInit() {
    this.fetchProducts(this.first() / this.rows + 1, this.rows);
  }

  fetchProducts(page = 1, pageSize = 10) {
    this.appStore.startLoader();
    this.productService.getProducts(page, pageSize)
      .pipe(
        delay(1500)
      ).subscribe({
        next: (response) => {
          this.appStore.stopLoader();
          this.products.set(response.data);
          this.total.set(response.total);
        },
        error: (err) => {
          this.appStore.stopLoader();
          console.error('Error fetching products:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch products' });
        }
      });
  }

  pageChange(event: any) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchProducts(this.first() / this.rows + 1, this.rows);
  }

  getSeverity(variants: number) {
    if (variants > 10) {
      return 'success';
    } else if (variants > 5) {
      return 'warn';
    } else {
      return 'danger';
    }
  }

  getProductImg(product: Product): string {
    return product.images.length > 0 ? product.images[0].url : '/no_image.svg';
  }

  productQuantity(product: Product): number {
    return product.variants.reduce((total, variant) => total + variant.quantity, 0);
  }

  archive(event: Event, product: Product) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
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
        this.appStore.startLoader();
        this.productService.archiveProduct(product.id).subscribe({
          next: () => {
            this.appStore.stopLoader();
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Product archived successfully' });
            this.fetchProducts(this.first() / this.rows + 1, this.rows);
          },
          error: (err) => {
            this.appStore.stopLoader();
            console.error('Error archiving product:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to archive product' });
          }
        });

      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      }
    });


  }

  selectProduct(product: Product) {
    this.router.navigate(['/pages/product/view', product.id]);
  }

  goToCreateProduct() {
    this.router.navigate(['/pages/product/create']);
  }

  ngOnDestroy() {
    this.appStore.stopLoader();
  }
}
