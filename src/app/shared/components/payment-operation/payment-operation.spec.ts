import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentOperation } from './payment-operation';

describe('PaymentOperation', () => {
  let component: PaymentOperation;
  let fixture: ComponentFixture<PaymentOperation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentOperation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentOperation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
