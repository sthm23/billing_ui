import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Loader } from '../../../shared/components/loader/loader';
import { InputNumberModule } from 'primeng/inputnumber';
import { AppStore } from '../../../store/app.store';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload';
import { ProductService } from '../service/product.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { CreateProduct } from '../../../models/product.model';

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
    TreeSelectModule
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProductCreate implements OnInit, OnDestroy {
  categories = signal<MultiSelectType[]>([])
  brands = signal<SelectType[]>([])
  stores = signal<SelectType[]>([])

  uploadedFilesCancel$ = new BehaviorSubject<boolean>(false);
  appStore = inject(AppStore);

  productForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),//+
    images: new FormControl<string[] | null>([]),//+
    category: new FormControl<MultiSelectType | null>(null, [Validators.required]), //+
    brand: new FormControl<SelectType | null>(null),
    store: new FormControl<SelectType | null>(null, [Validators.required]), //+
  })

  constructor(
    private productService: ProductService,
    private messageService: MessageService
  ) {

  }


  ngOnInit() {
    this.fetchData();
  }

  private fetchData() {
    this.appStore.startLoader();
    this.productService.getBrandList().pipe(
      switchMap((brandsRes) => {
        this.brands.set(brandsRes.data);
        return this.productService.getCategoryList()
      }),
      switchMap((categoryList) => {
        const categories: MultiSelectType[] = this.makeSelectTypes(categoryList) as MultiSelectType[];
        this.categories.set(categories);
        return this.productService.getStoreList()
      }),
    ).subscribe({
      next: (stores) => {
        this.stores.set(stores.data);
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
    });
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

  onUpload(files: string[]) {
    this.productForm.patchValue({ images: files });
  }

  submit() {
    if (this.productForm.valid) {
      this.appStore.startLoader();
      const data = this.productForm.value;

      const product: CreateProduct = {
        name: data.name!,
        categoryId: data.category?.key,
        images: data.images,
        brandId: data.brand?.id,
        storeId: data.store?.id!,
      };

      this.productService.createProduct(product).subscribe({
        next: (res) => {
          console.log(res);

          this.appStore.stopLoader();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Product created successfully!',
          });
          this.clearForm();
        },
        error: (err) => {
          this.appStore.stopLoader();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Error creating product. Please try again.',
          });
        },
      })
    } else {
      this.productForm.markAllAsTouched();
      this.productForm.markAsDirty();
    }
  }

  ngOnDestroy(): void {
    this.appStore.stopLoader();
  }
}
