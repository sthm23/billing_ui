import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateStore, Store, CreateWarehouse, Warehouse, StoreResponse, UpdateStoreFlags } from '../../../models/store.model';

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
    return this.http.get<StoreResponse>(`/api/store?currentPage=${page}&pageSize=${pageSize}`, {
      withCredentials: true
    });
  }

  getStoreById(id: string) {
    return this.http.get<Store>(`/api/store/${id}`, {
      withCredentials: true
    });
  }

  /** PUT /store/:id with the sale/rent flags; attributes and brands are required by the backend */
  updateStoreFlags(id: string, body: UpdateStoreFlags) {
    return this.http.put<Store>(`/api/store/${id}`, body, {
      withCredentials: true
    });
  }

  updateStore(id: string, body: Partial<CreateStore>) {
    return this.http.put<Store>(`/api/store/${id}`, body, {
      withCredentials: true
    });
  }
}
