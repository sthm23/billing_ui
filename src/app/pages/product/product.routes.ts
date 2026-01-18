import { Routes } from "@angular/router";
import { ProductList } from "./product-list/product-list";
import { ProductCreate } from "./product-create/product-create";
import { ProductCard } from "./product-card/product-card";
import { ProductVariant } from "./product-variant/product-variant";



export default [
  { path: 'list', component: ProductList },
  { path: 'create', component: ProductCreate },
  { path: ':id', component: ProductCard },
  { path: ':id/variant', component: ProductVariant },
] as Routes;
