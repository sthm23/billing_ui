import { Component, OnInit, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CategoryService } from '../../../../shared/services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { AttributeDetail } from '../../../../models/product.model';
import { TranslocoPipe } from '@ngneat/transloco';
import { Tag } from "primeng/tag";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-attribute-view',
  imports: [
    ToastModule,
    ButtonModule,
    TranslocoPipe,
    Tag,
    InputTextModule,
    ReactiveFormsModule
  ],
  templateUrl: './attribute-view.html',
  styleUrl: './attribute-view.css',
  providers: [MessageService]
})
export class AttributeView implements OnInit {

  attributeId: string | null = null;
  attributeName: string | null = null;
  currentAttributeValues = signal<AttributeDetail | null>(null);
  attrValueForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  })

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

  addAttributeValue() {
    if (this.attrValueForm.valid && this.attributeId) {
      const newValue = this.attrValueForm.value.name!;
      const payload = { attributeId: this.attributeId, value: newValue };
      this.categoryService.createAttributeValue(payload).subscribe({
        next: (res) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attribute value added successfully' });
          this.fetchAttribute(this.attributeId!);
          this.attrValueForm.reset();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add attribute value' });
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please enter a valid attribute value' });
    }
  }
}
