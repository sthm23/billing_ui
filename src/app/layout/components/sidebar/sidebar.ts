import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Menu } from '../menu/menu';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { SidebarFooter } from '../sidebar-footer/sidebar-footer';
@Component({
  selector: 'app-sidebar',
  imports: [
    SidebarHeader,
    SidebarFooter,
    Menu,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar { }
