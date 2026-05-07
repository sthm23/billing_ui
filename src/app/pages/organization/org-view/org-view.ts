import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { ScrollerModule, ScrollerScrollIndexChangeEvent } from 'primeng/scroller';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../auth/service/auth';
import { Store } from '../../../models/store.model';
import { StoreService } from '../service/store';
import { AddWarehouse } from '../add-warehouse/add-warehouse';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";

@Component({
  selector: 'app-org-view',
  imports: [
    ButtonModule,
    TagModule,
    OverlayBadgeModule,
    AvatarModule,
    DatePipe,
    // CurrencyPipe,
    // Divider,
    ScrollerModule,
    TagModule,
    AddWarehouse,
    Toast
  ],
  templateUrl: './org-view.html',
  styleUrl: './org-view.css',
  providers: [MessageService]
})
export class OrgView {

  fistPage = 1;
  lastItem = 30;
  addWarehouseVisible = false;

  currentStore = signal<null | Store>(null);

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const isAdmin = this.authService.isAdmin();
      const storeId = params.get('id');
      if (storeId && isAdmin) {
        this.loadCurrentStore(storeId);
      } else {
        this.router.navigate(['/pages/organization/list']);
      }
    })
  }

  private loadCurrentStore(id: string) {

    this.storeService.getStoreById(id).subscribe({
      next: (store) => {
        this.currentStore.set(store);
      },
      error: (err) => {
        console.error('Error fetching current store:', err);
        this.router.navigate(['/pages/organization/list']);
      }
    });

  }



  handleScroll(event: ScrollerScrollIndexChangeEvent) {
    console.log(event);

    this.fistPage = event.first;
    this.lastItem = event.last;

    if (this.fistPage === 0) { }

  }



  userPhone(phone: string) {
    return `${phone.slice(0, 4)} (${phone.slice(4, 6)}) ${phone.slice(6, 9)}-${phone.slice(9, 11)}-${phone.slice(11)}`;
  }

  goToDashboard() {
    this.router.navigate(['/pages/organization/list']);
  }

  addWarehouse() {
    this.addWarehouseVisible = !this.addWarehouseVisible;
  }

  handleError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add warehouse' });
  }
}
