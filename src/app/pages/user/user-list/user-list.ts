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

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule
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
      .pipe(
        delay(1500)
      ).subscribe({
        next: (response) => {
          this.appStore.stopLoader();
          this.users = response.data;
          this.total.set(response.total);
        },
        error: (err) => {
          this.appStore.stopLoader();
          console.error('Error fetching users:', err);
        }
      });
  }

  pageChange(event: any) {
    this.dataTable.reset();
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchUsers(this.first() / this.rows + 1, this.rows);
  }

  goToOrgSchema(user: User) {
    this.router.navigate(['/pages/user/view', user.id]);
  }

  createUser() {
    this.router.navigate(['/pages/user/create']);
  }

  selectUser(user: User) {
    this.router.navigate(['/settings/profile', user.id]);
  }

  ngOnDestroy() {
    this.appStore.stopLoader();
  }

}
