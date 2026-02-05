import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-footer',
  imports: [],
  templateUrl: './sidebar-footer.html',
  styleUrl: './sidebar-footer.css',
})
export class SidebarFooter {
  date: number = new Date().getFullYear();
}
