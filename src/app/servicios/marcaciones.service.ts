import { Injectable } from '@angular/core';
import { PeticionService } from '../config/peticiones/peticion.service';

export type TipoMarcacion = 'I' | 'S' | 'A' | 'P' | 'C' | 'F';
export type AccionActividadMarcacion = 'INICIAR' | 'PAUSAR' | 'CONTINUAR' | 'FINALIZAR';

export interface ActividadTurno {
  ActividadTurnoId: number;
  Descripcion: string;
  CierraTurno: number;
}

export interface RegistroMarcacionPayload {
  UsuarioAppId?: Number;
  TipoRegistro: TipoMarcacion;
  Latitud: number;
  Longitud: number;
  NumeroControl?: string;
  StopTurno?: string;
  NuevaActividad?: number;
  CierreTurno?: boolean;
  FotoTercero?: string;
  FotoEntorno?: string;
  ActividadTurnoId?: number;
  NIT?: string;
}

export interface DataHistorialIngreso {
  ActividadTurnoId: number | null;
  Fecha: string;
  Longitud: string;
  NumeroControl?: string;
  RutaFotoTercero?: string;
  RutaFotoEntorno?: string;
  StopTurno?: string;
  TipoRegistro: string;
  latitud: number;
}

export interface RespuestaRegistroTurno {
  success: boolean;
  mensaje: string;
  data?: DataHistorialIngreso[];
}

export interface EstadoMarcacionDia {
  actividadActiva: DataHistorialIngreso | null;
  ingreso?: DataHistorialIngreso | null;
  salida?: DataHistorialIngreso | null;
  [key: string]: any;
}

export interface TurnoAgrupado {
  ingreso?: DataHistorialIngreso;
  eventos: DataHistorialIngreso[];
  salida?: DataHistorialIngreso;
  abierto: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MarcacionesService extends PeticionService {
  private readonly rutaGeneral = 'Autogestion/IngresoTurno/';
  private readonly rutaRegistrar = `${this.rutaGeneral}registrarIngresoTurno`;
  private readonly rutaHistorial = `${this.rutaGeneral}historialIngresoTurno`;
  private actividadesTurno: ActividadTurno[] = [];

  private formatearFechaYmd(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private async obtenerUsuarioAppId(): Promise<string> {
    const usuario = await this.obtenerDatosStorage('usuario');
    const usuarioAppId = usuario?.usuarioId;

    if (!usuarioAppId) {
      throw new Error('No fue posible obtener el UsuarioAppId de la sesion.');
    }

    return String(usuarioAppId);
  }

    private async obtenerNit(): Promise<string> {
    const nit = await this.obtenerDatosStorage('nit');

    if (!nit) {
      throw new Error('No fue posible obtener el NIT de la sesion.');
    }

    return String(nit);
  }

  async obtenerEstadoDia(): Promise<EstadoMarcacionDia> {
    const UsuarioAppId = await this.obtenerUsuarioAppId();
    const fechaHoy = this.formatearFechaYmd(new Date());
    const FechaInicial = fechaHoy;
    const FechaFinal = fechaHoy;

    const response = await this.informacion({ UsuarioAppId, FechaInicial, FechaFinal }, this.rutaHistorial);
    const data = response?.data || [];

    const ordenarPorFechaDesc = (a: DataHistorialIngreso, b: DataHistorialIngreso): number => {
      return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
    };

    const ingreso = [...data]
      .filter((item: DataHistorialIngreso) => item?.TipoRegistro === 'Ingreso Turno')
      .sort(ordenarPorFechaDesc)[0] || null;

    const salida = [...data]
      .filter((item: DataHistorialIngreso) => item?.TipoRegistro === 'Salida Turno')
      .sort(ordenarPorFechaDesc)[0] || null;

    const actividadActivaFind = [...data]
      .sort(ordenarPorFechaDesc)[0] || null;

    return {
      ingreso: ingreso || null,
      salida: salida || null,
      actividadActiva: actividadActivaFind
    };
  }

  async obtenerActividadesTurno(): Promise<ActividadTurno[]> {
    const response = await this.informacion({}, `${this.rutaGeneral}getActividadTurno`);
    this.actividadesTurno = response?.data;
    return Promise.resolve(this.actividadesTurno);
  }

  async registrarMarcacion(payload: RegistroMarcacionPayload): Promise<RespuestaRegistroTurno> {
    const UsuarioAppId = await this.obtenerUsuarioAppId();
    const NIT = await this.obtenerNit();
    return this.informacion({ UsuarioAppId, NIT, ...payload }, this.rutaRegistrar);
  }

  async obtenerReporte(filtros: { desde: string; hasta: string }): Promise<DataHistorialIngreso[]> {
    const UsuarioAppId = await this.obtenerUsuarioAppId();
    const FechaInicial = filtros.desde;
    const FechaFinal = filtros.hasta;

    const response = await this.informacion({ UsuarioAppId, FechaInicial, FechaFinal }, this.rutaHistorial);

    return response?.datos
      || response?.data
      || [];
  }
}
