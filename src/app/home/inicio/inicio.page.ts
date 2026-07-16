import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from '../../componentes/header/header.component';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  airplaneOutline,
  documentTextOutline,
  ribbonOutline,
  medkitOutline,
  shieldCheckmarkOutline,
  cashOutline,
  briefcaseOutline,
  clipboardOutline,
  fingerPrintOutline,
  barChartOutline,
} from 'ionicons/icons';
import { StorageService } from 'src/app/servicios/storage.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

interface ModuleItem {
  title: string;
  icon: string;
  route: string;
  color: string;
  permisoId?: number;
}
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HeaderComponent
  ]
})
export class InicioPage implements OnInit {
  modules: ModuleItem[] = [
    { title: 'Datos básicos', icon: 'person-circle-outline', route: 'datosbasicos', color: '#3b82f6', permisoId: 6001006 },
    { title: 'Solicitar vacaciones', icon: 'airplane-outline', route: 'solicitarvacaciones', color: '#0ea5e9', permisoId: 6001008 },
    { title: 'Solicitar permisos', icon: 'document-text-outline', route: 'solicitarpermisos', color: '#14b8a6', permisoId: 6001008 },
    { title: 'Certificados', icon: 'ribbon-outline', route: 'certificados', color: '#f59e0b', permisoId: 6001007 },
    { title: 'Registro ausentismo', icon: 'medkit-outline', route: 'registroausentismo', color: '#ef4444', permisoId: 6001009 },
    { title: 'Elementos protección', icon: 'shield-checkmark-outline', route: 'elementosproteccion', color: '#22c55e' },
    { title: 'Ver Ejecuciones de Evaluación', icon: 'clipboard-outline', route: 'ejecucionesevaluacion', color: '#ec4899', permisoId: 6001100 },
    { title: 'Perfil de cargo', icon: 'briefcase-outline', route: 'perfilcargo', color: '#8b5cf6', permisoId: 6001200 },
    { title: 'Marcaciones', icon: 'finger-print-outline', route: 'marcaciones', color: '#6366f1', permisoId: 6001015 },
    { title: 'Reporte marcaciones', icon: 'bar-chart-outline', route: 'marcaciones-reporte', color: '#f97316', permisoId: 6001015 },
  ];

  datosUsuario: any = null; // Variable para almacenar los datos del usuario

  constructor(
    private router: Router,
    private storageService: StorageService,
    private loginService: LoginService,
    private notificaciones: NotificacionesService
  ) {
    addIcons({
      personCircleOutline,
      airplaneOutline,
      documentTextOutline,
      ribbonOutline,
      medkitOutline,
      shieldCheckmarkOutline,
      cashOutline,
      briefcaseOutline,
      clipboardOutline,
      fingerPrintOutline,
      barChartOutline,
    });
  }

  ngOnInit() {
    this.obtenerUsuario();
  }

  private async obtenerUsuario() {
    const usuarioStorage = await this.storageService.get('usuario');
    if (!usuarioStorage) {
      this.notificaciones.notificacion('No se encontró información del usuario en el almacenamiento local. Por favor, inicie sesión nuevamente.');
      return;
    }

    const usuarioParsed = JSON.parse(usuarioStorage);
    this.datosUsuario = await this.loginService.desencriptar(usuarioParsed);
  }

  /**
  * Navega al módulo seleccionado si el usuario tiene el permiso correspondiente
  * @param module - Módulo a abrir
  * @returns void
  */
  openModule(module: ModuleItem): void {
    console.log(`Navigating to ${module.title} at route ${module.route}`);
    this.router.navigateByUrl(`modulos/${module.route}`);
  }

  /**
  * Valida si el usuario tiene permiso para acceder a una funcionalidad específica
  * @param permisoId - ID del permiso a validar
  * @returns boolean - true si tiene permiso, false en caso contrario
  */
  validarPermiso(permisoId?: number): boolean {
    // Si no se especifica permiso, permitir acceso
    if (!permisoId) {
      return true;
    }

    // Si no hay permisos cargados, denegar acceso
    if (!this.datosUsuario?.SEGUR || this.datosUsuario.SEGUR.length === 0) {
      return false;
    }

    // Verificar si el permiso específico está en la lista
    return this.datosUsuario.SEGUR.includes(permisoId);
  }

}
