import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeCreate } from './create';

describe('AttributeCreate', () => {
  let component: AttributeCreate;
  let fixture: ComponentFixture<AttributeCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeCreate]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AttributeCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should AttributeCreate', () => {
    expect(component).toBeTruthy();
  });
});
