import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalService } from './additional-service';

describe('AdditionalService', () => {
  let component: AdditionalService;
  let fixture: ComponentFixture<AdditionalService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
