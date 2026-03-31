import { Component, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AuthService } from '../../pages/auth/service/auth';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { UserService } from '../../pages/user/service/user.service';
import { UserInfo, UserStockMovement } from '../../models/user.model';
import { Divider } from "primeng/divider";
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { ScrollerModule, ScrollerScrollIndexChangeEvent } from 'primeng/scroller';

@Component({
  selector: 'app-profile',
  imports: [
    ButtonModule,
    TagModule,
    OverlayBadgeModule,
    AvatarModule,
    DatePipe,
    CurrencyPipe,
    Divider,
    ScrollerModule,
    TagModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',

})
export class Profile implements OnInit {

  fistPage = 1;
  lastItem = 30;


  currentUser = signal<null | UserInfo>(null);
  stockMovements = signal<UserStockMovement[]>([]);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      const currentUser = this.authService.getCurrentUser();
      if (productId) {
        this.loadCurrentUser(productId);
      } else if (currentUser && currentUser.id) {
        this.loadCurrentUser(currentUser.id);
      } else {
        this.router.navigate(['/pages/product/list']);
      }
    })

  }

  private loadCurrentUser(id: string) {

    this.userService.getCurrentStaffInfo(id).pipe(
      switchMap(user => {
        this.currentUser.set(user);
        return this.userService.getStockMovementsByUserId(user.staff.id)
      })
    ).subscribe({
      next: (stockMoves) => {
        this.stockMovements.set(stockMoves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.router.navigate(['/']);
      }
    });

  }

  getSeverity(item: UserStockMovement) {
    if (item.reason === 'ADJUSTMENT') {
      return 'warn';
    }
    switch (item.type) {
      case 'IN':
        return 'info';
      case 'OUT':
        return 'success';
      default:
        return 'info';
    }
  }

  handleScroll(event: ScrollerScrollIndexChangeEvent) {
    console.log(event);

    this.fistPage = event.first;
    this.lastItem = event.last;

    if (this.lastItem >= this.stockMovements().length) { }
    if (this.fistPage === 0) { }

  }


  userPayments() {
    const user = this.currentUser();
    if (!user) return 0;
    return user.staff.payments.reduce((total, payment) => +total + +payment.amount, 0);
  }

  totalOrders() {
    const orders = this.orders();
    if (!orders.length) return 0;
    return orders.reduce((total, order) => +total + +order.totalAmount, 0);
  }

  orders() {
    const user = this.currentUser();
    if (!user) return [];
    return user.staff.orders.filter(order => order.status === 'COMPLETED' || order.status === 'DEBT');
  }

  debt() {
    const orders = this.orders();
    if (!orders.length) return 0;
    const total = orders.reduce((total, order) => +total + +order.totalAmount, 0);
    const paid = orders.reduce((total, order) => +total + +order.paidAmount, 0);
    return paid - total;
  }

  userPhone(phone: string) {
    return `${phone.slice(0, 4)} (${phone.slice(4, 6)}) ${phone.slice(6, 9)}-${phone.slice(9, 11)}-${phone.slice(11)}`;
  }

  goToDashboard() {
    this.router.navigate(['/pages/user/list']);
  }
}
