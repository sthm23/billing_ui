import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderId } from './order-id';

describe('OrderId', () => {
  let component: OrderId;
  let fixture: ComponentFixture<OrderId>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderId]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderId);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
