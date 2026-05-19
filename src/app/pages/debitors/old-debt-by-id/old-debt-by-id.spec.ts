import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldDebtById } from './old-debt-by-id';

describe('OldDebtById', () => {
  let component: OldDebtById;
  let fixture: ComponentFixture<OldDebtById>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OldDebtById]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OldDebtById);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
