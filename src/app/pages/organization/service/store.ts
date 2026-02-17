import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateStore, Store, CreateWarehouse, Warehouse, StoreResponse } from '../../../models/store.model';

@Injectable({
  providedIn: 'root',
})
export class StoreService {

  constructor(
    private http: HttpClient
  ) { }

  createStore(body: CreateStore) {
    return this.http.post<Store>(`/api/store`, body, {
      withCredentials: true
    });
  }

  createWarehouse(body: CreateWarehouse) {
    return this.http.post<{ warehouse: Warehouse, worker: any }>(`/api/warehouse`, body, {
      withCredentials: true
    });
  }

  getStores(page: number = 1, pageSize: number = 10) {
    return this.http.get<StoreResponse>(`/api/store?page=${page}&pageSize=${pageSize}`, {
      withCredentials: true
    });
  }

  getStoreById(id: string) {
    return this.http.get<Store>(`/api/store/${id}`, {
      withCredentials: true
    });
  }
}
