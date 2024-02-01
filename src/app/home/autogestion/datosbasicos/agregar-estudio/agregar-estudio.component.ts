import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionAcademica } from 'src/app/servicios/informacionacademica.service';

@Component({
	selector: 'app-agregar-estudio',
	templateUrl: './agregar-estudio.component.html',
	styleUrls: ['./agregar-estudio.component.scss'],
})
export class AgregarEstudioComponent implements OnInit {

	@Input() getNivelEducativo: Array<any> = [];
	@Input() permisos: Array<any> = [];
	datosAcademica: { formulario: RxFormGroup, propiedades: Array<string> };
	cambiovalor: boolean;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	datosSeleccionados = {};

	constructor(
		private modalController: ModalController,
		private informacionAcademica: InformacionAcademica,
	) { }

	ngOnInit() {
		this.datosAcademica = FuncionesGenerales.crearFormulario(this.informacionAcademica);
		this.validarPermiso();
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	cambiosComponenteSelect(evento, key, tabs) {
		this.datosAcademica.formulario.get(evento.key).setValue(evento.valor[evento.key]);
	}

	submitDataFamiliaContacto(tabla) {
		let form = Object.assign({}, this.datosAcademica.formulario.value);

		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosAcademica.formulario.valid) {
			this.cerrarModal(form);
			this.datosAcademica.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosAcademica.formulario);
		}
	}

	validarPermiso() {
		let permView = FuncionesGenerales.permisos('IC');
		permView.forEach(({ id, campo }: any) => {
			if (this.permisos.includes(id)) {
				this.datosAcademica.formulario.get(campo).enable();
			} else {
				this.cambiovalor = !this.cambiovalor;
				this.datosAcademica.formulario.get(campo).disable();
			}
		});
	}

	confirmar(){
		const inputElement = document.getElementById('selectFecha') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFecha2') as HTMLInputElement;
		const inputSelect = inputElement.value;
		fechanacselect.value = inputSelect.split('T')[0];
	}

}
