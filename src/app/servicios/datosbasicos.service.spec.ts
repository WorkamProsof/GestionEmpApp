import { TestBed } from '@angular/core/testing';

import { DatosbasicosService } from './datosbasicos.service';

describe('DatosbasicosService', () => {
  let service: DatosbasicosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosbasicosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
