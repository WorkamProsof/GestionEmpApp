import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionPermiso } from 'src/app/servicios/informacionpermiso.service';

@Component({
	selector: 'app-agregar-solicitar-permisos',
	templateUrl: './agregar-solicitar-permisos.component.html',
	styleUrls: ['./agregar-solicitar-permisos.component.scss'],
})
export class AgregarSolicitarPermisosComponent implements OnInit {

	@Input() ausentimos: Array<object> = [];
	datosSolicitud: { formulario: RxFormGroup, propiedades: Array<string> };
	datosForm = {};
	datosSeleccionados = {};

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

}
