import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-ver-pdf',
	templateUrl: './ver-pdf.component.html',
	styleUrls: ['./ver-pdf.component.scss'],
})
export class VerPdfComponent implements OnInit {

	@Input() url: string;
	valorZoom: number = 1;

	constructor(private modalController: ModalController) { }

	ngOnInit() { }

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

}
