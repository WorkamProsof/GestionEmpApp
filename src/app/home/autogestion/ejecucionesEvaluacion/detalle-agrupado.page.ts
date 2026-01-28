import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, IonModal, AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import QrScanner from 'qr-scanner';

// ==================== INTERFACES ====================

interface Encabezado {
  documento?: string;
  nombreEmpleado?: string;
  nombreEvaluacion?: string;
  tipoEvaluacion?: string;
  FechaReal?: string | Date;
  conclusion?: string;
  firma?: string;
  rutaFirma?: string;
  firmado?: boolean;
  // Propiedades alternativas que pueden venir del backend
  num_docu?: string;
  NomEvaluador?: string;
  nombre?: string;
  fechaReal?: string | Date;
  [key: string]: any;
  EvaluacionId?: number;
}

interface DatoEje {
  evaluador?: string;
  rol?: string;
  peso?: number | string;
  resultado?: number | string;
  ponderado?: number | string;
  [key: string]: any;
}

interface Grupo {
  nombre?: string;
  peso?: number | string;
  [key: string]: any;
}

interface Total {
  nombre?: string;      // Ejemplo: "Competencias", "Funciones", etc.
  resultado?: number | string;
  grupo?: string;       // Fallback para compatibilidad
  ponderado?: number | string;
  [key: string]: any;
}

interface ResumenAgrupado {
  Encabezado?: Encabezado[];
  DatosEje?: DatoEje[];
  Grupos?: Grupo[];
  gTotales?: Total[];
  gTotalGeneral?: number | string;
}

// ==================== COMPONENTE ====================

@Component({
  selector: 'app-detalle-agrupado',
  templateUrl: './detalle-agrupado.page.html',
  styleUrls: ['./detalle-agrupado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HeaderComponent
  ]
})
export class DetalleAgrupado implements OnInit, OnDestroy {
  @ViewChild('modalFirmaManual', { static: false }) modalFirmaManual!: IonModal;
  @ViewChild('modalFirma', { static: false }) modalFirma!: IonModal;
  @ViewChild('modalQR', { static: false }) modalQR!: IonModal;
  @ViewChild('signaturePadCanvas', { static: false }) signaturePadCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoQR', { static: false }) videoQR!: ElementRef<HTMLVideoElement>;

  private destroy$ = new Subject<void>();
  cargando = false;
  error: string | null = null;
  rutaGeneral = 'Autogestion/cEjecucionEvaluacion/';

  // Datos del resumen agrupado
  resumenAgrupado: ResumenAgrupado = {};
  encabezado: Encabezado = {};
  datosItem: DatoEje[] = [];
  datosEvaluador : any[] = [];
  gruposPorEvaluador: any[] = [];
  totalesPorGrupo: Total[] = [];
  totalGeneral: number | string = 0;

  // Control de firma
  mostrando_firma = false;
  isSignaturePadModalOpen = false;
  isQRModalOpen = false;
  isDrawing = false;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  firmaBase64: string = '';
  contrasena: string = '';
  validandoClave = false;
  lectorQR: QrScanner | null = null;
  private canvasContext: CanvasRenderingContext2D | null = null;

  evaluacionId: number | null = null;

  constructor(
    private datosBasicosService: DatosbasicosService,
    private notificacionService: NotificacionesService,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.evaluacionId = Number(this.route.snapshot.paramMap.get('evaluacionId'));
    
    if (this.evaluacionId) {
      this.obtenerDatos();
    } else {
      this.error = 'No se encontró el ID de la evaluación';
    }
  }

