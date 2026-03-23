import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Attribute, AttributeItem, CreateProductVariantPayload, Product, ProductDetail } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../service/product.service';
import { ImageModule } from 'primeng/image';
import { delay, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { CategoryService } from '../../service/category.service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { AuthService } from '../../auth/service/auth';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { Warehouse } from '../../../models/store.model';

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
  selector: 'app-product-variant',
  imports: [
    CommonModule,
    ButtonModule,
    ImageModule,
    ReactiveFormsModule,
    MultiSelectModule,
    InputTextModule,
    FluidModule,
    InputNumberModule,
    ToastModule,
    TagModule,
    DividerModule,
    AvatarModule
  ],
  templateUrl: './product-variant.html',
  styleUrl: './product-variant.css',
  providers: [MessageService]
})
export class ProductVariant implements OnInit, OnDestroy {
  productCard = signal<ProductDetail | null>(null);
  attributes = signal<AttrItemList[]>([]);

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

    // один сабскрайб на все изменения выбора атрибутов
    this.attrGroup.valueChanges
      .pipe(takeUntil(this.destroyer$))
      .subscribe(() => {
        this.rebuildVariantsFromSelection();
      });
  }


  fetchProductById(productId: string) {
    this.productService.getProductById(productId)
      .pipe(
        switchMap((product: ProductDetail) => {
          if (!product) throw new Error('Product not found');

          this.productCard.set(product);

          const attributeList = product.attributes.map(attr => ({ ...attr, items: [] } as AttrItemList));
          this.attributes.set(attributeList);

          // создаём контролы выбора (по одному multiselect на атрибут)
          this.makeAttributeSelectionControls(product.attributes);


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
          // ВАЖНО: после загрузки items можно восстановить выбор + значения variants
          // if (this.productCard()?.variants?.length) {
          //   this.prefillFormFromExistingVariants(this.productCard()!, items);
          // }
        },
        error: (err) => {
          console.error('Error fetching product:', err);
          this.router.navigate(['/pages/product/list']);
        }
      })
  }

  // === 1) создаём multiselect-контролы по атрибутам ===
  private makeAttributeSelectionControls(attributes: Attribute[]) {
    // очистка на случай повторной загрузки
    const existingKeys = Object.keys(this.attrGroup.controls) as any[];

    existingKeys.forEach(k => (this.attrGroup as any).removeControl(k));
    this.variantsArray.clear();

    attributes.forEach(attr => {
      this.attrGroup.addControl(
        attr.id,
        new FormControl<AttributeItem[]>([], { nonNullable: true })
      );
    });
  }

  // === 2) строим variants на основе выбранных item’ов ===
  private rebuildVariantsFromSelection() {
    const attrs = this.attributes();

    // соберём выбранные items по каждому атрибуту
    const selectedByAttr = attrs.map(a => {
      const selected = this.attrGroup.controls[a.id]?.value ?? [];
      return {
        attributeId: a.id,
        attributeName: a.name,
        selectedItems: selected
      };
    });

    // если хочешь создавать варианты ТОЛЬКО когда выбрано по всем атрибутам:
    const allPicked = selectedByAttr.every(x => x.selectedItems.length > 0);
    if (!allPicked) {
      this.variantsArray.clear();
      return;
    }

    // декартово произведение выбранных item’ов
    const combos = this.cartesian(selectedByAttr.map(x =>
      x.selectedItems.map((item) => ({
        attributeId: x.attributeId,
        attributeName: x.attributeName,
        itemId: item.id,
        itemName: item.value
      } as VariantAttr))
    ));

    // синхронизируем FormArray (сохраняя введённые числа по key)
    this.syncVariantsArray(combos);
  }

  private syncVariantsArray(combos: VariantAttr[][]) {
    const existing = new Map<string, FormGroup<VariantForm>>();
    this.variantsArray.controls.forEach(ctrl => existing.set(ctrl.controls.key.value, ctrl));

    const nextControls: FormGroup<VariantForm>[] = [];

    for (const attrs of combos) {
      const key = this.buildVariantKey(attrs);

      const prev = existing.get(key);
      if (prev) {
        // обновим attrs (на случай если имена изменились), но оставим quantity/price/salePrice
        prev.controls.attrs.setValue(attrs);
        nextControls.push(prev);
      } else {
        nextControls.push(this.createVariantGroup(key, attrs));
      }
    }

    // перезаполняем массив в нужном порядке
    this.variantsArray.clear();
    nextControls.forEach(c => this.variantsArray.push(c));
  }

  private createVariantGroup(key: string, attrs: VariantAttr[]) {
    return new FormGroup<VariantForm>({
      key: new FormControl<string>(key, { nonNullable: true }),
      attrs: new FormControl<VariantAttr[]>(attrs, { nonNullable: true }),
      quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      salePrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
      barCode: new FormControl<string | null>(null)
    });
  }

  private buildVariantKey(attrs: VariantAttr[]): string {
    // стабильный ключ, чтобы сохранять введённые значения
    // например: "color=black|size=xl"
    return attrs
      .map(a => `${a.attributeId}=${a.itemId}`)
      .sort()
      .join('|');
  }

  private cartesian<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])),
      [[]]
    );
  }


  clearForm() {
    Object.values(this.attrGroup.controls).forEach((c) => c.setValue([]));
  }

  submit() {
    // итог: variants содержит комбинации + quantity/price/salePrice
    if (this.form.valid) {
      const product = this.productCard()!;
      const currentUser = this.authService.getCurrentUser()!;
      // пример "удобной" структуры для API:
      const payload = this.variantsArray.controls.map(v => ({
        // key: v.controls.key.value,
        attributes: v.controls.attrs.value.map(a => ({
          // attributeId: a.attributeId,
          attributeValueId: a.itemId,
          value: a.itemName
        })),
        quantity: v.controls.quantity.value!,
        costPrice: v.controls.price.value!,
        retailPrice: v.controls.salePrice.value!,
        barCode: v.controls.barCode.value || undefined
      }));

      const createProductVariantPayload: CreateProductVariantPayload = {
        storeId: currentUser?.staff?.store.id || '',
        warehouseId: product.warehouseId || '',
        productId: product.id,
        category: product.category,
        variants: payload
      }

      this.productService.createProductVariants(createProductVariantPayload)
        .subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Product variants created successfully' });
            this.clearForm();
            this.router.navigate(['/pages/product/view', this.productCard()?.id]);
          },
          error: (err) => {
            console.error('Error creating variants:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create product variants' });
          }
        });

    } else {
      this.form.markAllAsTouched();
    }


  }

  // /**
  //  * Заполняет form из product.variants:
  //  * 1) выставляет выбранные AttributeItem'ы в multiselect'ы
  //  * 2) генерирует variants (FormArray) как декартово произведение
  //  * 3) проставляет quantity/price/salePrice/barCode по совпадающему key
  //  */
  // private prefillFormFromExistingVariants(product: ProductDetail, allItems: AttributeItem[]) {
  //   const variants = product.variants ?? [];
  //   if (!variants.length) return;

  //   // itemId -> item, чтобы знать attributeId для каждого выбранного значения
  //   const itemById = new Map<string, AttributeItem>();
  //   allItems.forEach(it => itemById.set(it.id, it));

  //   // 1) собрать выбранные items по каждому attributeId на основе variants
  //   const selectedByAttrId = new Map<string, AttributeItem[]>();

  //   for (const v of variants) {
  //     const vAttrs = v.attributes ?? [];
  //     for (const a of vAttrs) {
  //       // поддержка разных возможных названий поля id значения
  //       const valueId: string | undefined =
  //         a.id ?? a.attributeId;

  //       if (!valueId) continue;

  //       const item = itemById.get(valueId);
  //       if (!item) continue;

  //       const list = selectedByAttrId.get(item.attributeId) ?? [];
  //       if (!list.some(x => x.id === item.id)) list.push(item);
  //       selectedByAttrId.set(item.attributeId, list);
  //     }
  //   }

  //   // 2) выставить multiselect значения без триггера rebuild на каждом setValue
  //   for (const [attrId, control] of Object.entries(this.attrGroup.controls)) {
  //     const selected = selectedByAttrId.get(attrId) ?? [];
  //     control.setValue(selected, { emitEvent: false } as any);
  //   }

  //   // 3) сгенерировать строки variants (комбинации)
  //   this.rebuildVariantsFromSelection();

  //   // 4) заполнить quantity/price/salePrice/barCode по key
  //   const formByKey = new Map<string, FormGroup<VariantForm>>();
  //   this.variantsArray.controls.forEach(ctrl => formByKey.set(ctrl.controls.key.value, ctrl));

  //   const attrNameById = new Map<string, string>();
  //   product.attributes?.forEach(a => attrNameById.set(a.id, a.name));

  //   for (const v of variants) {
  //     const vAttrs = v?.attributes ?? [];

  //     const attrs: VariantAttr[] = [];
  //     for (const a of vAttrs) {
  //       const valueId: string | undefined =
  //         a?.id ?? a?.attributeId;

  //       if (!valueId) continue;

  //       const item = itemById.get(valueId);
  //       if (!item) continue;

  //       attrs.push({
  //         attributeId: item.attributeId,
  //         attributeName: attrNameById.get(item.attributeId) ?? '',
  //         itemId: item.id,
  //         itemName: item.value ?? ''
  //       });
  //     }

  //     if (!attrs.length) continue;

  //     const key = this.buildVariantKey(attrs);
  //     const fg = formByKey.get(key);
  //     if (!fg) continue;

  //     // поддержка разных возможных названий полей в product.variants
  //     fg.controls.quantity.setValue(v?.quantity ?? null);
  //     // fg.controls.price.setValue(v?.costPrice ?? v?.price ?? null);
  //     fg.controls.salePrice.setValue(v?.price ?? null);
  //     fg.controls.barCode.setValue(v?.barCode ?? null);
  //   }

  //   this.cdRef.detectChanges();
  // }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
