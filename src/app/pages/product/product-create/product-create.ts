import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable, of, switchMap } from 'rxjs';
import { Loader } from '../../../shared/components/loader/loader';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppStore } from '../../../store/app.store';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload';
import { ProductService } from '../service/product.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { CreateProduct, FileUploadData, Product } from '../../../models/product.model';
import { CategoryService } from '../../service/category.service';
import { StoreService } from '../../organization/service/store';
import { FileUploadService } from '../../service/file-upload.service';
import { AuthService } from '../../auth/service/auth';
// import { UserRole } from '../../../models/user.model';
import { Store } from '../../../models/store.model';
import { StepperModule } from 'primeng/stepper';
import { BlockUIModule } from 'primeng/blockui';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { ToggleButtonModule } from 'primeng/togglebutton';

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
    StepperModule, TagModule,
    BlockUIModule, PanelModule,
    ToggleButtonModule, FormsModule
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProductCreate implements OnInit, OnDestroy {
  categories = signal<MultiSelectType[]>([])
  brands = signal<SelectType[]>([])
  stores = signal<Store[]>([])

  uploadedFilesCancel$ = new BehaviorSubject<boolean>(false);
  appStore = inject(AppStore);

  productForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),//+
    images: new FormControl<any[] | null>(null),//+
    category: new FormControl<MultiSelectType | null>(null, [Validators.required]), //+
    brand: new FormControl<SelectType | null>(null),
    store: new FormControl<SelectType | null>(null, [Validators.required]), //+
  })

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private storeService: StoreService,
    private fileUploadService: FileUploadService,
    private messageService: MessageService
  ) {

  }


  ngOnInit() {
    if (this.authService.isAdmin()) {
      this.fetchData();
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
        categories: this.categoryService.getStoreCategoryList(storeId)
      }).subscribe({
        next: ({ brands, store, categories }) => {
          this.brands.set(brands);
          this.stores.set([store]);
          const categoryData = this.makeSelectTypes(categories) as MultiSelectType[];
          this.categories.set(categoryData);
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
        categories: this.categoryService.getCategoryList()
      }).subscribe({
        next: ({ brands, stores, categories }) => {
          this.brands.set(brands.data);
          this.stores.set(stores.data);
          const categoryData = this.makeSelectTypes(categories) as MultiSelectType[];
          this.categories.set(categoryData);
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
        storeId: data.store?.id!,
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
  }

  ngOnDestroy(): void {
    this.appStore.stopLoader();
  }
}
