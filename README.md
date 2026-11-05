# Billing Web UI — Angular Frontend

Web frontend for **my-billing** retail POS system.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
ng serve
```

Application runs at: `http://localhost:4200`

---

## 📚 Documentation

### For AI / Developers

**Start here**: [`AGENTS.md`](./AGENTS.md) — Web development guide

**Root documentation**:
- [`../AGENTS.md`](../AGENTS.md) — Project overview
- [`../docs/INDEX.md`](../docs/INDEX.md) — Documentation index
- [`../docs/business-domain.md`](../docs/business-domain.md) — Business concepts
- [`../docs/api-map.md`](../docs/api-map.md) — API endpoints
- [`../docs/workflows/`](../docs/workflows/) — Business workflows

**Architecture notes**:
- [`ANALIZE.md`](./ANALIZE.md) — Angular architecture analysis (issues & recommendations)

---

## 🛠️ Development Commands

```bash
# Development
ng serve                       # Start dev server (http://localhost:4200)
ng serve --open                # Open browser automatically

# Build
ng build                       # Production build to dist/
ng build --configuration production

# Code Generation
ng generate component <name> --standalone
ng generate service <name>
ng generate guard <name>

# Testing
ng test                        # Unit tests (Vitest)
ng e2e                         # End-to-end tests

# Code Quality
ng lint                        # ESLint
```

---

## 🏗️ Project Structure

```
src/app/
├── layout/              # App shell (sidebar, header)
├── models/              # TypeScript interfaces
├── pages/               # Lazy-loaded route pages
│   ├── auth/            # Login
│   ├── dashboard/       # Home
│   ├── order/           # Order management
│   ├── debitors/        # Debt tracking
│   ├── payments/        # Cashbox operations
│   ├── product/         # Product/inventory
│   ├── user/            # User management
│   └── settings/        # Settings (ADMIN only)
├── shared/
│   ├── guards/          # Route guards (hasAccessGuard)
│   ├── services/        # API services
│   ├── interceptors/    # HTTP interceptors
│   └── components/      # Reusable UI components
└── store/               # State management
```

---

## 🔑 Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',  // Backend API URL
};
```

---

## 📦 Tech Stack

- **Angular** 21 — Modern web framework
- **PrimeNG** — Rich UI component library
- **Transloco** — i18n (en, ru, uz)
- **Angular Signals** — Reactive state management
- **RxJS** — Reactive extensions
- **TypeScript** — Type-safe JavaScript

---

## 🎨 Key Features

- ✅ **Standalone Components** — No NgModule
- ✅ **PrimeNG UI** — Table, Button, Dialog, Toast, etc.
- ✅ **i18n** — English, Russian, Uzbek
- ✅ **Signals** — Modern reactive state
- ✅ **Role-based Access** — hasAccessGuard
- ✅ **JWT Auth** — Auto token refresh

---

## 🔗 Related Projects

- **Backend API**: [`../billing/`](../billing/)
- **Mobile App**: [`../billing-mobile/`](../billing-mobile/)

---

## 📖 Learn More

- [Angular Documentation](https://angular.dev)
- [PrimeNG Documentation](https://primeng.org)
- [Transloco Documentation](https://jsverse.github.io/transloco/)

---

## 📄 License

MIT
