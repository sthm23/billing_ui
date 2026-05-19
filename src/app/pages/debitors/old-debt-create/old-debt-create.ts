import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { Loader } from '../../../shared/components/loader/loader';
import { DebtService } from '../service/debt.service';
import { AuthService } from '../../auth/service/auth';
import { DatePickerModule } from 'primeng/datepicker';
import { Router } from '@angular/router';
import { InputNumber } from 'primeng/inputnumber';
import { CustomerSearch, SearchCustomer } from "../../../shared/components/customer-search/customer-search";
import { TextareaModule } from 'primeng/textarea';
import { CreateDebtPayload } from '../../../models/order.model';

@Component({
  selector: 'app-old-debt-create',
  imports: [
    Loader,
    ReactiveFormsModule,
    InputTextModule,
    FluidModule,
    ButtonModule,
    TextareaModule,
    InputMaskModule,
    TranslocoPipe,
    DatePickerModule,
    InputNumber,
    FormsModule,
    CustomerSearch,
  ],
  templateUrl: './old-debt-create.html',
  styleUrl: './old-debt-create.css',
})
export class OldDebtCreate {

  oldDebtForm = new FormGroup({
    customerId: new FormControl<string | null>(null, [Validators.required]),
    amount: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    description: new FormControl<string | null>(null),
    createdAt: new FormControl<Date | null>(null),
    returnedAt: new FormControl<Date | null>(null),
  });

  constructor(
    private router: Router,
    private debtService: DebtService,
    private authService: AuthService,
  ) { }

  submitForm() {
    if (this.oldDebtForm.valid) {
      const payload: CreateDebtPayload = {
        customerId: this.oldDebtForm.value.customerId!,
        amount: this.oldDebtForm.value.amount!,
        description: this.oldDebtForm.value.description || undefined,
        storeId: this.authService.getCurrentUser()?.staff?.storeId || '',
        createdAt: this.oldDebtForm.value.createdAt?.toISOString() ?? (new Date()).toISOString(),
        returnedAt: this.oldDebtForm.value.returnedAt?.toISOString() ?? undefined,
      }

      this.debtService.createDebt(payload).subscribe({
        next: () => {
          this.router.navigate(['/pages/debitor/list/old']);
        },
        error: (err) => {
          console.error('Error creating old debt:', err);
        }
      });
    }
  }

  clearForm() {
    this.oldDebtForm.reset();
  }

  backList() {
    this.router.navigate(['/pages/debitor/list/old']);
  }

  handleCustomerSelect(customer: SearchCustomer | null) {
    if (customer) {
      this.oldDebtForm.patchValue({ customerId: customer.id });
    } else {
      this.oldDebtForm.patchValue({ customerId: null });
    }
  }
}
