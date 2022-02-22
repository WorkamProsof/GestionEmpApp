import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuController, AlertController, NavController, ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { StorageService } from 'src/app/servicios/storage.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
// import { Camera, CameraOptions} from '@ionic-native/camera/ngx';
// import { ModalimagenPage } from '../modalimagen/modalimagen.page';
import { Router } from '@angular/router';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
	detalle          : any;
	solicitud        : any = [];
	tipoGastoId      : any = null;
	valor            : any = '0';
	observacion      : any = '';
	fecha            : any;
	detalleId        = 0;
	imagenes         : any     = [];
	cargando 		 : boolean = false;
	contenido 		 : boolean = true;
	imagesDelete     = new Set();
	listImagesDelete = [];
  constructor(
    private menu           : MenuController,
		// private notificaciones   : notificaciones,
		private alertController: AlertController,
		private navCtrl        : NavController,
		private storageService : StorageService,
		// private camera         : Camera,
		private modalCtrl      : ModalController,
		// private modalImagen    : ModalimagenPage
    private notificaciones: NotificacionesService,
    private router: Router,
    ) { }

  async ngOnInit() {
		this.loader(false);
		this.menu.close();

		await this.storageService.get('solicitudSeleccionada').then(
			(data:any) => {
				// data = JSON.parse(data);
				this.solicitud = data;

				let detalle = this.solicitud.dataDetalle;
				for(var i = 0; i < detalle.length; i++){
					if(detalle[i].Id < 0){
						if(detalle[i].Id <= this.detalleId){
							this.detalleId = detalle[i].Id;
						}
					}
				}
				this.detalleId--;
				this.menu.enable(false);
			}
		);

		await this.storageService.get('listImagesDelete').then(
			(data:any) => {
				if(data != null){
					this.listImagesDelete = data;
				}
			}
		);

		await this.storageService.get('detalleSeleccionado').then(
			(data:any) => {
				// data = JSON.parse(data);
				if(data != null){
					this.detalle = data;
					this.tipoGastoId = String(this.detalle.SolicitudTipoGastoId);
					this.valor = this.detalle.Valor;
					this.observacion = this.detalle.Observacion;
					this.fecha = this.detalle.Fecha;
					this.imagenes = this.detalle.Anexos;
					for(var i = 0; i < this.imagenes.length; i++){
						this.listImages.add(this.imagenes[i]);
					}
				}else{
					this.fecha = this.getDate();
				}
				this.menu.enable(false);
			}
		);

	}

	async ionViewWillEnter() {

	}

	async ionViewWillLeave() {

	}

	dismissModal() {
    this.router.navigateByUrl('/modulos/gestionarsolicitud');
	}

	async login(form: NgForm) {
		this.loader(true);
		// form.value.user, form.value.password
	}

	changeValue(event){
		let value = this.valor.replace(/,/g, '');
		if(!isNaN(parseInt(value[value.length - 1]))){
			this.valor = this.valor.replace(/,/g, '');
			this.valor = new Intl.NumberFormat('en-US').format(this.valor);
		}else{
			this.valor = this.valor.slice(0, -1);
		}
	}

	// verImagen(imagen){
	// 	this.modalCtrl.create({
	// 		component: ModalimagenPage
	// 	}).then(modal => {
	// 		this.storageService.set('imagen', imagen.Ruta);
	// 			modal.present();
	// 	});
	// }

	takePhoto(sourceType){
		// const options: CameraOptions = {
		// 	quality: 100,
		// 	destinationType : this.camera.DestinationType.DATA_URL,
		// 	encodingType    : this.camera.EncodingType.JPEG,
		// 	mediaType       : this.camera.MediaType.PICTURE,
		// 	sourceType      : this.camera.PictureSourceType.CAMERA
		// 	,targetWidth 	: 350
		// 	,targetHeight 	: 450
		// };

		// this.camera.getPicture(options).then((imageData) => {
		// 	let base64Image = `data:image/jpeg;base64,${imageData}`;
		// 	let arrData  = {
		// 		AnexoId  : -1,
		// 		DetalleId: -1,
		// 		Ruta     : base64Image
		// 	};
		// 	this.imagenes.push(arrData);
		// 	this.listImages.add(arrData);
		// },(err) => {
		// 	//Handle error
		// });
	}

	takeGallery(sourceType){
		// const options: CameraOptions = {
		// 	quality         : 100,
		// 	destinationType : this.camera.DestinationType.DATA_URL,
		// 	encodingType    : this.camera.EncodingType.JPEG,
		// 	mediaType       : this.camera.MediaType.PICTURE,
		// 	sourceType      : sourceType
		// 	,targetWidth 	: 350
		// 	,targetHeight 	: 450
		// };

		// this.camera.getPicture(options).then((result) => {
		// 	let base64Image = 'data:image/jpeg;base64,' + result;
		// 	let arrData  = {
		// 		AnexoId  : -1,
		// 		DetalleId: -1,
		// 		Ruta: base64Image
		// 	};
		// 	this.imagenes.push(arrData);
		// 	this.listImages.add(arrData);
		// },(err) => {
		// 	//Handle error
		// });
	}

	progress   : number = 0;
	interval   : any;
	imgSeleccionadas: number = 0;
	listImages = new Set();

	touchStart($event){
		this.startInterval();
	}

	touchEnd($event, imagen){
		let card = $event.currentTarget;

		// elementos[i].classList.remove('seleccionado');
		clearInterval(this.interval);
		if(this.progress > 30){
			if(card.classList.contains('imageSelected')){
				card.classList.remove('imageSelected');
				this.imgSeleccionadas--;
				this.listImages.add(imagen);
				this.imagesDelete.delete(imagen);
			}else{
				card.classList.add('imageSelected');
				this.imgSeleccionadas++;
				this.listImages.delete(imagen);
				this.imagesDelete.add(imagen);
			}
		}else{
			// this.verImagen(imagen);
		}
		this.progress = 0;
	}

	startInterval(){
		const self    = this;
		this.interval = setInterval(function(){
			self.progress = self.progress + 1;
		}, 1);
	}

	async deleteImages(){
		var self = this;

		const alert = await this.alertController.create({
			header: '¡Advertencia!',
			message: '¿Está seguro de eliminar la imagenes seleccionadas?',
			buttons:[
				{
					text: 'No',
					role: 'cancel',
					cssClass: 'secondary',
					handler: () => { }
				},
				{
					text: 'Sí',
					handler: (value) => {
						let myList = Array.from(self.listImages);
						self.imagenes = myList;
						self.imgSeleccionadas = 0;
						self.notificaciones.presentToast('Imagenes eliminadas', 'middle');
					}
				}
			]
		});
		await alert.present();
	}

	async guardarCambios(){
		if(this.tipoGastoId == "" || this.tipoGastoId == null){
			this.notificaciones.presentToast('Ingrese el Tipo de Gasto', 'middle');
			return false;
		}

		if(this.valor == "" || this.valor == 0){
			this.notificaciones.presentToast('Ingrese el Valor', 'middle');
			return false;
		}

		if(this.detalle != undefined && this.detalle != null){
			for(var i = 0; i < this.solicitud.dataDetalle.length; i++){
				if(this.solicitud.dataDetalle[i].Id == this.detalle.Id){
					this.solicitud.dataDetalle[i].Fecha = this.fecha;
					this.solicitud.dataDetalle[i].SolicitudTipoGastoId = parseInt(this.tipoGastoId);
					this.solicitud.dataDetalle[i].Valor = this.valor;
					this.solicitud.dataDetalle[i].Observacion = this.observacion;
					this.solicitud.dataDetalle[i].Anexos = this.imagenes;
				}
			}
		}else{
			let tipoGasto = "";
			let datos = this.solicitud.dataTG;
			for(var i = 0; i < datos.length; i++){
				if(datos[i].Id == parseInt(this.tipoGastoId)){
					tipoGasto = datos[i].TipoGasto;
					break;
				}
			}

			this.detalle = {
				Fecha: this.fecha,
				Id: this.detalleId,
				SolicitudTipoGastoId: parseInt(this.tipoGastoId),
				TipoGasto: tipoGasto,
				Valor: this.valor,
				Observacion: this.observacion,
				Anexos: this.imagenes
			};
			this.solicitud.dataDetalle.push(this.detalle);
		}

		this.listImagesDelete = this.listImagesDelete.concat(Array.from(this.imagesDelete));
		await this.storageService.set('listImagesDelete', this.listImagesDelete);

		await this.storageService.set('solicitudSeleccionada', this.solicitud);
		this.notificaciones.presentToast('Cambios guardados exitosamente', 'middle');
		this.dismissModal();
	}

	async eliminarDetalle(){
		var self = this;
		const alert = await this.alertController.create({
			header: '¡Advertencia!',
			message: '¿Está seguro de eliminar el detalle?',
			buttons:[
				{
					text: 'No',
					role: 'cancel',
					cssClass: 'secondary',
					handler: () => { }
				},
				{
					text: 'Sí',
					handler: (value) => {
						var arrTemp = [];
						var deleteDetalle = [];

						for(var i = 0; i < self.solicitud.dataDetalle.length; i++){
							let arr = self.solicitud.dataDetalle[i];
							if (arr.Id != self.detalle.Id){
								arrTemp.push(arr);
							}else{
								self.storageService.get('detallesDeletes').then(
									(data:any) => {
										if(data != null){
											data = JSON.parse(data);
											if(data.length > 0){
												data.push(arr.Id);
												self.storageService.set('detallesDeletes', data);
											}
										}else{
											deleteDetalle.push(arr.Id);
											self.storageService.set('detallesDeletes', deleteDetalle);
										}
									}
								);
							}
						}

						self.solicitud.dataDetalle = arrTemp;
						self.storageService.set('solicitudSeleccionada', self.solicitud);
							self.notificaciones.presentToast('Detalle eliminado exitosamente', 'middle');
							self.dismissModal();
					}
				}
			]
		});
		await alert.present();
	}

	getDate(){
		var today = new Date();
		var dd = String(today.getDate()).padStart(2,'0');
		var mm = String(today.getMonth() + 1).padStart(2, '0');
		var yyyy = today.getFullYear();
		return yyyy + '-' + mm + '-' + dd;
	}

	loader(estado : boolean) {
		this.cargando = estado === true ? false : true;
		this.contenido = estado === true ? true : false;
	}

}
