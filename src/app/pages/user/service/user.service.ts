import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, UserCreateRequest, UsersResponse, CreateCustomer, UserInfo, CustomersResponse, UserStockMovement } from "../../../models/user.model";


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
    return this.http.get<UsersResponse>(`/api/users?currentPage=${page}&pageSize=${pageSize}`, {
      withCredentials: true
    });
  }

  getOwners(page: number = 1, pageSize: number = 10) {
    return this.http.get<UsersResponse>(`/api/users/owners?currentPage=${page}&pageSize=${pageSize}`, {
      withCredentials: true
    });
  }

  getUserById(userId: string) {
    return this.http.get<User>(`/api/users/${userId}`, {
      withCredentials: true
    });
  }

  createCustomer(userData: CreateCustomer) {
    return this.http.post<User>('/api/users/customers', userData, {
      withCredentials: true
    });
  }

  searchCustomers(text: string) {
    return this.http.get<CustomersResponse>(`/api/users/customers?search=${text}`, {
      withCredentials: true
    })
  }

  getCurrentStaffInfo(userId: string) {
    return this.http.get<UserInfo>(`/api/users/${userId}/info`, {
      withCredentials: true
    });
  }

  getCurrentCustomerInfo(userId: string) {
    return this.http.get<UserInfo>(`/api/users/customers/${userId}/info`, {
      withCredentials: true
    });
  }

  getStockMovementsByUserId(staffId: string) {
    return this.http.get<UserStockMovement[]>(`/api/store/${staffId}/stock-movements`, {
      withCredentials: true
    })
  }
}
