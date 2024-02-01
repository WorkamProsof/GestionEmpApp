import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionPermiso } from 'src/app/servicios/informacionpermiso.service';
import { Constantes } from 'src/app/config/constantes/constantes';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
	selector: 'app-agregar-solicitar-permisos',
	templateUrl: './agregar-solicitar-permisos.component.html',
	styleUrls: ['./agregar-solicitar-permisos.component.scss'],
})
export class AgregarSolicitarPermisosComponent implements OnInit {

	@Input() ausentimos: Array<object> = [];
	@Input() enfermedades: Array<object> = [];
	tipoCalculo = Constantes.tipoCalculo;

	// eslint-disable-next-line @typescript-eslint/member-delimiter-style
	datosSolicitud: { formulario: RxFormGroup, propiedades: Array<string> };
	datosForm = {};
	datosSeleccionados = {};
	selectedOption: string;
	fechaInicio: Date;
	fechaFin: Date;
	diferenciaDias: number;


	constructor(
		private modalController: ModalController,
		private informacionPermiso: InformacionPermiso,
		private notificacionService: NotificacionesService,
	) { }

	ngOnInit() {
		this.datosSolicitud = FuncionesGenerales.crearFormulario(this.informacionPermiso);
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	submitDataFamiliaContacto() {
		this.datosForm = Object.assign({}, this.datosSolicitud.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		this.cerrarModal(this.datosForm);
		this.datosSolicitud.formulario.reset();
		this.datosSolicitud.formulario.markAsUntouched();
	}

	confirmarInicio(event: Event){
		const inputElement = document.getElementById('Fechainicio') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
	}
	confirmarFin(event: Event){
		const inputElement = document.getElementById('FechaFin') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
	}

	onSelectChange(){
		const diasAusentismo: any = document.getElementById('diasAusentismo') as HTMLInputElement;
		const horasAusentismo = document.getElementById('horasAusentismo') as HTMLInputElement;
		const selectFechaInicio = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const selectFechaFin = document.getElementById('selectFechaFin') as HTMLInputElement;

		if (selectFechaInicio.value !== '' && selectFechaFin.value !== '') {
			//hacemos el calculo de las fechas para saber cuantos dias son
			this.fechaInicio = this.parsearFecha(selectFechaInicio.value);
			this.fechaFin = this.parsearFecha(selectFechaFin.value);
			const diferenciaMilisegundos = this.fechaFin.getTime() - this.fechaInicio.getTime();
			this.diferenciaDias = Math.floor(diferenciaMilisegundos / (1000*60*60*24))+1;
			if (this.selectedOption === 'D') {
				diasAusentismo.value= this.diferenciaDias;
				horasAusentismo.setAttribute('disabled','true');
			}else if (this.selectedOption === 'H') {
				diasAusentismo.value= 0;
				horasAusentismo.removeAttribute('disabled');
			}
		}else{
			this.notificacionService.notificacion('Los campos de fecha inicio y fecha fin no pueden estar vacios');
			this.selectedOption='';
		}
	}

	parsearFecha(fechaStr: string): Date{
		const [ano,mes,dia]=fechaStr.split('-').map(Number);
		return new Date(ano,mes-1,dia);
	}

}
