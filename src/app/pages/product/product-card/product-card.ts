import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Attribute, AttributeItem, Product, ProductDetail } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { ImageModule } from 'primeng/image';
import { delay, switchMap } from 'rxjs';
import { CategoryService } from '../../service/category.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
type AttrItemList = Attribute & { items: AttributeItem[] };

interface AttributeFormValue {
  name: FormControl<string | null>,
  value: FormControl<AttributeItem[] | null>
}
interface FormStructure {
  [key: string]: FormGroup<AttributeFormValue>
}
@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    ButtonModule,
    ImageModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  providers: []
})
export class ProductCard implements OnInit {
  productCard = signal<ProductDetail | null>(null);
  attributes = signal<AttrItemList[]>([]);
  attributeForm = new FormGroup<FormStructure>({});

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public productService: ProductService,
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef
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

  valueChanges(value: string) {
    this.attributeForm.controls[value].valueChanges.subscribe(val => {
      console.log(val.value);
    })
  }

  fetchProductById(productId: string) {
    this.productService.getProductById(productId)
      .pipe(
        switchMap((product: ProductDetail) => {
          if (!product) {
            throw new Error('Product not found');
          }
          this.productCard.set(product);
          const attributeList = product.attributes.map(attr => ({ ...attr, items: [] } as AttrItemList));
          this.attributes.set(attributeList);
          const attributeIds = product.attributes.map(attr => attr.id);
          this.makeAttributeForm(product.attributes);

          return this.categoryService.getAttributeItems(attributeIds.join(','));
        }),
      )
      .subscribe({
        next: (attributes) => {
          const map = new Map<string, AttributeItem[]>();
          attributes.forEach(attr => {
            const existingItems = map.get(attr.attributeId) || [];
            map.set(attr.attributeId, [...existingItems, attr]);
          });
          const updAttr = this.attributes();
          const updList = updAttr.map(attr => {
            const items = map.get(attr.id) || [];
            return { ...attr, items: items } as AttrItemList;
          });
          this.attributes.set(updList);

        },
        error: (err) => {
          console.error('Error fetching product:', err);
          this.router.navigate(['/pages/product/list']);
        }
      })
  }


  getImageUrl(product: ProductDetail): string {
    return product.images.length ? product.images[0].url : '/no_image.svg';
  }

  makeAttributeForm(attributes: Attribute[]) {
    attributes.forEach(attr => {
      this.attributeForm.addControl(attr.id, new FormGroup({
        name: new FormControl<string>(attr.name),
        value: new FormControl<AttributeItem[]>([], [Validators.required])
      }));
      this.valueChanges(attr.id);
    })
  }

  getAttributeControl(id: string) {
    const control = this.attributeForm.get(id) as FormGroup<AttributeFormValue>;
    return control.value.value as AttributeItem[];
  }


  clearForm() {
    this.attributeForm.reset();
  }

  submit() {
    console.log(this.attributeForm.value);

  }
}
