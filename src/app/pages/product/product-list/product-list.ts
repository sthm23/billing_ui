import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { delay } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductService } from '../service/product.service';
import { Product } from '../../../models/product.model';
import { BadgeModule } from 'primeng/badge';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    BadgeModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = []
  first = signal(0);
  rows = 10;
  total = signal(0);

  @ViewChild('dt') dataTable!: Table;

  private productService = inject(ProductService)
  public appStore = inject(AppStore);
  public messageService = inject(MessageService);

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
          this.products = response.data;
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

  goToProductView(product: Product) {
    this.router.navigate(['/pages/product', product.id]);
  }

  ngOnDestroy() {
    this.appStore.stopLoader();
  }
}