  /**
   * Obtiene los datos del resumen agrupado
   */
  obtenerDatos() {
    this.cargando = true;
    this.error = null;

    // Obtener el NIT del storage
    this.storageService.get('nit').then(nit => {
      const parametros = {
        evaluacionId: this.evaluacionId,
        nit: nit || ''  // Añadir NIT a los parámetros
      };

      this.datosBasicosService.informacion(parametros, `${this.rutaGeneral}obtenerResumenAgrupado`)
        .then(resp => {          
          if (resp && resp.success && resp.datos) {
            this.procesarDatos(resp.datos);
          } else {
            this.error = resp?.error || 'Error al cargar los datos agrupados';
            console.error('❌ Error:', this.error);
            this.cargando = false;
            this.cdRef.detectChanges();
          }
        })
        .catch(error => {
          console.error('❌ Error al obtener datos:', error);
          this.error = error?.message || 'Error al obtener los datos';
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
   * Procesa los datos recibidos del servidor
   */
  private procesarDatos(datos: ResumenAgrupado) {
    // Procesar encabezado - tomar el primero del array y normalizar propiedades
    if (datos.Encabezado && Array.isArray(datos.Encabezado) && datos.Encabezado.length > 0) {
      const encabezadoRaw = datos.Encabezado[0];
      console.log('🔍 Encabezado raw:', encabezadoRaw);
      // Mapear propiedades del backend a propiedades esperadas en el componente
      this.encabezado = {
        documento: encabezadoRaw.documento || encabezadoRaw.num_docu || '',
        nombreEmpleado: encabezadoRaw.nomEmp || '',
        nombreEvaluacion: encabezadoRaw.nombre || '',
        tipoEvaluacion: encabezadoRaw.tipoEvaluacion || '',
        FechaReal: encabezadoRaw.FechaFirma ||  '',
        conclusion: encabezadoRaw.conclusion || '',
        firma: encabezadoRaw.firma || '',
        rutaFirma: encabezadoRaw.rutaFirma || '',
        firmado: encabezadoRaw.firmado || false,
        EvaluacionId: encabezadoRaw.EvaluacionId || null,
        ...encabezadoRaw
      };
    }

    this.datosEvaluador = datos.Encabezado || [];

    // Procesar datos de evaluadores (para tabla "Total Por Evaluador")
    this.datosItem = datos.DatosEje || [];

    // Procesar totales por grupo (para tabla "Resumen por Competencias")
    this.totalesPorGrupo = datos.gTotales || [];

    this.cargando = false;
    this.cdRef.detectChanges();
  }

  // ==================== MÉTODOS DE FIRMA ====================

  /**
   * Abre el modal de opciones de firma
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
   * Abre el modal para ingresar contraseña
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
          text: 'Firmar',
          handler: (data) => {
            if (data.clave) {
              this.validarClaveYFirmar(data.clave);
            } else {
              this.notificacionService.notificacion('⚠️ Por favor ingrese su contraseña');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Abre el modal para firma manual
   */
  abrirModalFirmaManual() {
    this.isSignaturePadModalOpen = true;
    setTimeout(() => {
      this.inicializarCanvas();
    }, 300);
  }

  /**
   * Cierra el modal de firma manual
   */
  cerrarModalFirmaManual() {
    this.isSignaturePadModalOpen = false;
    if (this.modalFirmaManual) {
      this.modalFirmaManual.dismiss();
    }
  }

  /**
   * Regresa a las opciones de firma
   */
  regresarAOpciones() {
    this.isSignaturePadModalOpen = false;
    this.limpiarFirma();
    if (this.modalFirmaManual) {
      this.modalFirmaManual.dismiss();
    }
  }

  regresar() {
    window.history.back();
  }

  /**
   * Inicializa el canvas para la firma
   */
  private inicializarCanvas() {
    const canvas = this.signaturePadCanvas?.nativeElement;
    
    if (!canvas) {
      this.notificacionService.notificacion('❌ Error al acceder al canvas');
      return;
    }

    // Obtener contexto 2D
    this.canvasContext = canvas.getContext('2d');
    
    if (!this.canvasContext) {
      this.notificacionService.notificacion('❌ Error al obtener contexto del canvas');
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
      this.firmaBase64 = '';
    }
  }

  /**
   * Valida que haya firma dibujada
   */
  private validarFirmaDibujada(): boolean {
    const canvas = this.signaturePadCanvas?.nativeElement;
    
    if (!canvas) {
      this.notificacionService.notificacion('❌ Error al acceder al canvas');
      return false;
    }

    if (!this.canvasContext) {
      this.notificacionService.notificacion('❌ Error al obtener contexto del canvas');
      return false;
    }

    try {
      const imageData = this.canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Error al validar firma:', error);
      this.notificacionService.notificacion('❌ Error al validar la firma');
      return false;
    }

    this.notificacionService.notificacion('⚠️ Por favor dibuje su firma');
    return false;
  }

  /**
   * Valida datos requeridos
   */
  private validarDatosRequeridos(): boolean {
    if (!this.evaluacionId) {
      this.notificacionService.notificacion('❌ Falta información de la evaluación');
      return false;
    }

    if (!this.encabezado.documento) {
      this.notificacionService.notificacion('❌ Falta información del empleado');
      return false;
    }

    return true;
  }

  /**
   * Guarda la firma dibujada
   */
  async guardarFirmaManual() {
    if (!this.validarFirmaDibujada()) {
      return;
    }

    if (!this.validarDatosRequeridos()) {
      return;
    }

    const canvas = this.signaturePadCanvas?.nativeElement;
    const firmaBase64 = canvas.toDataURL('image/png');

    if (firmaBase64.length < 100) {
      this.notificacionService.notificacion('❌ La firma no fue capturada correctamente');
      return;
    }

    try {
      // Obtener el NIT del storage
      const nit = await this.storageService.get('nit');

      const params = {
        ejecucion_id: this.evaluacionId,
        documento: this.encabezado.documento,
        fechaEvaluacion: this.encabezado.FechaReal || this.encabezado.fechaReal,
        tercero: this.encabezado.tercero_id,
        firmaBase64: firmaBase64,
        tipoFirma: 'manual',
        evaluacionId : this.encabezado.EvaluacionId,
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
        
        setTimeout(() => {
          this.obtenerDatos();
        }, 1000);
      } else {
        this.notificacionService.notificacion(resultado?.error || '❌ Error al guardar la firma');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      this.notificacionService.notificacion('❌ Error al guardar la firma');
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
        ejecucion_id: this.evaluacionId,
        documento: this.encabezado.documento,
        tercero: this.encabezado.tercero_id,
        firmaBase64: firmaBase64,
        evaluacionId : this.encabezado.EvaluacionId,
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
          this.obtenerDatos();
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
            text: 'Continuar',
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
   * Guarda firma con contraseña
   */

  /**
   * Abre el modal QR para escanear código de firma
   */
  async abrirModalQR() {
    try {
      this.isQRModalOpen = true;
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('❌ Error al abrir modal QR:', error);
      this.notificacionService.notificacion('❌ Error al abrir escáner QR');
      this.isQRModalOpen = false;
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
        this.lectorQR.destroy();
        this.lectorQR = null;
      }
    } catch (error) {
      console.error('❌ Error al detener QR scanner:', error);
    } finally {
      const videoElement = this.videoQR?.nativeElement;
      if (videoElement && videoElement.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
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
        ejecucion_id: this.evaluacionId,
        evaluacionId: this.encabezado.EvaluacionId,
        fechaEvaluacion: this.encabezado.FechaReal || this.encabezado.fechaReal,
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
          this.obtenerDatos();
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
   * Formato para porcentajes
   */
  formatearPorcentaje(valor: any): string {
    const num = Number(valor);
    return isNaN(num) ? '0%' : num.toFixed(2) + '%';
  }

  /**
   * Formato para números
   */
  formatearNumero(valor: any): string {
    const num = Number(valor);
    return isNaN(num) ? '0' : num.toFixed(2);
  }

  ngOnDestroy() {
    this.stopQRScanner();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
