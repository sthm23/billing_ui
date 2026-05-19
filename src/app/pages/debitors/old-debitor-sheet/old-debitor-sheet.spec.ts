import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldDebitorSheet } from './old-debitor-sheet';

describe('OldDebitorSheet', () => {
  let component: OldDebitorSheet;
  let fixture: ComponentFixture<OldDebitorSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OldDebitorSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OldDebitorSheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
