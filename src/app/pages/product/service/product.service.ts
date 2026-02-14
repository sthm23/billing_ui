import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrandResponse, Category, CategoryResponse, CreateProduct, UploadImageResponse, Product, ProductResponse, UploadImageRequest } from '../../../models/product.model';
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

  createProduct(data: CreateProduct) {
    return this.http.post<Product>(`/api/product`, data, {
      withCredentials: true,
    });
  }

  getProductById(productId: string) {
    return this.http.get<Product>(`/api/product/${productId}`, {
      withCredentials: true,
    });
  }
}
