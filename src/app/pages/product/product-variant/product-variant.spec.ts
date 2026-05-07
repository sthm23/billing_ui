import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariant } from './product-variant';

describe('ProductVariant', () => {
  let component: ProductVariant;
  let fixture: ComponentFixture<ProductVariant>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariant]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductVariant);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
