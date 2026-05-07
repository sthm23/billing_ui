import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { User } from '../../../models/user.model';
import { AppStore } from '../../../store/app.store';
import { delay } from 'rxjs';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    TranslocoPipe,
    TagModule,
    InputTextModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class UserList implements OnInit, OnDestroy {
  users: User[] = []
  first = signal(0);
  rows = 10;
  total = signal(0);

  @ViewChild('dt') dataTable!: Table;

  private userService = inject(UserService)
  public appStore = inject(AppStore);

  constructor(private router: Router) { }

  ngOnInit() {
    this.fetchUsers(this.first() / this.rows + 1, this.rows);
  }

  fetchUsers(page = 1, pageSize = 10) {
    this.appStore.startLoader();
    this.userService.getUsers(page, pageSize)
      .subscribe({
        next: (response) => {
          this.appStore.stopLoader();
          this.users = response.data;
          this.total.set(response.total);
        },
        error: (err) => {
          this.appStore.stopLoader();
          console.error('Error fetching users:', err);
          this.router.navigate(['/pages/order/list']);
        }
      });
  }

  pageChange(event: any) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchUsers(this.first() / this.rows + 1, this.rows);
  }

  createUser() {
    this.router.navigate(['/pages/user/create']);
  }

  selectUser(user: User) {
    this.router.navigate(['pages/profile', user.id]);
  }

  getUserRole(user: User): string {
    if (user.role === 'OWNER') {
      return 'owner';
    } else if (user.role === 'ADMIN') {
      return 'admin';
    } else {
      return user.staff?.role.toLowerCase() || 'staff';
    }
  }

  getSeverity(user: User) {
    if (user.role === 'OWNER') {
      return 'info';
    } else if (user.role === 'ADMIN') {
      return 'danger';
    } else {
      return null;
    }
  }

  normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
    }
    return phone;
  }

  deleteUser(user: User) {
    //need to implement disable user instead of delete, because of foreign key constraints in database
  }

  ngOnDestroy() {
    this.appStore.stopLoader();
  }

}
