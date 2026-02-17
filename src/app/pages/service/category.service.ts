import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Category, BrandResponse, CategoryResponse, Brand } from "../../models/product.model";


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {
  }

  getCategoryList(page = 1, pageSize = 10) {
    let url = `/api/category?pageSize=${pageSize}&currentPage=${page}`;
    return this.http.get<Category[]>(url, {
      withCredentials: true,
    });
  }

  getStoreCategoryList(storeId: string) {
    let url = `/api/category/${storeId}/categories`;
    return this.http.get<Category[]>(url, {
      withCredentials: true,
    });
  }

  getStoreBrandList(storeId: string) {
    return this.http.get<Brand[]>(`/api/category/brand/${storeId}`, {
      withCredentials: true,
    });
  }

  getBrandList(page = 1, pageSize = 10) {
    return this.http.get<BrandResponse>(`/api/category/brand?pageSize=${pageSize}&currentPage=${page}`, {
      withCredentials: true,
    });
  }
}
