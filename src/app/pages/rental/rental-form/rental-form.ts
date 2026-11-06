import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { AuthService } from '../../auth/service/auth';
import { ProductService } from '../../product/service/product.service';
import { ProductVariant } from '../../../models/product.model';
import {
  RentalBookingPayload,
  RentalDetail,
  RentalErrorCode,
  RentalStatus,
} from '../../../models/rental.model';
import { CustomerSearch, SearchCustomer } from '../../../shared/components/customer-search/customer-search';
import { distributeSetDiscount } from '../../../shared/utils/set-discount';
import { AppStore } from '../../../store/app.store';
import { RentalService } from '../service/rental.service';
import {
  apiErrorMessage,
  bookingDays,
  fromDateString,
  nextDay,
  rentalApiError,
  rentalLocalDate,
  toDateString,
} from '../rental-utils';

interface BookingLine {
  variantId: string;
  name: string;
  rentPricePerDay: number;
  quantity: number;
  /** Discount per unit */
  sale: number;
  /** Free units on the dates (from the backend), null until known */
  available: number | null;
  owned: number | null;
}

interface ServiceLine {
  name: string;
  price: number;
  sale: number;
  description: string;
}

type SearchVariant = ProductVariant & { productName?: string; label: string };

/**
 * Create / edit a booking (R3, R11). Prices and availability come from the
 * backend; the screen only previews `rentPricePerDay × days` and spreads a set
 * discount with the shared algorithm (docs/features/rental.md).
 */
