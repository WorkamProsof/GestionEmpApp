import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, IonModal } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import QrScanner from 'qr-scanner';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

// ==================== INTERFACES ====================

interface Pregunta {
  id?: number;
  pregunta?: string;
  observacion?: string;
  tipoRespuesta?: string;
  respuestaSeleccionada?: string | number;
  peso?: number | string;
  competencia?: string;
  descripcion?: string;
  grupo?: string;
  valorMaximo?: number | string;
  escala?: number | string;
  valorReal?: number | string;
  ponderado?: string | number;
  pesoOriginal?: string | number;
  valorMaximoRespuesta?: string | number;
}

interface Grupo {
  id?: number;
  nombre?: string;
  pesoGrupo?: string;
  sumaPesos?: number;
  preguntas?: Pregunta[];
}

interface Encabezado {
  ejecucion_id?: number;
  documento?: string;
  nombreEmpleado?: string;
  nombreEvaluacion?: string;
  tipoEvaluacion?: string;
  evaluador?: string;
  rol?: string;
  peso?: string;
  Sucursal?: string;
  CentroTrabajo?: string;
  CentroCosto?: string;
  periodoinicial?: string | Date;
  periodofinal?: string | Date;
  fechaReal?: string | Date;
  totalGeneral?: number;
  evaluacion?: string;
  conclusion?: string;
  firma?: string;
  firmado?: boolean;
  rutaFirma?: string;
  tercero_id ?: string | number;
  evaluacionId?: number;
  valida?: string;
}

interface Totales {
  ponderadoPorGrupo?: number[];
  totalGeneral?: number;
}

interface DetalleEjecucion {
  encabezado?: Encabezado;
  grupos?: Grupo[];
  preguntas?: Pregunta[];
  totales?: Totales;
}

// ==================== COMPONENTE ====================

