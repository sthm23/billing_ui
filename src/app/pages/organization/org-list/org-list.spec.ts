import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgList } from './org-list';

describe('OrgList', () => {
  let component: OrgList;
  let fixture: ComponentFixture<OrgList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
