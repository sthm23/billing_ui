import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrandResponse, Category, CategoryResponse, CreateProduct, Product, ProductResponse } from '../../../models/product.model';
import { StoreResponse } from '../../../models/store.model';


@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(
    private http: HttpClient
  ) { }

  getProducts(page = 1, pageSize = 10) {
    return this.http.get<ProductResponse>(`/api/product?currentPage=${page}&pageSize=${pageSize}`, {
      withCredentials: true,
    });
  }

  getCategoryList(page = 1, pageSize = 10) {
    return this.http.get<Category[]>(`/api/category?pageSize=${pageSize}&currentPage=${page}`, {
      withCredentials: true,
    });
  }

  getBrandList(page = 1, pageSize = 10) {
    return this.http.get<BrandResponse>(`/api/category/brand?pageSize=${pageSize}&currentPage=${page}`, {
      withCredentials: true,
    });
  }

  getStoreList(page = 1, pageSize = 10) {
    return this.http.get<StoreResponse>(`/api/store?pageSize=${pageSize}&currentPage=${page}`, {
      withCredentials: true,
    });
  }

  createProduct(data: CreateProduct) {
    return this.http.post<Product>(`/api/product`, data, {
      withCredentials: true,
    });
  }
}
