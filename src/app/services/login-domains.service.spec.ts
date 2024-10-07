import { TestBed } from '@angular/core/testing';

import { LoginDomainsService } from './login-domains.service';

describe('LoginDomainsService', () => {
  let service: LoginDomainsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginDomainsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
