import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentById } from './payment-by-id';

describe('PaymentById', () => {
  let component: PaymentById;
  let fixture: ComponentFixture<PaymentById>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentById]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentById);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
