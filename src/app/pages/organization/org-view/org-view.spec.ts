import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgView } from './org-view';

describe('OrgView', () => {
  let component: OrgView;
  let fixture: ComponentFixture<OrgView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
