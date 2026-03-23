import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Attribute, AttributeItem, CreateProductVariantPayload, Product, ProductDetail, ProductVariant, TagList } from '../../../models/product.model';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../service/product.service';
import { ImageModule } from 'primeng/image';
import { delay, of, Subject, switchMap, takeUntil } from 'rxjs';
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
import { Table, TableModule, TableRowCollapseEvent } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { DialogComponent } from '../../../shared/components/dialog/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';

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
    TagModule,
    IconFieldModule,
    InputIconModule,
    ToolbarModule,
    SelectModule,
    RouterModule,
    TreeSelectModule,
    MultiSelectModule,
    DialogComponent,
    ChipModule,
    TextareaModule,
    AvatarModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  providers: [MessageService]
})
export class ProductCard implements OnInit, OnDestroy {
  productCard = signal<ProductDetail | null>(null);
  attributes = signal<AttrItemList[]>([]);
  categories = signal<MultiSelectType[]>([])
  brands = signal<SelectType[]>([])
  tags = signal<SelectType[]>([])

  visibleAddVariants = false
  expandedRows: any = {};

  productAttributes = new Map<string, AttrItemList>();
  productTags = new Map<string, TagList>();
  editMode = false;

  productForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    description: new FormControl<string | null>(null),
    images: new FormControl<any[] | null>(null),
    category: new FormControl<MultiSelectType | null>(null, [Validators.required]),
    brand: new FormControl<SelectType | null>(null),
    store: new FormControl<string | null>(null, [Validators.required]),
    attributes: new FormControl<SelectType[] | null>(null),
    tags: new FormControl<SelectType[] | null>(null)
  })

  @ViewChild('dt') dataTable!: Table;

  public appStore = inject(AppStore);

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

          this.productForm.patchValue({
            name: product.name,
            description: product.description,
            category: product.category ? { label: product.category, key: product.category } : null,
            brand: product.brand ? { name: product.brand, id: product.brand } : null,
            store: product.storeId,
            attributes: product.attributes.map(attr => ({ name: attr.name, id: attr.id })),
            tags: product.tags.map(tag => ({ name: tag.tagName, id: tag.id, label: tag.value }))
          })

          const attrMap = new Map<string, AttrItemList>();
          product.attributes.forEach(attr => attrMap.set(attr.id, { ...attr, items: [] }));
          product.variants.forEach(variant => {
            variant.attributes.forEach(attrItem => {
              const attr = attrMap.get(attrItem.attributeId);
              if (attr) {
                const map = new Map(attr.items.map(i => [i.id, i]));
                map.set(attrItem.id, attrItem);
                const obj = { ...attr, items: Array.from(map.values()) };
                attrMap.set(attrItem.attributeId, obj);
              }
            });
          });

          this.productAttributes = attrMap;
          const tagMap = new Map<string, TagList>();
          product.tags.forEach(tag => {
            if (!tagMap.has(tag.tagId)) {
              tagMap.set(tag.tagId, { id: tag.tagId, name: tag.tagName, values: [] });
            }
            const tagObj = tagMap.get(tag.tagId)!;
            if (!tagObj.values.find(v => v.id === tag.id)) {
              tagObj.values.push({ id: tag.id, tagId: tag.tagId, value: tag.value });
            }
          });
          this.productTags = tagMap;
          this.productCard.set(product);

          const attributeList = product.attributes.map(attr => ({ ...attr, items: [] } as AttrItemList));
          this.attributes.set(attributeList);

          const attributeIds = product.attributes.map(attr => attr.id);

          // return this.categoryService.getAttributeItems(attributeIds.join(','));
          return of(null).pipe(delay(1000)); // имитация запроса, удалить после реализации получения атрибутов
        }),
      )
      .subscribe({
        next: (items) => {
          // наполняем items для каждого атрибута
          // const map = new Map<string, AttributeItem[]>();
          // items.forEach(item => {
          //   const existing = map.get(item.attributeId) || [];
          //   map.set(item.attributeId, [...existing, item]);
          // });

          // const updList = this.attributes().map(attr => {
          //   const attrItems = map.get(attr.id) || [];
          //   return { ...attr, items: attrItems } as AttrItemList;
          // });
          // this.attributes.set(updList);

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

  addVariants(variants: ProductVariant[]) {
    this.visibleAddVariants = false;
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

  goBack() {
    this.router.navigate(['/pages/product/list']);
  }


  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
