import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductResponse, CreateProduct, Product, ProductDetail, CreateProductVariantPayload, SearchProductResponse } from '../../../models/product.model';


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
    return this.http.get<ProductDetail>(`/api/product/${productId}`, {
      withCredentials: true,
    });
  }

  createProductVariants(body: CreateProductVariantPayload) {
    return this.http.post<Product>(`/api/product/variants`, body, {
      withCredentials: true,
    });
  }

  searchProducts(warehouseId: string, text: string) {
    const url = `/api/product/search/${warehouseId}?text=${text}`;
    return this.http.get<SearchProductResponse>(url, {
      withCredentials: true,
    });
  }

  archiveProduct(productId: string) {
    return this.http.delete(`/api/product/${productId}`, {
      withCredentials: true,
    });
  }
}
