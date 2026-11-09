import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseListResponse } from '../../../models/app.models';
import {
  CleaningConflict,
  RentalBookingPayload,
  RentalCalendar,
  RentalCancelPayload,
  RentalCleaning,
  RentalCleaningCheck,
  RentalCleaningPayload,
  RentalDetail,
  RentalListItem,
  RentalListParams,
  RentalPaymentPayload,
  RentalReturnLinePayload,
  RentalReturnPayload,
  RentalReturnPreview,
  VariantAvailability,
} from '../../../models/rental.model';

/** Rental API (billing/docs/rental/03_RENTAL_API.md). Prices and availability come from the backend. */
@Injectable({
  providedIn: 'root',
})
export class RentalService {
  constructor(private http: HttpClient) { }

  getRentals(params: RentalListParams) {
    const query = new URLSearchParams();
    query.append('currentPage', String(params.currentPage ?? 1));
    query.append('pageSize', String(params.pageSize ?? 10));
    if (params.status?.length) query.append('status', params.status.join(','));
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.customerId) query.append('customerId', params.customerId);
    if (params.overdue) query.append('overdue', 'true');
    return this.http.get<BaseListResponse<RentalListItem>>(`/api/rental?${query.toString()}`, {
      withCredentials: true,
    });
  }

  getRentalById(id: string) {
    return this.http.get<RentalDetail>(`/api/rental/${id}`, { withCredentials: true });
  }

  getAvailability(params: {
    warehouseId: string;
    startDate: string;
    endDate: string;
    variantIds: string[];
    excludeRentalId?: string;
  }) {
    const query = new URLSearchParams({
      warehouseId: params.warehouseId,
      startDate: params.startDate,
      endDate: params.endDate,
      variantIds: params.variantIds.join(','),
    });
    if (params.excludeRentalId) query.append('excludeRentalId', params.excludeRentalId);
    return this.http.get<VariantAvailability[]>(`/api/rental/availability?${query.toString()}`, {
      withCredentials: true,
    });
  }

  getCalendar(params: { warehouseId: string; from: string; to: string; variantIds?: string[] }) {
    const query = new URLSearchParams({
      warehouseId: params.warehouseId,
      from: params.from,
      to: params.to,
    });
    if (params.variantIds?.length) query.append('variantIds', params.variantIds.join(','));
    return this.http.get<RentalCalendar>(`/api/rental/calendar?${query.toString()}`, {
      withCredentials: true,
    });
  }

  createRental(body: RentalBookingPayload) {
    return this.http.post<RentalDetail>('/api/rental', body, { withCredentials: true });
  }

  updateRental(id: string, body: RentalBookingPayload) {
    return this.http.patch<RentalDetail>(`/api/rental/${id}`, body, { withCredentials: true });
  }

  addPayments(id: string, body: RentalPaymentPayload) {
    return this.http.post<RentalDetail>(`/api/rental/${id}/payments`, body, {
      withCredentials: true,
    });
  }

  issue(id: string, body: RentalPaymentPayload) {
    return this.http.post<RentalDetail>(`/api/rental/${id}/issue`, body, {
      withCredentials: true,
    });
  }

  getCleaningConflicts(id: string, lines: RentalReturnLinePayload[], returnedAt?: string) {
    const query = new URLSearchParams({
      items: lines.map((l) => `${l.orderItemId}:${l.quantity}:${l.cleaningDays}`).join(','),
    });
    if (returnedAt) query.append('returnedAt', returnedAt);
    return this.http.get<CleaningConflict[]>(
      `/api/rental/${id}/cleaning-conflicts?${query.toString()}`,
      { withCredentials: true },
    );
  }

  previewReturn(id: string, body: RentalReturnPayload) {
    return this.http.post<RentalReturnPreview>(`/api/rental/${id}/returns/preview`, body, {
      withCredentials: true,
    });
  }

  createReturn(id: string, body: RentalReturnPayload) {
    return this.http.post<RentalDetail>(`/api/rental/${id}/returns`, body, {
      withCredentials: true,
    });
  }

  returnCollateral(id: string, collateralId: string) {
    return this.http.post<RentalDetail>(
      `/api/rental/${id}/collaterals/${collateralId}/return`,
      {},
      { withCredentials: true },
    );
  }

  cancel(id: string, body: RentalCancelPayload) {
    return this.http.post<RentalDetail>(`/api/rental/${id}/cancel`, body, {
      withCredentials: true,
    });
  }

  /** Planned dry cleaning (R13): can one unit go on these days? Saves nothing. */
  checkCleaning(params: { warehouseId: string; variantId: string; startDate: string; days: number }) {
    const query = new URLSearchParams({
      warehouseId: params.warehouseId,
      variantId: params.variantId,
      startDate: params.startDate,
      days: String(params.days),
    });
    return this.http.get<RentalCleaningCheck>(`/api/rental/cleanings/check?${query.toString()}`, {
      withCredentials: true,
    });
  }

  /** Active cleanings not finished before `from` (default today) and starting by `to` */
  getCleanings(params: { warehouseId: string; variantId?: string; from?: string; to?: string }) {
    const query = new URLSearchParams({ warehouseId: params.warehouseId });
    if (params.variantId) query.append('variantId', params.variantId);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    return this.http.get<RentalCleaning[]>(`/api/rental/cleanings?${query.toString()}`, {
      withCredentials: true,
    });
  }

  /** OWNER/MANAGER; the expense goes to the user's open cashbox at once */
  createCleaning(body: RentalCleaningPayload) {
    return this.http.post<RentalCleaning>('/api/rental/cleanings', body, { withCredentials: true });
  }

  /** OWNER/MANAGER, before the start only; the amount comes back to the cashbox */
  cancelCleaning(id: string) {
    return this.http.post<RentalCleaning>(`/api/rental/cleanings/${id}/cancel`, {}, {
      withCredentials: true,
    });
  }
}
