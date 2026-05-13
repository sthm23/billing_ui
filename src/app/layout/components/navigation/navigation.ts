import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';

@Component({
  selector: 'app-navigation',
  imports: [
    ButtonModule, SpeedDialModule,
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css',
})
export class Navigation implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Add',
        icon: 'pi pi-pencil',
      },
      {
        label: 'Update',
        icon: 'pi pi-refresh',
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
      },
      {
        label: 'Upload',
        icon: 'pi pi-upload',
      },
      {
        label: 'Website',
        icon: 'pi pi-external-link',
      }
    ];
  }

  toggleCallback(event: any, item?: MenuItem) {
    console.log(event, item);
  }
}
