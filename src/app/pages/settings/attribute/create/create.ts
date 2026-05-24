import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AttributePayload } from '../../../../models/product.model';

@Component({
  selector: 'app-attribute-create',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TranslocoPipe,
    ReactiveFormsModule
  ],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class AttributeCreate {

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() data = new EventEmitter<AttributePayload>();

  attributeType = [
    { label: 'String', value: 'STRING' },
    { label: 'Number', value: 'NUMBER' },
    { label: 'Boolean', value: 'BOOLEAN' },
  ];

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
  })

  submit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.data.emit({ name: formValue.name!, type: formValue.type! as any });
      this.form.reset();
      this.hideDialog();
    } else {
      this.form.markAllAsTouched();
    }
  }

  hideDialog() {
    this.visibleChange.emit(false);
  }

  isValid(controlName: string): string {
    const control = this.form.get(controlName);
    return control && control.touched && control.invalid ? 'ng-dirty ng-invalid' : ''
  }
}
