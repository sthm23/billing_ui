import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Attribute, AttributeItem, CreateProductVariantPayload, Product, ProductDetail } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { ImageModule } from 'primeng/image';
import { delay, Subject, switchMap, takeUntil } from 'rxjs';
import { CategoryService } from '../../service/category.service';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { CarouselModule } from 'primeng/carousel';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { AuthService } from '../../auth/service/auth';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { Menu, MenuModule } from 'primeng/menu';
import { Table, TableModule } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';

type AttrItemList = Attribute & { items: AttributeItem[] };

type AttrSelectionControls = Record<string, FormControl<AttributeItem[]>>;

type VariantAttr = {
  attributeId: string;
  attributeName: string;
  itemId: string;
  itemName: string;
};

type VariantForm = {
  key: FormControl<string>;
  attrs: FormControl<VariantAttr[]>;
  quantity: FormControl<number | null>;
  price: FormControl<number | null>;
  salePrice: FormControl<number | null>;
  barCode: FormControl<string | null>;
};
@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    ButtonModule,
    ImageModule,
    ReactiveFormsModule,
    CarouselModule,
    InputTextModule,
    FluidModule,
    InputNumberModule,
    ToastModule,
    DividerModule,
    TableModule,
    FormsModule,
    BadgeModule,
    MenuModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule, InputIconModule, ToolbarModule,
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  providers: [MessageService]
})
export class ProductCard implements OnInit, OnDestroy {
  productCard = signal<ProductDetail | null>(null);
  attributes = signal<AttrItemList[]>([]);

  toggleInput = false



  selectedProduct!: Product;
  actionBtns: MenuItem[] = [
    {
      label: 'View', icon: 'pi pi-eye',
      command: () => {
        setTimeout(() => {
          this.goToProductView(this.selectedProduct);
        }, 350)
      }
    },
    {
      label: 'Edit', icon: 'pi pi-pencil', command: () => {
        setTimeout(() => {
          this.goToAddItems(this.selectedProduct);
        }, 350)
      }
    },
    // { label: 'Delete', icon: 'pi pi-trash', command: (event) => this.deleteProduct(this.selectedProduct) },
  ];
  products: Product[] = []
  first = signal(0);
  rows = 10;
  total = signal(0);

  @ViewChild('dt') dataTable!: Table;

  public appStore = inject(AppStore);

  // 1) attributes - выбранные значения по каждому атрибуту (color, size, ...)
  // 2) variants - строки (комбинации) с quantity/price/salePrice
  form = new FormGroup({
    attributes: new FormGroup<AttrSelectionControls>({} as AttrSelectionControls),
    variants: new FormArray<FormGroup<VariantForm>>([])
  });

  get attrGroup() {
    return this.form.controls.attributes;
  }

  get variantsArray() {
    return this.form.controls.variants;
  }

  destroyer$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private messageService: MessageService,
    private cdRef: ChangeDetectorRef
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
          // наполняем items для каждого атрибута
          const map = new Map<string, AttributeItem[]>();
          items.forEach(item => {
            const existing = map.get(item.attributeId) || [];
            map.set(item.attributeId, [...existing, item]);
          });

          const updList = this.attributes().map(attr => {
            const attrItems = map.get(attr.id) || [];
            return { ...attr, items: attrItems } as AttrItemList;
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


  clearForm() {
    Object.values(this.attrGroup.controls).forEach((c) => c.setValue([]));
  }

  submit() {
    // итог: variants содержит комбинации + quantity/price/salePrice
    console.log(this.form.value);
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
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

  goToAddItems(product: Product) {
    this.router.navigate(['/pages/product', product.id, 'add-items']);
  }

  productQuantity(product: Product): number {
    return product.variants.reduce((total, variant) => total + variant.quantity, 0);
  }

  toggleAction(event: Event, menu: Menu, product: Product) {
    this.selectedProduct = product;
    menu.toggle(event);
  }
}
