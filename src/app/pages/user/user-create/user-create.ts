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
import { StaffRole, UserCreateRequest, UserErrorResponse, UserRole } from '../../../models/user.model';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../service/user.service';
import { AppStore } from '../../../store/app.store';
import { SelectType } from '../../../models/app.models';
import { StoreService } from '../../organization/service/store';
import { AuthService } from '../../auth/service/auth';
import { Store } from '../../../models/store.model';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '../../../shared/services/translate.service';
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
    RouterModule,
    InputMaskModule,
    PasswordModule,
    TranslocoPipe
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class UserCreate implements OnInit, OnDestroy {
  userForm = new FormGroup({
    fullName: new FormControl<string>('', [Validators.required]),//
    phone: new FormControl<string>('', [Validators.required]),//
    login: new FormControl<string>('', [Validators.required]),//
    password: new FormControl<string>('', [Validators.required]),//
    role: new FormControl<SelectItemGroup | null>(null, [Validators.required]),//
  });

  staff = new FormGroup({
    storeId: new FormControl<Store | null>(null, [Validators.required]),//
    warehouseId: new FormControl<SelectType | null>(null, [Validators.required]),//
  });

  isShopHidden = false;
  destroyer$ = new Subject<void>();
  userRole: SelectItemGroup[] = [];

  storeList = signal<Store[]>([]);
  warehouses = signal<SelectType[]>([]);

  translate = inject(TranslateService);
  messageService = inject(MessageService);
  userService = inject(UserService);
  storeService = inject(StoreService);
  authService = inject(AuthService);
  appStore = inject(AppStore);
  router = inject(Router);
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    const isAdmin = this.authService.isAdmin();
    this.isShopHidden = !isAdmin;
    this.translate.selectTranslateObject('user').pipe(takeUntil(this.destroyer$)).subscribe({
      next: (res) => {
        this.userRole = this.makeUserRoleSelectItems(isAdmin, res);
      },
      error: (err) => {
        console.error('Translation loading error:', err);
      }
    })



    if (this.authService.isAdmin()) {
      this.fetchStoreInformation();
      this.staff.controls.storeId.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe(store => {
        const warehouses = store?.warehouse.map((wh) => ({
          name: wh.name,
          id: wh.id,
        })) || [];
        this.warehouses.set(warehouses);
      })
    } else {
      const currentUser = this.authService.getCurrentUser()!;
      this.storeService.getStoreById(currentUser.staff?.storeId!).pipe(takeUntil(this.destroyer$))
        .subscribe({
          next: (store) => {
            this.storeList.set([{ ...store }]);
            this.warehouses.set(store?.warehouse.map((wh) => ({
              name: wh.name,
              id: wh.id,
            })) || []);
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: 'Do\'kon ma\'lumotlarini olishda xatolik yuz berdi' });
          }
        })
    }


    this.toggleOwnerFields();
  }

  private toggleOwnerFields() {
    this.userForm.controls.role.valueChanges.pipe(takeUntil(this.destroyer$)).subscribe((value) => {
      if (value?.value === UserRole.OWNER) {
        this.isShopHidden = false;
      } else {
        this.isShopHidden = true;
      }
    });
  }

  fetchStoreInformation(storeId?: string) {
    if (storeId && !this.authService.isAdmin()) {
      this.storeService.getStoreById(storeId).pipe(takeUntil(this.destroyer$)).subscribe({
        next: (store) => {
          this.storeList.set([{ ...store }]);
          const warehouses = store?.warehouse.map((wh) => ({
            name: wh.name,
            id: wh.id,
          })) || [];
          this.warehouses.set(warehouses);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: 'Do\'kon ma\'lumotlarini olishda xatolik yuz berdi' });
        }
      });
    } else {
      this.storeService.getStores().pipe(takeUntil(this.destroyer$)).subscribe({
        next: (stores) => {
          this.storeList.set(stores.data);
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: 'Do\'konlar ro\'yxatini olishda xatolik yuz berdi' });
        }
      });
    }

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
        role: role?.value,
        storeId: storeId?.id,
        warehouseId: warehouseId?.id,
      } as UserCreateRequest;

      const url = payload.role === UserRole.OWNER ? '/api/store/owner' : '/api/store/staff';

      this.userService.createUser(url, payload).pipe(takeUntil(this.destroyer$)).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: 'Foydalanuvchi yaratildi' });
          this.userForm.reset();
          this.staff.reset();
          this.router.navigate(['/pages/user/list']);
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

  private makeUserRoleSelectItems(isAdmin: boolean, translations: any) {
    if (isAdmin) {
      return [
        {
          label: translations.roles || 'Roles', items: [
            { label: translations.staff.owner || 'Owner', value: UserRole.OWNER },
          ],
        },
        {
          label: translations.staff.label || 'Staff', items: [
            { label: translations.staff.manager || 'Manager', value: StaffRole.MANAGER },
            { label: translations.staff.seller || 'Seller', value: StaffRole.SELLER },
            { label: translations.staff.warehouse || 'Warehouse', value: StaffRole.WAREHOUSE },
            { label: translations.staff.cashier || 'Cashier', value: StaffRole.CASHIER },
          ]
        }
      ]
    } else {
      return [
        {
          label: translations.staff.label || 'Staff', items: [
            { label: translations.staff.manager || 'Manager', value: StaffRole.MANAGER },
            { label: translations.staff.seller || 'Seller', value: StaffRole.SELLER },
            { label: translations.staff.warehouse || 'Warehouse', value: StaffRole.WAREHOUSE },
            { label: translations.staff.cashier || 'Cashier', value: StaffRole.CASHIER },
          ]
        }
      ]
    }
  }

  isValidField(field: keyof typeof this.userForm.controls): string {
    return this.userForm.controls[field].touched && this.userForm.controls[field].invalid ? 'ng-dirty ng-invalid' : ''
  }

  goToList() {
    this.router.navigate(['pages/user/list'])
  }
  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }
}
