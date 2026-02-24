import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProductService } from '../service/product.service';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../service/category.service';
import { Attribute, AttributeItem, ProductDetail } from '../../../models/product.model';
import { switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Image, ImageModule } from "primeng/image";
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { SelectButtonModule } from 'primeng/selectbutton';



type AttrItemList = Attribute & { items: AttributeItem[] };
@Component({
  selector: 'app-edit-product',
  imports: [
    ToastModule,
    ButtonModule,
    ImageModule,
    ColorPickerModule,
    TagModule,
    DividerModule,
    AccordionModule,
    SelectButtonModule,
    FormsModule
  ],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
  providers: [MessageService]
})
export class EditProduct implements OnInit, OnDestroy {

  productCard = signal<ProductDetail | null>(null);
  attributes = signal<AttrItemList[]>([]);
  colorsMap = new Map<string, string>([
    ['red', '#ff0000'],
    ['green', '#00ff00'],
    ['blue', '#0000ff'],
    ['yellow', '#ffff00'],
    ['black', '#000000'],
    ['white', '#ffffff'],
    ['orange', '#ffa500'],
    ['purple', '#800080'],
    ['pink', '#ffc0cb'],
    ['gray', '#808080'],
  ]);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
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
    this.productService.getProductById(productId)
      .pipe(
        switchMap((product: ProductDetail) => {
          if (!product) throw new Error('Product not found');

          this.productCard.set(product);

          const attributeList = product.attributes.map(attr => ({ ...attr, items: [] } as AttrItemList));
          this.attributes.set(attributeList);

          const attributeIds = product.attributes.map(attr => attr.id);

          return this.categoryService.getAttributeItems(attributeIds.join(','));
        }),
      )
      .subscribe({
        next: (items) => {
          const map = new Map<string, AttributeItem[]>();
          items.forEach(item => {
            const existing = map.get(item.attributeId) || [];
            map.set(item.attributeId, [...existing, { ...item, value: item.value.toString() }]);
          });

          const updList = this.attributes().map(attr => {
            const attrItems = map.get(attr.id) || [];
            return { ...attr, items: attrItems };
          });
          this.attributes.set(updList);
          console.log(updList);

        },
        error: (err) => {
          console.error('Error fetching product:', err);
          this.router.navigate(['/pages/product/list']);
        }
      })
  }

  goBackToList() {
    this.router.navigate(['/pages/product/list']);
  }

  ngOnDestroy(): void {
    this.messageService.clear();
  }
}
