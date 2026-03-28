import { Component } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-sidebar-footer',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './sidebar-footer.html',
  styleUrl: './sidebar-footer.css',
})
export class SidebarFooter {
  date: number = new Date().getFullYear();
}
