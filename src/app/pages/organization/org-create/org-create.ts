import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectItemGroup } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { AppStore } from '../../../store/app.store';
import { MultiSelectType, SelectType } from '../../../models/app.models';
import { CategoryService } from '../../service/category.service';
import { UserService } from '../../user/service/user.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { StoreService } from '../service/store';

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
    PasswordModule,

    TreeSelectModule
  ],
  templateUrl: './org-create.html',
  styleUrl: './org-create.css',
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgCreate implements OnInit, OnDestroy {
  ownerList = signal<SelectType[]>([]);
  categoryList = signal<MultiSelectType[]>([]);

  storeForm = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]),
    wareHouse: new FormGroup({
      name: new FormControl<string | null>(null, [Validators.required]),
    }),
    ownerId: new FormControl<SelectType | null>(null, [Validators.required]),
    categoryId: new FormControl<MultiSelectType | null>(null, [Validators.required]),
  })

  constructor(
    private userService: UserService,
    private storeService: StoreService,
    private categoryService: CategoryService,
    private messageService: MessageService,
  ) {
  }

  ngOnInit(): void {
    this.fetchOwners();
    this.fetchCategories();
  }

  private fetchOwners() {
    this.userService.getOwners(1, 10).subscribe({
      next: (res) => {
        this.ownerList.set(res.data.map((owner) => {
          return {
            name: owner.fullName,
            id: owner.id
          }
        }));
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch owners' });
      }
    })
  }
  private fetchCategories() {
    this.categoryService.getCategoryList().subscribe({
      next: (res) => {
        const data = this.makeSelectTypes(res)
        this.categoryList.set(data);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch categories' });
      }
    });
  }

  submitForm() {
    console.log(this.storeForm.value);

    if (this.storeForm.valid) {
      const data = this.storeForm.value;
      const payload = {
        name: data.name!,
        ownerId: data.ownerId?.id!,
        categoryId: data.categoryId?.key!,
        warehouseName: data.wareHouse?.name!,
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


  ngOnDestroy(): void {
  }
}
