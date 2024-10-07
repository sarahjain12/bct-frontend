import { TestBed } from '@angular/core/testing';

import { StornoDataSharedService } from './storno-data-shared.service';

describe('StornoDataSharedService', () => {
  let service: StornoDataSharedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StornoDataSharedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
