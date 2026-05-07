import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariantDialog } from './variant-dialog';

describe('VariantDialog', () => {
  let component: VariantDialog;
  let fixture: ComponentFixture<VariantDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariantDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VariantDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
