import { Component, OnInit, ViewChild } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
import { Constantes } from 'src/app/config/constantes/constantes';
//import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Subject } from 'rxjs';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { InformacionEmpleado } from 'src/app/servicios/informacionempleado.service';
import { LoginService } from 'src/app/servicios/login.service';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AgregarResidenciaComponent } from './agregar-residencia/agregar-residencia.component';
import { AgregarTelefonoComponent } from './agregar-telefono/agregar-telefono.component';
import { AgregarCorreoComponent } from './agregar-correo/agregar-correo.component';
import { AgregarEstudioComponent } from './agregar-estudio/agregar-estudio.component';
import { AgregarFamiliarComponent } from './agregar-familiar/agregar-familiar.component';

@Component({
	selector: 'app-datosbasicos',
	templateUrl: './datosbasicos.page.html',
	styleUrls: ['./datosbasicos.page.scss'],
})
export class DatosbasicosPage implements OnInit {

	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup;
	qFamiliar: Array<object> = [];
	qTelefono: Array<object> = [];
	qResidencia: Array<object> = [];
	qCorreo: Array<object> = [];
	qAcademica: Array<object> = [];
	SEGUR: Array<object> = [];
	buscarLista: string = '';
	buscarListaHistorico: string = '';
	buscarListaAcademia: string = '';
	buscarListaTelefono: string = '';
	buscarListaRe: string = '';
	buscarListaCorreo: string = '';
	accordions = ["DP", "DR", "DC", "CC", "IE", "IC", "FI"]
	datosUsuario: Object = {};
	foto: string = FuncionesGenerales.urlGestion();
	rutaGeneral: string = 'Autogestion/cDatosBasicos/';
	datosFormulario: { formulario: RxFormGroup, propiedades: Array<string> };
	datosAdicionales: { formulario: RxFormGroup, propiedades: Array<string> };

	generos = Constantes.generos;
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
	estadoCivil: any = [];
	paisnacido: any = [];
	dptonacido: any = [];
	ciudadnacido: any = [];
	getParentesco: any = [];
	getTipoDocumento: any = [];
	getNivelEducativo: any = [];
	cambiovalor: boolean;
	datosSeleccionados = {};
	dptoResidencia: any = [];
	ciudadResidencia: any = [];

	constructor(
		private notificacionService: NotificacionesService,
		// private camera: Camera,
		private loginService: LoginService,
		private datosBasicosService: DatosbasicosService,
		private informacionEmpleado: InformacionEmpleado,
		private menu: CambioMenuService,
		private storage: StorageService,
		private modalController: ModalController
	) { }

