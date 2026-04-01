import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCardInfo } from './order-card-info';

describe('OrderCardInfo', () => {
  let component: OrderCardInfo;
  let fixture: ComponentFixture<OrderCardInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderCardInfo]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderCardInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
