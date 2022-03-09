import { Component, OnInit } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
// import { Constantes } from 'src/app/config/constantes/constantes';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Subject } from 'rxjs';

import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { LoginService } from 'src/app/servicios/login.service';
import { InformacionSolicitud } from '../../../servicios/informacionsolicitud.service';

@Component({
	selector: 'app-solicitarvacaciones',
	templateUrl: './solicitarvacaciones.page.html',
	styleUrls: ['./solicitarvacaciones.page.scss'],
})
export class SolicitarvacacionesPage implements OnInit {
	searching: boolean = true;
	segmento: string = 'historicoFamilia';
	segmentoDisfrutado: 'historicoDisfrutado';

	qPendientes: Array<object> = [];
	qAprobados: Array<object> = [];
	buscarListaHistorico: string = '';
	buscarDisfrutados: string = '';
	datosSolicitud: { formulario: RxFormGroup, propiedades: Array<string> };
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	datosForm = {};
	datosSeleccionados = {};
	rutaGeneral: string = 'Autogestion/cSolicitarVacaciones/';
	datosUsuario: Object = {};
	subject = new Subject();
	subjectMenu = new Subject();
	terceroId: string;

	constructor(
		private notificacionService: NotificacionesService,
		// private camera: Camera,
		private loginService: LoginService,
		private datosBasicosService: DatosbasicosService,
		private informacionSolicitud: InformacionSolicitud,
		private menu: CambioMenuService,
		private storage: StorageService
	) { }

	ngOnInit() {
		this.datosSolicitud = FuncionesGenerales.crearFormulario(this.informacionSolicitud);
	}

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerUsuario();
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

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
	}

	submitDataFamiliaContacto() {
		this.datosForm = Object.assign({}, this.datosSolicitud.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.obtenerInformacion('guardarValores', 'datosGuardados', this.datosForm);
	}


	obtenerInformacion(metodo, funcion, datos = {}, event?) {
		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			this.datosSolicitud.formulario.reset();
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
		this.datosSolicitud.formulario.reset();
		this.datosSolicitud.formulario.markAsUntouched();
		this.qPendientes = qPendientes;
		this.qAprobados = qAprobados;

		this.datosSeleccionados = {};
	}

	obtenerDatosEmpleado(event?) {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then(
			({
				datos,
				qPendientes,
				qAprobados,
			}) => {
				if (datos) {
					this.qPendientes = qPendientes;
					this.qAprobados = qAprobados;
					this.terceroId = datos.id_tercero;
				}
				this.searching = false;
				if (event) event.target.complete();
			}).catch(error => console.log("Error ", error));
	}

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	getColor(data) {
		for (let i = 0; i < data.length; i++) {
			data[i].Color = this.colorRGB();
		}
		return data;
	};

	colorRGB() {
		var num = Math.round(0xffffff * Math.random());
		var r = num >> 16;
		var b = num & 255;
		var A = 0.5;
		return '--border-color: rgba(' + r + ', ' + 47 + ', ' + b + ', ' + A + ')';
	}

	refresh(evento) {
		this.obtenerDatosEmpleado(evento);
	}

}
