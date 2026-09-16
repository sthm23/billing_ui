# Billing Web UI — Angular Frontend

> **Context**: Web frontend for my-billing retail POS system

---

## Technology Stack

- **Framework**: Angular 21
- **UI Library**: PrimeNG (Table, Button, Dialog, Toast, Drawer, etc.)
- **i18n**: Transloco (en, ru, uz)
- **State Management**: Angular Signals + @ngrx/signals
- **Styling**: SCSS + PrimeNG themes
- **HTTP**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading

---

## Responsibility

This application provides the **web user interface** for the billing system.

**What web does**:
- Display data from backend API
- Handle user interactions (forms, clicks, navigation)
- Client-side validation (UX only, server validates)
- Manage UI state (loading, errors, selections)
- Navigate between pages

**What web does NOT do**:
- Implement business logic (that's backend's job)
- Calculate stock, prices, totals independently (trust backend)
- Make direct database calls

---

## Application Structure

```
src/app/
├── layout/               # App shell (sidebar, header, footer)
│   ├── sidebar/
│   └── header/
├── models/               # TypeScript interfaces (Order, Product, Payment, etc.)
├── pages/                # Lazy-loaded route pages
│   ├── auth/             # Login/signup
│   ├── dashboard/        # Home dashboard
│   ├── order/            # Order management (create, list, view, return)
│   ├── debitors/         # Debt management (DEBT orders + CustomerDebt)
│   ├── payments/         # Cashbox management
│   ├── product/          # Product/inventory management
│   ├── user/             # User management (ADMIN, OWNER only)
│   └── settings/         # Settings (stores, warehouses, ADMIN only)
├── shared/
│   ├── guards/           # Route guards (hasAccessGuard for roles)
│   ├── services/         # API services (OrderService, ProductService, etc.)
│   ├── interceptors/     # HTTP interceptors (auth, error handling)
│   └── components/       # Reusable UI components
└── store/                # State management (@ngrx/signals)
```

---

## Standalone Components

**All components are standalone** (no `NgModule`).

**Pattern**:
```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,        // PrimeNG
    ButtonModule,
    TranslocoModule,    // i18n
  ],
  templateUrl: './product-list.component.html',
  providers: [MessageService, ConfirmationService],  // Local providers
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products'
        });
        this.loading.set(false);
      }
    });
  }
}
```

---

## Angular Signals

Use **signals** for reactive state management.

**Example**:
```typescript
// Reactive state
products = signal<Product[]>([]);
selectedProduct = signal<Product | null>(null);
loading = signal(false);

// Computed values
totalProducts = computed(() => this.products().length);
hasProducts = computed(() => this.products().length > 0);

// Update signal
addProduct(product: Product) {
  this.products.update(current => [...current, product]);
}
```

**In Template**:
```html
<div *ngIf="loading()">Loading...</div>
<div *ngIf="!loading() && hasProducts()">
  Found {{ totalProducts() }} products
</div>
```

---

## Route Structure

```
/ (root)
├── /login                        # Public (unauth)
├── /dashboard                    # Authenticated
├── /order
│   ├── /list                     # All orders
│   ├── /create                   # New order
│   ├── /view/:id                 # Order details
│   └── /return/:id               # Return order
├── /debitors                     # Debt management
├── /payments                     # Cashbox management
├── /product
│   ├── /list                     # Product list
│   ├── /create                   # New product
│   └── /edit/:id                 # Edit product
├── /user                         # ADMIN, OWNER only
└── /settings                     # ADMIN only
    ├── /stores
    └── /warehouses
```

---

## Route Guards & Permissions

### hasAccessGuard

**Purpose**: Check user role before allowing access to route.

**Usage**:
```typescript
const routes: Routes = [
  {
    path: 'product',
    canActivate: [hasAccessGuard],
    data: { roles: ['ADMIN', 'OWNER', 'MANAGER'] },
    loadComponent: () => import('./pages/product/product-list/product-list.component')
  },
  {
    path: 'user',
    canActivate: [hasAccessGuard],
    data: { roles: ['ADMIN', 'OWNER'] },
    loadComponent: () => import('./pages/user/user-list/user-list.component')
  },
  {
    path: 'settings',
    canActivate: [hasAccessGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./pages/settings/settings.component')
  },
  {
    path: 'order',
    // No guard — open to all authenticated users
    loadComponent: () => import('./pages/order/order-list/order-list.component')
  }
];
```

**Current User**:
- Stored in `localStorage` after login
- Retrieved via `AuthService.getCurrentUser()`
- Type: `CurrentUserType` (see `models/auth.model.ts`)

---

## API Communication

### Base URL

