import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    ButtonModule,
    ImageModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  providers: []
})
export class ProductCard implements OnInit {
  productCard = signal<Product>({} as Product);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.fetchProductById(productId);
      } else {
        this.router.navigate(['/pages/product/list']);
      }

    })
  }

  fetchProductById(productId: string) {
    this.productService.getProductById(productId).subscribe({
      next: (product: Product) => {
        console.log(product);
        this.productCard.set(product)
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.router.navigate(['/pages/product/list']);
      }
    })
  }

  getSeverity(status: string) {
    switch (status) {
      case 'INSTOCK':
        return 'success';
      case 'LOWSTOCK':
        return 'warn';
      case 'OUTOFSTOCK':
        return 'danger';
      default:
        return 'success';
    }
  }

  getImageUrl(product: Product): string {
    return product.images.length ? product.images[0].url : '/no_image.svg';
  }
}
