import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeView } from './attribute-view';

describe('AttributeView', () => {
  let component: AttributeView;
  let fixture: ComponentFixture<AttributeView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributeView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
