
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonCheckbox, IonRange } from '@ionic/angular';
import { Constantes } from 'src/app/config/constantes/constantes';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { ThemeService } from 'src/app/servicios/theme.service';

@Component({
	selector: 'app-configuracion',
	templateUrl: './configuracion.page.html',
	styleUrls: ['./configuracion.page.scss'],
})
export class ConfiguracionPage implements OnInit, AfterViewInit {

	temas = Constantes.valoresTemas;
	@ViewChild('rangeLetra') range: IonRange;
	@ViewChild('checkLetra') check: IonCheckbox;

	constructor(
		public theme: ThemeService,
		private notificaciones: NotificacionesService,
		private storage: StorageService
	) { }

	ngOnInit() {}

	valorFuente(evento) {
		const size = evento?.detail?.value;
		if (size) {
			this.theme.setFontSize(size);
		}
	}

	setTema(event) {
		const tema = event?.detail?.value;
		this.theme.setTheme(tema);
	}

	ngAfterViewInit(): void {
		if (this.range) {
			this.storage.get('fontSize').then((size) => {
				this.range.value = size;
				this.storage.get('appliedSize').then((applied) => {
					this.range.disabled = !applied;
					this.check.checked = applied;
				});
			});
		}
	}

	get fontSize() {
		return { 'fontSize': this.theme.getStyle() }
	}

	restaurarLetra(event) {
		const opciones = [
			{
				text: 'Si',
				handler: () => {
					this.theme.setFontSize(0, true);
					this.range.disabled = true;
				}
			}, {
				text: 'No',
				role: 'cancel',
				handler: () => {
					this.check.checked = true;
				}
			}
		];
		if (!event?.detail.checked) {
			this.notificaciones.alerta('Restaurar tamaño de letra?', '', [], opciones);
		} else {
			this.range.disabled = false;
			this.theme.appliedSize = true;
			this.theme.setFontSize(this.range.value as number);
		}
	}

}

