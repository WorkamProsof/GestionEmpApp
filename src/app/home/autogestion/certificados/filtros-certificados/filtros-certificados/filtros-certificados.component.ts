import { Component, Input, OnInit,ViewChild  } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
@Component({
  selector: 'app-filtros-certificados',
  templateUrl: './filtros-certificados.component.html',
  styleUrls: ['./filtros-certificados.component.scss'],
})
export class FiltrosCertificadosComponent implements OnInit {
  @ViewChild(IonDatetime, { static: true }) datetime: IonDatetime;

  meses : any = [
    {valor : '01', titulo : 'Enero'},
    {valor : '02', titulo : 'Febrero'},
    {valor : '03', titulo : 'Marzo'},
    {valor : '04', titulo : 'Abril'},
    {valor : '05', titulo : 'Mayo'},
    {valor : '06', titulo : 'Junio'},
    {valor : '07', titulo : 'Julio'},
    {valor : '08', titulo : 'Agosto'},
    {valor : '09', titulo : 'Septiembre'},
    {valor : '10', titulo : 'Octubre'},
    {valor : '11', titulo : 'Noviembre'},
    {valor : '12', titulo : 'Diciembre'}
  ];

  quincena : any = [
    {valor : '01', titulo : 'Primera'},
    {valor : '02', titulo : 'Segunda'}
  ];

  documento : any = [
    {valor : 'T', titulo : 'Todos'},
    {valor : 'E', titulo : 'Extracto'},
    {valor : 'C', titulo : 'Certificado'}
  ];

	@Input() inputmeses: string;
	@Input() inputquincena: string;
  @Input() inputdocumento: string;
	formFiltro: FormGroup;


  constructor(
    private modalController: ModalController,
		private notificaciones: NotificacionesService,
  ) { }

  ngOnInit() {
    this.formFiltro = new FormGroup({
			meses     : new FormControl(this.inputmeses),
			quincena  : new FormControl(this.inputquincena),
      documento : new FormControl(this.inputdocumento),
		});
  }

  confirm() {
    this.datetime.confirm();
  }

  reset() {
    this.datetime.reset();
  }

  formatDate(value: string) {
    return format(parseISO(value), 'MMM');
  }



	cambioFechaDesde($event) {
		// this.minFechaHasta = $event;
	}

	cambioFechaHasta($event) {
		// this.maximoFechaDesde = $event;
	}

	filtrar() {
		let filtra = true;
		let informacion = Object.assign({}, this.formFiltro.value);
		if ((informacion['meses'] == null || informacion['meses'].length == 0) && (informacion['quincena'] == null || informacion['quincena'].length == 0) && informacion['documento'] == null) {
      this.notificaciones.notificacion("Ingrese algún filtro.");
		}else{
      this.cerrarModal(informacion);
    }
	}

  cerrarModal(datos?) {
		this.modalController.dismiss(datos);
	}

	limpiarFormulario() {
		this.formFiltro.reset();
		this.cerrarModal({ limpiar: true });
	}


}
