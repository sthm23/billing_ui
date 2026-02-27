import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderMain } from './order-main';

describe('OrderMain', () => {
  let component: OrderMain;
  let fixture: ComponentFixture<OrderMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
