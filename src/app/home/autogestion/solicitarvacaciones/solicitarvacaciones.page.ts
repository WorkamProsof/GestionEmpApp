import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { AgregarSolicitudVacacionesComponent } from './agregar-solicitud-vacaciones/agregar-solicitud-vacaciones.component';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-solicitarvacaciones',
	templateUrl: './solicitarvacaciones.page.html',
	styleUrls: ['./solicitarvacaciones.page.scss'],
})
export class SolicitarvacacionesPage implements OnInit {

	searching: boolean = true;
	qPendientes: Array<object> = [];
	qAprobados: Array<object> = [];
	buscarListaHistorico: string = '';
	buscarDisfrutados: string = '';
	rutaGeneral: string = 'Autogestion/cSolicitarVacaciones/';
	subject = new Subject();
	subjectMenu = new Subject();

	constructor(
		private notificacionService: NotificacionesService,
		private datosBasicosService: DatosbasicosService,
		private menu: CambioMenuService,
		private modalController: ModalController
	) { }

	ngOnInit() { }

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerDatosEmpleado();
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Menú !!"));
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

	async datosGuardados({ mensaje, qPendientes, qAprobados }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.qPendientes = qPendientes;
		this.qAprobados = qAprobados;
	}

	obtenerDatosEmpleado(event?) {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then(({
			qPendientes,
			qAprobados,
		}) => {
			this.qPendientes = (qPendientes || []);
			this.qAprobados = (qAprobados || []);
			this.searching = false;
			if (event) event.target.complete();
		}).catch(error => console.log("Error ", error));
	}

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	refresh(evento) {
		this.obtenerDatosEmpleado(evento);
	}

	async irModal() {
		let datos = { component: AgregarSolicitudVacacionesComponent, componentProps: {} };
		const modal = await this.modalController.create(datos);
		await modal.present();
		await modal.onWillDismiss().then(resp => {
			if (resp.data && typeof resp.data == "object") {
				this.obtenerInformacion('guardarValores', 'datosGuardados', resp.data);
			}
		});
	}

}
