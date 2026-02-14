import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { PhotoService } from '../../service/photo.service';

@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule, ButtonModule, GalleriaModule, ImageModule, TagModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  providers: [PhotoService]
})
export class ProductCard implements OnInit {
  images = signal<any[]>([]);

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '960px',
      numVisible: 4
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private photoService: PhotoService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    // this.photoService.getImages().then((images) => {
    //   this.images.set(images);
    //   console.log(images);

    // });
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
        const imgs = product.images.map(img => ({
          itemImageSrc: img.url,
          thumbnailImageSrc: img.url,
          alt: product.name,
          title: product.name
        }))
        this.images.set([...imgs]);
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
}
