import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderPayload, OrderResponse, OrderDetail, Order, CreateOrderItemPayload, CreateOrderPaymentPayload, ReturnOrderItemPayload, OrderStatus, OrderParams } from '../../../models/order.model';


@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders(params: OrderParams) {
    const { currentPage = 1, pageSize = 10, status = [], fromDate, toDate, search } = params;
    const statusParam = status.join(',');
    const queryParams = new URLSearchParams();
    queryParams.append('currentPage', currentPage.toString());
    queryParams.append('pageSize', pageSize.toString());
    if (status.length > 0) {
      queryParams.append('status', statusParam);
    }
    if (fromDate) {
      queryParams.append('fromDate', fromDate.toISOString());
    }
    if (toDate) {
      queryParams.append('toDate', toDate.toISOString());
    }
    if (search) {
      queryParams.append('search', search);
    }
    return this.http.get<OrderResponse>(`/api/orders?${queryParams.toString()}`, {
      withCredentials: true
    })
  }

  searchOrders(search: string) {
    const queryParams = new URLSearchParams();
    queryParams.append('search', search);
    return this.http.get<Order[]>(`/api/orders/search?${queryParams.toString()}`, {
      withCredentials: true
    })
  }

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<Order>('/api/orders', payload, {
      withCredentials: true
    })
  }

  getOrderById(id: string) {
    return this.http.get<OrderDetail>(`/api/orders/${id}`, {
      withCredentials: true
    })
  }

  createOrderItems(body: CreateOrderItemPayload) {
    return this.http.post<{ message: string }>('/api/orders/items', body, {
      withCredentials: true
    })
  }

  createOrderPayment(orderId: string, body: CreateOrderPaymentPayload) {
    return this.http.post<{ message: string }>(`/api/orders/payment/${orderId}`, body, {
      withCredentials: true
    })
  }

  returnOrder(returnOrderPayload: ReturnOrderItemPayload) {
    return this.http.post<{ message: string }>('/api/orders/return', returnOrderPayload, {
      withCredentials: true
    })
  }

  addPaymentToOrder(orderId: string, body: CreateOrderPaymentPayload) {
    return this.http.post<{ message: string }>(`/api/payment`, body, {
      withCredentials: true
    })
  }

  deleteOrder(orderId: string) {
    return this.http.delete<{ message: string }>(`/api/orders/${orderId}`, {
      withCredentials: true
    })
  }

  setCustomerToOrder(body: { orderId: string, customerId: string }) {
    return this.http.put<{ message: string }>(`/api/users/customers/set-to-order`, body, {
      withCredentials: true
    })
  }

  clearCustomerFromOrder(orderId: string) {
    return this.http.patch(`/api/orders/${orderId}/clear-customer`, {}, {
      withCredentials: true
    })
  }
}
