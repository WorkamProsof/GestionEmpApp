/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Component, Input, OnInit } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { ModalController, } from '@ionic/angular';
import * as moment from 'moment';
import { InformacionFamiliar } from '../../../../servicios/informacionfamiliar.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';

@Component({
	selector: 'app-agregar-familiar',
	templateUrl: './agregar-familiar.component.html',
	styleUrls: ['./agregar-familiar.component.scss'],
})
export class AgregarFamiliarComponent implements OnInit {
	@Input() getTipoDocumento: Array<any> = [];
	@Input() getParentesco: Array<any> = [];
	@Input() permisos: Array<any> = [];
	datosFamiliar: { formulario: RxFormGroup, propiedades: Array<string> };
	cambiovalor: boolean;
	cambiovalor2: boolean;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	datosSeleccionados = {};

	constructor(
		private modalController: ModalController,
		private informacionFamiliar: InformacionFamiliar
	) { }

	ngOnInit() {
		this.datosFamiliar = FuncionesGenerales.crearFormulario(this.informacionFamiliar);
		this.validarPermiso();
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	cambiosComponenteSelect(evento) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		this.datosFamiliar.formulario.get(evento.key).setValue(evento.valor[evento.key]);
	}

	submitDataFamiliaContacto(tabla) {
		const form = Object.assign({}, this.datosFamiliar.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosFamiliar.formulario.valid) {
			this.cerrarModal(form);
			this.datosFamiliar.formulario.reset();
			this.datosFamiliar.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosFamiliar.formulario);
		}
	}

	validarPermiso() {
		const permView = FuncionesGenerales.permisos('FI');
		permView.forEach(({ id, campo }: any) => {
			if (this.permisos.includes(id)) {
				this.datosFamiliar.formulario.get(campo).enable();
			} else {
				this.datosFamiliar.formulario.get(campo).disable();
				this.cambiovalor = !this.cambiovalor;
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
