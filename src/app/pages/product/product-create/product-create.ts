import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { catchError, debounceTime, throwError } from 'rxjs';
import { Loader } from '../../../shared/components/loader/loader';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { AppStore } from '../../../store/app.store';
import { SelectType } from '../../../models/app.models';



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
    TextareaModule,
    FileUploadModule,
    ToastModule,
    RouterModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProductCreate implements OnDestroy {
  uploadedFiles: any[] = [];

  categories = []
  sizeItems = []
  tagItems = []

  appStore = inject(AppStore);

  productForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),//+
    price: new FormControl<string | null>(null, [Validators.required]),//+
    category: new FormControl<SelectType | null>(null, [Validators.required]), //+
    photo: new FormControl<string[] | null>([]),//+
    brand: new FormControl<string | null>(null),
    tag: new FormControl<SelectType | null>(null),
    description: new FormControl<string | null>(null),
    hasDiscount: new FormControl<string[]>([], { nonNullable: true }),
    sizeType: new FormControl<string[]>([], { nonNullable: true }),
    newPrice: new FormControl<string | null>({ value: '0', disabled: true }),
    size: new FormControl<SelectType[] | null>(null, [Validators.required]),//+
    sizes: new FormArray<FormGroup>([]),
  })


  constructor(private messageService: MessageService) {
    this.onInit()
  }


  private onInit() {
    this.productForm.controls.hasDiscount.valueChanges.pipe(
      takeUntilDestroyed(),
    ).subscribe(value => {
      if (value && value.length) {
        this.productForm.controls.newPrice.enable()
      } else {
        this.productForm.controls.newPrice.disable()
      }
    })

    this.productForm.controls.sizeType.valueChanges.pipe(
      takeUntilDestroyed(),
    ).subscribe(value => {
      if (value && value.length) {
        this.sizeItems = []
      } else {
        this.sizeItems = []
      }
      this.clearSizes()
      this.productForm.controls.size.patchValue(null)
    })

    this.productForm.controls.size.valueChanges.pipe(
      takeUntilDestroyed(),
      debounceTime(200)
    ).subscribe({
      next: (value) => {
        if (value) {
          this.setActualSizeList(value);
        }
      },
    })
  }

  private setActualSizeList(value: SelectType[]) {
    const sizes = this.productForm.controls.sizes.value;
    const actualList = value.filter(size => !sizes.some(item => item.size === size));

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i].size;
      if (size && !value.includes(size)) {
        this.productForm.controls.sizes.removeAt(i)
      }
    }

    actualList.forEach(size => {
      this.addSize(size);
    });
  }

  private addSize(size: SelectType) {
    const group = new FormGroup({
      size: new FormControl(size, { nonNullable: true }),  // size
      colors: new FormArray<FormGroup<{
        stock: FormControl<number>,
        color: FormControl<string>
      }>>([]), // color stock quantity
      quantity: new FormControl(0, { nonNullable: true })
    });
    const arr = this.productForm.controls.sizes;
    arr.push(group);
  }

  private clearSizes() {
    const arr = this.productForm.controls.sizes as FormArray<any>;
    arr.clear();
  }

  get sizes() {
    const arr = (this.productForm.controls.sizes as FormArray).controls as FormGroup<{
      size: FormControl,
      colors: FormArray<any>,
      quantity: FormControl
    }>[];
    return arr
  }


  onUpload(event: FileUploadEvent) {

    for (let i = 0; i < event.files.length; i++) {
      const file = event.files[i];
      this.uploadedFiles.push({ file, path: (event.originalEvent as any).body[i] });
    }

    this.productForm.patchValue({
      photo: this.uploadedFiles.map(file => file.path)
    })

    this.showNotification('Rasmlar yuklash', 'info', 'Rasmlar muvofaqiyatli yuklandi!');
  }

  showNotification(title: string, bgColor: 'info' | 'success' | 'error', message: string) {
    this.messageService.add({ severity: bgColor, summary: title, detail: message, life: 3000 })
  }

  clearForm() {
    this.productForm.reset()
    this.uploadedFiles = [];
  }

  submit() {
    console.log(this.productForm.value);

    if (this.productForm.valid) {
      this.appStore.startLoader();
      const data = this.productForm.value;
      const product = {
        name: data.name,
        category: data.category?.code,
        price: data.price,
        discount: data.hasDiscount?.length ? data.newPrice : 0,
        photo: data.photo,
        description: data.description ?? '',
        brand: data.brand,
        tag: data.tag?.code,
        quantity: this.countQuantity(data.sizes),
        // sizes: data.sizes?.map(size => {
        //   return {
        //     size: size?.size?.name,
        //     colors: size.colors ? size.colors.map(color => {
        //       return {
        //         color: color.color,
        //         stock: color.stock
        //       }
        //     }) : [],
        //     quantity: size.quantity,
        //   }
        // })
      };


    } else {
      this.productForm.markAllAsTouched();
      this.productForm.markAsDirty();
    }
  }

  private countQuantity(arr?: Partial<{ quantity: any }>[]) {
    let result = 0;
    if (arr && arr.length) {
      for (let i = 0; i < arr.length; i++) {
        const el = arr[i];
        result += el.quantity
      }
      return result;
    }
    return result
  }

  ngOnDestroy(): void {
    this.appStore.stopLoader();
  }
}
