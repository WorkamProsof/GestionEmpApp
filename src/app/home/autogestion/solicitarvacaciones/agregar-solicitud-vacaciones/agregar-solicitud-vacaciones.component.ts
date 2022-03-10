import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionSolicitud } from 'src/app/servicios/informacionsolicitud.service';

@Component({
	selector: 'app-agregar-solicitud-vacaciones',
	templateUrl: './agregar-solicitud-vacaciones.component.html',
	styleUrls: ['./agregar-solicitud-vacaciones.component.scss'],
})
export class AgregarSolicitudVacacionesComponent implements OnInit {

	datosSolicitud: { formulario: RxFormGroup, propiedades: Array<string> };
	datosForm = {};
	datosSeleccionados = {};

	constructor(
		private modalController: ModalController,
		private informacionSolicitud: InformacionSolicitud,
	) { }

	ngOnInit() {
		this.datosSolicitud = FuncionesGenerales.crearFormulario(this.informacionSolicitud);
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

}
