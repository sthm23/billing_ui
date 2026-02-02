import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectItemGroup } from 'primeng/api';
import { UserCreateRequest, UserErrorResponse } from '../../../models/user.model';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../service/user.service';
import { AppStore } from '../../../store/app.store';
import { SelectType } from '../../../models/app.models';
@Component({
  selector: 'app-user-create',
  imports: [
    CommonModule,
    Loader,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    Select,
    ToastModule,
    BreadcrumbModule,
    RouterModule,
    InputMaskModule,
    PasswordModule
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class UserCreate implements OnInit, OnDestroy {
  breadcrumbItems = [{ icon: 'pi pi-home', route: '/' }, { label: 'Foydalanuvchilar' }, { label: 'Yaratish', route: '/' }]
  userForm = new FormGroup({
    fullName: new FormControl<string>('', [Validators.required]),//
    phone: new FormControl<string>('', [Validators.required]),//
    login: new FormControl<string>('', [Validators.required]),//
    password: new FormControl<string>('', [Validators.required]),//
    role: new FormControl<string>('', [Validators.required]),//
  });

  staff = new FormGroup({
    storeId: new FormControl('', [Validators.required]),//
    warehouseId: new FormControl('', [Validators.required]),//
  });

  isShopHidden = false;

  userRole: SelectItemGroup[] = [
    {
      label: 'Roles', items: [
        { label: 'Owner', value: 'OWNER' },
      ]
    },
    {
      label: 'Staff', items: [
        { label: 'Seller', value: 'SELLER' },
        { label: 'Warehouse', value: 'WAREHOUSE' },
        { label: 'Cashier', value: 'CASHIER' },
      ]
    }
  ];

  storeList = signal<SelectType[]>([]);
  warehouses = signal<SelectType[]>([]);

  messageService = inject(MessageService);
  userService = inject(UserService);
  appStore = inject(AppStore);
  router = inject(Router);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if (params.hasOwnProperty('storeId') && params.hasOwnProperty('warehouseId')) {


        const storeId = params['storeId'].split('!!');
        const warehouseId = params['warehouseId'].split('!!');

        if (storeId) {
          this.storeList.set([{ name: storeId[1], code: storeId[0], child: [] }]);
          this.staff.controls.storeId.setValue({ code: storeId[0], name: storeId[1], child: [] } as any);
        }
        if (warehouseId) {
          this.warehouses.set([{ name: warehouseId[1], code: warehouseId[0], child: [] }]);
          this.staff.controls.warehouseId.setValue({ code: warehouseId[0], name: warehouseId[1], child: [] } as any);
        }

        if (storeId && warehouseId) {
          this.isShopHidden = true;
        }
      } else {
        this.fetchStoreInformation();
      }

    });
    this.userForm.controls.role.valueChanges.subscribe((value: any) => {
      if (value['value'] === 'OWNER') {
        this.isShopHidden = false;
      } else {
        this.isShopHidden = true;
      }
    });
    this.staff.controls.storeId.valueChanges.subscribe((storeId: any) => {
      if (storeId && storeId.code) {
        const storeIdCode = storeId.code;
        this.staff.controls.warehouseId.setValue(null);
        this.warehouses.set(this.storeList().find(store => store.code === storeIdCode)?.child || []);
      }
    })
  }

  fetchStoreInformation() {
    this.userService.getStores().subscribe({
      next: (stores) => {
        this.storeList.set(stores.data.map(store => ({ name: store.name, code: store.id, child: store.warehouses.map(wh => ({ name: wh.name, code: wh.id, child: [] })) })));
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: 'Do\'konlar ro\'yxatini olishda xatolik yuz berdi' });
      }
    });
  }

  submitForm() {
    if (this.userForm.valid && (!this.isShopHidden ? true : this.staff.valid)) {
      const {
        fullName,
        phone,
        login,
        password,
        role,
      } = this.userForm.value;

      const {
        storeId,
        warehouseId
      } = this.staff.value;

      const payload = {
        fullName,
        login,
        password,
        phone: '+998' + phone?.replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '').trim(),
        role: (role as any).value,
        storeId: (storeId as any)?.code,
        warehouseId: (warehouseId as any)?.code,
      } as UserCreateRequest;

      const url = payload.role === 'OWNER' ? '/api/store/owner' : '/api/store/staff';

      this.userService.createUser(url, payload).subscribe({
        next: (res) => {
          const ownerId = res.id;
          this.appStore.setOwnerId(ownerId);
          this.messageService.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: 'Foydalanuvchi yaratildi' });
          this.userForm.reset();
          this.staff.reset();
          if (payload.role === 'OWNER') {
            this.router.navigate(['/pages/user/view', res.id]);
          } else {
            this.router.navigate(['/pages/user/list']);
          }
        },
        error: (err: { error: UserErrorResponse }) => {
          this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error.message || 'Foydalanuvchi yaratishda xatolik yuz berdi' });
        }
      });
    } else {
      this.userForm.markAllAsTouched()
      this.staff.markAllAsTouched();
    }
  }


  clearForm() {
    console.log(this.userForm.value);
    this.userForm.reset();
    this.staff.reset();
  }

  isValidField(field: keyof typeof this.userForm.controls): string {
    return this.userForm.controls[field].touched && this.userForm.controls[field].invalid ? 'ng-dirty ng-invalid' : ''
  }
  ngOnDestroy(): void { }
}
