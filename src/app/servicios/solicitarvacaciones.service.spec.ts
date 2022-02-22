import { TestBed } from '@angular/core/testing';

import { SolicitarvacacionesService } from './solicitarvacaciones.service';

describe('SolicitarvacacionesService', () => {
  let service: SolicitarvacacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitarvacacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
