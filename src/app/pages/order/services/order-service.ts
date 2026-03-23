import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderPayload, OrderResponse, OrderDetail, Order, CreateOrderItemPayload, CreateOrderPaymentPayload } from '../../../models/order.model';


@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders(page = 1, pageSize = 10) {
    return this.http.get<OrderResponse>(`/api/orders?currentPage=${page}&pageSize=${pageSize}`, {
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
}
