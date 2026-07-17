import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { MarcacionesDispositivoService } from 'src/app/servicios/marcaciones-dispositivo.service';
import {
  ActividadTurno,
  AccionActividadMarcacion,
  DataHistorialIngreso,
  MarcacionesService,
  TipoMarcacion
} from 'src/app/servicios/marcaciones.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { ValidacionPermisosService } from 'src/app/servicios/validacion-permisos.service';

@Component({
  selector: 'app-marcaciones',
  templateUrl: './marcaciones.page.html',
  styleUrls: ['./marcaciones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class MarcacionesPage {
  private marcacionesService = inject(MarcacionesService);
  private dispositivoService = inject(MarcacionesDispositivoService);
  private notificacionesService = inject(NotificacionesService);
  private validacionPermisosService = inject(ValidacionPermisosService);
  private resolverPreviewFotos: ((accion: 'confirmar' | 'recapturar' | 'cancelar') => void) | null = null;

  permisoRegistrar = false;
  cargando = false;
  procesandoMarcacion = false;

  estadoDia = {
    ingreso: null as DataHistorialIngreso | null,
    salida: null as DataHistorialIngreso | null,
    actividadActiva: null as DataHistorialIngreso | null
  };

  actividadesTotales: ActividadTurno[] = [];
  actividades: ActividadTurno[] = [];
  actividadSeleccionadaId = 0;
  observacionActividad = '';
  motivoPausaActividad = '';
  nuevaActividadId = 0;
  observacionCambioActividad = '';
  mostrarFormularioInicioActividad = false;
  mostrarFormularioPausaActividad = false;
  mostrarFormularioCambioActividad = false;
  mostrarPreviewFotos = false;
  fotoPreviewTercero = '';
  fotoPreviewEntorno = '';

  async ionViewWillEnter() {
    await this.validarPermisos();

    if (this.permisoRegistrar) {
      await this.cargarDatosIniciales();
    }
  }

  private async validarPermisos() {
    await this.validacionPermisosService.inicializar();

    this.permisoRegistrar = this.validacionPermisosService.validarPermisoLocal(6001015);

    if (!this.permisoRegistrar) {
      this.notificacionesService.notificacion('No tiene permisos para acceder al módulo de marcaciones.');
    }
  }

  private async cargarDatosIniciales() {
    this.cargando = true;

    try {
      await this.cargarEstadoDia();
      await this.cargarActividadesTurno();
    } catch (error: any) {
      this.notificacionesService.notificacion(error?.message || 'No fue posible cargar la información de marcaciones.');
    } finally {
      this.cargando = false;
    }
  }

  private async cargarActividadesTurno() {
    const actividadesLista = await this.marcacionesService.obtenerActividadesTurno();
    this.actividadesTotales = actividadesLista;
    this.actividades = actividadesLista.filter((item) => item.CierraTurno !== 1);

    // Selecciona la primera actividad que no sea de cierre de turno, si no hay una actividad seleccionada.
    if (!this.actividadSeleccionadaId) {
      const primeraActividad = this.actividades.find((item) => item.CierraTurno !== 1);
      this.actividadSeleccionadaId = primeraActividad?.ActividadTurnoId || 0;
    }
  }

  get actividadEnCurso(): ActividadTurno | null {
    const actividadVigente = this.estadoDia.actividadActiva || null;

    if (!actividadVigente || actividadVigente.TipoRegistro === 'Finaliza') {
      return null;
    }

    const actividadActivaId = actividadVigente.ActividadTurnoId;

    if (!actividadActivaId) {
      return null;
    }

    return this.actividades.find((item) => item.ActividadTurnoId === actividadActivaId) || null;
  }

  get actividadEnPausa(): boolean {
    return this.estadoDia.actividadActiva?.TipoRegistro === 'Pausa';
  }

  get nuevaActividadSeleccionada(): ActividadTurno | null {
    return this.actividadesTotales.find((item) => item.ActividadTurnoId === this.nuevaActividadId) || null;
  }

  get nuevaActividadCierraTurno(): boolean {
    return this.nuevaActividadSeleccionada?.CierraTurno === 1;
  }

  async cargarEstadoDia() {
    try {
      const estado = await this.marcacionesService.obtenerEstadoDia();
      this.estadoDia = {
        ingreso: estado?.ingreso || null,
        salida: estado?.salida || null,
        actividadActiva: estado?.actividadActiva || null
      };
    } catch {
      this.estadoDia = {
        ingreso: null,
        salida: null,
        actividadActiva: null
      };
    }
  }

  puedeRegistrarIngreso(): boolean {
    const ultimoMovimiento = this.estadoDia.actividadActiva;

    return this.permisoRegistrar && (!ultimoMovimiento || ultimoMovimiento.TipoRegistro === 'Salida Turno');
  }

  puedeRegistrarSalida(): boolean {
    return this.permisoRegistrar && !this.puedeRegistrarIngreso();
  }

  puedeGestionarActividad(): boolean {
    return this.permisoRegistrar && this.estadoDia.ingreso !== null;
  }

  puedeIniciarActividad(): boolean {
    return this.puedeGestionarActividad() && Boolean(this.actividadSeleccionadaId);
  }

  private obtenerEstadoActividadActual(): 'ingreso' | 'actividad inicio' | 'pausa' | 'continua' | 'finaliza' | 'sin-actividad' | 'salida' {
    const tipoRegistro = this.estadoDia.actividadActiva?.TipoRegistro;

    if (!tipoRegistro) {
      return 'sin-actividad';
    }

    if (tipoRegistro === 'Ingreso Turno') {
      return 'ingreso';
    }

    if (tipoRegistro === 'Inicio Actividad') {
      return 'actividad inicio';
    }

    if (tipoRegistro === 'Pausa Actividad') {
      return 'pausa';
    }

    if (tipoRegistro === 'Continua Actividad') {
      return 'continua';
    }

    if (tipoRegistro === 'Finaliza Actividad') {
      return 'finaliza';
    }

    if (tipoRegistro === 'Salida Turno') {
      return 'salida';
    }

    return 'sin-actividad';
  }

  mostrarBotonIniciarActividad(): boolean {
    if (!this.puedeGestionarActividad()) {
      return false;
    }
    
    const estadoActividad = this.obtenerEstadoActividadActual();
    return estadoActividad === 'finaliza' || estadoActividad === 'sin-actividad' || estadoActividad === 'ingreso';
  }

  mostrarBotonPausarActividad(): boolean {
    if (!this.puedeGestionarActividad()) {
      return false;
    }

    const estadoActividad = this.obtenerEstadoActividadActual();
    return estadoActividad === 'actividad inicio' || estadoActividad === 'continua';
  }

  mostrarBotonContinuarActividad(): boolean {
    if (!this.puedeGestionarActividad()) {
      return false;
    }

    const estadoActividad = this.obtenerEstadoActividadActual();
    return estadoActividad === 'pausa';
  }

  mostrarBotonFinalizarActividad(): boolean {
    if (!this.puedeGestionarActividad()) {
      return false;
    }

    const estadoActividad = this.obtenerEstadoActividadActual();
    return estadoActividad === 'actividad inicio' || estadoActividad === 'pausa' || estadoActividad === 'continua';
  }

  mostrarBotonCambiarActividad(): boolean {
    return this.mostrarBotonFinalizarActividad();
  }

  mostrarBotonSalida(): boolean {
    return this.puedeRegistrarSalida();
  }

  abrirFormularioInicioActividad() {
    if (!this.mostrarBotonIniciarActividad() || this.procesandoMarcacion) {
      return;
    }

    this.mostrarFormularioInicioActividad = true;
  }

  cancelarInicioActividad() {
    this.mostrarFormularioInicioActividad = false;
    this.observacionActividad = '';
  }

  async confirmarInicioActividad() {
    await this.registrarAccionActividad('INICIAR');
  }

  abrirFormularioPausaActividad() {
    if (!this.mostrarBotonPausarActividad() || this.procesandoMarcacion) {
      return;
    }

    this.mostrarFormularioPausaActividad = true;
  }

  cancelarPausaActividad() {
    this.mostrarFormularioPausaActividad = false;
    this.motivoPausaActividad = '';
  }

  async confirmarPausaActividad() {
    const motivoPausa = this.obtenerStopTurnoParaPausa();

    if (!motivoPausa) {
      this.notificacionesService.notificacion('Debe ingresar el motivo de la pausa.');
      return;
    }

    await this.registrarAccionActividad('PAUSAR');
  }

  abrirFormularioCambioActividad() {
    if (!this.mostrarBotonCambiarActividad() || this.procesandoMarcacion) {
      return;
    }

    this.nuevaActividadId = 0;
    this.observacionCambioActividad = '';

    this.mostrarFormularioCambioActividad = true;
  }

  cancelarCambioActividad() {
    this.mostrarFormularioCambioActividad = false;
    this.nuevaActividadId = 0;
    this.observacionCambioActividad = '';
  }

  private obtenerStopTurnoParaCambioActividad(): string | undefined {
    const observacion = this.observacionCambioActividad?.trim().slice(0, 100);
    return observacion ? observacion : undefined;
  }

  async confirmarCambioActividad() {
    const nuevaActividad = this.nuevaActividadSeleccionada;

    if (!nuevaActividad) {
      this.notificacionesService.notificacion('Debe seleccionar una nueva actividad.');
      return;
    }

    if (nuevaActividad.CierraTurno === 1 && !this.obtenerStopTurnoParaCambioActividad()) {
      this.notificacionesService.notificacion('Debe ingresar una observación para actividades que cierran turno.');
      return;
    }

    await this.registrarAccionActividad('FINALIZAR', {
      nuevaActividad: nuevaActividad.ActividadTurnoId,
      StopTurno: nuevaActividad.CierraTurno === 1 ? this.obtenerStopTurnoParaCambioActividad() : undefined,
      cierreTurno: nuevaActividad.CierraTurno === 1 ? true : undefined
    });

    if (!this.procesandoMarcacion) {
      this.cancelarCambioActividad();
    }
  }

  private async confirmarAccion(accion: 'CONTINUAR' | 'FINALIZAR'): Promise<boolean> {
    const mensaje = accion === 'CONTINUAR'
      ? 'Se va a registrar la continuación de la actividad. ¿Desea continuar?'
      : 'Se va a registrar la finalización de la actividad. ¿Desea continuar?';

    const resultado = await this.notificacionesService.alerta(
      mensaje,
      accion === 'CONTINUAR' ? 'Confirmar continuación' : 'Confirmar finalización',
      undefined,
      [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar',
          role: 'confirmar'
        }
      ],
      undefined,
      false
    );

    return resultado?.role === 'confirmar';
  }

  private obtenerObservacionParaInicioActividad(): string | undefined {
    const observacion = this.observacionActividad?.trim().slice(0, 100);
    return observacion ? observacion : undefined;
  }

  private obtenerStopTurnoParaPausa(): string | undefined {
    const motivo = this.motivoPausaActividad?.trim().slice(0, 100);
    return motivo ? motivo : undefined;
  }

  private async capturarEvidenciasActividadObligatorias() {
    const { fotoUsuario, fotoEntorno } = await this.capturarFotosConPrevisualizacion();
    const coordenadas = await this.dispositivoService.capturarUbicacionObligatoria();

    return {
      fotoUsuario,
      fotoEntorno,
      coordenadas
    };
  }

  private async capturarFotosConPrevisualizacion() {
    while (true) {
      const fotoUsuario = await this.dispositivoService.capturarFotoObligatoria();
      const fotoEntorno = await this.dispositivoService.capturarFotoObligatoria();

      const decision = await this.solicitarDecisionPrevisualizacion(fotoUsuario, fotoEntorno);

      if (decision === 'confirmar') {
        return { fotoUsuario, fotoEntorno };
      }

      if (decision === 'cancelar') {
        throw new Error('OPERACION_CANCELADA');
      }
    }
  }

  private solicitarDecisionPrevisualizacion(
    fotoTercero: string,
    fotoEntorno: string
  ): Promise<'confirmar' | 'recapturar' | 'cancelar'> {
    this.fotoPreviewTercero = fotoTercero;
    this.fotoPreviewEntorno = fotoEntorno;
    this.mostrarPreviewFotos = true;

    return new Promise((resolve) => {
      this.resolverPreviewFotos = resolve;
    });
  }

  confirmarPreviewFotos() {
    this.finalizarPreviewFotos('confirmar');
  }

  recapturarPreviewFotos() {
    this.finalizarPreviewFotos('recapturar');
  }

  cancelarPreviewFotos() {
    this.finalizarPreviewFotos('cancelar');
  }

  onPreviewFotosDismiss() {
    this.finalizarPreviewFotos('cancelar');
  }

  private finalizarPreviewFotos(accion: 'confirmar' | 'recapturar' | 'cancelar') {
    const resolver = this.resolverPreviewFotos;

    this.mostrarPreviewFotos = false;
    this.fotoPreviewTercero = '';
    this.fotoPreviewEntorno = '';
    this.resolverPreviewFotos = null;

    if (resolver) {
      resolver(accion);
    }
  }

  private esErrorCancelacion(error: unknown): boolean {
    return error instanceof Error && error.message === 'OPERACION_CANCELADA';
  }

  private obtenerFotosRespaldoActividad(accion: AccionActividadMarcacion): { fotoUsuario?: string; fotoEntorno?: string } {
    if (accion === 'FINALIZAR') {
      return {};
    }

    const actividadActiva = this.estadoDia.actividadActiva;
    
    if (actividadActiva) {
      return {
        fotoUsuario: actividadActiva.RutaFotoTercero,
        fotoEntorno: actividadActiva.RutaFotoEntorno,
      }
    } else {
      return {};
    }
  }

  async registrarIngreso() {
    await this.registrarTurno('I');
  }

  async registrarSalida() {
    await this.registrarTurno('S');
  }

  private async registrarTurno(tipo: TipoMarcacion) {
    if (this.procesandoMarcacion) {
      return;
    }

    if (!this.dispositivoService.validarInternet()) {
      this.notificacionesService.notificacion('Debe tener conexión a internet para registrar marcaciones.');
      return;
    }

    this.procesandoMarcacion = true;

    try {
      if (tipo === 'I') {
        const evidencias = await this.capturarEvidenciasActividadObligatorias();
        const response = await this.marcacionesService.registrarMarcacion({
          TipoRegistro: tipo,
          Latitud: evidencias.coordenadas.latitud,
          Longitud: evidencias.coordenadas.longitud,
          FotoTercero: evidencias.fotoUsuario,
          FotoEntorno: evidencias.fotoEntorno,
        });

        if (response.success) {
          this.notificacionesService.notificacion(response.mensaje || 'Ingreso registrado correctamente.');
        }
      } else {
        const evidencias = await this.capturarEvidenciasActividadObligatorias();

        await this.marcacionesService.registrarMarcacion({
          TipoRegistro: tipo,
          Latitud: evidencias.coordenadas.latitud,
          Longitud: evidencias.coordenadas.longitud,
          FotoTercero: evidencias.fotoUsuario,
          FotoEntorno: evidencias.fotoEntorno,
        });
      }

      this.notificacionesService.notificacion(`Marcación de ${tipo === 'I' ? 'ingreso' : 'salida'} registrada correctamente.`);
      await this.cargarDatosIniciales();
    } catch (error: any) {
      if (this.esErrorCancelacion(error)) {
        return;
      }

      this.notificacionesService.notificacion(error?.message || 'No fue posible registrar la marcación.');
    } finally {
      this.procesandoMarcacion = false;
    }
  }

  private obtenerTipoRegistroActividad(accion: AccionActividadMarcacion): TipoMarcacion {
    switch (accion) {
      case 'INICIAR':
        return 'A';
      case 'PAUSAR':
        return 'P';
      case 'CONTINUAR':
        return 'C';
      case 'FINALIZAR':
        return 'F';
      default:
        throw new Error('Acción de actividad no válida.');
    }
  }

  async registrarAccionActividad(accion: AccionActividadMarcacion, extras?: { nuevaActividad?: number; StopTurno?: string; cierreTurno?: boolean }) {
    if (this.procesandoMarcacion) {
      return;
    }

    if (!this.dispositivoService.validarInternet()) {
      this.notificacionesService.notificacion('Debe tener conexión a internet para registrar la actividad.');
      return;
    }

    const actividad = accion === 'INICIAR' ? this.actividadSeleccionadaId : this.estadoDia.actividadActiva?.ActividadTurnoId;

    if (!actividad) {
      this.notificacionesService.notificacion('Debe seleccionar o iniciar una actividad antes de continuar.');
      return;
    }

    if (accion === 'CONTINUAR') {
      const confirmar = await this.confirmarAccion(accion);

      if (!confirmar) {
        return;
      }
    }
    
    if (accion === 'FINALIZAR' && !extras?.nuevaActividad) {
      const confirmar = await this.confirmarAccion(accion);

      if (!confirmar) {
        return;
      }
    }

    this.procesandoMarcacion = true;

    try {
      const coordenadas = await this.dispositivoService.capturarUbicacionObligatoria();

      let fotoUsuario: string | undefined;
      let fotoEntorno: string | undefined;

      if (extras?.cierreTurno) {
        const evidencias = await this.capturarFotosConPrevisualizacion();
        fotoUsuario = evidencias.fotoUsuario;
        fotoEntorno = evidencias.fotoEntorno;
      }

      await this.marcacionesService.registrarMarcacion({
        TipoRegistro: this.obtenerTipoRegistroActividad(accion),
        Latitud: coordenadas.latitud,
        Longitud: coordenadas.longitud,
        FotoTercero: fotoUsuario,
        FotoEntorno: fotoEntorno,
        ActividadTurnoId: actividad || undefined,
        NumeroControl: accion === 'INICIAR' ? this.obtenerObservacionParaInicioActividad() : undefined,
        StopTurno: extras?.StopTurno || (accion === 'PAUSAR' ? this.obtenerStopTurnoParaPausa() : undefined),
        NuevaActividad: extras?.nuevaActividad,
        CierreTurno: extras?.cierreTurno,
      });

      if (accion === 'INICIAR') {
        this.mostrarFormularioInicioActividad = false;
        this.observacionActividad = '';
      }

      if (accion === 'PAUSAR') {
        this.mostrarFormularioPausaActividad = false;
        this.motivoPausaActividad = '';
      }

      if (accion === 'FINALIZAR' && extras?.nuevaActividad) {
        this.mostrarFormularioCambioActividad = false;
        this.observacionCambioActividad = '';
      }

      const etiquetaAccion = accion.toLowerCase();
      this.notificacionesService.notificacion(`Actividad ${etiquetaAccion} registrada correctamente.`);
      await this.cargarEstadoDia();
    } catch (error: any) {
      if (this.esErrorCancelacion(error)) {
        return;
      }

      this.notificacionesService.notificacion(error?.message || 'No fue posible registrar la actividad.');
    } finally {
      this.procesandoMarcacion = false;
    }
  }
}
