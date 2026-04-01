import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeList } from './list';

describe('AttributeList', () => {
  let component: AttributeList;
  let fixture: ComponentFixture<AttributeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeList]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AttributeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
