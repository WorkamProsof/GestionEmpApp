import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

// ==================== INTERFACES ====================

interface Ejecucion {
  id?: number;
  documento?: string;
  nombre?: string;
  nombreEvaluacion?: string;
  tipoEvaluacion?: string;
  evaluacion?: string;
  evaluador?: string;
  rol?: string;
  peso?: string | number;
  periodoinicial?: string | Date;
  periodofinal?: string | Date;
  FechaReal?: string | Date;
  totalGeneral?: string | number;
  conclusion?: string;
  firma?: string;
  rutaFirma?: string;
  valida?: string;
  evaluacionId?: number;
  fechaFirma?: string | Date;
}

// ==================== COMPONENTE ====================

@Component({
  selector: 'app-ejecuciones-evaluacion',
  templateUrl: './ejecuciones-evaluacion.page.html',
  styleUrls: ['./ejecuciones-evaluacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class EjecucionesEvaluacionPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  cargando = false;
  error: string | null = null;
  rutaGeneral = 'Autogestion/cEjecucionEvaluacion/';

  // Datos
  ejecuciones: Ejecucion[] = [];
  ejecucionesFiltradas: Ejecucion[] = [];

  // Filtros
  filtroForm: FormGroup;
  isModalOpen = false;
  fechaInicial: string = '';
  fechaFinal: string = '';

  constructor(
    private datosBasicosService: DatosbasicosService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filtroForm = new FormGroup({
      fechainicio: new FormControl(),
      fechafinal: new FormControl()
    });
  }

  ngOnInit() {
  }

  /**
   * Se ejecuta cada vez que entras a la página
   */
  ionViewWillEnter() {
    this.obtenerUsuarioYCargarDatos();
  }

  /**
   * Obtiene el usuario del storage y carga los datos de ejecuciones
   */
  private async obtenerUsuarioYCargarDatos() {
    try {
      const usuario = await this.datosBasicosService.obtenerDatosStorage('usuario');
      if (usuario && usuario.num_docu) {
        const documento = usuario.num_docu.toString();
        this.obtenerInformacion(documento);
      } else {
        this.error = 'No se encontró el documento del usuario';
        console.error('❌ No hay usuario disponible o documento vacío');
      }
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      this.error = 'Error al obtener datos del usuario';
    }
  }

  /**
   * Obtiene información de ejecuciones
   */
  obtenerInformacion(documento: string) {
    this.cargando = true;
    this.error = null;

    this.datosBasicosService.informacion({ documento }, `${this.rutaGeneral}obtenerEjecuciones`).then(resp => {
      if (resp && resp.success) {
        this.cargarEjecuciones(resp);
      } else {
        this.error = resp?.error || 'Error al cargar los datos';
        this.cargando = false;
        this.cdRef.detectChanges();
      }
    }).catch(error => {
      console.error('❌ Error al cargar datos:', error);
      this.error = error?.message || 'Error al cargar las ejecuciones';
      this.cargando = false;
      this.cdRef.detectChanges();
    });
  }

  /**
   * Procesa la respuesta y carga las ejecuciones
   */
  cargarEjecuciones(response: any) {
    const datos = response.datos || response;
    
    // Si datos es un array directamente
    if (Array.isArray(datos)) {
      this.ejecuciones = datos;
    } 
    // Si datos es un objeto con propiedad ejecuciones
    else if (datos.ejecuciones && Array.isArray(datos.ejecuciones)) {
      this.ejecuciones = datos.ejecuciones;
    } 
    // Si no encontramos nada, usamos array vacío
    else {
      this.ejecuciones = [];
    }
    
    this.ejecucionesFiltradas = [...this.ejecuciones];
    this.cargando = false;
    
    // Forzar detección de cambios
    this.cdRef.detectChanges();
  }

  /**
   * Filtra las ejecuciones según el rango de fechas
   */
  filtrar() {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.ejecucionesFiltradas = [...this.ejecuciones];
      return;
    }

    const fechaInicio = new Date(this.fechaInicial);
    const fechaFin = new Date(this.fechaFinal);

    this.ejecucionesFiltradas = this.ejecuciones.filter(ejecucion => {
      const periodoinicial = new Date(ejecucion.periodoinicial);
      const periodofinal = new Date(ejecucion.periodofinal);
      
      // Traer solo registros que están dentro del rango especificado
      return periodoinicial >= fechaInicio && periodofinal <= fechaFin;
    });
  }

  /**
   * Confirma la fecha inicial en el formulario
   */
  confirmarInicio(event?: any) {
    const fecha = this.fechaInicial;
    if (fecha) {
      // Convertir formato ISO a DD-MM-YYYY
      const fechaObj = new Date(fecha);
      const fechaFormato = fechaObj.toISOString().split('T')[0];
      this.filtroForm.get('fechainicio')?.setValue(fechaFormato, { emitEvent: false });
    }
  }

  /**
   * Confirma la fecha final en el formulario
   */
  confirmarFin(event?: any) {
    const fecha = this.fechaFinal;
    if (fecha) {
      // Convertir formato ISO a DD-MM-YYYY
      const fechaObj = new Date(fecha);
      const fechaFormato = fechaObj.toISOString().split('T')[0];
      this.filtroForm.get('fechafinal')?.setValue(fechaFormato, { emitEvent: false });
    }
  }

  /**
   * Abre el modal de filtros
   */
  openModal() {
    this.isModalOpen = true;
  }

  /**
   * Cierra el modal de filtros
   */
  closeModal() {
    this.isModalOpen = false;
  }

  /**
   * Aplica el filtro por fecha
   */
  filtrarPorFecha() {
    this.fechaInicial = this.filtroForm.get('fechainicio')?.value;
    this.fechaFinal = this.filtroForm.get('fechafinal')?.value;
    this.filtrar();
    this.closeModal();
  }

  /**
   * Reinicia todos los filtros
   */
  reiniciarFiltros() {
    this.filtroForm.reset();
    this.fechaInicial = '';
    this.fechaFinal = '';
    this.ejecucionesFiltradas = [...this.ejecuciones];
  }

  /**
   * Ver detalle de una ejecución
  */
  verDetalle(ejecucion: Ejecucion) {
    this.router.navigate(['detalle', ejecucion.id], { 
      relativeTo: this.route,
      queryParams: { rol: ejecucion.rol }
    });
  }

  /**
   * Ver informe agrupado de una ejecución
   * Realiza validaciones y obtiene el resumen agrupado
  */
  verDetalleAgrupada(ejecucion: Ejecucion) {
    // Validaciones previas
    if (!ejecucion.id) {
      console.error('❌ Error: La ejecución no tiene ID');
      return;
    }

    if (ejecucion.valida !== '2') {
      console.warn('⚠️ Advertencia: Esta ejecución no tiene validez de agrupada');
      return;
    }

    this.obtenerResumenAgrupado(ejecucion);
  }

  /**
   * Obtiene el resumen agrupado de una ejecución
   * Realiza la petición al backend para obtener datos agrupados
  */
  private obtenerResumenAgrupado(ejecucion: Ejecucion) {
    
    // Navegar directamente a la página de detalle agrupado
    // La página obtendrá los datos una vez que cargue
    this.router.navigate(['detalle-agrupado', ejecucion.evaluacionId], { relativeTo: this.route });
  }

  /**
   * Recarga los datos
  */
  recargar() {
    this.obtenerUsuarioYCargarDatos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
