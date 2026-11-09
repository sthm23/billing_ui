import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../auth/service/auth';
import {
  RentalCalendar as RentalCalendarData,
  RentalCleaning,
  RentalCleaningState,
} from '../../../models/rental.model';
import { AppStore } from '../../../store/app.store';
import { RentalService } from '../service/rental.service';
import { apiErrorMessage, rentalStatusSeverity, toDateString } from '../rental-utils';
import { CleaningVariant, RentalCleaningDialog } from '../rental-cleaning-dialog/rental-cleaning-dialog';

type CalendarDay = RentalCalendarData['variants'][number]['days'][number];

/**
 * Busy units per variant per day (GET /rental/calendar). A day `d` is the
 * window [d 12:00, d+1 12:00): a booking 14 → 16 fills the 14th and the 15th.
 * Planned dry cleaning (R13) is a busy unit too; it is planned and cancelled here.
 */
@Component({
  selector: 'app-rental-calendar',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    SelectModule,
    TagModule,
    TooltipModule,
    TranslocoPipe,
    RentalCleaningDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './rental-calendar.html',
})
export class RentalCalendar implements OnInit {
  appStore = inject(AppStore);
  private router = inject(Router);
  private authService = inject(AuthService);
  private rentalService = inject(RentalService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private transloco = inject(TranslocoService);

  readonly statusSeverity = rentalStatusSeverity;
  /** UX only — the backend checks the role */
  readonly canManage = this.authService.canManageStore();

  warehouses = signal<{ id: string; name: string }[]>([]);
  warehouseId: string | null = null;
  month = new Date();
  calendar = signal<RentalCalendarData | null>(null);
  cleanings = signal<RentalCleaning[]>([]);

  cleaningVisible = false;
  cleaningVariant: CleaningVariant | null = null;
  cancellingId = signal<string | null>(null);

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
    const range = { warehouseId: this.warehouseId, from: toDateString(first), to: toDateString(last) };
    this.appStore.startLoader();
    forkJoin({
      calendar: this.rentalService.getCalendar(range),
      cleanings: this.rentalService.getCleanings(range),
    }).subscribe({
      next: ({ calendar, cleanings }) => {
        this.appStore.stopLoader();
        this.calendar.set(calendar);
        this.cleanings.set(cleanings);
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

  cellClass(day: CalendarDay) {
    const cleaning = day.cleaning > 0 ? ' outline outline-2 -outline-offset-2 outline-blue-400' : '';
    if (day.busy === 0) return 'bg-green-50 text-green-700' + cleaning;
    if (day.available === 0) return 'bg-red-100 text-red-700 font-semibold' + cleaning;
    return 'bg-yellow-50 text-yellow-700' + cleaning;
  }

  cellTooltip(day: CalendarDay, owned: number) {
    const text = this.transloco.translate('rental.availableOf', { available: day.available, owned });
    if (!day.cleaning) return text;
    return `${text} · ${this.transloco.translate('rental.cleaning.inCleaning', { count: day.cleaning })}`;
  }

  /** dd.MM of a YYYY-MM-DD salon date */
  dayLabel(date: string) {
    const [, m, d] = date.split('-');
    return `${d}.${m}`;
  }

  stateSeverity(state: RentalCleaningState) {
    switch (state) {
      case RentalCleaningState.PLANNED:
        return 'info';
      case RentalCleaningState.IN_PROGRESS:
        return 'warn';
      case RentalCleaningState.DONE:
        return 'success';
      default:
        return 'secondary';
    }
  }

  openCleaning(variant: CleaningVariant) {
    this.cleaningVariant = {
      variantId: variant.variantId,
      productName: variant.productName,
      sku: variant.sku,
    };
    this.cleaningVisible = true;
  }

  onCleaningSaved() {
    this.cleaningVisible = false;
    this.notify('rental.cleaning.saved');
    this.load();
  }

  cancelCleaning(event: Event, cleaning: RentalCleaning) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: this.transloco.translate('rental.cleaning.cancelTitle'),
      message: this.transloco.translate('rental.cleaning.cancelMessage', {
        product: cleaning.productName,
        from: this.dayLabel(cleaning.firstDay),
        to: this.dayLabel(cleaning.lastDay),
      }),
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: this.transloco.translate('rental.cancelAction'), severity: 'secondary', outlined: true },
      acceptButtonProps: { label: this.transloco.translate('rental.cleaning.cancel'), severity: 'danger' },
      accept: () => {
        this.cancellingId.set(cleaning.id);
        this.rentalService.cancelCleaning(cleaning.id).subscribe({
          next: () => {
            this.cancellingId.set(null);
            this.notify('rental.cleaning.cancelled');
            this.load();
          },
          error: (err) => {
            this.cancellingId.set(null);
            this.messageService.add({
              severity: 'error',
              summary: this.transloco.translate('rental.error'),
              detail: apiErrorMessage(err, this.transloco.translate('rental.saveFailed')),
            });
          },
        });
      },
    });
  }

  open(rentalId: string) {
    this.router.navigate(['/pages/rental', rentalId]);
  }

  back() {
    this.router.navigate(['/pages/rental/list']);
  }

  private notify(key: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.transloco.translate('rental.success'),
      detail: this.transloco.translate(key),
    });
  }
}
