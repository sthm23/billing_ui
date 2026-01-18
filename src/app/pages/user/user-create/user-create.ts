import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { Loader } from '../../../shared/components/loader/loader';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-create',
  imports: [
    CommonModule,
    Loader,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    SelectModule,
    TextareaModule,
    ToastModule,
    BreadcrumbModule,
    RouterModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class UserCreate implements OnInit, OnDestroy {
  breadcrumbItems = [{ icon: 'pi pi-home', route: '/' }, { label: 'Foydalanuvchilar' }, { label: 'Yaratish', route: '/' }]
  userForm = new FormGroup({
    username: new FormControl<string | null>(null),//
    fullName: new FormControl<string | null>(null),//
    phone: new FormControl<string | null>(null),//
    password: new FormControl<string | null>(null),//
    role: new FormControl<string | null>(null),//
    description: new FormControl<string | null>(null),//
    isActive: new FormControl<boolean>(true),//
  });


  ngOnInit(): void { }

  submitForm() {
    console.log(this.userForm.value);
  }
  clearForm() {
    console.log(this.userForm.value);
  }
  ngOnDestroy(): void { }
}
