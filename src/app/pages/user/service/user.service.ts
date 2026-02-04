import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, UserCreateRequest, UsersResponse } from "../../../models/user.model";
import { CreateStore, Store, CreateWarehouse, Warehouse, StoreResponse } from "../../../models/store.model";


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  createUser(ownerUrl: string, userData: UserCreateRequest) {
    return this.http.post<User>(ownerUrl, userData, {
      withCredentials: true
    });
  }

  getUsers(page: number = 1, pageSize: number = 10) {
    return this.http.get<UsersResponse>(`/api/users?page=${page}&pageSize=${pageSize}`, {
      withCredentials: true
    });
  }

  getUserById(userId: string) {
    return this.http.get<User>(`/api/users/${userId}`, {
      withCredentials: true
    });
  }

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

  getStores() {
    return this.http.get<StoreResponse>(`/api/store`, {
      withCredentials: true
    });
  }
}
