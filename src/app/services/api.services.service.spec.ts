import { TestBed } from '@angular/core/testing';

import { Api.ServicesService } from './api.services.service';

describe('Api.ServicesService', () => {
  let service: Api.ServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Api.ServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
