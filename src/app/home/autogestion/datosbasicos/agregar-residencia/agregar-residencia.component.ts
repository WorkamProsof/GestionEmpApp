import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { Constantes } from 'src/app/config/constantes/constantes';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { InformacionResidencia } from 'src/app/servicios/informacionresidencia.service';

@Component({
	selector: 'app-agregar-residencia',
	templateUrl: './agregar-residencia.component.html',
	styleUrls: ['./agregar-residencia.component.scss'],
})
export class AgregarResidenciaComponent implements OnInit {

	@Input() paisnacido: Array<any> = [];
	@Input() dptoResidencia: Array<any> = [];
	@Input() ciudadResidencia: Array<any> = [];
	@Input() permisos: Array<any> = [];
	datosResidencia: { formulario: RxFormGroup, propiedades: Array<string> };
	cambiovalor: boolean;
	ppal = Constantes.ppal;
	datosSeleccionados = {};
	llaveActual: string = '';
	rutaGeneral: string = 'Autogestion/cDatosBasicos/';

	constructor(
		private modalController: ModalController,
		private datosBasicosService: DatosbasicosService,
		private informacionResidencia: InformacionResidencia,
	) { }

	ngOnInit() {
		this.datosResidencia = FuncionesGenerales.crearFormulario(this.informacionResidencia);
		this.validarPermiso();
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	cambiosComponenteSelect(evento, key, tabs) {
		this.datosSeleccionados[evento.control] = evento.valor[evento.key];
		this.llaveActual = key;
		let data = {
			id: evento.valor[evento.key],
			tipo: 1
		};
		data.tipo = evento.key == 'paisid' ? 1 : 0;
		this.ubicacionesResidencia(evento, data);
	}

	submitDataFamiliaContacto(tabla) {
		let form = Object.assign({}, this.datosResidencia.formulario.value);

		Object.keys(this.datosSeleccionados).forEach(it => {
			form[it] = this.datosSeleccionados[it];
		});
		form['tabla'] = tabla;
		if (this.datosResidencia.formulario.valid) {
			this.cerrarModal(form);
			this.datosResidencia.formulario.reset();
			this.datosResidencia.formulario.markAsUntouched();
		} else {
			FuncionesGenerales.formularioTocado(this.datosResidencia.formulario);
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
		}, console.error).catch(err => {
			console.log("Error ", err);
		}).catch(error => console.log("Error ", error));
	}

	validarPermiso() {
		let permView = FuncionesGenerales.permisos('DR');
		permView.forEach(({ id, campo }: any) => {
			if (this.permisos.includes(id)) {
				this.datosResidencia.formulario.get(campo).enable();
			} else {
				this.cambiovalor = !this.cambiovalor;
				this.datosResidencia.formulario.get(campo).disable();
			}
		});
	}

}
