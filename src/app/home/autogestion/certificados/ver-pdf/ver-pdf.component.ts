import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'app-ver-pdf',
	templateUrl: './ver-pdf.component.html',
	styleUrls: ['./ver-pdf.component.scss'],
})
export class VerPdfComponent implements OnInit {

	@Input() url: any;
	valorZoom: number = 1;

	constructor(private modalController: ModalController,	private sanitizer: DomSanitizer) { }

	ngOnInit() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

	cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

}
