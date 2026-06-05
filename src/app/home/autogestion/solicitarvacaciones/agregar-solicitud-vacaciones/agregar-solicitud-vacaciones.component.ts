import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxFormGroup, RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { InformacionSolicitud } from 'src/app/servicios/informacionsolicitud.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
	selector: 'app-agregar-solicitud-vacaciones',
	templateUrl: './agregar-solicitud-vacaciones.component.html',
	styleUrls: ['./agregar-solicitud-vacaciones.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule,
		FormsModule,
		ReactiveFormsModule,
		RxReactiveFormsModule
	]
})
export class AgregarSolicitudVacacionesComponent implements OnInit {
	@Input() permisoAdjuntarArchivo = false;

	// eslint-disable-next-line @typescript-eslint/member-delimiter-style
	datosSolicitud!: { formulario: RxFormGroup, propiedades: Array<string> };

	datosForm: Record<string, unknown> = {};
	datosSeleccionados: Record<string, unknown> = {};
	popoverAbierto: string | null = null;
	archivoAdjunto: File | null = null;
	archivoAdjuntoError = '';
	readonly pesoMaximoArchivo = 4 * 1024 * 1024;
	readonly tiposArchivoPermitidos = ['application/pdf', 'image/png', 'image/jpeg'];

	constructor(
		private modalController: ModalController,
		private informacionSolicitud: InformacionSolicitud,
		private notificacionService: NotificacionesService,
	) { }

	ngOnInit() {
		this.datosSolicitud = FuncionesGenerales.crearFormulario(this.informacionSolicitud);
	}

	abrirPopover(tipo: string) {
		this.popoverAbierto = tipo;
	}

	cerrarModal(datos?: Record<string, unknown>) {
		this.modalController.dismiss(datos);
	}

	async submitDataFamiliaContacto() {
		this.datosSolicitud.formulario.markAllAsTouched();

		if (this.datosSolicitud.formulario.invalid) {
			this.notificacionService.notificacion('Complete los campos obligatorios para continuar.');
			return;
		}

		const valorDiaCompensado = Number(this.datosSolicitud.formulario.get('DiaCompensado')?.value);
		if (!Number.isNaN(valorDiaCompensado) && valorDiaCompensado > 30) {
			this.datosSolicitud.formulario.patchValue({ DiaCompensado: '30' });
			this.notificacionService.notificacion('Maximo 30 dias de vacaciones.');
		}

		if (this.permisoAdjuntarArchivo && !this.archivoAdjunto) {
			this.archivoAdjuntoError = 'Debe adjuntar un archivo para continuar.';
			this.notificacionService.notificacion(this.archivoAdjuntoError);
			return;
		}

		this.datosForm = Object.assign({}, this.datosSolicitud.formulario.value);
		Object.keys(this.datosSeleccionados).forEach(it => {
			this.datosForm[it] = this.datosSeleccionados[it];
		});
		if (this.archivoAdjunto) {
			const base64 = await this.getBase64(this.archivoAdjunto);
			this.datosForm.anexos = {
				[this.archivoAdjunto.name]: {
					ArchivoNombre: this.archivoAdjunto.name,
					TipoArchivo: this.archivoAdjunto.type,
					archivo: base64,
				}
			};
		}
		this.cerrarModal(this.datosForm);
		this.datosSolicitud.formulario.reset();
		this.datosSolicitud.formulario.markAsUntouched();
		this.archivoAdjunto = null;
		this.archivoAdjuntoError = '';
	}

	onArchivoSeleccionado(event: Event) {
		const input = event.target as HTMLInputElement;
		const archivo = input.files && input.files.length > 0 ? input.files[0] : null;
		this.archivoAdjunto = null;
		this.archivoAdjuntoError = '';
		if (!archivo) {
			return;
		}
		if (!this.tiposArchivoPermitidos.includes(archivo.type)) {
			this.archivoAdjuntoError = 'Solo se permite adjuntar PDF o imagen JPG/PNG.';
			input.value = '';
			this.notificacionService.notificacion(this.archivoAdjuntoError);
			return;
		}
		if (archivo.size > this.pesoMaximoArchivo) {
			this.archivoAdjuntoError = 'El archivo no puede superar 4 MB.';
			input.value = '';
			this.notificacionService.notificacion(this.archivoAdjuntoError);
			return;
		}
		this.archivoAdjunto = archivo;
		this.archivoAdjuntoError = '';
	}

	quitarArchivo() {
		this.archivoAdjunto = null;
		this.archivoAdjuntoError = '';
		const input = document.getElementById('inputArchivoVacaciones') as HTMLInputElement;
		if (input) {
			input.value = '';
		}
	}

	getBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = error => reject(error);
		});
	}

	confirmarInicio(event: any) {
		let fecha = event.detail.value;
		fecha = fecha.split('T')[0];
		this.datosSolicitud.formulario.patchValue({ FechaInicio: fecha });
		this.popoverAbierto = null;
	}

	onDiaCompensadoInput(event: any) {
		const valorIngresado = String(event?.detail?.value ?? '').replace(/[^0-9]/g, '');
		if (valorIngresado === '') {
			this.datosSolicitud.formulario.patchValue({ DiaCompensado: '' });
			if (event?.target) {
				event.target.value = '';
			}
			return;
		}

		const valorNumerico = Number(valorIngresado);
		if (valorNumerico > 30) {
			this.datosSolicitud.formulario.patchValue({ DiaCompensado: '30' });
			if (event?.target) {
				event.target.value = '30';
			}
			this.notificacionService.notificacion('Maximo 30 dias de vacaciones.');
			return;
		}

		this.datosSolicitud.formulario.patchValue({ DiaCompensado: valorIngresado });
		if (event?.target) {
			event.target.value = valorIngresado;
		}
	}

	onDiaCompensadoKeydown(event: KeyboardEvent) {
		const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
		if (teclasPermitidas.includes(event.key)) {
			return;
		}

		if (!/^[0-9]$/.test(event.key)) {
			event.preventDefault();
		}
	}

	getMensajeError(campo: string): string {
		const control = this.datosSolicitud.formulario.get(campo);
		if (!control || !control.errors) {
			return '';
		}

		if (control.errors['errorMessage']) {
			return control.errors['errorMessage'];
		}

		if (control.errors['required']) {
			return 'Campo requerido.';
		}

		if (control.errors['maxNumber']) {
			return 'Maximo 30 dias de vacaciones.';
		}

		if (control.errors['numeric']) {
			return 'Solo numeros positivos.';
		}

		return 'Valor invalido.';
	}
}
