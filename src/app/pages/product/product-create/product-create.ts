import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, switchMap } from 'rxjs';
import { Loader } from '../../../shared/components/loader/loader';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppStore } from '../../../store/app.store';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload';
import { ProductService } from '../service/product.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { CreateProduct, FileUploadData, Product } from '../../../models/product.model';
import { CategoryService } from '../../../shared/services/category.service';
import { StoreService } from '../../organization/service/store';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { AuthService } from '../../auth/service/auth';
import { Store, Warehouse } from '../../../models/store.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-product-create',
  imports: [
    CommonModule,
    Loader,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    RouterModule,
    InputNumberModule,
    FileUploadComponent,
    TreeSelectModule,
    MultiSelectModule,
    TextareaModule,
    TranslocoPipe
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProductCreate implements OnInit, OnDestroy {
  categories = signal<MultiSelectType[]>([])
  brands = signal<SelectType[]>([])
  tags = signal<SelectType[]>([])
  stores = signal<Store[]>([])
  warehouses = signal<Warehouse[]>([])
  attributeOptions = signal<SelectType[]>([])


  uploadedFilesCancel$ = new BehaviorSubject<boolean>(false);
  appStore = inject(AppStore);

  productForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    description: new FormControl<string | null>(null),
    images: new FormControl<any[] | null>(null),
    category: new FormControl<MultiSelectType | null>(null, [Validators.required]),
    brand: new FormControl<SelectType | null>(null),
    store: new FormControl<SelectType | null>(null),
    warehouse: new FormControl<SelectType | null>(null, [Validators.required]),
    attributes: new FormControl<SelectType[] | null>(null),
    tags: new FormControl<SelectType[] | null>(null)
  })

  constructor(
    public authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private messageService: MessageService
  ) {

  }


  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.fetchData();
      this.productForm.get('store')?.valueChanges.subscribe(store => {
        if (store) {
          this.productForm.patchValue({ warehouse: null });
          this.fetchStoreById(store.id);
        } else {
          this.warehouses.set([]);
        }
      })
    } else {
      const storeId = this.authService.getUserStoreId()!;
      this.fetchData(storeId);
    }
  }

  private fetchData(storeId?: string) {
    this.appStore.startLoader();
    if (storeId) {
      forkJoin({
        brands: this.categoryService.getStoreBrandList(storeId),
        store: this.storeService.getStoreById(storeId),
        categories: this.categoryService.getStoreCategoryList(storeId),
        attributes: this.categoryService.getStoreAttributeList(storeId),
        tags: this.categoryService.getTagList()
      }).subscribe({
        next: ({ brands, store, categories, attributes, tags }) => {
          this.tags.set(tags);
          this.brands.set(brands);
          this.warehouses.set(store.warehouse);
          const categoryData = this.makeSelectTypes(categories) as MultiSelectType[];
          this.categories.set(categoryData);
          this.attributeOptions.set(attributes);
          this.appStore.stopLoader();
        },
        error: (err) => {
          this.appStore.stopLoader();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error fetching data. Please try again.',
          });
        }
      })
    } else {
      forkJoin({
        brands: this.categoryService.getBrandList(),
        stores: this.storeService.getStores(),
        categories: this.categoryService.getCategoryList(),
        attributes: this.categoryService.getAttributeList(),
        tags: this.categoryService.getTagList()
      }).subscribe({
        next: ({ brands, stores, categories, attributes, tags }) => {
          this.brands.set(brands);
          this.stores.set(stores.data);
          const categoryData = this.makeSelectTypes(categories) as MultiSelectType[];
          this.categories.set(categoryData);
          this.attributeOptions.set(attributes);
          this.tags.set(tags);
          this.appStore.stopLoader();
        },
        error: (err) => {
          this.appStore.stopLoader();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error fetching data. Please try again.',
          });
        }
      })
    }
  }

  private fetchStoreById(storeId: string) {
    this.storeService.getStoreById(storeId).subscribe({
      next: (store) => {
        this.warehouses.set(store.warehouse);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Error fetching store data. Please try again.',
        });
      }
    })
  }

  clearForm() {
    this.productForm.reset()
    this.uploadedFilesCancel$.next(true);
  }

  onUpload(files: FileUploadData[]) {
    this.productForm.patchValue({ images: files });
  }

  submit() {

    if (this.productForm.valid) {
      this.appStore.startLoader();
      const data = this.productForm.value;
      const images = data.images?.map(file => file.url?.split('?')[0]) || [];
      const product: CreateProduct = {
        name: data.name!,
        categoryId: data.category?.key,
        images,
        brandId: data.brand?.id,
        warehouseId: data.warehouse?.id!,
        attributeIds: data.attributes?.map(a => a.id) || [],
        tagIds: data.tags?.map(t => t.id) || [],
        description: data.description || undefined
      };

      if (images.length === 0) {
        this.productService.createProduct(product).subscribe({
          next: this.handleCreatingProduct.bind(this),
          error: this.handleError.bind(this),
        })
      } else {
        const uploadImages = data.images?.map(file => {
          return this.fileUploadService.uploadImagesToS3(file.url, file.file);
        }) as Observable<null>[];
        forkJoin(uploadImages)
          .pipe(
            switchMap((res) => {
              return this.productService.createProduct(product)
            })
          )
          .subscribe({
            next: this.handleCreatingProduct.bind(this),
            error: this.handleError.bind(this),
          })
      }
    } else {
      this.productForm.markAllAsTouched();
      this.productForm.markAsDirty();
    }
  }

  handleError(err: any) {
    this.appStore.stopLoader();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: err?.error?.message || 'Error creating product. Please try again.',
    });
  }

  handleCreatingProduct(res: Product | null = null) {
    this.appStore.stopLoader();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product created successfully!',
    });
    this.clearForm();
    if (res?.id) this.router.navigate(['/pages/product', res.id, 'variant']);
  }


  private makeSelectTypes(data: SelectType[]): MultiSelectType[] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.children && item.children.length) {
        result.push({
          key: item.id,
          label: item.name,
          icon: 'pi pi-fw pi-folder',
          children: this.makeSelectTypes(item.children)
        });
      } else {
        result.push({
          key: item.id,
          label: item.name,
          icon: 'pi pi-fw pi-clipboard',
        });
      }
    }
    return result as MultiSelectType[];
  }

  goToList() {
    this.router.navigate(['pages/product/list'])
  }

  ngOnDestroy(): void {
    this.appStore.stopLoader();
  }
}