@Component({
  selector: 'app-rental-form',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    AutoCompleteModule,
    ButtonModule,
    DatePickerModule,
    DividerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TextareaModule,
    TranslocoPipe,
    CustomerSearch,
  ],
  templateUrl: './rental-form.html',
})
export class RentalForm implements OnInit {
  appStore = inject(AppStore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private rentalService = inject(RentalService);
  private productService = inject(ProductService);
  private messageService = inject(MessageService);
  private transloco = inject(TranslocoService);

  readonly canManage = this.authService.canManageStore();
  readonly today = new Date(new Date().setHours(0, 0, 0, 0));

  rentalId = signal<string | null>(null);
  warehouses = signal<{ id: string; name: string }[]>([]);
  warehouseId = signal<string | null>(null);
  customer = signal<SearchCustomer | null>(null);
  rangeDates = signal<Date[] | null>(null);
  lines = signal<BookingLine[]>([]);
  services = signal<ServiceLine[]>([]);
  notes = '';
  saving = signal(false);

  searchValue = '';
  searchResults = signal<SearchVariant[]>([]);
  targetTotal: number | null = null;

  startDate = computed(() => {
    const range = this.rangeDates();
    return range?.[0] ? toDateString(range[0]) : null;
  });
  /**
   * A single picked date (or the same date twice) means a one-day booking:
   * it ends on the next day at 12:00 (R1/R2 — no same-day bookings).
   */
  endDate = computed(() => {
    const range = this.rangeDates();
    if (!range?.[0]) return null;
    const start = toDateString(range[0]);
    const end = range[1] ? toDateString(range[1]) : null;
    return end && end > start ? end : toDateString(nextDay(range[0]));
  });
  /** Preview only — the backend prices the booking */
  days = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    return start && end && start < end ? bookingDays(start, end) : 0;
  });
  baseTotal = computed(
    () =>
      this.lines().reduce((s, l) => s + this.unitPrice(l) * l.quantity, 0) +
      this.services().reduce((s, x) => s + (x.price || 0), 0),
  );
  discountTotal = computed(
    () =>
      this.lines().reduce((s, l) => s + (l.sale || 0) * l.quantity, 0) +
      this.services().reduce((s, x) => s + (x.sale || 0), 0),
  );
  total = computed(() => this.baseTotal() - this.discountTotal());

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const warehouses = (user?.staff?.warehouse ?? []).map((w) => ({
      id: w.warehouseId,
      name: w.warehouse?.name ?? w.warehouseId,
    }));
    this.warehouses.set(warehouses);
    if (warehouses.length === 1) this.warehouseId.set(warehouses[0].id);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.rentalId.set(id);
      this.loadRental(id);
    }
  }

  unitPrice(line: BookingLine) {
    return line.rentPricePerDay * this.days();
  }

  private loadRental(id: string) {
    this.appStore.startLoader();
    this.rentalService.getRentalById(id).subscribe({
      next: (rental) => {
        this.appStore.stopLoader();
        if (rental.status !== RentalStatus.BOOKED) {
          this.notify('warn', 'rental.onlyBookedEditable');
          this.router.navigate(['/pages/rental', id]);
          return;
        }
        this.fill(rental);
      },
      error: (err) => {
        this.appStore.stopLoader();
        this.notifyError(err, 'rental.loadFailed');
        this.router.navigate(['/pages/rental/list']);
      },
    });
  }

  private fill(rental: RentalDetail) {
    if (!this.warehouses().some((w) => w.id === rental.warehouseId)) {
      this.warehouses.update((list) => [
        ...list,
        { id: rental.warehouseId, name: rental.order.warehouse.name },
      ]);
    }
    this.warehouseId.set(rental.warehouseId);
    const customer = rental.order.customer;
    if (customer) {
      this.customer.set({
        id: customer.id,
        name: customer.user.fullName,
        phone: customer.user.phone,
        label: `${customer.user.fullName} ${customer.user.phone}`,
      });
    }
    this.rangeDates.set([
      fromDateString(rentalLocalDate(rental.startDate)),
      fromDateString(rentalLocalDate(rental.endDate)),
    ]);
    this.lines.set(
      rental.order.items.map((item) => ({
        variantId: item.variantId,
        name: `${item.variant.product.name} · ${item.variant.sku}`,
        rentPricePerDay: +(item.variant.rentPricePerDay ?? 0),
        quantity: item.quantity,
        sale: +item.sale,
        available: null,
        owned: null,
      })),
    );
    this.services.set(
      rental.order.services.map((s) => ({
        name: s.name,
        price: +s.price,
        sale: +s.sale,
        description: s.description ?? '',
      })),
    );
    this.notes = rental.notes ?? '';
    this.refreshAvailability();
  }

  // ------------------------------------------------------------ inputs

  onWarehouseChange(id: string) {
    this.warehouseId.set(id);
    this.lines.set([]);
  }

  onDatesSelect(range: Date[] | null) {
    this.rangeDates.set(range ? [...range] : null);
    if (range?.[0] && range[1]) {
      this.normalizeOneDayRange();
      this.refreshAvailability();
    }
  }

  /** Picker closed after one click: book that day until the next day 12:00 */
  onDatesClose() {
    const range = this.rangeDates();
    if (range?.[0] && !range[1]) {
      this.normalizeOneDayRange();
      this.refreshAvailability();
    }
  }

  /** Show the real one-day range in the picker: [d, d + 1] instead of [d, d] or [d] */
  private normalizeOneDayRange() {
    const range = this.rangeDates();
    if (!range?.[0]) return;
    if (!range[1] || toDateString(range[1]) <= toDateString(range[0])) {
      this.rangeDates.set([range[0], nextDay(range[0])]);
    }
  }

  onCustomerSelected(customer: SearchCustomer | null) {
    this.customer.set(customer);
  }

  search(event: AutoCompleteCompleteEvent) {
    const warehouseId = this.warehouseId();
    if (!warehouseId) {
      this.notify('warn', 'rental.chooseWarehouse');
      return;
    }
    this.productService.searchProducts(warehouseId, event.query).subscribe({
      next: (res) => {
        const variants = res.data as (ProductVariant & { productName?: string })[];
        this.searchResults.set(
          variants
            .filter((v) => v.canRent && +(v.rentPricePerDay ?? 0) > 0)
            .map((v) => ({ ...v, label: `${v.productName ?? ''} · ${v.sku} — ${(+(v.rentPricePerDay ?? 0)).toLocaleString()} / ${this.transloco.translate('rental.day')}` })),
        );
      },
      error: (err) => this.notifyError(err, 'rental.searchFailed'),
    });
  }

  selectVariant(event: AutoCompleteSelectEvent) {
    const variant = event.value as SearchVariant;
    this.searchValue = '';
    this.searchResults.set([]);
    if (this.lines().some((l) => l.variantId === variant.id)) {
      this.notify('warn', 'rental.alreadyAdded');
      return;
    }
    this.lines.update((lines) => [
      ...lines,
      {
        variantId: variant.id,
        name: `${variant.productName ?? ''} · ${variant.sku}`,
        rentPricePerDay: +(variant.rentPricePerDay ?? 0),
        quantity: 1,
        sale: 0,
        available: null,
        owned: null,
      },
    ]);
    this.refreshAvailability();
  }

  updateLine(index: number, patch: Partial<BookingLine>) {
    this.lines.update((lines) => lines.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  removeLine(index: number) {
    this.lines.update((lines) => lines.filter((_, i) => i !== index));
  }

  addService() {
    this.services.update((list) => [...list, { name: '', price: 0, sale: 0, description: '' }]);
  }

  updateService(index: number, patch: Partial<ServiceLine>) {
    this.services.update((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  removeService(index: number) {
    this.services.update((list) => list.filter((_, i) => i !== index));
  }

  /** Spreads (base − target) over items and services: docs/features/rental.md#set-discount-distribution */
  applyTargetTotal() {
    if (this.targetTotal === null || this.days() === 0) return;
    const lines = this.lines();
    const services = this.services();
    try {
      const sales = distributeSetDiscount(
        [
          ...lines.map((l) => ({ unitPrice: this.unitPrice(l), quantity: l.quantity })),
          ...services.map((s) => ({ unitPrice: s.price || 0, quantity: 1 })),
        ],
        this.targetTotal,
      );
      this.lines.set(lines.map((l, i) => ({ ...l, sale: sales[i] })));
      this.services.set(services.map((s, i) => ({ ...s, sale: sales[lines.length + i] })));
    } catch {
      this.notify('warn', 'rental.invalidTotal');
    }
  }

  resetDiscount() {
    this.targetTotal = null;
    this.lines.update((lines) => lines.map((l) => ({ ...l, sale: 0 })));
    this.services.update((list) => list.map((s) => ({ ...s, sale: 0 })));
  }

  refreshAvailability() {
    const warehouseId = this.warehouseId();
    const startDate = this.startDate();
    const endDate = this.endDate();
    const variantIds = this.lines().map((l) => l.variantId);
    if (!warehouseId || !startDate || !endDate || startDate >= endDate || !variantIds.length) return;
    this.rentalService
      .getAvailability({
        warehouseId,
        startDate,
        endDate,
        variantIds,
        excludeRentalId: this.rentalId() ?? undefined,
      })
      .subscribe({
        next: (list) => {
          const byId = new Map(list.map((a) => [a.variantId, a]));
          this.lines.update((lines) =>
            lines.map((l) => ({
              ...l,
              available: byId.get(l.variantId)?.available ?? 0,
              owned: byId.get(l.variantId)?.owned ?? 0,
            })),
          );
        },
        error: (err) => this.notifyError(err, 'rental.availabilityFailed'),
      });
  }

  // -------------------------------------------------------------- save

  private validate(): string | null {
    if (!this.warehouseId()) return 'rental.chooseWarehouse';
    if (!this.customer()) return 'rental.chooseCustomer';
    if (!this.days()) return 'rental.chooseDates';
    const lines = this.lines();
    if (!lines.length) return 'rental.addItems';
    for (const l of lines) {
      if (!l.quantity || l.quantity < 1) return 'rental.invalidQuantity';
      if (l.available !== null && l.available < l.quantity) return 'rental.notAvailable';
      if ((l.sale || 0) > this.unitPrice(l)) return 'rental.saleTooBig';
    }
    for (const s of this.services()) {
      if (!s.name.trim() || s.price < 0) return 'rental.invalidService';
      if ((s.sale || 0) > s.price) return 'rental.saleTooBig';
    }
    return null;
  }

  save() {
    const error = this.validate();
    if (error) {
      this.notify('warn', error);
      return;
    }
    const payload: RentalBookingPayload = {
      warehouseId: this.warehouseId()!,
      customerId: this.customer()!.id,
      startDate: this.startDate()!,
      endDate: this.endDate()!,
      items: this.lines().map((l) => ({
        variantId: l.variantId,
        quantity: l.quantity,
        sale: l.sale || 0,
      })),
      services: this.services().map((s) => ({
        name: s.name.trim(),
        price: s.price,
        sale: s.sale || 0,
        description: s.description || undefined,
      })),
      notes: this.notes.trim() || undefined,
    };
    const id = this.rentalId();
    const request$ = id
      ? this.rentalService.updateRental(id, payload)
      : this.rentalService.createRental(payload);
    this.saving.set(true);
    request$.subscribe({
      next: (rental) => {
        this.saving.set(false);
        this.notify('success', id ? 'rental.updated' : 'rental.created');
        // A new booking goes straight to prepayment and collateral (scenario 1)
        this.router.navigate(['/pages/rental', rental.id], id ? {} : { queryParams: { pay: 1 } });
      },
      error: (err) => {
        this.saving.set(false);
        const body = rentalApiError(err);
        if (body.code === RentalErrorCode.NOT_AVAILABLE && body.variantId) {
          this.lines.update((lines) =>
            lines.map((l) =>
              l.variantId === body.variantId ? { ...l, available: body.available ?? 0 } : l,
            ),
          );
        }
        this.notifyError(err, 'rental.saveFailed');
      },
    });
  }

  cancel() {
    const id = this.rentalId();
    this.router.navigate(id ? ['/pages/rental', id] : ['/pages/rental/list']);
  }

  private notify(severity: 'success' | 'warn' | 'error', key: string) {
    this.messageService.add({
      severity,
      summary: this.transloco.translate(severity === 'success' ? 'rental.success' : 'rental.error'),
      detail: this.transloco.translate(key),
    });
  }

  private notifyError(err: unknown, fallbackKey: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.transloco.translate('rental.error'),
      detail: apiErrorMessage(err, this.transloco.translate(fallbackKey)),
    });
  }
}
