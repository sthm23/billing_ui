import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingExpenseDialog } from './incoming-expense-dialog';

describe('IncomingExpenseDialog', () => {
  let component: IncomingExpenseDialog;
  let fixture: ComponentFixture<IncomingExpenseDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingExpenseDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomingExpenseDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
