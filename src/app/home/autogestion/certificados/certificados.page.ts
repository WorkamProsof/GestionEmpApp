import { Component, OnInit } from '@angular/core';
// import { Constantes } from 'src/app/config/constantes/constantes';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import { StorageService } from 'src/app/servicios/storage.service';
import { FuncionesGenerales } from 'src/app/config/funciones/funciones';
import { LoginService } from 'src/app/servicios/login.service';


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
		private loginService: LoginService,
		private storage: StorageService
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

	GenerarPDF() { }

	OpenPDF() { }

	download() {

	}
}
