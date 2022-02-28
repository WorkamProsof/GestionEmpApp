import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from '../servicios/cargador.service';
import { LoginService } from '../servicios/login.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { StorageService } from '../servicios/storage.service';
import { ThemeService } from '../servicios/theme.service';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { timer } from 'rxjs';
import { Constantes } from '../config/constantes/constantes';

import { File } from '@awesome-cordova-plugins/file/ngx';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject  } from '@awesome-cordova-plugins/file-transfer/ngx';
import { DocumentViewer } from '@awesome-cordova-plugins/document-viewer/ngx';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Platform } from '@ionic/angular';

export interface DocumentViewerOptions {
  title?: string;
  documentView?: {
    closeLabel: string;
  };
  navigationView?: {
    closeLabel: string;
  };
  email?: {
    enabled: boolean;
  };
  print?: {
    enabled: boolean;
  };
  openWith?: {
    enabled: boolean;
  };
  bookmarks?: {
    enabled: boolean;
  };
  search?: {
    enabled: boolean;
  };
  autoClose?: {
    onPause: boolean;
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  formLogin: { formulario: RxFormGroup, propiedades: Array<string> };
  ingresoDocumento: Boolean = true;
  claseDocumento: string = '';
  claseUsuario: string = '';
  verPassword: Boolean = false;
  urlFondoImagen: string = "/assets/images/fondoLogin.jpg";

  pdfObj: any;



  constructor(
    private sanitizer: DomSanitizer,
    private theme: ThemeService,
    private router: Router,
    private notificaciones: NotificacionesService,
    private loginService: LoginService,
    private storageService: StorageService,
    private cargadorService: CargadorService,

    private transfer: FileTransfer,
		private fileOpener: FileOpener,
		private file: File,
    private platform :Platform,
    private document: DocumentViewer
  ) { }

  ngOnInit() {
    this.configForm();
  }

  ionViewWillEnter() {
    this.validarAccion();
  }

  async validarAccion() {
    let nit = await this.storageService.get('nit').then(resp => resp);
    if (nit) {
      this.formLogin.formulario.get('nit').setValue(nit);
      this.irFormulario();
    }
  }

  configForm() {
    this.formLogin = FuncionesGenerales.crearFormulario(this.loginService);
  }

  obtenerFondo() {
    return this.sanitizer.bypassSecurityTrustStyle(`
			background-image: url(${this.urlFondoImagen});
			background-repeat: no-repeat;
			background-size: cover;
			background-position: center;
			background-attachment: fixed;
		`);
  }

  irFormulario() {
    this.cargadorService.presentar().then(resp => {
      if (this.formLogin.formulario.get('nit').valid) {
        const nit = this.formLogin.formulario.get('nit').value;
        this.loginService.validarNit(nit).then(respuesta => {
          console.log(respuesta);
          if (respuesta && respuesta.success) {
            this.storageService.set('nit', nit);
            this.storageService.set('crypt', respuesta.crypt);
            this.storageService.set('modulos', respuesta.modulos);
            this.storageService.set('conexion', respuesta.db);
            this.claseDocumento = 'animate__fadeOutLeft';
            this.ejecutarTimer('claseUsuario', 'animate__fadeInRight').then(item => this.ingresoDocumento = !this.ingresoDocumento);
          } else {
            this.notificaciones.notificacion(respuesta.mensaje);
          }
          this.cargadorService.ocultar();
        }).catch(error => {
          console.log(error);
          this.notificaciones.notificacion("Error de conexión.");
          this.cargadorService.ocultar();
        });
      }
    });
  }

  async ejecutarTimer(variable: string, clase: string) {
    return await timer(200).toPromise().then(resp => this[variable] = clase);
  }

  retornar() {
    this.formLogin.formulario.reset();
    this.claseUsuario = 'animate__fadeOutRight';
    this.ejecutarTimer('claseDocumento', 'animate__fadeInLeft').then(item => this.ingresoDocumento = !this.ingresoDocumento);
  }

  get fontSize() {
    return { 'fontSize': this.theme.getStyle() };
  };

  login() {
    if (this.formLogin.formulario.valid) {
      this.cargadorService.presentar().then(resp => {
        let permisos = FuncionesGenerales.permisos();
        let data = { ...this.formLogin.formulario.value, permisos };
        this.loginService.iniciarSesionUser(data).then(async respuesta => {
          console.log(respuesta);
          if (respuesta && respuesta.valido) {
            this.storageService.set('usuario', respuesta.usuario);
            this.router.navigateByUrl('/modulos/inicio');
            this.formLogin.formulario.reset();
            this.retornar();
          } else {
            this.notificaciones.notificacion(respuesta.mensaje);
          }
          this.cargadorService.ocultar();
        }).catch(error => {
          console.error("Error ", error);
          this.cargadorService.ocultar();
        });
      });
    } else {
      FuncionesGenerales.formularioTocado(this.formLogin.formulario);
    }
  }








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
				},
			],
			styles: {
				header: {
					fontSize: 18,
					bold: true
				},
				subheader: {
					fontSize: 15,
          justifi:true,
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





		// this.pdfObj = pdfMake.createPdf(dd).open();
		/* this.pdfObj.getBase64((data) => {
			console.log('data:image/pdf;base64,' + data);
			this.base64 = 'data:image/pdf;base64,' + data;
		}); */
		// this.pdfObj.download();

    const options: DocumentViewerOptions = {
      title: 'My PDF'
    }


    let data = this.document.viewDocument('http://www.example.com/file.pdf', 'application/pdf', options);
    console.log('data',data);

	}

	OpenPDF() {
    if(this.platform.is('cordova')){
      this.pdfObj.getBuffer((buffer)=>{
        var blob = new Blob([buffer],{type:'application/pdf'});
        this.file.writeFile(this.file.dataDirectory,'hola.pdf',blob,{replace:true}).then(fileEntry =>{
          this.fileOpener.open(this.file.dataDirectory + 'hola.pdf','application/pdf');
        });
      });
      return true;
    }
    // this.fileOpener.open('http://192.168.0.224:8016/dev/Gestion_Empresarial/uploads/111111111/AutoGestion/CIR_4585401_2022.pdf', 'application/pdf')
    //   .then(() => {
    //     console.log('File is opened')
    //   })

    //   .catch(e =>{
    //     alert(e);
    //     this.notificaciones.notificacion('Error opening file', e)
    //     }
    //   );

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
      this.notificaciones.notificacion('Error opening file', error)
    });
  }

}
