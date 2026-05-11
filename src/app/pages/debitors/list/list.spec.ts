import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitorList } from './list';

describe('DebitorList', () => {
  let component: DebitorList;
  let fixture: ComponentFixture<DebitorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitorList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DebitorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
