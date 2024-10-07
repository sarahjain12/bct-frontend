import { TestBed } from '@angular/core/testing';

import { BatchPanelService } from './batch-panel.service';

describe('BatchPanelService', () => {
  let service: BatchPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
