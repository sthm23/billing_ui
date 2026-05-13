import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateProduct, Product, ProductDetail, CreateProductVariantPayload, AddInventoryPayload, ProductVariant } from '../../../models/product.model';
import { BaseListResponse } from '../../../models/app.models';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private http: HttpClient
  ) { }

  getProducts(page = 1, pageSize = 10) {
    return this.http.get<BaseListResponse<Product>>(`/api/product?currentPage=${page}&pageSize=${pageSize}`, {
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
    return this.http.get<BaseListResponse<ProductVariant>>(url, {
      withCredentials: true,
    });
  }

  archiveProduct(productId: string) {
    return this.http.delete(`/api/product/${productId}`, {
      withCredentials: true,
    });
  }

  addInventory(warehouseId: string, body: AddInventoryPayload) {
    return this.http.post<{ message: string }>(`/api/warehouse/${warehouseId}/inventory`, body, {
      withCredentials: true,
    });
  }
}
