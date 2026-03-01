import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderPayload, OrderResponse, OrderDetail, Order, OrderDetail2 } from '../../../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) { }

  getOrders() {
    return this.http.get<OrderResponse>('/api/orders', {
      withCredentials: true
    })
  }

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<Order>('/api/orders', payload, {
      withCredentials: true
    })
  }

  getOrderById(id: string) {
    return this.http.get<OrderDetail2>(`/api/orders/${id}`, {
      withCredentials: true
    })
  }
}
