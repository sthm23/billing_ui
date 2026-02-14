import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Category, BrandResponse } from "../../models/product.model";


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {
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
}
