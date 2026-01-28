import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

// ==================== INTERFACES ====================

interface InfoCargo {
  codigo?: string;
  nombre?: string;
  jefe?: string | { nombre?: string };
  nivel?: string;
  nivelJerarquico?: string;
  supervisa?: string;
  mision?: string;
  jefeOperativo?: Array<{ nombre?: string }>;
  procesos?: Array<{ nombre?: string }>;
  proceso?: any;
  procesosPertenece?: Array<{ nombre?: string }>;
  sistemasGestion?: Array<{ nombre?: string }>;
  sistema?: any;
  centrosCostos?: Array<{ nombre?: string }>;
  centro?: any;
  sucursal?: any;
  sucursales?: any[];
  estado?: string;
  nombreTipoRequisito?: string;
  nombreTipoFuncion?: string;
  nombreTipoObjetivo?: string;
  nombreTipoCompetencia?: string;
}

interface Requisito {
  id?: number;
  nombre?: string;
  descripcion?: string;
  tipoRequisito?: string;
}

interface Funcion {
  id?: number;
  funcion?: string;
  nombre?: string;
  titulo?: string;
  criterio?: string;
}

interface Objetivo {
  id?: number;
  objetivo?: string;
  nombre?: string;
  titulo?: string;
  indicador?: string;
  criterio?: string;
}

interface Responsabilidad {
  id?: number;
  Responsabilidad?: string;
  responsabilidad?: string;
  nombre?: string;
  descripcion?: string;
}

interface Competencia {
  id?: number;
  nombre?: string;
  nombreNivel?: string;
  nivel?: string;
  descripcion?: string;
  descripcionNivel?: string;
}

interface Riesgo {
  id?: number;
  numero?: number;
  nombre?: string;
  descripcion?: string;
  clasificacion?: string;
  peligro?: string;
  tipoPeligro?: string;
}

// ==================== COMPONENTE ====================

@Component({
  selector: 'app-perfil-cargo',
  templateUrl: './perfil-cargo.page.html',
  styleUrls: ['./perfil-cargo.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, HeaderComponent]
})
export class PerfilCargoPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  cargando = false;
  error: string | null = null;
  rutaGeneral = 'Autogestion/cPerfilCargo/';
  
  // Datos
  idCargo: number | null = null;
  
  // Desglose de datos
  info: InfoCargo[] = [];
  requisitos: Requisito[] = [];
  funciones: Funcion[] = [];
  objetivos: Objetivo[] = [];
  responsabilidades: Responsabilidad[] = [];
  competencias: Competencia[] = [];
  riesgos: Riesgo[] = [];

  // Nombres dinámicos de tipos
  nombreTipoRequisito: string = 'Requisitos';
  nombreTipoFuncion: string = 'Funciones';
  nombreTipoObjetivo: string = 'Objetivos';
  nombreTipoCompetencia: string = 'Competencias';

  // UI
  tabActiva = 'basicos';
  mostrandoDetalles = false;

  constructor(
    private loadingController: LoadingController,
    private datosBasicosService: DatosbasicosService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.obtenerUsuarioYCargarDatos();
  }

  /**
   * Obtiene el usuario del storage y carga los datos del cargo
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
        console.error('❌ Usuario recibido:', usuario);
      }
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      this.error = 'Error al obtener datos del usuario';
    }
  }

  /**
   * Obtiene información del cargo usando el patrón de ausentismo
   */
  obtenerInformacion(documento: string) {
    this.cargando = true;
    this.error = null;
        
    this.datosBasicosService.informacion({documento}, `${this.rutaGeneral}obtenerCargo`).then(resp => {
      
      if (resp && resp.success) {
        this.cargarCargoCompleto(resp);
      } else {
        this.error = resp?.error || 'Error al cargar los datos';
      }
      
      this.cargando = false;
    }).catch(error => {
      console.error('❌ Error al cargar datos:', error);
      this.error = error?.message || 'Error al cargar los datos del cargo';
      this.mostrandoDetalles = false;
      this.cargando = false;
    });
  }

  /**
   * Función que se ejecuta cuando llega la respuesta del servidor
   */
  cargarCargoCompleto(response: any) {    
    // La respuesta viene con estructura: { success: 1, datos: { info, requisitos, ... } }
    const datos = response.datos || response.perfilCompleto || response;
    
    this.idCargo = response.idCargo || datos.idCargo;    
    this.info = Array.isArray(datos.info) ? datos.info : (datos.info ? [datos.info] : []);
    
    // Obtener nombres dinámicos del primer item de info
    if (this.info && this.info.length > 0) {
      const infoItem = this.info[0];
      this.nombreTipoRequisito = infoItem.nombreTipoRequisito || 'Requisitos';
      this.nombreTipoFuncion = infoItem.nombreTipoFuncion || 'Funciones';
      this.nombreTipoObjetivo = infoItem.nombreTipoObjetivo || 'Objetivos';
      this.nombreTipoCompetencia = infoItem.nombreTipoCompetencia || 'Competencias';
    }
    
    this.requisitos = Array.isArray(datos.requisitos) ? datos.requisitos : [];    
    this.funciones = Array.isArray(datos.funciones) ? datos.funciones : [];    
    this.objetivos = Array.isArray(datos.objetivos) ? datos.objetivos : [];    
    this.responsabilidades = Array.isArray(datos.responsabilidades) ? datos.responsabilidades : [];    
    this.competencias = Array.isArray(datos.competencias) ? datos.competencias : [];    
    this.riesgos = Array.isArray(datos.riesgos) ? datos.riesgos : [];    
    this.mostrandoDetalles = true;
  }

  /**
   * Cambia la pestaña activa
   */
  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  /**
   * Sanitiza HTML para que se pueda renderizar de forma segura
   */
  sanitizeHtml(html: any): string {
    // Validar que sea string
    if (!html || typeof html !== 'string') {
      return '';
    }

    const original = html;

    // Extraer solo el texto puro sin HTML de Office
    let cleanHtml = html
      // Decodificar primero todas las entidades
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      // Remover caracteres especiales invisibles o códigos HTML mal formados
      .replace(/[\u00A0\u2000-\u200B]/g, '') // Espacios Unicode
      .replace(/&[a-zA-Z0-9]+;/g, '') // Remover cualquier entidad HTML restante
      // Remover tags de Office
      .replace(/<o:p>/gi, '')
      .replace(/<\/o:p>/gi, '')
      // Remover style/class/lang/dir de Office
      .replace(/\s+lang="[^"]*"/gi, '')
      .replace(/\s+style="[^"]*"/gi, '')
      .replace(/\s+class="[^"]*"/gi, '')
      .replace(/\s+dir="[^"]*"/gi, '')
      // Remover todos los tags HTML
      .replace(/<[^>]*>/g, '')
      // Limpiar espacios múltiples y saltos de línea
      .replace(/\s+/g, ' ')
      .trim();

    return cleanHtml;
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


