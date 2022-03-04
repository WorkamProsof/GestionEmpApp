import { Component, OnInit, } from '@angular/core';
import { IonItemSliding } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { ModalController } from '@ionic/angular';
import { FiltrosCertificadosComponent } from './filtros-certificados/filtros-certificados/filtros-certificados.component';
import { VerPdfComponent } from './ver-pdf/ver-pdf.component';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Browser } from '@capacitor/browser';

@Component({
	selector: 'app-certificados',
	templateUrl: './certificados.page.html',
	styleUrls: ['./certificados.page.scss'],
})
export class CertificadosPage implements OnInit {
	buscarListaHistorico: string = '';
	segmento = 'historicoFamilia';
	searching: boolean = false;
	pdfObj: any;
	datosUsuario: Object = {};
	foto: string = FuncionesGenerales.urlGestion();
	base64 = '';
	subject = new Subject();
	subjectMenu = new Subject();
	listEstra: any = [{ nombre: 'cesar', Observacion: 'nuevo para descarga' }, { nombre: 'juan', Observacion: 'nuevo para descarga' }]
	qExtractos: any = Array();
	qCIR: any = Array();
	terceroId = '';
	rutaGeneral: string = 'Autogestion/cCertificadoslaborales/';
	filtro: any = false;
	formFiltro = {};

	constructor(
		private loginService: LoginService,
		private storage: StorageService,
		private menu: CambioMenuService,
		private datosBasicosService: DatosbasicosService,
		private modalController: ModalController,
		private file: File,
		private fileOpener: FileOpener,
		private iab: InAppBrowser
	) { }

	ngOnInit() { }

	fechaActual() {
		var hoy = new Date();
		var Month = ("0" + (hoy.getMonth() + 1)).slice(-2);
		var year = hoy.getFullYear();
		this.formFiltro = {
			anio: year,
			meses: [Month],
			quincena: ['01', '02'],
			documento: 'T'
		};
		this.obtenerDatosEmpleado();
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		console.log('datosUsuario', this.foto + this.datosUsuario['foto']);
	}

	ionViewDidEnter() {
		this.searching = true;
		this.obtenerUsuario();
		this.fechaActual();

		this.menu.suscripcion().pipe(
			takeUntil(this.subjectMenu)
		).subscribe(() => {
			this.subject.next(true);
			this.subjectMenu.next(true);
		}, error => {
			console.log("Error ", error);
		}, () => console.log("Completado Menú !!"));
	}

	obtenerDatosEmpleado(event?) {
		this.searching = true;
		this.datosBasicosService.informacion(this.formFiltro, this.rutaGeneral + 'getData').then(({
			datos,
			qCertificados,
		}) => {
			if (datos) {
				this.qCIR = qCertificados.CIR;
				this.qExtractos = qCertificados.Extracto;
				this.terceroId = datos.id_tercero;
				console.log('datos', datos);
				console.log('this.qCIR', this.qCIR);
				console.log('this.qExtractos', this.qExtractos);
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch(error => console.log("Error ", error));
	}

	async download(url) {
		console.log(url);
		/* let target = "_self"; // _system _self _blank
		const browser = this.iab.create(url, target, this.options);
		browser.show(); */
		const modal = await this.modalController.create({
			component: VerPdfComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps: { url }
		});

		await modal.present();
		modal.onWillDismiss().then(() => { }).catch(console.log);
	}

	async filtros() {
		let componentProps = { inputmeses: this.formFiltro['meses'], inputquincena: this.formFiltro['quincena'], inputdocumento: this.formFiltro['documento'] };
		const modal = await this.modalController.create({
			component: FiltrosCertificadosComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps
		});

		await modal.present();
		modal.onWillDismiss().then(({ data }) => {
			if (data) {
				if (data.limpiar) {
					console.log('data.limpiar', data);
					this.fechaActual();
				} else {
					this.formFiltro['meses'] = data.meses;
					this.formFiltro['quincena'] = data.quincena;
					this.formFiltro['documento'] = data.documento;
					this.obtenerDatosEmpleado();
					// this.searching = true;
					// this.infiniteScroll.disabled = false;
					// this.obtenerHistorial(undefined, true);
				}
			}
		}).catch((error) => {
			console.log(error);
		});
	}

	refresh(event) {
		this.obtenerDatosEmpleado();
	}

	buscarFiltro(variable, evento) {
		this[variable] = evento.detail.value;
	}

	sliding(ref) {
		let elem: any = document.getElementById(ref);
		(elem as IonItemSliding).getSlidingRatio().then(numero => {
			if (numero === 1) {
				(elem as IonItemSliding).close();
			} else {
				(elem as IonItemSliding).open("end");
			}
		});
	}

	obtenerArchivo(base) {

		//Browser.open({ url: 'data:application/pdf; base64, ' + base });

		Browser.open({ url: 'https://prosof.co:8011/dev/Gestion_Empresarial/uploads/111111111/AutoGestion/CIR_4585401_2022.pdf' });

		/* let target = "_self"; // _system _self _blank
		const browser = this.iab.create('data:application/pdf; base64, ' + base, target, this.options);
		browser.show(); */

		/* fetch('data:application/pdf; base64, ' + base, { method: 'GET' })
			.then(file => file.blob())
			.then(blob => {
				this.file.createFile(this.file.dataDirectory, 'temp.pdf', true).then(res => {

					this.file.writeFile(this.file.dataDirectory, 'temp.pdf', blob, {replace: true}).then(resp => {
						this.fileOpener.open(resp.toInternalURL(), 'application/pdf').then(() => {

						});
					});
					
				});
			}); */
	}
}


