import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-ver-pdf',
	templateUrl: './ver-pdf.component.html',
	styleUrls: ['./ver-pdf.component.scss'],
})
export class VerPdfComponent implements OnInit {

	@Input() url: string;

	constructor(private modalController: ModalController) { }

	ngOnInit() {
		console.log('data:application/pdf; base64, ' + this.url);
	}

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

}
