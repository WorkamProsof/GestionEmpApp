import { Component, Input, OnInit,ViewChild } from '@angular/core';
import { ModalController,IonModal } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionPermiso } from 'src/app/servicios/informacionpermiso.service';
import { Constantes } from 'src/app/config/constantes/constantes';

@Component({
	selector: 'app-agregar-solicitar-permisos',
	templateUrl: './agregar-solicitar-permisos.component.html',
	styleUrls: ['./agregar-solicitar-permisos.component.scss'],
})
export class AgregarSolicitarPermisosComponent implements OnInit {

	@Input() ausentimos: Array<object> = [];
	@Input() enfermedades: Array<object> = [];
	@ViewChild('modalFechaSolicitudesInicio') modalFechaSolicitudesInicio: IonModal;
	@ViewChild('modalFechaSolicitudesFin') modalFechaSolicitudesFin: IonModal;
	@ViewChild('#updateFechaModal') fechaModal: IonModal;
	tipoCalculo = Constantes.tipoCalculo;

	// eslint-disable-next-line @typescript-eslint/member-delimiter-style
	datosSolicitud: { formulario: RxFormGroup, propiedades: Array<string> };
	datosForm = {};
	datosSeleccionados = {};
	selectedOption: string;

	constructor(
		private modalController: ModalController,
		private informacionPermiso: InformacionPermiso
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

	cerrarModalFecha(){
		this.modalFechaSolicitudesFin.dismiss();
		this.modalFechaSolicitudesInicio.dismiss();
	}

	confirmarInicio(event: Event){
		event.stopPropagation();
		const inputElement = document.getElementById('Fechainicio') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaInicio') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
		this.modalFechaSolicitudesInicio.dismiss();
	}
	confirmarFin(event: Event){
		event.stopPropagation();
		const inputElement = document.getElementById('FechaFin') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFechaFin') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
		this.modalFechaSolicitudesFin.dismiss();
	}

	onSelectChange(){
		const diasAusentismo = document.getElementById('diasAusentismo') as HTMLInputElement;
		const horasAusentismo = document.getElementById('horasAusentismo') as HTMLInputElement;
		if (this.selectedOption === 'D') {
			diasAusentismo.removeAttribute('disabled');
			horasAusentismo.setAttribute('disabled','true');
		}else if (this.selectedOption === 'H') {
			diasAusentismo.setAttribute('disabled','true');
			horasAusentismo.removeAttribute('disabled');
		}
	}

}
