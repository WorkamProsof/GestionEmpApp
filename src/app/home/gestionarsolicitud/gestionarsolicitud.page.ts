import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-gestionarsolicitud',
	templateUrl: './gestionarsolicitud.page.html',
	styleUrls: ['./gestionarsolicitud.page.scss'],
})
export class GestionarsolicitudPage implements OnInit {
	
	solicitud: any = [];
	opcionDetalle: any = '';
	Solicitudes: any = [];
	detalleSeleccionado: any;
	totalPresupuesto: any = 0;
	totalGasto: any = 0;
	cargando: boolean = false;
	contenido: boolean = true;

	constructor(
		private menu: MenuController,
		private navCtrl: NavController,
		private storageService: StorageService,
		private router: Router
	) {
		// this.menu.enable(true);
	}

	ngOnInit() {
	}

	async ionViewWillEnter() {
		// this.menu.close();
		await this.storageService.get('solicitudSeleccionada').then(
			(data: any) => {
				// data = JSON.parse(data);
				this.solicitud = data;
				this.cargarTotalizados();
				this.menu.enable(false);
			}
		);
		this.storageService.remove('detalleSeleccionado');
	}

	addDetalle() {
		this.opcionDetalle = 'Crear';
		this.detalle();
	}

	itemDetalle(item) {
		this.detalleSeleccionado = item;
		this.opcionDetalle;
		this.detalle();
	}

	loader(estado: boolean) {
		this.cargando = estado === true ? false : true;
		this.contenido = estado === true ? true : false;
	}

	irAtras() {
		this.navCtrl.navigateRoot('/solicitud');
	}

	cargarTotalizados() {
		for (let i = 0; i < this.solicitud.dataTG.length; i++) {
			let valor = this.solicitud.dataTG[i].ValorAprobado.replace(/,/g, '')
			this.totalPresupuesto += parseInt(valor);
		}
		this.totalPresupuesto = new Intl.NumberFormat('en-US').format(this.totalPresupuesto);

		for (let i = 0; i < this.solicitud.dataDetalle.length; i++) {
			let valor = this.solicitud.dataDetalle[i].Valor.replace(/,/g, '')
			this.totalGasto += parseInt(valor);
		}
		this.totalGasto = new Intl.NumberFormat('en-US').format(this.totalGasto);
	}

	detalle() {
		if (this.opcionDetalle != 'Crear') {
			this.storageService.set('detalleSeleccionado', this.detalleSeleccionado);
		}

		setTimeout(() => {
			this.router.navigateByUrl('/modulos/detalle');
		}, 10);

	}

	dismissModal() {
		this.router.navigateByUrl('/modulos/gastos');
	}

}
