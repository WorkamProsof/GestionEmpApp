import { Component, OnInit } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import * as moment from 'moment';
// import { Constantes } from 'src/app/config/constantes/constantes';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Subject } from 'rxjs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject  } from '@awesome-cordova-plugins/file-transfer/ngx';

import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Router } from '@angular/router';
import { CambioMenuService } from 'src/app/config/cambio-menu/cambio-menu.service';
import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DatosbasicosService } from 'src/app/servicios/datosbasicos.service';
import { LoginService } from 'src/app/servicios/login.service';
import { DomSanitizer } from '@angular/platform-browser';
import { InformacionSolicitud } from '../../../servicios/informacionsolicitud.service';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { resolve } from 'q';

pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
	selector: 'app-certificados',
	templateUrl: './certificados.page.html',
	styleUrls: ['./certificados.page.scss'],
})
export class CertificadosPage implements OnInit {
	pdfObj: any;
	datosUsuario: Object = {};
	foto: string = FuncionesGenerales.urlGestion();
	base64 = '';

  tipoactividades :any =  [{nombre:'cesar'},{nombre:'juan'}]


	constructor(
    private transfer: FileTransfer,
		private fileOpener: FileOpener,
		private file: File,
		private notificacionService: NotificacionesService,
		// private camera: Camera,
		private loginService: LoginService,
		private router: Router,
		private datosBasicosService: DatosbasicosService,
		private informacionSolicitud: InformacionSolicitud,
		private menu: CambioMenuService,
		private storage: StorageService,
		private domSanitizer: DomSanitizer
	) { }

	ngOnInit() {
		this.obtenerUsuario();
	}

	async obtenerUsuario() {
		this.datosUsuario = await this.loginService.desencriptar(
			JSON.parse(await this.storage.get('usuario').then(resp => resp))
		);
		console.log('datosUsuario', this.foto + this.datosUsuario['foto']);
	}

	// foto + datosUsuario['foto'] : datosUsuario['foto']

	GenerarPDF() {

		var dd = {
			content: [
				{
					text: 'This is a header, using header style',
					style: 'header'
				},
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam.\n\n',
				{
					text: 'Subheader 1 - using subheader style',
					style: 'subheader'
				},
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
				{
					text: 'Subheader 2 - using subheader style',
					style: 'subheader'
				},
				'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Confectum ponit legam, perferendis nomine miserum, animi. Moveat nesciunt triari naturam posset, eveniunt specie deorsus efficiat sermone instituendarum fuisse veniat, eademque mutat debeo. Delectet plerique protervi diogenem dixerit logikh levius probabo adipiscuntur afficitur, factis magistra inprobitatem aliquo andriam obiecta, religionis, imitarentur studiis quam, clamat intereant vulgo admonitionem operis iudex stabilitas vacillare scriptum nixam, reperiri inveniri maestitiam istius eaque dissentias idcirco gravis, refert suscipiet recte sapiens oportet ipsam terentianus, perpauca sedatio aliena video.',
				{
					text: 'It is possible to apply multiple styles, by passing an array. This paragraph uses two styles: quote and small. When multiple styles are provided, they are evaluated in the specified order which is important in case they define the same properties',
					style: ['quote', 'small']
				}
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true
				},
				subheader: {
					fontSize: 15,
					bold: true
				},
				quote: {
					italics: true
				},
				small: {
					fontSize: 8
				}
			}

		}



		this.pdfObj = pdfMake.createPdf(dd).open();
		/* this.pdfObj.getBase64((data) => {
			console.log('data:image/pdf;base64,' + data);
			this.base64 = 'data:image/pdf;base64,' + data;
		}); */
		// this.pdfObj.download();
	}

	OpenPDF() {
    this.fileOpener.open('http://192.168.0.224:8016/dev/Gestion_Empresarial/uploads/111111111/AutoGestion/CIR_4585401_2022.pdf', 'application/pdf')
      .then(() => console.log('File is opened'))
      .catch(e => console.log('Error opening file', e));

    // this.fileOpener.

    // this.fileOpener.showOpenWithDialog('http://192.168.0.224:8016/dev/Gestion_Empresarial/uploads/111111111/AutoGestion/CIR_4585401_2022.pdf', 'application/pdf')
    // .then(() => console.log('File is opened'))
    // .catch(e => console.log('Error opening file', e));

		//const fileTransfer: FileTransferObject = this.transfer.create();
		/* const url = 'http://192.168.0.224:8016/dev/Gestion_Empresarial/uploads/111111111/Terceros/TerceroFoto_2807__Cardona_Montoya_Norbey.jpg'
		// const url = 'http://www.example.com/file.pdf';
		fileTransfer.download(url, this.file.dataDirectory + 'file.pdf').then((entry) => {
			console.log('download complete: ' + entry.toURL());
		}, (error) => {
			// handle error
		}); */
	}

  download() {
    const fileTransfer: FileTransferObject = this.transfer.create();
    const url = 'http://www.example.com/file.pdf';
    fileTransfer.download(url, this.file.dataDirectory + 'file.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      // Controlamos el error aquí.
    });
  }
}
