import { Component, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../../shared/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AttributeDetail } from '../../../../models/product.model';
import { TranslocoPipe } from '@ngneat/transloco';
import { Tag } from "primeng/tag";


@Component({
  selector: 'app-attribute-view',
  imports: [
    ToastModule,
    ButtonModule,
    TranslocoPipe,
    Tag
  ],
  templateUrl: './attribute-view.html',
  styleUrl: './attribute-view.css',
  providers: [MessageService]
})
export class AttributeView implements OnInit {

  attributeId: string | null = null;
  attributeName: string | null = null;
  currentAttributeValues = signal<AttributeDetail | null>(null);

  constructor(
    private messageService: MessageService,
    private router: Router,
    private categoryService: CategoryService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.attributeId = this.route.snapshot.paramMap.get('id');
    if (this.attributeId) {
      this.fetchAttribute(this.attributeId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid attribute ID' });
      this.router.navigate(['pages/settings/attribute/list']);
    }
  }

  fetchAttribute(id: string) {
    this.categoryService.getAttributeById(id).subscribe({
      next: (res) => {
        this.currentAttributeValues.set(res);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch attribute details' });
        this.router.navigate(['pages/settings/attribute/list']);
      },
    })
  }

  backToList() {
    this.router.navigate(['pages/settings/attribute/list']);
  }

  getTranslate(translate: string, text: string | number | boolean) {
    if (translate.includes('.')) {
      return text
    }
    return translate
  }
}
