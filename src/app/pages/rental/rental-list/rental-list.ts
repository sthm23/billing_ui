import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { AppStore } from '../../../store/app.store';
import { RentalListItem, RentalListParams, RentalStatus } from '../../../models/rental.model';
import { RentalService } from '../service/rental.service';
import { apiErrorMessage, rentalStatusSeverity, toDateString } from '../rental-utils';

@Component({
  selector: 'app-rental-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DatePickerModule,
    MultiSelectModule,
    ToggleSwitchModule,
    TranslocoPipe,
  ],
  templateUrl: './rental-list.html',
})
export class RentalList implements OnInit {
  appStore = inject(AppStore);
  private rentalService = inject(RentalService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private transloco = inject(TranslocoService);

  rentals = signal<RentalListItem[]>([]);
  total = signal(0);
  first = 0;
  rows = 10;

  statusOptions = Object.values(RentalStatus).map((value) => ({ value }));
  statuses: RentalStatus[] = [];
  rangeDates: Date[] | null = null;
  overdue = false;

  statusSeverity = rentalStatusSeverity;

  ngOnInit() {
    this.load();
  }

  load() {
    const params: RentalListParams = {
      currentPage: this.first / this.rows + 1,
      pageSize: this.rows,
      status: this.statuses,
      overdue: this.overdue,
    };
    if (this.rangeDates?.[0]) {
      params.from = toDateString(this.rangeDates[0]);
      params.to = toDateString(this.rangeDates[1] ?? this.rangeDates[0]);
    }
    this.appStore.startLoader();
    this.rentalService.getRentals(params).subscribe({
      next: (res) => {
        this.appStore.stopLoader();
        this.rentals.set(res.data);
        this.total.set(+res.total);
      },
      error: (err) => {
        this.appStore.stopLoader();
        this.messageService.add({
          severity: 'error',
          summary: this.transloco.translate('rental.error'),
          detail: apiErrorMessage(err, this.transloco.translate('rental.loadFailed')),
        });
      },
    });
  }

  applyFilter() {
    this.first = 0;
    this.load();
  }

  onRangeSelect() {
    if (this.rangeDates?.[0] && this.rangeDates[1]) this.applyFilter();
  }

  clearRange() {
    this.rangeDates = null;
    this.applyFilter();
  }

  pageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.load();
  }

  open(rental: RentalListItem) {
    this.router.navigate(['/pages/rental', rental.id]);
  }

  create() {
    this.router.navigate(['/pages/rental/create']);
  }

  openCalendar() {
    this.router.navigate(['/pages/rental/calendar']);
  }
}
