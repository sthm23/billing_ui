import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { delay } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '../../../models/store.model';
import { StoreService } from '../service/store';
import { Loader } from '../../../shared/components/loader/loader';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-org-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    DatePipe,
    Loader,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    InputTextModule,
    TranslocoPipe
  ],
  templateUrl: './org-list.html',
  styleUrl: './org-list.css',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgList implements OnInit, OnDestroy {
  stores = signal<Store[]>([]);
  first = signal(0);
  rows = 10;
  total = signal(0);

  stateOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'On hold', value: 'ON_HOLD' },
    { label: 'Debt', value: 'DEPT' },
    { label: 'Canceled', value: 'CANCELED' }
  ];

  @ViewChild('dt') dataTable!: Table;

  private storeService = inject(StoreService)
  public appStore = inject(AppStore);

  constructor(private router: Router) { }

  ngOnInit() {
    this.fetchStores(this.first() / this.rows + 1, this.rows);
  }

  fetchStores(page = 1, pageSize = 10) {
    this.appStore.startLoader();
    this.storeService.getStores(page, pageSize)
      .pipe(
        delay(1500)
      ).subscribe({
        next: (response) => {
          this.appStore.stopLoader();
          this.stores.set(response.data);
          this.total.set(response.total);
        },
        error: (err) => {
          this.appStore.stopLoader();
          console.error('Error fetching stores:', err);
        }
      });
  }

  pageChange(event: any) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchStores(this.first() / this.rows + 1, this.rows);
  }

  goToOrgSchema(store: Store) {
    this.router.navigate(['/pages/organization/view', store.id]);
  }

  createStore() {
    this.router.navigate(['/pages/organization/create']);
  }

  disableStore(store: Store) {

  }
  ngOnDestroy() {
    this.appStore.stopLoader();
  }

}
