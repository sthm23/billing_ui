import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { User, UserType } from "../../models/user.model";


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  users = [
    { id: '1', createdAt: '13.12.2025', type: UserType.STAFF, fullName: 'John Doe', phone: 'test@test.uz' },
    { id: '2', createdAt: '14.12.2025', type: UserType.STAFF, fullName: 'Madina Tog\'ayniyozova', phone: 'test1@test.uz' },
    { id: '3', createdAt: '15.12.2025', type: UserType.STAFF, fullName: 'Sanjar Tukhtamishev', phone: 'test2@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test3@test.uz' },
    { id: '4', createdAt: '16.12.2025', type: UserType.STAFF, fullName: 'Jane Smith', phone: 'test31@test.uz' },
  ]

  constructor(
    private http: HttpClient
  ) { }

  getProducts(page: number = 1, pageSize: number = 10): Observable<{ currentPage: number; totalPages: number; pageSize: number; totalItems: number; data: User[] }> {
    return of({
      currentPage: page,
      totalPages: Math.ceil(this.users.length / pageSize),
      pageSize: pageSize,
      totalItems: this.users.length,
      data: this.users.slice((page - 1) * pageSize, page * pageSize)
    })
    // return this.http.get<{ result: any[] }>('http://localhost:3000/products');
  }

  getUsers(page: number = 1, pageSize: number = 10): Observable<{ currentPage: number; totalPages: number; pageSize: number; totalItems: number; data: User[] }> {
    return of({
      currentPage: page,
      totalPages: Math.ceil(this.users.length / pageSize),
      pageSize: pageSize,
      totalItems: this.users.length,
      data: this.users.slice((page - 1) * pageSize, page * pageSize)
    })
    // return this.http.get<{ result: any[] }>('http://localhost:3000/users');
  }
}
