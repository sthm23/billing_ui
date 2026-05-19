import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-home',
  imports: [
    TabsModule,
    RouterModule,
    TranslocoPipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  activeTab = 'list';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
  ) {
    this.activeRoute.url.subscribe(() => {
      this.activeTab = this.router.url.split('/').pop() || 'list';
    });
  }
}
