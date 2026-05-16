import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { hasAccessGuard } from './has-access-guard';

describe('hasAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => hasAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
