import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldDebtCreate } from './old-debt-create';

describe('OldDebtCreate', () => {
  let component: OldDebtCreate;
  let fixture: ComponentFixture<OldDebtCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OldDebtCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OldDebtCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
