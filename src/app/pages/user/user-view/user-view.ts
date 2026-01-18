import { Component, inject, OnInit, signal } from '@angular/core';
import { AppStore } from '../../../store/app.store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { UserService } from '../service/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-user-view',
  imports: [],
  templateUrl: './user-view.html',
  styleUrl: './user-view.css',
})
export class UserView implements OnInit {
  user = signal<User | null>(null);

  appStore = inject(AppStore);
  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap((params) => this.userService.getUserById(params['id']))
    ).subscribe({
      next: (user) => {
        this.user.set(user);
      },
      error: (err) => {
        console.error('Error fetching user:', err);
        this.router.navigate(['/pages/user/list']);
      }
    });
  }
}
