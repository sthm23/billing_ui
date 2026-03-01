import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleDialog } from './sale-dialog';

describe('SaleDialog', () => {
  let component: SaleDialog;
  let fixture: ComponentFixture<SaleDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
