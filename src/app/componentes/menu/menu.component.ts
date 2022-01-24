import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { CargadorService } from 'src/app/servicios/cargador.service';
import { LoginService } from 'src/app/servicios/login.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

	appMenuSwipeGesture: boolean;
	menus: Array<{ icon: string, title: string, path: string, badge?: boolean, hijos?: Array<any>, modulo?: string }> = [
		{
			modulo: 'GASTOSAPP', icon: '', title: 'Gastos', path: '', hijos: [{
				icon: 'cash-outline', title: 'Gastos', path: '/modulos/gastos'
			}]
		},
		{
			modulo: 'AUTOGESTION', icon: '', title: 'Gestión', path: '', hijos: [{
				icon: 'documents-outline', title: 'Documentos', path: '/modulos/gestion'
			}]
		}
	];
	datosUsuario: Object = {};
	public logo: string = 'assets/images/nofoto.png';
	modulos: Array<object> = [];

	constructor(
		private menuController: MenuController,
		private router: Router,
		public theme: ThemeService,
		private notificacionesService: NotificacionesService,
		private storageService: StorageService,
		private loginService: LoginService,
		private cambioMenuService: CambioMenuService,
		private cargadorService: CargadorService,
	) {
		this.menus = this.menus.sort((a, b) => FuncionesGenerales.ordenar(a, 'title', 1, b));
		this.menus.unshift({
			icon: '', title: '', path: '', hijos: [{
				icon: 'home-outline', title: 'Inicio', path: '/modulos/inicio'
			}]
		});
	}

	ngOnInit() {
		this.obtenerUsuario();
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storageService.get('usuario').then(resp => resp))
		);
		this.modulos = await this.loginService.desencriptar(
			JSON.parse(await this.storageService.get('modulos').then(resp => resp))
		);
		console.log(this.modulos);
	}

	toggleMenu(sesion?: boolean) {
		this.menuController.close('first');
	}

	ngOnDestroy() {
		this.menuController.enable(false);
	}

	mostrarConfiguracion(ruta: string) {
		this.router.navigateByUrl(ruta);
		this.toggleMenu();
	}

	get size() {
		return { fontSize: this.theme.getStyle() };
	}

	irPagina(ruta) {
		this.cambioMenuService.cambio(ruta);
		this.router.navigateByUrl(ruta);
	}

	confirmarCerrarSesion() {
		this.notificacionesService.alerta('¿Esta seguro de Cerrar Sesión?').then(respuesta => {
			if (respuesta.role === 'aceptar') {
				this.cargadorService.presentar().then(resp => {
					this.loginService.cerrarSesionUser().then(resp => {
						if (resp.valido == 1) {
							this.storageService.limpiarTodo(true);
						} else {
							this.notificacionesService.notificacion(resp.mensaje);
						}
						this.cargadorService.ocultar();
					}).catch(error => {
						this.notificacionesService.notificacion("ha ocurrido un error");
						this.cargadorService.ocultar();
					});
				});
			}
		}, console.error);
	}

	irMiPerfil() {
		//this.router.navigateByUrl('modulos/mi-perfil');
	}

}
