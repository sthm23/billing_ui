import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateProduct, Product, ProductResponse } from '../../../models/product.model';


@Injectable({
  providedIn: 'root',
})
export class ProductService {

  constructor(
    private http: HttpClient
  ) { }

  getProducts(page: number, pageSize: number) {
    return this.http.get<ProductResponse>(`/api/products?currentPage=${page}&pageSize=${pageSize}`, {
      withCredentials: true,
    });
  }

  createProduct(data: CreateProduct) {
    return this.http.post<Product>(`/api/products`, data, {
      withCredentials: true,
    });
  }
}
