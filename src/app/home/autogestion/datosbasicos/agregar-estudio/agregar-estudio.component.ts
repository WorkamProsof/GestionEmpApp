import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { RxReactiveFormsModule, RxFormGroup } from '@rxweb/reactive-form-validators';
import  moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionAcademica } from 'src/app/servicios/informacionacademica.service';
import { SelectAutogestionComponent } from 'src/app/home/autogestion/select-autogestion/select-autogestion.component';

@Component({
	selector: 'app-agregar-estudio',
	templateUrl: './agregar-estudio.component.html',
	styleUrls: ['./agregar-estudio.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		IonicModule,
		RxReactiveFormsModule,
		SelectAutogestionComponent
	]
})
export class AgregarEstudioComponent implements OnInit, OnDestroy {

	@Input() getNivelEducativo: Array<any> = [];
	@Input() permisos: Array<any> = [];
	datosAcademica: { formulario: RxFormGroup, propiedades: Array<string> } = { formulario: new RxFormGroup({}, {}, {}), propiedades: [] };
	cambiovalor: boolean = false;
	maximoFechanacimiento = moment().format('YYYY-MM-DD');
	datosSeleccionados: { [key: string]: any } = {};

	// ✅ Subject para controlar desuscripciones
	private destroy$ = new Subject<void>();

	constructor(
		private modalController: ModalController,
		private informacionAcademica: InformacionAcademica,
	) { }

	ngOnInit() {
		try {
			// Limpiar el servicio para evitar que mantenga valores previos
			this.limpiarServicio();
			this.datosAcademica = FuncionesGenerales.crearFormulario(this.informacionAcademica);
			this.validarPermiso();
		} catch (error) {
			console.error('Error al inicializar AgregarEstudioComponent:', error);
		}
	}

	/**
	 * ✅ OnDestroy para limpiar recursos
	 */
	ngOnDestroy() {
		// Notificar a todos los observables suscritos que deben dejar de escuchar
		this.destroy$.next();
		this.destroy$.complete();
		
		// Limpiar el formulario
		if (this.datosAcademica?.formulario) {
			this.datosAcademica.formulario.reset();
			this.datosAcademica.formulario.markAsUntouched();
		}
		
		// Limpiar datos
		this.datosSeleccionados = {};
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	cambiosComponenteSelect(evento: any, key: string, tabs: any) {
		this.datosAcademica.formulario.get(evento.key)?.setValue(evento.valor[evento.key]);
	}

	submitDataFamiliaContacto(tabla: any) {
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
				this.datosAcademica.formulario.get(campo)?.enable();
			} else {
				this.cambiovalor = !this.cambiovalor;
				this.datosAcademica.formulario.get(campo)?.disable();
			}
		});
	}

	confirmar(){
		const inputElement = document.getElementById('selectFecha') as HTMLInputElement;
		const fechanacselect = document.getElementById('selectFecha2') as HTMLInputElement;
		let inputSelect = inputElement.value.split('T')[0];
		fechanacselect.value = inputSelect;
	}

	limpiarServicio() {
		// Limpiar todas las propiedades del servicio
		this.informacionAcademica.niveleducativo_id = '';
		this.informacionAcademica.institucion = '';
		this.informacionAcademica.ultimocursado = '';
		this.informacionAcademica.fecha_finalizacion = '';
		this.informacionAcademica.titulo = '';
	}

}
