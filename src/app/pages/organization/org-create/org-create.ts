import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { RouterModule } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { CategoryService } from '../../../shared/services/category.service';
import { UserService } from '../../user/service/user.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { StoreService } from '../service/store';
import { MultiSelectModule } from 'primeng/multiselect';
import { forkJoin, Subject, switchMap, take, takeUntil } from 'rxjs';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Category } from '../../../models/product.model';
import { TranslateService } from '../../../shared/services/translate.service';


@Component({
  selector: 'app-org-create',
  imports: [
    CommonModule,
    Loader,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    Select,
    ToastModule,
    RouterModule,
    InputMaskModule,
    MultiSelectModule,
    TreeSelectModule,
    TranslocoPipe,
    TranslatePipe
  ],
  templateUrl: './org-create.html',
  styleUrl: './org-create.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgCreate implements OnInit, OnDestroy {
  ownerList = signal<SelectType[]>([]);
  categoryList = signal<MultiSelectType[]>([]);
  brandList = signal<SelectType[]>([]);
  attributeList = signal<SelectType[]>([]);

  storeForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]),
    wareHouse: new FormGroup({
      name: new FormControl<string | null>(null, [Validators.required]),
    }),
    ownerId: new FormControl<SelectType | null>(null, [Validators.required]),
    categoryId: new FormControl<MultiSelectType | null>(null, [Validators.required]),
    brands: new FormControl<SelectType[] | null>(null, [Validators.required]),
    attributeIds: new FormControl<SelectType[] | null>(null, [Validators.required]),
  })

  translateObject = {}
  categoryArr: Category[] = []
  destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.fetchData();
  }

  private fetchData() {
    forkJoin({
      owners: this.userService.getOwners(1, 10),
      brands: this.categoryService.getBrandList(),
      categories: this.categoryService.getCategoryList(),
      attributes: this.categoryService.getAttributeList()
    }).pipe(takeUntil(this.destroy$), switchMap(({ owners, brands, categories, attributes }) => {

      this.ownerList.set(owners.data.map((owner) => ({
        name: owner.fullName,
        id: owner.id
      })));
      this.categoryArr = categories;
      const data = this.makeSelectTypes(categories)
      this.categoryList.set(data);

      this.brandList.set(brands.map((brand) => ({
        name: brand.name,
        id: brand.id
      })));

      this.attributeList.set(attributes.map((attr) => ({
        name: attr.name,
        id: attr.id
      })));
      return this.translate.selectTranslateObject('category')
    })).subscribe({
      next: (translate) => {
        this.translateObject = translate;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data' });
      }
    })
  }

  submitForm() {
    if (this.storeForm.valid) {
      const data = this.storeForm.value;
      const payload = {
        name: data.name!,
        ownerId: data.ownerId?.id!,
        categoryId: data.categoryId?.key!,
        warehouseName: data.wareHouse?.name!,
        brandIds: data.brands?.map(brand => brand.id) || [],
        attributeIds: data.attributeIds?.map(attr => attr.id) || []
      }

      this.storeService.createStore(payload).subscribe({
        next: (store) => {
          console.log('Store created:', store);
          this.messageService.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: 'Magazin yaratildi' });
          this.clearForm();
        },
        error: (err) => {
          console.error('Error creating store:', err);
          this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error.message || 'Magazin yaratishda xatolik yuz berdi' });
        }
      });
    }

  }

  clearForm() {
    console.log(this.storeForm.value);
    this.storeForm.reset();
  }

  isValidField(field: keyof typeof this.storeForm.controls): string {
    return this.storeForm.controls[field].touched && this.storeForm.controls[field].invalid ? 'ng-dirty ng-invalid' : ''
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

  getStoreTranslatedName(translate: string, value: string): string {
    if (translate.includes('.')) {
      return value
    }
    return translate
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
