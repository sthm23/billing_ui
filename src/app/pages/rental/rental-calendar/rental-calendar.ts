import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { AuthService } from '../../auth/service/auth';
import { RentalCalendar as RentalCalendarData } from '../../../models/rental.model';
import { AppStore } from '../../../store/app.store';
import { RentalService } from '../service/rental.service';
import { apiErrorMessage, rentalStatusSeverity, toDateString } from '../rental-utils';

/**
 * Busy units per variant per day (GET /rental/calendar). A day `d` is the
 * window [d 12:00, d+1 12:00): a booking 14 → 16 fills the 14th and the 15th.
 */
@Component({
  selector: 'app-rental-calendar',
  imports: [DatePipe, FormsModule, ButtonModule, DatePickerModule, SelectModule, TagModule, TooltipModule, TranslocoPipe],
  templateUrl: './rental-calendar.html',
})
export class RentalCalendar implements OnInit {
  appStore = inject(AppStore);
  private router = inject(Router);
  private authService = inject(AuthService);
  private rentalService = inject(RentalService);
  private messageService = inject(MessageService);
  private transloco = inject(TranslocoService);

  readonly statusSeverity = rentalStatusSeverity;

  warehouses = signal<{ id: string; name: string }[]>([]);
  warehouseId: string | null = null;
  month = new Date();
  calendar = signal<RentalCalendarData | null>(null);

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const warehouses = (user?.staff?.warehouse ?? []).map((w) => ({
      id: w.warehouseId,
      name: w.warehouse?.name ?? w.warehouseId,
    }));
    this.warehouses.set(warehouses);
    this.warehouseId = warehouses[0]?.id ?? null;
    this.load();
  }

  load() {
    if (!this.warehouseId) return;
    const first = new Date(this.month.getFullYear(), this.month.getMonth(), 1);
    const last = new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0);
    this.appStore.startLoader();
    this.rentalService
      .getCalendar({ warehouseId: this.warehouseId, from: toDateString(first), to: toDateString(last) })
      .subscribe({
        next: (res) => {
          this.appStore.stopLoader();
          this.calendar.set(res);
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

  shiftMonth(delta: number) {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + delta, 1);
    this.load();
  }

  dayNumber(date: string) {
    return Number(date.slice(8, 10));
  }

  cellClass(day: { busy: number; available: number }) {
    if (day.busy === 0) return 'bg-green-50 text-green-700';
    if (day.available === 0) return 'bg-red-100 text-red-700 font-semibold';
    return 'bg-yellow-50 text-yellow-700';
  }

  open(rentalId: string) {
    this.router.navigate(['/pages/rental', rentalId]);
  }

  back() {
    this.router.navigate(['/pages/rental/list']);
  }
}
