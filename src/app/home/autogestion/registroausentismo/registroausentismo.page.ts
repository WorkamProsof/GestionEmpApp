/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/member-delimiter-style */
/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit,ViewChild } from '@angular/core';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';
import { Constantes } from 'src/app/config/constantes/constantes';
import { IonAccordionGroup, IonModal ,Platform} from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { Subject } from 'rxjs';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FormGroup, FormControl} from '@angular/forms';
import { DatosAusentismosService } from 'src/app/servicios/datosAusentismo';

@Component({
	selector: 'app-registroausentismo',
	templateUrl: './registroausentismo.page.html',
	styleUrls: ['./registroausentismo.page.scss'],
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class registroausentismoPage implements OnInit {
	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup;
	@ViewChild('modalFechaSolicitudesInicio') modalFechaSolicitudesInicio: IonModal;
	@ViewChild('modalFechaSolicitudesFin') modalFechaSolicitudesFin: IonModal;

	tipoCalculo = Constantes.tipoCalculo;
	escalaAusentismo = Constantes.escalaAusentismo;


  	segur: Array<object> = [];

	src: any;
	base64Img: any;
	pdfObj: any;
	datosUsuario = {};
	base64 = '';
	rutaGeneral = 'Autogestion/cAusentismoAutoGestion/';
	selectedOption: string;
	selectedOptionHoras: any;
	diasAusentismo: any;
	horasAusentismo: any;
	costoAusentismo: any;
	precioHoraLaboral: any;
	totalHorasAusente: any;
	fechaInicio: Date;
	fechaFin: Date;
	diferenciaDias: number;
	terceroId: number;
	searching = true;

	subject = new Subject();
	empleado: Array<object> = [];
	areas: Array<object> = [];
	ausentismo: Array<object> = [];
	enfermedades: Array<object> = [];
	selectedFiles: File[] = [];
	grado: string;
	tipoausentismoId: string;
	areaId: string;
	datosForm = {};
	datosSeleccionados = {};
	ausentismoForm= new FormGroup({
		areaId: new FormControl(),
		grado: new FormControl(),
		fechainicio: new FormControl(),
		fechafin: new FormControl(),
		tiposausentismoid: new FormControl(),
		cie10: new FormControl(),
		observacion: new FormControl(),
		horas_dia_laboradas: new FormControl(),
		dias: new FormControl(),
		TipoCalculo: new FormControl(),
		horas: new FormControl(),
		total_horas: new FormControl(),
		costo_hora: new FormControl(),
		costo_total: new FormControl(),
	});
	cambiovalor: boolean;
	guardarAusentismo = false;

	datosFormulario: { formulario: RxFormGroup, propiedades: Array<string> };
	datosFormularioEnvio: { formulario: RxFormGroup, propiedades: Array<string> };

	constructor(
		private datosEmpleadosService: DatosEmpleadosService,
		public platform: Platform,
		private notificacionService: NotificacionesService,
		private loginService: LoginService,
		private storage: StorageService,
		private datosAusentismo: DatosAusentismosService,
	) { }
	ngOnInit() {
		this.datosFormulario = FuncionesGenerales.crearFormulario(this.datosEmpleadosService);
		this.datosFormularioEnvio = FuncionesGenerales.crearFormulario(this.datosAusentismo);
		this.obtenerUsuario();

	}

	ionViewDidEnter() {
		this.obtenerDatosEmpleado(this.terceroId);
		this.obtenerInformacion('obtenerDatosSelects', 'obtenerSelect');
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		this.terceroId = this.datosUsuario['num_docu'];
		this.segur = this.datosUsuario['SEGUR'] || [];
	}

	obtenerDatosEmpleado(event?) {
		this.datosEmpleadosService.informacion({documento: event}, `${this.rutaGeneral}cargarEmpleado`).then((resp) => {
			this.empleado= resp[0];
		}).catch(error => console.log('Error ', error));
		this.segur = this.datosUsuario['SEGUR'] || [];
		this.irPermisos('ausentismoForm', 'RC');

	}

	irPermisos(form, tipo) {
		const permisos = FuncionesGenerales.permisos(tipo);
		permisos.forEach(({ id, campo }: any) => this.validarPermiso(id, form, campo));
	}

	validarPermiso(permiso, formulario, control) {
		if (this.segur.length > 0 && !this.segur.includes(permiso)) {
			this.cambiovalor = !this.cambiovalor;
			this[formulario].disable();
			this.guardarAusentismo = true;
		}
	}

	obtenerInformacion(metodo, funcion, datos = {}, event?) {
		this.searching = true;
		this.datosEmpleadosService.informacion(datos, this.rutaGeneral + metodo).then(resp => {
			this.areas = resp.areas;
			this.ausentismo = resp.tiposAusentismo;
			this.enfermedades = resp.enfermedades;
			if (resp.success) {
				this[funcion](resp);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}, console.error).catch(err => {
			console.log('Error ', err);
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch(error => console.log('Error ', error));
	}

	confirmarInicio(){
		const inputElement = document.getElementById('Fechainicio') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
	}

	confirmarFin(){
		const inputElement = document.getElementById('FechaFin') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
	}

	onSelectChange(){
		const horasAusentismo = document.getElementById('horasAusentismo') as HTMLInputElement;
		const horasLaborales = document.getElementById('HorasLaborales') as HTMLInputElement;
		const diasAusentismo: any = document.getElementById('diasAusentismo') as HTMLInputElement;
		const selectFechaInicio = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const selectFechaFin = document.getElementById('selectFechaFin') as HTMLInputElement;
		if (selectFechaInicio.value !== '' && selectFechaFin.value !== '') {
			//hacemos el calculo de las fechas para saber cuantos dias son
			this.fechaInicio = this.parsearFecha(selectFechaInicio.value);
			this.fechaFin = this.parsearFecha(selectFechaFin.value);
			const diferenciaMilisegundos = this.fechaFin.getTime() - this.fechaInicio.getTime();
			this.diferenciaDias = Math.floor(diferenciaMilisegundos / (1000*60*60*24))+1;
			horasLaborales.removeAttribute('disabled');
			if (this.selectedOption === 'D') {
				horasAusentismo.setAttribute('disabled','true');
				diasAusentismo.value= this.diferenciaDias;
				this.horasAusentismo = 0;
			}else if (this.selectedOption === 'H') {
				horasAusentismo.removeAttribute('disabled');
				diasAusentismo.value= 0;
				this.totalHorasAusente =0;
				this.costoAusentismo =0;

			}
		}else{
			this.notificacionService.notificacion('Los campos de fecha inicio y fecha fin no pueden estar vacios');
			this.selectedOption='';
		}
	}

	onSelectChangeHoras(){
		const precioHoraLaboral: any = document.getElementById('PrecioHoraLaboral') as HTMLInputElement;
		const totalHorasAusente: any = document.getElementById('totalHorasAusente') as HTMLInputElement;
		const precioHora = this.empleado['sueldo'] / 30;
		const precio = precioHora.toFixed(2);
		const totalPrecioHoras = parseFloat(precio)/ this.selectedOptionHoras;
		precioHoraLaboral.value = totalPrecioHoras.toFixed(2);
		if (this.selectedOption === 'D') {
			totalHorasAusente.value = this.diasAusentismo * this.selectedOptionHoras;
			this.costoAusentismo = totalHorasAusente.value * precioHoraLaboral.value;
		}
	}

	onSelectChangeHorasAusentismo(){
		const precioHoraLaboral: any = document.getElementById('PrecioHoraLaboral') as HTMLInputElement;
		this.totalHorasAusente = this.horasAusentismo;
		this.costoAusentismo = this.horasAusentismo * precioHoraLaboral.value;
	}

	parsearFecha(fechaStr: string): Date{
		const [ano,mes,dia]=fechaStr.split('-').map(Number);
		return new Date(ano,mes-1,dia);
	}

	onFileSelected(event: any){
		const files: FileList = event.target.files;
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			this.selectedFiles.push(file);
		}
	}

	eliminarArchivo(file: File){
		const index = this.selectedFiles.indexOf(file);
		if (index !== -1) {
			this.selectedFiles.splice(index,1);
		}
	}

	getFileIcon(file: File): string {
		const fileExtension = file.name.split('.').pop().toLowerCase();
		switch (fileExtension) {
			case 'jpg':
			case 'jpeg':
			case 'png':
				return '../../../../assets/images/img.png';
			case 'pdf':
				return '../../../../assets/images/pdf.png';
				// return pdf;
			case 'doc':
			case 'docx':
				return '../../../../assets/images/word.png';
				// return doc;
			case 'xls':
			case 'xlsx':
				return '../../../../assets/images/excel.png';
				// return excel;
		}
	}

	async guardarDatos(){
		if (this.ausentismoForm.valid) {
			const datosAnexos: { [key: string]: object} = {};
			for (let i = 0; i < this.selectedFiles.length; i++) {
				const archivo = this.selectedFiles[i];
				try {
					const base64 = await this.getBase64(archivo);
					datosAnexos[` ${archivo.name}`] = {
						ArchivoNombre:  archivo.name,
						TipoArchivo: archivo.type,
						archivo: base64,
					};
				} catch (error) {
					console.log(`Error al convertir archivo ${i + 1} a base64`,error);
				}
			}
			const datosEnviar = {
				...this.ausentismoForm.value,
				anexos: 	datosAnexos,
				tercero_id: this.empleado['id'],
				nombre:  	this.empleado['nombre'],
				num_docu: 	this.empleado['documento'],
				salarioBase:this.empleado['sueldo'],
			};
			this.obtenerInformacion('guardarAnexo', 'guardarA', datosEnviar);
		}else{
			this.notificacionService.notificacion('Diligencia todos los campos obligatorios.');
		}
	}

	guardarA(resp){
		const anexos: any = document.getElementById('inputAnexos') as HTMLInputElement;
		this.ausentismoForm.reset();
		this.selectedFiles = [];
		anexos.value='';
		this.obtenerUsuario();
		this.obtenerDatosEmpleado(this.terceroId);
		this.obtenerInformacion('obtenerDatosSelects', 'obtenerSelect');

		this.notificacionService.notificacion(resp.mensaje);
	}

	getBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function() {
				resolve(reader.result as string);
			};
			reader.onerror = function(error) {
				reject(error);
			};
		});
	}

}