@Component({
  selector: 'app-detalle-ejecucion',
  templateUrl: './detalle-ejecucion.page.html',
  styleUrls: ['./detalle-ejecucion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class DetalleEjecucionPage implements OnInit, OnDestroy {
  @ViewChild('modalQR', { static: false }) modalQR!: IonModal;
  @ViewChild('modalFirmaManual', { static: false }) modalFirmaManual!: IonModal;
  @ViewChild('videoQR', { static: false }) videoQR!: ElementRef<HTMLVideoElement>;
  @ViewChild('signaturePadCanvas', { static: false }) signaturePadCanvas!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  cargando = false;
  error: string | null = null;
  rutaGeneral = 'Autogestion/cEjecucionEvaluacion/';

  // Datos
  ejecucionId: number | null = null;
  evaluacionId: number | null = null;
  detalle: DetalleEjecucion = {};
  encabezado: Encabezado = {};
  grupos: Grupo[] = [];
  totales: Totales = {};
  rolDeListado: string = '';

  // UI
  gruposExpandidos: { [key: number]: boolean } = {};
  mostrando_firma = false;
  mostrando_impresion = false;
  contrasena: string = '';
  isQRModalOpen = false;
  isSignaturePadModalOpen = false;
  validandoClave = false;
  lectorQR: QrScanner | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;
  private isDrawing = false;

  constructor(
    private datosBasicosService: DatosbasicosService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private alertController: AlertController,
    private notificacionService: NotificacionesService,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.obtenerIdYCargar();
  }

  ngOnDestroy() {
    this.stopQRScanner();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtiene el ID de la ruta y carga los datos
   */
  private obtenerIdYCargar() {
    this.ejecucionId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Obtener el rol que viene del listado
    this.route.queryParams.subscribe(params => {
      this.rolDeListado = params['rol'] || '';
    });
    
    if (this.ejecucionId) {
      this.obtenerDetalleEjecucion();
    } else {
      this.error = 'No se encontró el ID de la ejecución';
    }
  }

  /**
   * Obtiene el detalle de la ejecución
   */
  obtenerDetalleEjecucion() {
    this.cargando = true;
    this.error = null;

    // Obtener el NIT del storage
    this.storageService.get('nit').then(nit => {
      const params = { 
        ejecucion_id: this.ejecucionId,
        nit: nit || ''
      };

      this.datosBasicosService.informacion(params, `${this.rutaGeneral}obtenerDetalleEjecucion`).then(resp => {
        if (resp && resp.success) {
          this.cargarDetalle(resp);
        } else {
          this.error = resp?.error || 'Error al cargar el detalle';
          this.cargando = false;
          this.cdRef.detectChanges();
        }
      }).catch(error => {
        console.error('❌ Error al cargar detalle:', error);
        this.error = error?.message || 'Error al cargar el detalle de la ejecución';
        this.cargando = false;
        this.cdRef.detectChanges();
      });
    }).catch(error => {
      console.error('❌ Error al obtener NIT del storage:', error);
      this.error = 'Error al recuperar datos de sesión';
      this.cargando = false;
      this.cdRef.detectChanges();
    });
  }

  /**
   * Procesa la respuesta y carga el detalle
   */
  cargarDetalle(response: any) {
    const datos = response.datos || response;
    console.log('✅ Detalle cargado:', datos);

    if (datos.encabezado) {
      this.encabezado = datos.encabezado;
    }

    if (datos.grupos && Array.isArray(datos.grupos)) {
      this.grupos = datos.grupos;
      // Inicializar acordeones cerrados
      this.grupos.forEach(grupo => {
        if (grupo.id) {
          this.gruposExpandidos[grupo.id] = false;
        }
      });
    }

    // Capturar totales del backend
    if (datos.totales) {
      this.totales = datos.totales;
    }

    this.detalle = datos;
    this.cargando = false;

    // Forzar detección de cambios
    this.cdRef.detectChanges();
  }

  /**
   * Alterna la expansión de un grupo
   */
  toggleGrupo(grupoId: number | undefined) {
    if (grupoId !== undefined) {
      this.gruposExpandidos[grupoId] = !this.gruposExpandidos[grupoId];
    }
  }

  /**
   * Verifica si un grupo está expandido
   */
  esGrupoExpandido(grupoId: number | undefined): boolean {
    if (grupoId === undefined) return false;
    return this.gruposExpandidos[grupoId] || false;
  }

  /**
   * Abre el modal de firma
   */
  abrirFirma() {
    this.mostrando_firma = true;
  }

  /**
   * Cierra el modal de firma
   */
  cerrarFirma() {
    this.mostrando_firma = false;
    this.contrasena = '';
  }

  /**
   * Abre el modal para ingresar contraseña de forma segura
   */
  async abrirModalClave() {
    const alert = await this.alertController.create({
      header: '¡Advertencia!',
      message: 'Ingrese su contraseña para firmar la evaluación',
      inputs: [
        {
          name: 'clave',
          type: 'password',
          placeholder: 'Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: async (data) => {
            if (data.clave && data.clave.trim()) {
              await this.validarClaveYFirmar(data.clave);
            } else {
              this.notificacionService.notificacion('Debe ingresar una contraseña');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Abre el modal QR para escanear código de firma
   */
  async abrirModalQR() {
    try {      
      // Verificar si estamos en una plataforma nativa
      if (Capacitor.isNativePlatform()) {        
        // Solicitar permisos de cámara
        const permissions = await Camera.requestPermissions({ permissions: ['camera'] });
        
        if (permissions.camera !== 'granted') {
          this.notificacionService.notificacion('Permisos de cámara requeridos para escanear QR');
          return;
        }
        
        // Esperar un momento para que los permisos se apliquen
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verificar si hay cámara disponible
      const hasCamera = await QrScanner.hasCamera();
      
      if (!hasCamera) {
        this.notificacionService.notificacion('No se detectó una cámara disponible');
        return;
      }

      this.isQRModalOpen = true;
      
      // Forzar múltiples detecciones de cambios
      this.cdRef.detectChanges();
      this.cdRef.markForCheck();
            
      // Esperar a que el modal esté completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      let errorMessage = 'Error al acceder a la cámara';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Por favor, habilítalos en configuración.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Cámara no soportada por este dispositivo.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      this.notificacionService.notificacion(errorMessage);
    }
  }

  /**
   * Cierra el modal QR
   */
  cerrarModalQR() {    
    // Detener scanner primero
    this.stopQRScanner();
    this.validandoClave = false;
    
    // Cerrar modal usando ambos métodos
    this.isQRModalOpen = false;
    
    if (this.modalQR) {
      this.modalQR.dismiss();
    }
    
    this.cdRef.detectChanges();
  }

  /**
   * Inicia el escáner QR
   */
  async iniciarEscanerQR() {
    try {      
      const videoElement = this.videoQR?.nativeElement;
      if (!videoElement) {
        this.notificacionService.notificacion('No se pudo inicializar la cámara - elemento de video no encontrado');
        return;
      }

      // Detener scanner previo si existe
      if (this.lectorQR) {
        this.stopQRScanner();
      }

      // Configurar atributos del video
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('muted', 'true');
      videoElement.setAttribute('playsinline', 'true');
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';

      const cameras = await QrScanner.listCameras(true);
      
      if (!cameras.length) {
        this.notificacionService.notificacion('No hay cámaras disponibles en el dispositivo');
        this.cerrarModalQR();
        return;
      }

      this.lectorQR = new QrScanner(
        videoElement,
        async (result) => {
          if (this.validandoClave) {
            return;
          }
          
          this.validandoClave = true;

          try {
            const datosScan = JSON.parse(result.data);
            const esClaveValida = await this.validarClaveYFirmar(datosScan.Clave, datosScan.id_tercero || 0);

            if (esClaveValida) {
              this.cerrarFirma();
            }
          } catch (error) {
            console.error('Error al procesar QR:', error);
            this.notificacionService.notificacion('Código QR inválido o mal formateado');
          } finally {
            this.validandoClave = false;
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment'
        }
      );

      // Buscar cámara trasera
      const rearCamera = cameras.find(cam =>
        cam.label.toLowerCase().includes('back') ||
        cam.label.toLowerCase().includes('rear') ||
        cam.label.toLowerCase().includes('environment') ||
        cam.label.toLowerCase().includes('0')
      );
      
      if (rearCamera) {
        await this.lectorQR.setCamera(rearCamera.id);
      } else {
        await this.lectorQR.setCamera(cameras[0].id);
      }

      await this.lectorQR.start();

    } catch (error) {
      console.error('Error detallado al iniciar el escáner QR:', error);
      
      let errorMsg = 'Error al iniciar la cámara';
      if (error.message) {
        errorMsg += ': ' + error.message;
      }
      
      this.notificacionService.notificacion(errorMsg);
      this.cerrarModalQR();
    }
  }

  /**
   * Detiene el escáner QR
   */
  stopQRScanner() {
    try {
      if (this.lectorQR) {
        this.lectorQR.stop();
        this.lectorQR.destroy();
      }
    } catch (error) {
      console.error('Error al detener el scanner QR:', error);
    } finally {
      this.lectorQR = null;
    }
  }

  /**
   * Valida la clave contra la API
   */
  async validarClaveYFirmar(clave: string, idTerceroQR: number = 0): Promise<boolean> {
    try {
      if (!clave || !clave.trim()) {
        this.notificacionService.notificacion('Debe ingresar una contraseña');
        return false;
      }

      // Obtener el NIT del storage
      const nit = await this.storageService.get('nit');

      const params = { 
        ejecucion_id: this.ejecucionId,
        evaluacionId: this.encabezado.evaluacionId,
        fechaEvaluacion: this.encabezado.fechaReal || this.encabezado.periodofinal,
        documento: this.encabezado.documento,
        pass: clave,
        scaner: idTerceroQR,
        tercero: this.encabezado.tercero_id,
        nit: nit || ''
      };

      const resultado = await this.datosBasicosService.informacion(
        params, 
        `${this.rutaGeneral}verificarClaveYFirmar`
      );

      if (resultado?.success) {
        this.notificacionService.notificacion(resultado.mensaje || 'Evaluación firmada correctamente');
        this.stopQRScanner();  
        this.isQRModalOpen = false;
        this.mostrando_firma = false;
        this.contrasena = '';
        this.cdRef.detectChanges();
        
        // Recargar datos después de firmar
        setTimeout(() => {
          this.obtenerDetalleEjecucion();
        }, 1000);
        
        return true;
      } else {
        this.notificacionService.notificacion(resultado?.error || 'Error al validar la contraseña');
        return false;
      }

    } catch (error) {
      console.error('❌ Error al validar clave:', error);
      this.notificacionService.notificacion(error?.message || 'Error al validar la contraseña');
      return false;
    }
  }

  /**
   * Obtiene el porcentaje de un grupo por nombre
   */
  obtenerPorcentajeGrupo(nombreGrupo: string): string {
    const grupo = this.grupos.find(g => g.nombre?.toLowerCase().includes(nombreGrupo.toLowerCase()));
    if (!grupo) {
      return '0.00';
    }
    return this.calcularPorcentajeGrupo(grupo);
  }

  /**
   * Calcula el total general promediando todos los grupos
   */
  calcularTotalGeneral(): string {
    if (!this.grupos || this.grupos.length === 0) {
      return '0.00';
    }

    let totalPorcentaje = 0;
    this.grupos.forEach(grupo => {
      const porcentaje = parseFloat(this.calcularPorcentajeGrupo(grupo));
      totalPorcentaje += porcentaje;
    });

    const promedio = totalPorcentaje / this.grupos.length;
    return promedio.toFixed(2);
  }

  /**
   * Evento cuando el modal QR se presenta
   */
  onQRModalDidPresent() {
    setTimeout(() => {
      this.iniciarEscanerQR();
    }, 200);
  }

  /**
   * Evento cuando el modal QR va a cerrarse
   */
  onQRModalWillDismiss() {
    this.stopQRScanner();
    this.validandoClave = false;
  }

  /**
   * Firma la evaluación con contraseña (metodo simplificado)
   */
  firmarEvaluacion(clave: string) {
    this.validarClaveYFirmar(clave);
  }

  /**
   * Regresa al listado
   */
  regresar() {
    window.history.back();
  }

  /**
   * Calcula el valor real total de un grupo
   */
  calcularValorRealTotal(grupo: Grupo): number {
    if (!grupo.preguntas || grupo.preguntas.length === 0) {
      return 0;
    }

    const total = grupo.preguntas.reduce((sum, pregunta) => {
      const valorReal = Number(pregunta.valorReal) || Number(pregunta.peso) || 0;
      return sum + valorReal;
    }, 0);

    // Redondear a 2 decimales para evitar errores de precisión
    return Math.round(total * 100) / 100;
  }

  /**
   * Calcula el porcentaje total de un grupo
   */
  calcularPorcentajeGrupo(grupo: Grupo): string {
    if (!grupo.preguntas || grupo.preguntas.length === 0) {
      return '0.00';
    }

    // Sumar todos los porcentajes de las preguntas SIN promediar
    let totalPorcentaje = 0;
    grupo.preguntas.forEach(pregunta => {
      // Extraer el número del porcentaje (ej: "50.00%" -> 50)
      let porcentaje = 0;
      if (pregunta.descripcion) {
        const match = pregunta.descripcion.toString().match(/[\d.]+/);
        porcentaje = match ? parseFloat(match[0]) : 0;
      } else if (pregunta.ponderado) {
        const match = pregunta.ponderado.toString().match(/[\d.]+/);
        porcentaje = match ? parseFloat(match[0]) : 0;
      }
      totalPorcentaje += porcentaje;
    });

    // Retornar la suma total sin división (valor real)
    return totalPorcentaje.toFixed(2);
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
   * Abre el modal de firma manual
   */
  abrirModalFirmaManual() {
    this.isSignaturePadModalOpen = true;
    this.mostrando_firma = false;
    
    // Esperar a que el modal se renderice
    setTimeout(() => {
      this.inicializarCanvasFirma();
    }, 300);
  }

  /**
   * Cierra el modal de firma manual
   */
  cerrarModalFirmaManual() {
    this.isSignaturePadModalOpen = false;
    this.limpiarFirma();
  }

  /**
   * Inicializa el canvas para la firma manual
   */
  private inicializarCanvasFirma() {
    const canvas = this.signaturePadCanvas?.nativeElement;
    
    if (!canvas) {
      console.error('Canvas no encontrado');
      return;
    }

    // Obtener contexto 2D
    this.canvasContext = canvas.getContext('2d');
    
    if (!this.canvasContext) {
      console.error('No se pudo obtener contexto 2D del canvas');
      return;
    }

    // Configurar dimensiones y estilo
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Escalar canvas para que coincida con el CSS
    this.canvasContext.scale(dpr, dpr);
    this.canvasContext.lineCap = 'round';
    this.canvasContext.lineJoin = 'round';
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = '#000';
    this.canvasContext.fillStyle = '#fff';
    
    // Llenar con fondo blanco
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    // Agregar event listeners
    canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    canvas.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
    canvas.addEventListener('mouseout', (e) => this.onCanvasMouseUp(e));
    
    // Eventos touch para mobile
    canvas.addEventListener('touchstart', (e) => this.onCanvasTouchStart(e));
    canvas.addEventListener('touchmove', (e) => this.onCanvasTouchMove(e));
    canvas.addEventListener('touchend', (e) => this.onCanvasTouchEnd(e));
  }

  /**
   * Maneja el inicio del dibujo con mouse
   */
  private onCanvasMouseDown(e: MouseEvent) {
    this.isDrawing = true;
    const canvas = this.signaturePadCanvas?.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x, y);
    }
  }

  /**
   * Maneja el movimiento del mouse mientras se dibuja
   */
  private onCanvasMouseMove(e: MouseEvent) {
    if (!this.isDrawing || !this.canvasContext) return;
    
    const canvas = this.signaturePadCanvas?.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.canvasContext.lineTo(x, y);
    this.canvasContext.stroke();
  }

  /**
   * Maneja el fin del dibujo con mouse
   */
  private onCanvasMouseUp(e: MouseEvent) {
    this.isDrawing = false;
    if (this.canvasContext) {
      this.canvasContext.closePath();
    }
  }

  /**
   * Maneja el inicio del toque en mobile
   */
  private onCanvasTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.isDrawing = true;
    const canvas = this.signaturePadCanvas?.nativeElement;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (this.canvasContext) {
      this.canvasContext.beginPath();
      this.canvasContext.moveTo(x, y);
    }
  }

  /**
   * Maneja el movimiento del toque en mobile
   */
  private onCanvasTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.isDrawing || !this.canvasContext) return;
    
    const canvas = this.signaturePadCanvas?.nativeElement;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    this.canvasContext.lineTo(x, y);
    this.canvasContext.stroke();
  }

  /**
   * Maneja el fin del toque en mobile
   */
  private onCanvasTouchEnd(e: TouchEvent) {
    e.preventDefault();
    this.isDrawing = false;
    if (this.canvasContext) {
      this.canvasContext.closePath();
    }
  }

  /**
   * Limpia el canvas
   */
  limpiarFirma() {
    const canvas = this.signaturePadCanvas?.nativeElement;
    
    if (canvas && this.canvasContext) {
      this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      this.canvasContext.fillStyle = '#fff';
      this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /**
   * Valida si hay firma dibujada en el canvas
   */
  private validarFirmaDibujada(): boolean {
    const canvas = this.signaturePadCanvas?.nativeElement;
    
    if (!canvas) {
      this.notificacionService.notificacion('❌ Canvas de firma no encontrado');
      return false;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.notificacionService.notificacion('❌ No se pudo acceder al canvas');
      return false;
    }

    // Obtener datos de imagen y verificar si hay pixels dibujados
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let tienePixeles = false;
    // Revisar canal alpha (índice 3, 7, 11, etc.)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 128) {
        tienePixeles = true;
        break;
      }
    }

    if (!tienePixeles) {
      this.notificacionService.notificacion('❌ Debes dibujar la firma antes de guardar');
      return false;
    }

    return true;
  }

  /**
   * Valida datos necesarios para firmar
   */
  private validarDatosRequeridos(): boolean {
    if (!this.ejecucionId || this.ejecucionId <= 0) {
      this.notificacionService.notificacion('❌ ID de evaluación no válido');
      return false;
    }

    if (!this.encabezado.documento) {
      this.notificacionService.notificacion('❌ Documento del tercero no válido');
      return false;
    }

    return true;
  }

  /**
   * Guarda la firma manual en la evaluación (OPCIÓN 1)
   * Solo guarda en esta evaluación, no actualiza firma del tercero
   */
  async guardarFirmaManual() {
    // Validar que hay firma dibujada
    if (!this.validarFirmaDibujada()) {
      return;
    }

    // Validar datos requeridos
    if (!this.validarDatosRequeridos()) {
      return;
    }

    const canvas = this.signaturePadCanvas?.nativeElement;
    const firmaBase64 = canvas.toDataURL('image/png');

    // Validar tamaño mínimo de Base64
    if (firmaBase64.length < 100) {
      this.notificacionService.notificacion('❌ La firma no fue capturada correctamente');
      return;
    }

    try {
      // Obtener el NIT del storage
      const nit = await this.storageService.get('nit');

      const params = {
        ejecucion_id: this.ejecucionId,
        tercero: this.encabezado.tercero_id,
        firmaBase64: firmaBase64,
        tipoFirma: 'manual',
        evaluacionId : this.encabezado.evaluacionId,
        nit: nit || ''
      };

      const resultado = await this.datosBasicosService.informacion(
        params,
        `${this.rutaGeneral}guardarFirmaManual`
      );

      if (resultado?.success) {
        this.notificacionService.notificacion('✅ Evaluación firmada correctamente');
        this.limpiarFirma();
        this.cerrarModalFirmaManual();
        this.cerrarFirma();
        
        // Recargar datos después de firmar
        setTimeout(() => {
          this.obtenerDetalleEjecucion();
        }, 1000);
      } else {
        this.notificacionService.notificacion(resultado?.error || '❌ Error al guardar la firma');
      }
    } catch (error) {
      console.error('❌ Error al guardar firma manual:', error);
      this.notificacionService.notificacion(error?.message || 'Error al guardar la firma');
    }
  }

  /**
   * Actualiza la firma digital del tercero (OPCIÓN 2) - CORREGIDO
   * Actualiza firma digital permanente + firma esta evaluación
   */
  async actualizarFirmaManual() {
    // Validar que hay firma dibujada
    if (!this.validarFirmaDibujada()) {
      return;
    }

    // Validar datos requeridos
    if (!this.validarDatosRequeridos()) {
      return;
    }

    const canvas = this.signaturePadCanvas?.nativeElement;
    const firmaBase64 = canvas.toDataURL('image/png');

    // Validar tamaño mínimo de Base64
    if (firmaBase64.length < 100) {
      this.notificacionService.notificacion('❌ La firma no fue capturada correctamente');
      return;
    }

    // ⚠️ CONFIRMACIÓN IMPORTANTE - Esta acción es permanente
    const confirmar = await this.mostrarAlertaConfirmacion(
      '⚠️ CAMBIO DE FIRMA PERMANENTE',
      'Esta acción reemplazará tu firma digital registrada permanentemente en el sistema.\n\n' +
      '¿Estás seguro de que deseas cambiar tu firma registrada?'
    );

    if (!confirmar) {
      return; // Usuario canceló
    }

    try {
      // Obtener el NIT del storage
      const nit = await this.storageService.get('nit');

      const params = {
        ejecucion_id: this.ejecucionId,
        tercero: this.encabezado.tercero_id,
        firmaBase64: firmaBase64,
        evaluacionId : this.encabezado.evaluacionId,
        nit: nit || ''
      };

      const resultado = await this.datosBasicosService.informacion(
        params,
        `${this.rutaGeneral}actualizarFirmaDigital`
      );

      if (resultado?.success) {
        this.notificacionService.notificacion('✅ Firma digital actualizada\n✅ Evaluación firmada correctamente');
        this.limpiarFirma();
        this.cerrarModalFirmaManual();
        this.cerrarFirma();
        
        // Recargar datos después de actualizar
        setTimeout(() => {
          this.obtenerDetalleEjecucion();
        }, 1000);
      } else {
        this.notificacionService.notificacion(resultado?.error || '❌ Error al actualizar la firma');
      }
    } catch (error) {
      console.error('❌ Error al actualizar firma digital:', error);
      this.notificacionService.notificacion(error?.message || 'Error al actualizar la firma');
    }
  }

  /**
   * Muestra una alerta de confirmación
   */
  private mostrarAlertaConfirmacion(titulo: string, mensaje: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: titulo,
        message: mensaje,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
      await alert.present();
    });
  }

  /**
   * Regresa al modal de opciones de firma
   */
  regresarAOpciones() {
    // Cerrar el modal de firma manual
    if (this.modalFirmaManual) {
      this.modalFirmaManual.dismiss();
    }
    
    this.isSignaturePadModalOpen = false;
    this.mostrando_firma = true;
    this.limpiarFirma();
    this.cdRef.detectChanges();
  }


}
