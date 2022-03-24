import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonAccordionGroup, Platform } from '@ionic/angular';
import { IonItemSliding } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { FiltrosCertificadosComponent } from './filtros-certificados/filtros-certificados/filtros-certificados.component';
import { VerPdfComponent } from './ver-pdf/ver-pdf.component';
import { Browser } from '@capacitor/browser';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-certificados',
	templateUrl: './certificados.page.html',
	styleUrls: ['./certificados.page.scss'],
})
export class CertificadosPage implements OnInit {
  src: any;
	@ViewChild(IonAccordionGroup, { static: true }) accordionGroup: IonAccordionGroup;
	viwPDF = false;
	base64Img: any;
	carataLaboral = '';
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
	qCartaLaboral = [];
	accordions = ["CL", "EX", "CI"];
	constructor(
		private loginService: LoginService,
		private storage: StorageService,
		private menu: CambioMenuService,
		private datosBasicosService: DatosbasicosService,
		private modalController: ModalController,
		public platform: Platform,
		private sanitizer: DomSanitizer

	) { }

	ngOnInit() {
		if (this.accordionGroup) {
			this.accordionGroup.ionChange.subscribe(({ detail }) => {
				if (this.accordions.includes(detail.value)) {
					this.accordionGroup.value = detail.value;
				}
			});
		}
	}

	fechaActual() {
		var hoy = new Date();
		var Month = ("0" + (hoy.getMonth() + 1)).slice(-2);
		var year = hoy.getFullYear();
		this.formFiltro = {
			anio: year,
			meses: [Month],
			quincena: ['01', '02'],
			documento: 'T',
			salario: null,
			destino: null
		};
		this.obtenerDatosEmpleado();
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
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
				this.qCartaLaboral = [datos];
				this.qCIR = qCertificados.CIR;
				this.qExtractos = qCertificados.Extracto;
				this.terceroId = datos.id_tercero;
			}
			this.searching = false;
			if (event) {
				event.target.complete();
			}
		}).catch(error => console.log("Error ", error));
	}

	async download(url) {
		const modal = await this.modalController.create({
			component: VerPdfComponent,
			backdropDismiss: true,
			cssClass: 'animate__animated animate__slideInRight animate__faster',
			componentProps: { url }
		});

		await modal.present();
		modal.onWillDismiss().then(() => { }).catch(console.log);
	}

	async filtros(param = null) {
		this.formFiltro['salario'] = param == null ? null : 'S';
		this.formFiltro['destino'] = '';
		let componentProps = {
			inputmeses: this.formFiltro['meses'],
			inputquincena: this.formFiltro['quincena'],
			inputdocumento: this.formFiltro['documento'],
			inputsalario: this.formFiltro['salario'],
			inputdestino: this.formFiltro['destino']
		};
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
					this.fechaActual();
				} else {
					this.formFiltro['meses'] = data.meses;
					this.formFiltro['quincena'] = data.quincena;
					this.formFiltro['documento'] = data.documento;
					this.formFiltro['destino'] = data.destino;
					this.formFiltro['salario'] = data.salario;
					if (param == null) {
						this.obtenerDatosEmpleado();
					} else {
						this.CartaLaboral(param);
					}
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

	obtenerArchivo(url) {
		Browser.open({ url });
	}


	async CartaLaboral(event) {
		this.datosBasicosService.informacion(this.formFiltro, this.rutaGeneral + 'imprimirFactura').then(({
			base64Img,
			file_aux
		}) => {
      this.download(file_aux);
			// if (event == 1) {
			// 	this.base64Img = 'data:application/pdf;base64,' + base64Img + '#toolbar=0&navpanes=0';
			// 	// this.download(base64Img);
			// 	this.src = this.sanitizer.bypassSecurityTrustResourceUrl(file_aux);
			// } else {
			// 	let pdfWindow = window.open();
			// 	var pdf = pdfWindow.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + base64Img + "'></iframe>");
			// 	// this.obtenerArchivo(file_aux);
			// }
		}).catch(error => console.log("Error ", error))
	}

	cerrarIframe() {
		this.src = '';
	}

}


