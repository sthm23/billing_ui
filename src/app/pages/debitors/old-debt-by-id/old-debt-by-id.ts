import { Component, OnInit, signal } from '@angular/core';
import { PaymentOperation } from '../../../shared/components/payment-operation/payment-operation';
import { CreateOrderPaymentPayload, DebtPaymentPayload } from '../../../models/order.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DebtService } from '../service/debt.service';
import { ButtonModule } from 'primeng/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth/service/auth';

@Component({
  selector: 'app-old-debt-by-id',
  imports: [
    ButtonModule,
    PaymentOperation,
    TranslocoPipe,
    DatePipe
  ],
  templateUrl: './old-debt-by-id.html',
  styleUrl: './old-debt-by-id.css',
})
export class OldDebtById implements OnInit {

  debt = signal<null | any>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private debtService: DebtService,
    private messageService: MessageService,
    private authService: AuthService,
  ) { }


  ngOnInit() {
    const debitorId = this.route.snapshot.paramMap.get('id');
    if (debitorId) {
      this.loadDebtor(debitorId);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No debitor ID provided in route' });
      console.error('No debitor ID provided in route');
      this.router.navigate(['/pages/debitor/list']);
    }
  }

  private loadDebtor(debitorId: string) {
    this.debtService.getDebtorById(debitorId).subscribe({
      next: (res) => {
        this.debt.set(res);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load debitor data' });
        console.error('Failed to load debitor data', err);
      }
    })

  }

  addPaymentToOrder(debtId: string, payload: CreateOrderPaymentPayload) {
    const warehouseId = this.authService.getCurrentUser()?.staff?.warehouse[0].warehouse.id!;
    const payments = payload.payments.map(p => ({
      amount: +p.amount,
      type: p.type
    }))

    const paymentPayload: DebtPaymentPayload = {
      debtId: debtId,
      warehouseId: warehouseId,
      payments: payments
    }
    this.debtService.createDebtPayment(paymentPayload).subscribe({
      next: (res) => {
        console.log('Payment created successfully', res);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Payment created successfully' });
        this.loadDebtor(debtId);
      },
      error: (err) => {
        console.error('Failed to create payment', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create payment' });
      }
    });
  }

  backOrderList() {
    this.router.navigate(['/pages/debitor/list']);
  }
}
