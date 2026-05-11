import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
    return this.http.get<{ data: any[], total: number }>('/api/payments', { params, withCredentials: true });
  }

}
