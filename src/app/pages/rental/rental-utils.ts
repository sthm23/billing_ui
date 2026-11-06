import { HttpErrorResponse } from '@angular/common/http';
import { RentalApiError, RentalStatus } from '../../models/rental.model';

/** Salon time zone: booking dates are local dates there (R2). */
const RENTAL_TIME_ZONE = 'Asia/Tashkent';
const localDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: RENTAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD of a date picked in the browser (its own calendar day). */
export function toDateString(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Browser Date (midnight) of a YYYY-MM-DD string, for date pickers. */
export function fromDateString(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Browser Date (midnight) of the next calendar day. */
export function nextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

/** Salon local date (YYYY-MM-DD) of an instant from the backend, e.g. a booking start at 12:00. */
export function rentalLocalDate(iso: string): string {
  return localDateFormat.format(new Date(iso));
}

/**
 * Days a booking is priced for (calendar days between the dates, at least 1).
 * Display only — the backend prices the booking (R2, R3).
 */
export function bookingDays(startDate: string, endDate: string): number {
  const start = Date.UTC(...splitDate(startDate));
  const end = Date.UTC(...splitDate(endDate));
  return Math.max(1, Math.round((end - start) / 86_400_000));
}

function splitDate(value: string): [number, number, number] {
  const [y, m, d] = value.split('-').map(Number);
  return [y, m - 1, d];
}

/** Body of a rental API error: `{ code, message, ... }` or Nest `{ statusCode, message, error }`. */
export function rentalApiError(err: unknown): RentalApiError {
  if (err instanceof HttpErrorResponse && err.error && typeof err.error === 'object') {
    return err.error as RentalApiError;
  }
  return {};
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const message = rentalApiError(err).message;
  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}

export function rentalStatusSeverity(status: RentalStatus) {
  switch (status) {
    case RentalStatus.BOOKED:
      return 'info';
    case RentalStatus.ISSUED:
      return 'warn';
    case RentalStatus.PARTIALLY_RETURNED:
      return 'contrast';
    case RentalStatus.RETURNED:
      return 'success';
    case RentalStatus.CANCELLED:
      return 'secondary';
    default:
      return null;
  }
}