Configured in `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',  // Development
};
```

### HTTP Interceptors

**Auth Interceptor** (`auth.interceptor.ts`):
- Adds `Authorization: Bearer <token>` header to all requests
- Adds `withCredentials: true` for cookies
- On 401 error: attempts token refresh → retries request → or logs out

**Pattern**:
```typescript
// On 401 response
if (error.status === 401 && !request.url.includes('/refresh')) {
  return this.handle401Error(request, next);
}
```

---

### API Services

**Location**: `src/app/shared/services/`

**Pattern**:
```typescript
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/order`;

  constructor(private http: HttpClient) {}

  getOrders(page = 1, pageSize = 10): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(
      `${this.apiUrl}?currentPage=${page}&pageSize=${pageSize}`,
      { withCredentials: true }
    );
  }

  createOrder(dto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(
      this.apiUrl,
      dto,
      { withCredentials: true }
    );
  }
}
```

**Available Services**:
- `AuthService` → `/api/auth/*`
- `OrderService` → `/api/order/*`
- `ProductService` → `/api/product/*`
- `PaymentService` → `/api/cashbox/*` ⚠️ Note: uses `/cashbox` endpoint!
- `DebtService` → `/api/debt/*`
- `UserService` → `/api/user/*`

---

## Internationalization (i18n)

**Transloco** with 3 languages: English (en), Russian (ru), Uzbek (uz).

**Translation Files**: `assets/i18next/locales/{en,ru,uz}.ts`

**Usage in Component**:
```typescript
@Component({
  imports: [TranslocoModule]
})
export class MyComponent {
  // Access translation service
  constructor(private transloco: TranslocoService) {}

  getMessage() {
    return this.transloco.translate('order.status.DEBT');
  }
}
```

**Usage in Template**:
```html
<h1>{{ 'navigation.products' | transloco }}</h1>
<p>{{ 'order.status.' + order.status | transloco }}</p>
```

**Translation Key Pattern**:
```typescript
'navigation.products'         // Navigation items
'order.status.DEBT'           // Order statuses
'common.save'                 // Common actions
'errors.insufficient_stock'   // Error messages
```

---

## PrimeNG Integration

### Common Components

**Table** (`p-table`):
```html
<p-table
  [value]="products()"
  [loading]="loading()"
  [paginator]="true"
  [rows]="10"
>
  <ng-template pTemplate="header">
    <tr>
      <th>{{ 'product.name' | transloco }}</th>
      <th>{{ 'product.price' | transloco }}</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-product>
    <tr>
      <td>{{ product.name }}</td>
      <td>{{ product.price | currency }}</td>
    </tr>
  </ng-template>
</p-table>
```

**Button** (`p-button`):
```html
<p-button
  label="{{ 'common.save' | transloco }}"
  icon="pi pi-check"
  (onClick)="save()"
  [loading]="saving()"
/>
```

**Dialog** (`p-dialog`):
```html
<p-dialog
  [(visible)]="displayDialog"
  [header]="'product.create' | transloco"
  [modal]="true"
>
  <ng-template pTemplate="content">
    <!-- Form content -->
  </ng-template>
  <ng-template pTemplate="footer">
    <p-button label="Cancel" (onClick)="displayDialog = false" />
    <p-button label="Save" (onClick)="save()" />
  </ng-template>
</p-dialog>
```

**Toast** (MessageService):
```typescript
constructor(private messageService: MessageService) {}

showSuccess() {
  this.messageService.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Product created successfully'
  });
}

showError() {
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Failed to create product'
  });
}
```

### PrimeNG Providers

**Always add to component providers**:
```typescript
@Component({
  providers: [MessageService, ConfirmationService]
})
```

---

## TypeScript Models

**Location**: `src/app/models/`

**Key Models**:
- `auth.model.ts` — `AuthRequest`, `AuthResponse`, `CurrentUserType`
- `user.model.ts` — `User`, `Staff`, `Customer`, `UserRole`, `StaffRole`
- `order.model.ts` — `Order`, `OrderItem`, `OrderStatus`, `PaymentType`
- `product.model.ts` — `Product`, `ProductVariant`, `Inventory`
- `payment.model.ts` — `Payment`, `Cashbox`, `CashTransaction`
- `store.model.ts` — `Store`, `Warehouse`

**Always import and use these types**:
```typescript
import { Order, OrderStatus } from '@/models/order.model';
import { Product } from '@/models/product.model';
```

---

## Common Patterns

### Loading Data on Init

```typescript
@Component({ ... })
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(false);

  constructor(
    private productService: ProductService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load products'
        });
        this.loading.set(false);
      }
    });
  }
}
```

---

### Form Submission

```typescript
@Component({ ... })
export class ProductCreateComponent {
  saving = signal(false);
  form = signal<ProductForm>({
    name: '',
    warehouseId: '',
    // ...
  });

  constructor(
    private productService: ProductService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onSubmit() {
    if (!this.isValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    this.saving.set(true);
    this.productService.createProduct(this.form()).subscribe({
      next: (product) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Product created successfully'
        });
        this.router.navigate(['/product/list']);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to create product'
        });
        this.saving.set(false);
      }
    });
  }

  isValid(): boolean {
    return !!this.form().name && !!this.form().warehouseId;
  }
}
```

---

### Confirmation Dialog

```typescript
constructor(
  private confirmationService: ConfirmationService,
  private messageService: MessageService,
  private productService: ProductService
) {}

deleteProduct(product: Product) {
  this.confirmationService.confirm({
    message: `Are you sure you want to delete ${product.name}?`,
    header: 'Confirm Delete',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Product deleted successfully'
          });
          this.loadProducts();  // Refresh list
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete product'
          });
        }
      });
    }
  });
}
```

---

## Important Notes

### State Management

**Current approach**: Mix of signals + @ngrx/signals

**Global Store** (`app.store.ts`):
- Manages products, user
- Some sections commented out (orders, payments)

**Component State**:
- Most components manage their own state with signals
- Load data on init, store in component signals

**Recommendation**: Continue using component-level signals for most features. Use global store only for truly shared state.

---

### Error Handling

**Current pattern**:
```typescript
error: (err) => {
  console.error('Error:', err);
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: err.message || 'Operation failed'
  });
}
```

**Improvement needed**: Global error handler for consistent UX.

---

### localStorage Access

**Current issue**: Direct `localStorage` access breaks SSR.

**Fix**: Use `afterNextRender()` or check `isPlatformBrowser()`:
```typescript
import { afterNextRender } from '@angular/core';

constructor() {
  afterNextRender(() => {
    const token = localStorage.getItem('my_billing_token');
  });
}
```

---

### API Base URL

**Current**: Hardcoded in `environment.ts`

**For production**: Use build-time environment variables or Angular's environment replacement.

---

## Development Workflow

### 1. Adding New Page

**Example**: Create a "Reports" page

1. Generate component:
   ```bash
   ng generate component pages/reports/report-list --standalone
   ```

2. Add route:
   ```typescript
   // app.routes.ts
   {
     path: 'reports',
     canActivate: [hasAccessGuard],
     data: { roles: ['ADMIN', 'OWNER', 'MANAGER'] },
     loadComponent: () => import('./pages/reports/report-list/report-list.component')
   }
   ```

3. Add to sidebar:
   ```html
   <!-- layout/sidebar/sidebar.component.html -->
   <a routerLink="/reports">
     <i class="pi pi-chart-bar"></i>
     <span>{{ 'navigation.reports' | transloco }}</span>
   </a>
   ```

4. Add translations:
   ```typescript
   // assets/i18next/locales/en.ts
   navigation: {
     reports: 'Reports'
   }
   ```

---

### 2. Adding New API Service

**Example**: Create `ReportService`

```typescript
// shared/services/report.service.ts
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/reports`;

  constructor(private http: HttpClient) {}

  getReport(storeId: string, dateFrom: string, dateTo: string): Observable<Report> {
    return this.http.get<Report>(
      `${this.apiUrl}?storeId=${storeId}&from=${dateFrom}&to=${dateTo}`,
      { withCredentials: true }
    );
  }
}
```

---

### 3. Before Creating New Feature

**Always check existing implementation**:

1. Find similar page:
   ```bash
   ls src/app/pages/order/
   ```

2. Check existing service:
   ```bash
   ls src/app/shared/services/
   ```

3. Review existing component patterns
4. **Follow existing patterns** — don't introduce new architectural approaches

---

## Related Documentation

- **Root entry point**: `../AGENTS.md`
- **Business concepts**: `../docs/business-domain.md`
- **API endpoints**: `../docs/api-map.md`
- **Backend architecture**: `../billing/AGENTS.md`

---

## Quick Commands

```bash
# Development
ng serve                          # Start dev server (http://localhost:4200)
ng serve --open                   # Open browser automatically

# Build
ng build                          # Production build to dist/
ng build --configuration production

# Generate
ng generate component <name> --standalone
ng generate service <name>
ng generate guard <name>

# Testing
ng test                           # Unit tests (Vitest)
ng e2e                            # E2E tests (if configured)

# Code Quality
ng lint                           # ESLint
```

---

**Remember**: This frontend **displays data** and **handles user interactions**. **Business logic lives in the backend.**
