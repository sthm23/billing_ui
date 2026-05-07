import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/service/auth';
import { StoreService } from '../service/store';
import { Button, ButtonModule } from "primeng/button";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { FluidModule } from 'primeng/fluid';
import { MultiSelectModule } from 'primeng/multiselect';
import { TreeSelectModule } from 'primeng/treeselect';

@Component({
  selector: 'app-add-warehouse',
  imports: [
    ButtonModule,
    SelectModule,
    InputTextModule,
    DrawerModule,
    FormsModule,
    // ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    MultiSelectModule,
    TreeSelectModule
  ],
  templateUrl: './add-warehouse.html',
  styleUrl: './add-warehouse.css',
})
export class AddWarehouse {

  name = '';
  loader = signal(false);

  @Input() storeId: string = '';
  @Input() ownerId: string = '';

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() error = new EventEmitter();

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
  ) { }

  cancel() {
    this.visibleChange.emit(false);
  }

  create() {
    const payload = {
      storeId: this.storeId,
      name: this.name,
      ownerId: this.ownerId
    }
    this.loader.set(true)
    if (!payload.name || payload.name.trim().length <= 2 || !payload.storeId || !payload.ownerId || payload.storeId.trim().length === 0 || payload.ownerId.trim().length === 0) {
      this.error.emit();
      this.loader.set(false);
      return;
    }
    this.storeService.createWarehouse(payload).subscribe({
      next: (res) => {
        this.loader.set(false);
        this.visibleChange.emit(false);
      },
      error: (err) => {
        this.loader.set(false)
        this.error.emit();
        console.log(err);
      }
    })
  }

}
