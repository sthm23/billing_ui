import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrderPayment } from './create-order-payment';

describe('CreateOrderPayment', () => {
  let component: CreateOrderPayment;
  let fixture: ComponentFixture<CreateOrderPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOrderPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
