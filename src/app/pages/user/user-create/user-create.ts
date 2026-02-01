import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Router, RouterModule } from '@angular/router';
import { Loader } from '../../../shared/components/loader/loader';
import { MessageService } from 'primeng/api';
import { SelectType } from '../../../models/app.models';
import { InputMaskModule } from 'primeng/inputmask';
import { UserCreateRequest, UserErrorResponse, UserType } from '../../../models/user.model';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../service/user.service';
import { AppStore } from '../../../store/app.store';
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

  userRole: SelectType[] = [
    { name: 'Owner', code: 'OWNER' },
    { name: 'Manager', code: 'MANAGER' },
    { name: 'Seller', code: 'SELLER' },
    { name: 'Warehouse', code: 'WAREHOUSE' },
  ];

  messageService = inject(MessageService);
  userService = inject(UserService);
  appStore = inject(AppStore);
  router = inject(Router);

  ngOnInit(): void { }

  submitForm() {
    if (this.userForm.valid) {
      const {
        fullName,
        phone,
        login,
        password,
        role,
      } = this.userForm.value;
      const payload = {
        fullName,
        login,
        password,
        phone: '+998' + phone?.replaceAll('(', '').replaceAll(')', '').replaceAll('-', '').replaceAll(' ', '').trim(),
        role: (role as any).code,
      } as UserCreateRequest;
      const url = payload.role === 'OWNER' ? '/api/store/owner' : '/api/store/staff';
      this.userService.createUser(url, payload).subscribe({
        next: (res) => {
          const ownerId = res.id;
          this.appStore.setOwnerId(ownerId);
          this.messageService.add({ severity: 'success', summary: 'Muvaffaqiyatli', detail: 'Foydalanuvchi yaratildi' });
          this.userForm.reset();
          this.router.navigate(['/pages/user/view', res.id]);
        },
        error: (err: { error: UserErrorResponse }) => {
          this.messageService.add({ severity: 'error', summary: 'Xatolik', detail: err.error.message || 'Foydalanuvchi yaratishda xatolik yuz berdi' });
        }
      });
    } else {
      this.userForm.markAllAsTouched()
    }
  }


  clearForm() {
    console.log(this.userForm.value);
  }

  isValidField(field: keyof typeof this.userForm.controls): string {
    return this.userForm.controls[field].touched && this.userForm.controls[field].invalid ? 'ng-dirty ng-invalid' : ''
  }
  ngOnDestroy(): void { }
}
