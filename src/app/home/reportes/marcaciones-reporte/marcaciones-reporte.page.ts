import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { MarcacionesService, DataHistorialIngreso, TurnoAgrupado } from 'src/app/servicios/marcaciones.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';

@Component({
  selector: 'app-marcaciones-reporte',
  templateUrl: './marcaciones-reporte.page.html',
  styleUrls: ['./marcaciones-reporte.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class MarcacionesReportePage {
  private marcacionesService = inject(MarcacionesService);
  private notificacionesService = inject(NotificacionesService);
  private validacionPermisosService = inject(ValidacionPermisosService);
  private readonly fotoPorDefecto = 'assets/images/nofoto.png';
  private readonly baseFoto = FuncionesGenerales.urlGestion();

  permisoVerReporte = false;
  cargando = false;

  filtros = {
    desde: '',
    hasta: ''
  };

  reporte: TurnoAgrupado[] = [];
  eventoSeleccionado: DataHistorialIngreso | null = null;

  async ionViewWillEnter() {
    await this.validacionPermisosService.inicializar();
    this.permisoVerReporte = this.validacionPermisosService.validarPermisoLocal(6001015);

    if (!this.permisoVerReporte) {
      this.notificacionesService.notificacion('No tiene permisos para consultar el reporte de marcaciones.');
      return;
    }

    const hoy = new Date().toISOString().slice(0, 10);
    this.filtros.desde = hoy;
    this.filtros.hasta = hoy;
    await this.consultar();
  }

  async consultar() {
    if (!this.filtros.desde || !this.filtros.hasta) {
      this.notificacionesService.notificacion('Debe indicar un rango de fechas.');
      return;
    }

    if (this.filtros.desde > this.filtros.hasta) {
      this.notificacionesService.notificacion('La fecha inicial no puede ser mayor a la fecha final.');
      return;
    }

    this.cargando = true;

    try {
      const registros = await this.marcacionesService.obtenerReporte(this.filtros);
      const registrosOrdenados = registros.sort((a, b) => {
        const fechaA = new Date(a.Fecha || '');
        const fechaB = new Date(b.Fecha || '');
        return fechaA.getTime() - fechaB.getTime();
      });

      const registrosAgrupados: TurnoAgrupado[] = [];
      let turnoActual: TurnoAgrupado | null = null;

      for (const element of registrosOrdenados) {
        switch (element.TipoRegistro) {
          case 'Ingreso Turno':
            if (turnoActual) {
              registrosAgrupados.push({ ...turnoActual, abierto: true });
            }
            turnoActual = { ingreso: element, eventos: [], abierto: false } as TurnoAgrupado;
            break;
          
          case 'Salida Turno':
            if (!turnoActual) turnoActual = { eventos: [], abierto: false } as TurnoAgrupado;
            turnoActual.salida = element;
            registrosAgrupados.push({ ...turnoActual, abierto: false });
            turnoActual = null;
            break;
          
          default:
            if (!turnoActual) turnoActual = { eventos: [], abierto: false } as TurnoAgrupado;
            turnoActual.eventos.push(element);
            break;
        }
      }

      if (turnoActual) {
        registrosAgrupados.push({ ...turnoActual, abierto: true });
      }

      this.reporte = registrosAgrupados;
    } catch (error: any) {
      this.reporte = [];
      this.notificacionesService.notificacion(error?.message || 'No fue posible consultar el reporte de marcaciones.');
    } finally {
      this.cargando = false;
    }
  }

  obtenerHora(item: DataHistorialIngreso): string {
    return item.Fecha || 'Sin dato';
  }

  obtenerFoto(item: DataHistorialIngreso): string {
    const rutaOriginal = (item.RutaFotoEntorno || '').trim();

    if (!rutaOriginal) {
      return this.fotoPorDefecto;
    }

    return `${this.baseFoto}${rutaOriginal.startsWith('./') ? rutaOriginal.substring(2) : rutaOriginal}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;

    if (target) {
      target.src = this.fotoPorDefecto;
    }
  }

  abrirDetalleEvento(evento: DataHistorialIngreso) {
    this.eventoSeleccionado = evento;
  }

  cerrarModalDetalle() {
    this.eventoSeleccionado = null;
  }
}
