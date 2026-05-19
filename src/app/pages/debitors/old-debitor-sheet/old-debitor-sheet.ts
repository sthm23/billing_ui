import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CreateDebtPayload, Debt, DebtParams, DebtStatus } from '../../../models/order.model';
import { AuthService } from '../../auth/service/auth';
import { UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TagModule } from "primeng/tag";
import { SelectButtonModule } from 'primeng/selectbutton';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { Warehouse } from '../../../models/store.model';
import { TranslocoPipe } from '@ngneat/transloco';
import { TranslateService } from '../../../shared/services/translate.service';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DebtService } from '../service/debt.service';

@Component({
  selector: 'app-old-debitor-sheet',
  imports: [
    CurrencyPipe,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    SelectButtonModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    DrawerModule,
    SelectModule,
    TranslocoPipe,
    DatePipe,
    AutoCompleteModule,
  ],
  templateUrl: './old-debitor-sheet.html',
  styleUrl: './old-debitor-sheet.css',
})
export class OldDebitorSheet implements OnInit {
  debitors = signal<Debt[]>([])
  visibleDrawer = signal(false);
  selectedDebt: Debt | null = null;
  warehouseId: string = '';
  storeId: string = '';
  warehouse = signal<Warehouse[]>([])

  loader = signal(false);
  first = signal(1);
  rows = 10;
  total = signal(0);

  today = new Date();
  rangeDates: Date[] | null = null;

  debitorsSearchResult = signal<{ createdAt: string, id: string, total: string }[]>([]);

  @ViewChild('dt') dataTable!: Table;

  constructor(
    private debtService: DebtService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
    this.loader.set(true);
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.staff) {
      const warehouses = currentUser.staff.warehouse.map(w => ({ ...w.warehouse }));
      this.warehouse.set(warehouses);
      this.storeId = currentUser.staff.storeId;
    }
    this.loadOldDebitors()
  }

  private loadOldDebitors(params: DebtParams = {}) {
    const {
      currentPage = this.first(),
      pageSize = this.rows,
      status = [DebtStatus.ACTIVE],
      fromDate,
      toDate,
      search
    } = params;
    this.debtService.getOldDebitors({
      currentPage,
      pageSize,
      status,
      fromDate,
      toDate,
      search
    }).subscribe({
      next: (res) => {
        this.loader.set(false);
        this.debitors.set(res.data)
        this.total.set(+res.total);
      },
      error: (err) => {
        this.loader.set(false);
        console.error(err)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to load Debts' })
      }
    })
  }

  pageChange(event: TablePageEvent) {
    this.loader.set(true);
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    const params: DebtParams = {
      currentPage: this.first() / this.rows + 1,
      pageSize: this.rows
    }
    this.loadOldDebitors(params);
  }

  createDebt() {
    this.router.navigate(['/pages/debitor/create'])
  }

  handleWarehouseChange() {
    if (this.warehouseId.length > 0) {
      this.visibleDrawer.set(false);
      this.proceedCreatingDebt(this.storeId, this.warehouseId);
    }
  }

  private proceedCreatingDebt(storeId: string, warehouseId: string) {

  }


  getSeverity(status: DebtStatus) {
    switch (status) {
      case DebtStatus.ACTIVE:
        return 'success';
      case DebtStatus.PAID:
        return 'info';
      default:
        return null;
    }
  }

  selectDebt(debt: Debt) {

    switch (debt.status) {
      case DebtStatus.ACTIVE:
        this.router.navigate(['/pages/debitor/', debt.id])
        return;
      default:
        return;
    }
  }

  getTranslatedText(translate: string, value: string): string {
    if (translate.includes('.')) {
      return value
    }
    return translate
  }

  onRangeSelect() {
    if (this.rangeDates && this.rangeDates[0] && this.rangeDates[1]) {
      const [startDate, endDate] = this.rangeDates;
      this.loadOldDebitors({
        status: [DebtStatus.ACTIVE],
        fromDate: new Date(startDate.setHours(0, 0, 0, 0)),
        toDate: new Date(endDate.setHours(23, 59, 59, 999))
      });
    }
  }

  selectSearchOption(option: AutoCompleteSelectEvent) {
    const selectedDebt = option.value;
    const Debts = this.debitorsSearchResult();
    const matchedDebt = Debts.find(Debt => Debt.id === selectedDebt.id);
    if (matchedDebt) {
      this.selectDebt(matchedDebt as unknown as Debt);
    }
  }
  search(event: AutoCompleteCompleteEvent) {
    const search = event.query;
    // this.debtService.searchDebts(
    //   search
    // ).subscribe({
    //   next: (res) => {
    //     const Debts = res.map((debt, i) => {
    //       return {
    //         id: debt.id,
    //         createdAt: debt.createdAt,
    //         total: debt.totalAmount.toLocaleString('en-US'),
    //         status: debt.status,
    //         label: `${debt.customer.user.fullName} - ${debt.customer.user.phone} - ${new Date(debt.createdAt).toLocaleDateString()} - ${(+debt.totalAmount).toLocaleString(undefined, { compactDisplay: 'short' })}`
    //       }
    //     })
    //     this.debitorsSearchResult.set(Debts);
    //   },
    //   error: (err) => {
    //     console.error(err)
    //     this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to load Debts' })
    //   }
    // })
  }

  clearFilter() {
    this.rangeDates = null;
    this.loadOldDebitors({
      status: [DebtStatus.ACTIVE]
    });
  }
}
