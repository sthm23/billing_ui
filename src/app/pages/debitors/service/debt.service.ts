import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseListResponse } from "../../../models/app.models";
import { CreateDebtPayload, Debt, DebtPaymentPayload } from "../../../models/order.model";


@Injectable({
  providedIn: 'root',
})
export class DebtService {
  constructor(
    private http: HttpClient
  ) { }

  getOldDebitors(param: any) {
    const { currentPage = 1, pageSize = 10, fromDate, toDate, search, customerId } = param;
    const queryParams = new URLSearchParams();
    queryParams.append('currentPage', currentPage.toString());
    queryParams.append('pageSize', pageSize.toString());
    if (fromDate) {
      queryParams.append('fromDate', fromDate.toISOString());
    }
    if (toDate) {
      queryParams.append('toDate', toDate.toISOString());
    }
    if (search) {
      queryParams.append('search', search);
    }
    if (customerId) {
      queryParams.append('customerId', customerId);
    }
    return this.http.get<BaseListResponse<Debt>>(`/api/debt?${queryParams.toString()}`, {
      withCredentials: true
    })
  }

  getDebtorById(id: string) {
    return this.http.get<Debt>(`/api/debt/${id}`, {
      withCredentials: true
    })
  }

  createDebt(body: CreateDebtPayload) {
    return this.http.post<Debt>(`/api/debt`, body, {
      withCredentials: true
    })
  }

  createDebtPayment(body: DebtPaymentPayload) {
    return this.http.post<Debt>(`/api/debt/payment`, body, {
      withCredentials: true
    })
  }
}
