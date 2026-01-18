import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { ApiService } from '../../../shared/service/api.service';
import { delay } from 'rxjs';
import { Product } from '../../service/product.service';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = []
  first = signal(0);
  rows = 10;
  total = signal(0);

  @ViewChild('dt') dataTable!: Table;

  private apiService = inject(ApiService)
  public appStore = inject(AppStore);

  constructor() { }

  ngOnInit() {
    // this.fetchProducts(this.first() / this.rows + 1, this.rows);
  }

  fetchProducts(page = 1, pageSize = 10) {
    this.appStore.startLoader();
    this.apiService.getProducts(page, pageSize)
      .pipe(
        delay(1500)
      ).subscribe({
        next: (response) => {
          this.appStore.stopLoader();
          this.products = response.data;
          this.total.set(response.totalItems);
        },
        error: (err) => {
          this.appStore.stopLoader();
          console.error('Error fetching products:', err);
        }
      });
  }

  pageChange(event: any) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchProducts(this.first() / this.rows + 1, this.rows);
  }

  ngOnDestroy() {
    this.appStore.stopLoader();
  }
}
