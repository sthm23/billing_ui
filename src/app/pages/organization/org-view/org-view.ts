import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ScrollerModule, ScrollerScrollIndexChangeEvent } from 'primeng/scroller';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../auth/service/auth';
import { Store } from '../../../models/store.model';
import { StoreService } from '../service/store';
import { AddWarehouse } from '../add-warehouse/add-warehouse';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';
import { FluidModule } from 'primeng/fluid';
import { forkJoin, mergeMap, switchMap } from 'rxjs';
import { CategoryService } from '../../../shared/services/category.service';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-org-view',
  imports: [
    ButtonModule,
    TagModule,
    OverlayBadgeModule,
    AvatarModule,
    // DatePipe,
    ScrollerModule,
    TagModule,
    InputTextModule,
    ReactiveFormsModule,
    TranslocoPipe,
    FluidModule,
    MultiSelectModule
  ],
  templateUrl: './org-view.html',
  styleUrl: './org-view.css',
  providers: []
})
export class OrgView {
  brandList = signal<SelectType[]>([]);
  attributeList = signal<SelectType[]>([]);

  storeForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]),
    wareHouse: new FormGroup({
      name: new FormControl<string | null>(null, [Validators.required]),
    }),
    brands: new FormControl<SelectType[] | null>(null, [Validators.required]),
    attributeIds: new FormControl<SelectType[] | null>(null, [Validators.required]),
  })

  currentStore = signal<null | Store>(null);

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private categoryService: CategoryService,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const isAdmin = this.authService.isAdmin();
      const storeId = params.get('id');
      if (storeId && isAdmin) {
        this.loadCurrentStore(storeId);
      } else {
        this.router.navigate(['/pages/organization/list']);
      }
    })
  }

  private loadCurrentStore(id: string) {
    forkJoin({
      brands: this.categoryService.getBrandList(),
      categories: this.categoryService.getCategoryList(),
      attributes: this.categoryService.getAttributeList(1, 100)
    }).pipe(
      switchMap(({ brands, categories, attributes }) => {
        console.log(brands, categories, attributes);
        this.brandList.set(brands.map(brand => ({ id: brand.id, name: brand.name })));
        this.attributeList.set(attributes.data.map(attr => ({ id: attr.id, name: attr.name })));
        return this.storeService.getStoreById(id)
      })
    ).subscribe({
      next: (store) => {
        this.currentStore.set(store);
        this.patchAttributeValues(store);
        this.patchBrandValues(store);
        this.storeForm.get('name')?.setValue(store.name);
        this.storeForm.get('wareHouse.name')?.setValue(store.warehouse[0]?.name || '');
      },
      error: (err) => {
        console.error('Error fetching current store:', err);
        this.router.navigate(['/pages/organization/list']);
      }
    })

  }

  private patchAttributeValues(store: Store) {
    const attributes = this.attributeList();
    const storeAttributes = []
    const newAttributes = []
    for (const attr of attributes) {
      if (store.attributes.some(storeAttr => storeAttr.attributeId === attr.id)) {
        storeAttributes.push(attr);
      } else {
        newAttributes.push(attr);
      }
    }
    this.storeForm.get('attributeIds')?.setValue(storeAttributes);
  }

  private patchBrandValues(store: Store) {
    const brands = this.brandList();
    const storeBrands = []
    const newBrands = []
    for (const brand of brands) {
      if (store.brands.some(storeBrand => storeBrand.brandId === brand.id)) {
        storeBrands.push(brand);
      } else {
        newBrands.push(brand);
      }
    }
    this.storeForm.get('brands')?.setValue(storeBrands);
  }



  goToDashboard() {
    this.router.navigate(['/pages/organization/list']);
  }

  handleError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add warehouse' });
  }

  isValidField(fieldName: string) {
    const field = this.storeForm.get(fieldName);
    return field && field.invalid && (field.dirty || field.touched) ? 'p-invalid' : '';
  }


  getTranslate(key: string, defaultText: string) {
    if (key.includes('.')) {
      return defaultText
    }
    return key;
  }

  clearForm() { }
  submitForm() {
    console.log(this.storeForm.value);
    if (this.storeForm.valid) {
      const value = this.storeForm.value;
      const payload = {
        name: value.name!,
        warehouseName: value.wareHouse!.name!,
        attributeIds: value.attributeIds!.map(attr => attr.id),
        brandIds: value.brands!.map(attr => attr.id),
      }
      const id = this.currentStore()!.id;
      this.storeService.updateStore(id, payload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Store updated successfully' });
          this.router.navigate(['/pages/organization/list']);
        },
        error: (err) => {
          console.error('Error updating store:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update store' });
        }
      })
    }

  }
}
