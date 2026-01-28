import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleAgrupado } from './detalle-agrupado.page';

describe('DetalleAgrupado', () => {
  let component: DetalleAgrupado;
  let fixture: ComponentFixture<DetalleAgrupado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleAgrupado],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleAgrupado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
