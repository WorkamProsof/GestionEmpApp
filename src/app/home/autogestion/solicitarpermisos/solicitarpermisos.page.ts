import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { NotificacionesService } from '../../../servicios/notificaciones.service';
import { AgregarSolicitarPermisosComponent } from './agregar-solicitar-permisos/agregar-solicitar-permisos.component';

@Component({
	selector: 'app-solicitarpermisos',
	templateUrl: './solicitarpermisos.page.html',
	styleUrls: ['./solicitarpermisos.page.scss'],
})
export class SolicitarpermisosPage implements OnInit {

	searching: boolean = false;
	permisoPendientes: boolean = false;
	permisoDisfrutados: boolean = false;
	buscarPendientes: string = '';
	permisoCrear: boolean = false;
	rutaGeneral: string = 'Autogestion/cSolicitudPermiso/';
	qPendientes: Array<object> = [];
	tiposAusentismosArray: Array<object> = [];
	subject = new Subject();
	subjectMenu = new Subject();
	SEGUR: Array<any> = [];
	datosUsuario: Object = {};

	constructor(
		private datosBasicosService: DatosbasicosService,
		private modalController: ModalController,
		private notificacionService: NotificacionesService,
		private menu: CambioMenuService,
		private storage: StorageService
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado');
		this.obtenerUsuario();
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Menú !!"));
		this.obtenerInformacion('tiposAusentismo', 'tiposDeAusentismo');
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.datosBasicosService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.SEGUR = this.datosUsuario['SEGUR'] || [];
		this.permisoCrear = this.validarPermiso(60010083);
		this.permisoDisfrutados = this.validarPermiso(60010082);
		this.permisoPendientes = this.validarPermiso(60010081);
	}

	validarPermiso = (permiso) => this.SEGUR.length > 0 && this.SEGUR.includes(permiso);

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	refresh(evento) {
		this.obtenerInformacion('getData', 'obtenerDatosEmpleado', {}, evento);
	}

	obtenerDatosEmpleado({ qPendientes }) {
		this.qPendientes = qPendientes;
		console.log(this.qPendientes)
	}

	async irModal() {
		let datos = {
			component: AgregarSolicitarPermisosComponent
			, componentProps: { ausentimos: this.tiposAusentismosArray }
		};
		const modal = await this.modalController.create(datos);
		await modal.present();
		await modal.onWillDismiss().then(resp => {
			if (resp.data && typeof resp.data == "object") {
				this.obtenerInformacion('crearSolicitud', 'datosGuardados', resp.data);
			}
		});
	}

	obtenerInformacion(metodo, funcion, datos = {}, event?) {
		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			if (resp.success) {
				this[funcion](resp);
			} else {
				this.notificacionService.notificacion(resp.mensaje);
			}
			this.searching = false;
			if (event) event.target.complete();
		}, console.error).catch(err => {
			console.log("Error ", err);
			this.searching = false;
			if (event) event.target.complete();
		}).catch(error => console.log("Error ", error));
	}

	async datosGuardados({ mensaje, qPendientes }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.qPendientes = qPendientes;
	}

	tiposDeAusentismo(resp) {
		this.tiposAusentismosArray = resp.datos;
	}

}
