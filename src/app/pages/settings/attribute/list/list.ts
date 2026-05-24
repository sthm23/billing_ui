import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule, TablePageEvent } from 'primeng/table';
import { AppStore } from '../../../../store/app.store';
import { Router } from '@angular/router';
import { Attribute, AttributePayload } from '../../../../models/product.model';
import { CategoryService } from '../../../../shared/services/category.service';
import { TranslocoPipe } from '@ngneat/transloco';
import { AttributeCreate } from '../create/create';

@Component({
  selector: 'app-attribute-list',
  imports: [
    TableModule,
    ButtonModule,
    TranslocoPipe,
    AttributeCreate
  ],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class AttributeList implements OnInit {

  attributes = signal<Attribute[]>([]);
  first = signal(0);
  rows = 10;
  total = signal(0);
  visibleCreate = false
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
        this.attributes.set(res.data);
        this.total.set(res.total);
        this.appStore.stopLoader();
      },
      error: (err) => {
        this.appStore.stopLoader();
      },
    })
  }

  selectAttribute(attribute: Attribute) {
    this.router.navigate([`pages/settings/attribute/view/${attribute.id}`]);
  }

  pageChange(event: TablePageEvent) {
    this.first.set(event.first);
    this.rows = event.rows;
    this.fetchAttributes(event.first / event.rows + 1, event.rows);
  }

  goToDashboard() {
    this.router.navigate(['/']);
  }

  createAttribute() {
    this.visibleCreate = true;
  }

  handleData(event: AttributePayload) {
    this.categoryService.createAttribute(event).subscribe({
      next: (res) => {
        this.fetchAttributes(this.first() / this.rows + 1, this.rows);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  getTranslate(translate: string, text: string) {
    if (translate.includes('.')) {
      return text
    }
    return translate
  }
}
