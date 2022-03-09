import { Component, OnInit } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
import { Constantes } from 'src/app/config/constantes/constantes';
//import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Subject } from 'rxjs';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Router } from '@angular/router';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { InformacionEmpleado } from 'src/app/servicios/informacionempleado.service';
import { InformacionFamiliar } from '../../../servicios/informacionfamiliar.service';
import { InformacionAcademica } from '../../../servicios/informacionacademica.service';
import { InformacionTelefono } from '../../../servicios/informaciontelefono.service';
import { LoginService } from 'src/app/servicios/login.service';
import { DomSanitizer } from '@angular/platform-browser';
import { InformacionCorreo } from '../../../servicios/informacioncorreo.service';
import { InformacionResidencia } from '../../../servicios/informacionresidencia.service';

@Component({
	selector: 'app-datosbasicos',
	templateUrl: './datosbasicos.page.html',
	styleUrls: ['./datosbasicos.page.scss'],
})
export class DatosbasicosPage implements OnInit {

	validandoPermiso: boolean = false;
	segmento: string = 'historicoFamilia';
	segmentoAcademica: string = 'historicoAcademica';
	segmentoTelefono: string = 'historicoTelefono';
	segmentoCorreo: string = 'historicoCorreo';
	segmentoResidencia: string = 'historicoResidencia';
	encomiendas: Array<object> = [];
	qFamiliar: Array<object> = [];
	qTelefono: Array<object> = [];
	qResidencia: Array<object> = [];
	qCorreo: Array<object> = [];

	qAcademica: Array<object> = [];
	buscarLista: string = '';
	buscarListaHistorico: string = '';
	buscarListaAcademia: string = '';
	buscarListaTelefono: string = '';
	buscarListaRe: string = '';
	buscarListaCorreo: string = '';

	datosUsuario: Object = {};
	foto: string = FuncionesGenerales.urlGestion();
	rutaGeneral: string = 'Autogestion/cDatosBasicos/';
	datosFormulario: { formulario: RxFormGroup, propiedades: Array<string> };
	datosAdicionales: { formulario: RxFormGroup, propiedades: Array<string> };
	datosFamiliar: { formulario: RxFormGroup, propiedades: Array<string> };
	datosAcademica: { formulario: RxFormGroup, propiedades: Array<string> };
	datosTelefono: { formulario: RxFormGroup, propiedades: Array<string> };
	datosCorreo: { formulario: RxFormGroup, propiedades: Array<string> };
	datosResidencia: { formulario: RxFormGroup, propiedades: Array<string> };

	generos = Constantes.generos;
	ppal = Constantes.ppal;
	grupo_sanguineo = Constantes.grupo_sanguineo;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	// Opciones de la camara
	// opcionescamara: CameraOptions = {
	// 	quality: 100, // De 0 a 100
	// 	destinationType: this.camera.DestinationType.DATA_URL,
	// 	encodingType: this.camera.EncodingType.JPEG,
	// 	mediaType: this.camera.MediaType.PICTURE,
	// 	allowEdit: false,
	// 	correctOrientation: true
	// };
	// Opciones de la galeria
	// opcionesgaleria: CameraOptions = {
	// 	quality: 100, // De 0 a 100
	// 	sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
	// 	destinationType: this.camera.DestinationType.DATA_URL,
	// 	allowEdit: false,
	// 	correctOrientation: true
	// };
	fotoDePerfil: string;
	subject = new Subject();
	subjectMenu = new Subject();
	terceroId: string;
	searching: boolean = true;
	extBase64: string = 'data:image/jpg;base64,';
	datosForm = {};
	localizaciones: any = {};
	estadoCivil: any = [];
	paisnacido: any = [];
	dptonacido: any = [];
	ciudadnacido: any = [];
	getParentesco: any = [];
	getTipoDocumento: any = [];
	getNivelEducativo: any = [];
	cambiovalor: boolean;
	cambiovalor2: boolean;
	llaveActual: string = '';
	datosSeleccionados = {};

