import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payment } from '../../models/payment.model';
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

}
