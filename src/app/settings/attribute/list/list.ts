import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AppStore } from '../../../store/app.store';
import { Router } from '@angular/router';
import { CategoryService } from '../../../pages/service/category.service';
import { Attribute } from '../../../models/product.model';

@Component({
  selector: 'app-attribute-list',
  imports: [
    TableModule,
    ButtonModule
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class AttributeList implements OnInit {

  attributes = signal<Attribute[]>([]);
  first = signal(0);
  rows = 10;
  total = signal(0);

  public appStore = inject(AppStore);

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.fetchAttributes(this.first() / this.rows + 1, this.rows);
  }

  fetchAttributes(page = 1, pageSize = 10) {
    this.appStore.startLoader();
    this.categoryService.getAttributeList(page, pageSize).subscribe({
      next: (res) => {
        this.attributes.set(res);
        this.total.set(res.length);
        this.appStore.stopLoader();
      },
      error: (err) => {
        this.appStore.stopLoader();
      },
    })
  }

  selectAttribute(attribute: Attribute) {
    this.router.navigate([`/settings/attribute/view/${attribute.id}`]);
  }

  pageChange(event: any) {
    // Handle pagination change
  }

  goToDashboard() {
    this.router.navigate(['/']);
  }

  createAttribute() {
    this.router.navigate(['/settings/attribute/create']);
  }
}