	ngOnInit() {
		this.datosFormulario = FuncionesGenerales.crearFormulario(this.datosBasicosService);
		this.datosFormulario.formulario.get('nombre').disable();
		this.datosAdicionales = FuncionesGenerales.crearFormulario(this.informacionEmpleado);

		if (this.accordionGroup) {
			this.accordionGroup.ionChange.subscribe(({ detail }) => {
				if (this.accordions.includes(detail.value)) {
					this.accordionGroup.value = detail.value;
				}
			});
		}
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.SEGUR = this.datosUsuario['SEGUR'] || [];
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
		}, () => console.log());
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
		}, () => console.log());

		this.datosAdicionales.formulario.valueChanges.pipe(
			debounceTime(1000),
			takeUntil(this.subject)
		).subscribe((resp) => {
			if (this.datosAdicionales.formulario.valid) {
				this.guardarInformacion('Empleados');
			} else {
				//FuncionesGenerales.formularioTocado(this.datosAdicionales.formulario);
			}
		}, error => {
			console.log("Error ", error);
		}, () => console.log());
	}

	guardarInformacion(tabla) {
		if (tabla == 'Empleados') {
			this.datosForm = Object.assign({}, this.datosAdicionales.formulario.value);
		} else {
			this.datosForm = Object.assign({}, this.datosFormulario.formulario.value);
			this.datosForm['fecha_nac'] = this.datosForm['fecha_nac'] && moment(this.datosForm['fecha_nac']).format('YYYY-MM-DD');
			this.datosForm['nombre'] = this.datosFormulario.formulario.get('nombruno').value + ' ' + this.datosFormulario.formulario.get('nombrdos').value + ' ' + this.datosFormulario.formulario.get('apelluno').value + ' ' + this.datosFormulario.formulario.get('apelldos').value;
		}
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.datosForm['tabla'] = tabla;
		this.obtenerInformacion('actualizarInformacion', 'datosGuardados', this.datosForm);
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
		return data.map(it => {
			it.Color = '--border-color: ' + FuncionesGenerales.generarColorAutomatico();
			return it;
		});
	};

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

	obtenerDatosEmpleado(event?) {
		this.datosBasicosService.informacion({}, this.rutaGeneral + 'getData').then((resp) => {
			Object.entries(resp).forEach((it) => {
				if (it[0] != 'datos') {
					if (it[0] == 'qFamiliar' || it[0] == 'qAcademica' || it[0] == 'qTelefono' || it[0] == 'qResidencia' || it[0] == 'qCorreo') {
						this[it[0]] = this.getColor(it[1])
					} else {
						this[it[0]] = it[1]
					}
				}
			});
			let { datos } = resp;
			this.terceroId = datos.id_tercero;
			this.datosFormulario.formulario.patchModelValue(datos);
			this.datosAdicionales.formulario.patchModelValue(datos);
			this.suscripcionCambios();
			this.searching = false;
			if (event) event.target.complete();
		}).catch(error => console.log("Error ", error));
	}

	cambiosComponenteSelect(evento, tabs, tabla) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		if (tabs == 'informacionempleado') {
			if (evento.key == 'paisid') {
				this.datosAdicionales.formulario.get('dptoid').setValue(null);
			}
			if (evento.key == 'dptoid' || evento.key == 'paisid') {
				this.datosAdicionales.formulario.get('ciudadid').setValue(null);
			}
			this.datosAdicionales.formulario.get(evento.key).setValue(evento.valor[evento.key]);
		}
		this.cambiovalor = !this.cambiovalor;
		this.guardarInformacion(tabla);
	}

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	irPermisos(form, tipo) {
		let permisos = FuncionesGenerales.permisos(tipo);
		permisos.forEach(({ id, campo }: any) => this.validarPermiso(id, form, campo));
	}

	validarPermiso(permiso, formulario, control) {
		if (this.SEGUR.length > 0 && this.SEGUR.includes(permiso)) {
			this[formulario].formulario.get(control).enable();
		} else {
			this.cambiovalor = !this.cambiovalor;
			this[formulario].formulario.get(control).disable();
		}
	}

	async irModal() {
		let valor = this.accordionGroup.value;
		let datos = { component: null, componentProps: {} };

		if (valor == "DR") {
			datos.component = AgregarResidenciaComponent;
			datos.componentProps = {
				paisnacido: this.paisnacido,
				dptoResidencia: this.dptoResidencia,
				ciudadResidencia: this.ciudadResidencia
			};
		}
		if (valor == "DC") {
			datos.component = AgregarTelefonoComponent;
		}
		if (valor == "CC") {
			datos.component = AgregarCorreoComponent;
		}
		if (valor == "IC") {
			datos.component = AgregarEstudioComponent;
			datos.componentProps = {
				getNivelEducativo: this.getNivelEducativo
			};
		}
		if (valor == "FI") {
			datos.component = AgregarFamiliarComponent;
			datos.componentProps = {
				getTipoDocumento: this.getTipoDocumento,
				getParentesco: this.getParentesco
			};
		}
		if (datos.component) {
			datos.componentProps['permisos'] = this.SEGUR;
			const modal = await this.modalController.create(datos);
			await modal.present();
			await modal.onWillDismiss().then(resp => {
				if (resp.data && typeof resp.data == "object") {
					this.obtenerInformacion('guardarValores', 'datosGuardados', resp.data);
				}
			});
		} else {
			this.notificacionService.notificacion("No se ha definido componente");
		}
	}

	refresh(evento) {
		this.subject.next(true);
		this.obtenerDatosEmpleado(evento);
	}

}
