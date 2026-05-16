import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CashboxOpenPayload, Payment, TransactionPayload } from '../../models/payment.model';
import { BaseListResponse } from '../../models/app.models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  constructor(
    private http: HttpClient
  ) { }

  getPayments(params: {
    currentPage: number;
    pageSize: number;
    status?: string[];
    fromDate?: string;
    toDate?: string;
    search?: string;
  }) {
    return this.http.get<BaseListResponse<Payment>>('/api/cashbox', { params, withCredentials: true });
  }

  getCashboxById(id: string) {
    return this.http.get<Payment>(`/api/cashbox/${id}`, { withCredentials: true });
  }

  closeCashbox(id: string) {
    return this.http.patch<Payment>(`/api/cashbox/${id}/close`, {}, { withCredentials: true });
  }

  openCashbox(data: CashboxOpenPayload) {
    return this.http.post<Payment>(`/api/cashbox`, data, { withCredentials: true });
  }

  addTransaction(cashboxId: string, data: TransactionPayload) {
    return this.http.post<Payment>(`/api/cashbox/${cashboxId}/transaction`, data, { withCredentials: true });
  }

}
