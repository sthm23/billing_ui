import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-additional-service',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    NgClass,
    ToggleSwitchModule,
    InputTextModule,
    FloatLabelModule,
    InputNumberModule,
    DividerModule,
    TextareaModule,
    TranslocoPipe
  ],
  templateUrl: './additional-service.html',
  styleUrl: './additional-service.css',
})
export class AdditionalService implements OnInit {

  @Input() additionalServicesForm!: FormGroup<any>

  ngOnInit(): void {
    this.isActive.valueChanges.subscribe(disabled => {
      const items = this.additionalServices;
      if (disabled) {
        items.enable();
      } else {
        items.disable();
      }
    });
  }

  get additionalServices() {
    return (this.additionalServicesForm.get('services') as FormArray);
  }

  get isActive() {
    return this.additionalServicesForm.get('isActive') as FormControl;
  }

  addService() {
    const newService = new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
      price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
      description: new FormControl('', { nonNullable: true })
    });
    this.additionalServices.push(newService);
  }

  removeService(index: number) {
    this.additionalServices.removeAt(index);
  }
}
