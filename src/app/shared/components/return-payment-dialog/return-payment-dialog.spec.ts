import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnPaymentDialog } from './return-payment-dialog';

describe('ReturnPaymentDialog', () => {
  let component: ReturnPaymentDialog;
  let fixture: ComponentFixture<ReturnPaymentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnPaymentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnPaymentDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