	dptoResidencia: any = [];
	ciudadResidencia: any = [];

	constructor(
		private notificacionService: NotificacionesService,
		// private camera: Camera,
		private loginService: LoginService,
		private router: Router,
		private datosBasicosService: DatosbasicosService,
		private informacionEmpleado: InformacionEmpleado,
		private informacionFamiliar: InformacionFamiliar,
		private informacionAcademica: InformacionAcademica,
		private informacionTelefono: InformacionTelefono,
		private informacionCorreo: InformacionCorreo,
		private informacionResidencia: InformacionResidencia,
		private menu: CambioMenuService,
		private storage: StorageService,
		private domSanitizer: DomSanitizer
	) { }

	ngOnInit() {
		this.datosFormulario = FuncionesGenerales.crearFormulario(this.datosBasicosService);
		this.datosFormulario.formulario.get('nombre').disable();
		this.datosAdicionales = FuncionesGenerales.crearFormulario(this.informacionEmpleado);
		this.datosFamiliar = FuncionesGenerales.crearFormulario(this.informacionFamiliar);
		this.datosAcademica = FuncionesGenerales.crearFormulario(this.informacionAcademica);
		this.datosTelefono = FuncionesGenerales.crearFormulario(this.informacionTelefono);
		this.datosCorreo = FuncionesGenerales.crearFormulario(this.informacionCorreo);
		this.datosResidencia = FuncionesGenerales.crearFormulario(this.informacionResidencia);
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		console.log('this.datosUsuario', this.datosUsuario);
		this.irPermisos('datosFormulario', 'DP');
	}

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerDatosEmpleado();
		this.obtenerUsuario();
		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Menú !!"));
	}

	suscripcionCambios() {
		this.datosFormulario.formulario.valueChanges.pipe(
			debounceTime(1000),
			takeUntil(this.subject)
		).subscribe((resp) => {
			if (this.datosFormulario.formulario.valid) {
				this.guardarInformacion('Tercero');
			} else {
				FuncionesGenerales.formularioTocado(this.datosFormulario.formulario);
			}
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Cambio Formulario !!1"));

		this.datosAdicionales.formulario.valueChanges.pipe(
			debounceTime(1000),
			takeUntil(this.subject)
		).subscribe((resp) => {
			if (this.datosAdicionales.formulario.valid) {
				this.guardarInformacion('Empleados');
			} else {
				FuncionesGenerales.formularioTocado(this.datosAdicionales.formulario);
			}
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Cambio Formulario !!2"));
	}

	guardarInformacion(tabla) {
		switch (tabla) {
			case 'Empleados':
				this.datosForm = Object.assign({}, this.datosAdicionales.formulario.value);
				break;

			default:
				this.datosForm = Object.assign({}, this.datosFormulario.formulario.value);
				this.datosForm['fecha_nac'] = moment(this.datosForm['fecha_nac']).format('YYYY-MM-DD');
				this.datosForm['nombre'] = this.datosFormulario.formulario.get('nombruno').value + ' ' + this.datosFormulario.formulario.get('nombrdos').value + ' ' + this.datosFormulario.formulario.get('apelluno').value + ' ' + this.datosFormulario.formulario.get('apelldos').value;
				console.log('this.datosForm', this.datosFormulario.formulario.get('apelldos').value);
				break;
		}

		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});

		this.datosForm['tabla'] = tabla;
		this.obtenerInformacion('actualizarInformacion', 'datosGuardados', this.datosForm);
	}

	submitDataFamiliaContacto(tabla) {
		switch (tabla) {
			case 'FamiliaresAcudientes':
				this.datosForm = Object.assign({}, this.datosFamiliar.formulario.value);
				break;
			case 'EstudiosRealizados':
				this.datosForm = Object.assign({}, this.datosAcademica.formulario.value);
				break;
			case 'Telefonos':
				this.datosForm = Object.assign({}, this.datosTelefono.formulario.value);
				break;
			case 'Correos':
				this.datosForm = Object.assign({}, this.datosCorreo.formulario.value);
				break;

			case 'LugarResidencia':
				this.datosForm = Object.assign({}, this.datosResidencia.formulario.value);
				break;
		}

		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.datosForm['tabla'] = tabla;
		this.obtenerInformacion('guardarValores', 'datosGuardados', this.datosForm);
	}

	async datosGuardados({ mensaje, ciudades, dptonacido, qFamiliar, qAcademica, qTelefono, qResidencia, qCorreo }) {
		this.notificacionService.notificacion(mensaje);
		this.subject.next(true);
		this.datosFormulario.formulario.patchModelValue(this.datosForm);
		this.datosFormulario.formulario.get('nombre').disable();
		this.cambiovalor = !this.cambiovalor;
		this.suscripcionCambios();
		this.ciudadnacido = ciudades;
		this.dptonacido = dptonacido;
		this.qFamiliar = this.getColor(qFamiliar);
		this.qAcademica = this.getColor(qAcademica);
		this.qTelefono = this.getColor(qTelefono);
		this.qResidencia = this.getColor(qResidencia);
		this.qCorreo = this.getColor(qCorreo);
		this.datosSeleccionados = {};
	}


	getColor(data) {
		for (let i = 0; i < data.length; i++) {
			data[i].Color = this.colorRGB();
		}
		return data;
	};

	obtenerInformacion(metodo, funcion, datos = {}, event?) {
		this.searching = true;
		this.datosBasicosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			this.datosFamiliar.formulario.reset();
			this.datosFamiliar.formulario.markAsUntouched();
			this.datosAcademica.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
			this.datosTelefono.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
			this.datosCorreo.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
			this.datosResidencia.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
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

	obtenerFotoPerfil() {
		const botones = [{
			text: 'Camara',
			role: 'camara'
		}, {
			text: 'Galeria',
			role: 'galeria'
		}, {
			text: 'Cancelar',
			role: 'cancelar'
		}];
		this.notificacionService.alerta("Seleccionemos tu foto empleado", null, [], botones).then(({ role }) => {
			if (role == 'camara' || role == 'galeria') {
				// this.camera.getPicture(this['opciones' + role]).then((imageData) => {
				// 	this.actualizarFotoPerfil(imageData);
				// }, (err) => {
				// 	if (err != "No Image Selected") {
				// 		this.fotoDePerfil = null;
				// 		this.notificacionService.notificacion("Error al tomar imagen");
				// 	}
				// });
			}
		}, error => console.log("Error ", error));
	}

	async actualizarFotoPerfil(foto) {
		const datos = { id_tercero: this.terceroId, foto };
		this.datosBasicosService.informacion(datos, this.rutaGeneral + 'fotoPerfil').then(async ({ mensaje, success, archivo }) => {
			this.notificacionService.notificacion(mensaje);
			if (success) {
				this.fotoDePerfil = foto;
				let user = await this.storage.get('usuario').then(resp => resp);
				user = this.datosBasicosService.desencriptar(JSON.parse(user));
				user.foto = foto;
				this.storage.set('usuario', JSON.stringify(user));
			}
		}).catch(error => console.log("Error ", error));
	}

	obtenerDatosEmpleado() {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then(
			({
				datos,
				paisnacido,
				dptonacido,
				ciudadnacido,
				estadoCivil,
				qFamiliar,
				qAcademica,
				qTelefono,
				qResidencia,
				qCorreo,
				getParentesco,
				getTipoDocumento,
				getNivelEducativo
			}) => {
				if (datos) {
					this.estadoCivil = estadoCivil;
					this.getParentesco = getParentesco;
					this.getTipoDocumento = getTipoDocumento;
					this.getNivelEducativo = getNivelEducativo;
					this.paisnacido = paisnacido;
					this.qFamiliar = this.getColor(qFamiliar);
					this.qAcademica = this.getColor(qAcademica);
					this.qTelefono = this.getColor(qTelefono);
					this.qResidencia = this.getColor(qResidencia);
					this.qCorreo = this.getColor(qCorreo);
					console.log('this.qResidencia', this.qResidencia);
					console.log('this.qCorreo', this.qCorreo);

					this.qAcademica = qAcademica;
					for (let i = 0; i < qAcademica.length; i++) {
						qAcademica[i].Color = this.colorRGB();
					}
					this.dptonacido = dptonacido;
					this.ciudadnacido = ciudadnacido;
					this.terceroId = datos.id_tercero;
					debounceTime(1000),
						this.datosFormulario.formulario.patchModelValue(datos);
					this.datosAdicionales.formulario.patchModelValue(datos);
					this.suscripcionCambios();
				}
				this.searching = false;
			}).catch(error => console.log("Error ", error));
	}

	cambiosComponenteSelect(evento, key, tabs) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		this.llaveActual = key;
		switch (tabs) {
			case 'informacionempleado':
				if (evento.key == 'paisid') {
					this.datosAdicionales.formulario.get('dptoid').setValue(null);
				}
				if (evento.key == 'dptoid' || evento.key == 'paisid') {
					this.datosAdicionales.formulario.get('ciudadid').setValue(null);
				}
				this.datosAdicionales.formulario.get(evento.key).setValue(evento.valor[evento.key]);
				break;

			case 'FamiliaresAcudientes':
				this.datosFamiliar.formulario.get(evento.key).setValue(evento.valor[evento.key]);
				break;

			case 'EstudiosRealizados':
				this.datosAcademica.formulario.get(evento.key).setValue(evento.valor[evento.key]);
				break;

			case 'LugarResidencia':
				let data = {
					id: evento.valor[evento.key],
					tipo: 1
				};
				data.tipo = evento.key == 'paisid' ? 1 : 0;
				this.ubicacionesResidencia(evento, data);
				break;
		}
	}

	ubicacionesResidencia(evento, datos = {},) {
		this.datosBasicosService.informacion(datos, this.rutaGeneral + 'ubicacionesResidencia').then(resp => {
			if (evento.key == 'paisid') {
				this.dptoResidencia = resp;
				this.ciudadResidencia = [];
				this.datosResidencia.formulario.get('dptoid').setValue(null);
				this.datosResidencia.formulario.get('ciudadid').setValue(null);
			}
			if (evento.key == 'dptoid') {
				this.ciudadResidencia = resp;
				this.datosResidencia.formulario.get('ciudadid').setValue(null);
			}
			this.datosResidencia.formulario.get(evento.key).setValue(evento.valor[evento.key]);
			this.cambiovalor = !this.cambiovalor;
			this.cambiovalor2 = !this.cambiovalor2;
		}, console.error).catch(err => {
			console.log("Error ", err);
		}).catch(error => console.log("Error ", error));
	}

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	sanitizar(value) {
		return this.domSanitizer.bypassSecurityTrustStyle(value);
	}

	colorRGB() {
		var num = Math.round(0xffffff * Math.random());
		var r = num >> 16;
		var b = num & 255;
		var A = 0.5;
		return '--border-color: rgba(' + r + ', ' + 47 + ', ' + b + ', ' + A + ')';
	}


	irPermisos(form, tipo) {
		let permisos = FuncionesGenerales.permisos(tipo);
		permisos.forEach(({ id, campo }: any) => this.validarPermiso(id, form, campo));
	}

	validarPermiso(permiso, formulario, control) {
		let { SEGUR }: any = this.datosUsuario;
		if (SEGUR && SEGUR.length > 0 && SEGUR.includes(permiso)) {
			this[formulario].formulario.get(control).enable();
		} else {
			this.cambiovalor2 = !this.cambiovalor2;
			this.cambiovalor = !this.cambiovalor;
			this[formulario].formulario.get(control).disable();
		}
	}

	segmentChange(evento, vari) {
		this[vari] = evento.detail.value;
	}
}
